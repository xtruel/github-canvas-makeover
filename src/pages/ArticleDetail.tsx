import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || (window as any).__API_BASE__ || "http://localhost:4000";

type ArticleAPI = {
  id: string;
  title: string;
  body: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  language: string;
  coverMediaId?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
};

type CommentAPI = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<ArticleAPI | { error: string }>({
    queryKey: ["article", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/articles/${slug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const commentsQuery = useQuery<CommentAPI[]>({
    queryKey: ["article", slug, "comments"],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/articles/${slug}/comments`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");

  const addComment = useMutation({
    mutationFn: async (payload: { authorName: string; body: string }) => {
      const res = await fetch(`${API_BASE}/articles/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Errore invio commento");
      }
      return res.json();
    },
    onSuccess: () => {
      setCommentBody("");
      qc.invalidateQueries({ queryKey: ["article", slug, "comments"] });
    },
  });

  if (isLoading) return <div className="container mx-auto px-4 py-8">Caricamento…</div>;
  if (isError || !data || (data as any).error)
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Articolo non trovato</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/articles">Torna agli articoli</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  const article = data as ArticleAPI;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{article.title}</h1>
        <Button asChild variant="outline">
          <Link to="/articles">Indietro</Link>
        </Button>
      </div>
      <Card className="border-border/50">
        <CardContent className="prose dark:prose-invert max-w-none py-6">
          <div dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, "<br/>") }} />
        </CardContent>
      </Card>

      {/* Commenti */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Commenti</h2>

        {/* Form invio commento */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Il tuo nome"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                maxLength={80}
              />
              <div className="md:col-span-2">
                <Textarea
                  placeholder="Scrivi un commento..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  rows={3}
                  maxLength={2000}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => addComment.mutate({ authorName: authorName.trim() || "Anonimo", body: commentBody.trim() })}
                disabled={addComment.isPending || !commentBody.trim()}
              >
                {addComment.isPending ? "Invio..." : "Invia"}
              </Button>
              {addComment.isError && (
                <p className="text-destructive text-sm">{(addComment.error as Error)?.message}</p>
              )}
              {addComment.isSuccess && <p className="text-green-600 text-sm">Commento inviato. In attesa di approvazione.</p>}
              <p className="text-xs text-muted-foreground">I commenti vengono pubblicati dopo approvazione dell'amministratore.</p>
            </div>
          </CardContent>
        </Card>

        {/* Lista commenti */}
        {commentsQuery.isLoading ? (
          <p>Caricamento commenti…</p>
        ) : commentsQuery.data && commentsQuery.data.length > 0 ? (
          <div className="space-y-4">
            {commentsQuery.data.map((c) => (
              <Card key={c.id} className="border-border/50">
                <CardContent className="py-4">
                  <div className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleString()} • {c.authorName}</div>
                  <div className="mt-1 whitespace-pre-wrap">{c.body}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nessun commento ancora. Scrivi il primo!</p>
        )}
      </div>
    </div>
  );
}