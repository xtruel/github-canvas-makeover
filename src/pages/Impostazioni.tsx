import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings, User, Bell, Shield, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const Impostazioni = () => {
  const { role, loginAdmin, logout } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    setLoading(true);
    const res = await loginAdmin(username, password);
    setLoading(false);
    if (!res.ok) setError(res.error || "Errore di autenticazione");
    else setOk(true);
  };

  const onLogout = async () => {
    setLoading(true);
    try { await logout(); } finally { setLoading(false); setOk(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Impostazioni
      </h1>
      
      <div className="grid gap-6 max-w-2xl">
        {/* Area Riservata (Admin) */}
        <Card className="shadow-glow border-border/50">
          <CardHeader>
            <CardTitle className="text-roma-gold flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Area Riservata
            </CardTitle>
          </CardHeader>
          <CardContent>
            {role === 'ADMIN' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sei autenticato come <span className="text-foreground font-medium">ADMIN</span>.
                </p>
                <div className="flex gap-3">
                  <Button onClick={onLogout} disabled={loading} variant="secondary">Logout</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Username</label>
                  <Input value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Password</label>
                  <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </div>
                )}
                {ok && !error && (
                  <div className="text-green-500 text-sm">Accesso effettuato!</div>
                )}
                <Button type="submit" disabled={loading} className="shadow-roma">
                  {loading ? 'Accesso in corso...' : 'Entra'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Accesso riservato agli amministratori.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Profilo */}
        <Card className="shadow-glow border-border/50">
          <CardHeader>
            <CardTitle className="text-roma-gold flex items-center gap-2">
              <User className="h-5 w-5" />
              Profilo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-roma-yellow/80">Nome utente</label>
              <input 
                type="text" 
                className="w-full p-2 bg-muted border border-border rounded-md text-foreground"
                placeholder="Il tuo nome"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-roma-yellow/80">Email</label>
              <input 
                type="email" 
                className="w-full p-2 bg-muted border border-border rounded-md text-foreground"
                placeholder="tua@email.com"
              />
            </div>
            <Button className="shadow-roma">Aggiorna Profilo</Button>
          </CardContent>
        </Card>
        
        {/* Notifiche */}
        <Card className="shadow-glow border-border/50">
          <CardHeader>
            <CardTitle className="text-roma-gold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Notifiche eventi</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Notifiche partite</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Messaggi community</span>
              <Switch />
            </div>
          </CardContent>
        </Card>
        
        {/* Privacy */}
        <Card className="shadow-glow border-border/50">
          <CardHeader>
            <CardTitle className="text-roma-gold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Profilo pubblico</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mostra posizione</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Condividi eventi</span>
              <Switch />
            </div>
          </CardContent>
        </Card>
        {role === 'ADMIN' && (
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin: Crea Articolo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminCreateArticleForm />
            </CardContent>
          </Card>
        )}

        {role === 'ADMIN' && (
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin: Moderazione Commenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminModerateComments />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

function AdminCreateArticleForm() {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || (window as any).__API_BASE__ || "http://localhost:4000";
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("it");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, language, status, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Errore creazione articolo");
      setResult(json);
      setTitle("");
      setBody("");
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Titolo</label>
        <Input value={title} onChange={(e)=>setTitle(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Lingua</label>
          <Input value={language} onChange={(e)=>setLanguage(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Stato</label>
          <select
            className="w-full p-2 bg-muted border border-border rounded-md text-foreground"
            value={status}
            onChange={(e)=>setStatus(e.target.value as any)}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Contenuto</label>
        <Textarea rows={8} value={body} onChange={(e)=>setBody(e.target.value)} required />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading || !title || !body}>
          {loading ? "Creazione..." : "Crea Articolo"}
        </Button>
        {error && <span className="text-destructive text-sm">{error}</span>}
        {result?.slug && (
          <span className="text-green-600 text-sm">Creato: <a className="underline" href={`${import.meta.env.BASE_URL}articles/${result.slug}`}>/articles/{result.slug}</a></span>
        )}
      </div>
    </form>
  );
}

function AdminModerateComments() {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || (window as any).__API_BASE__ || "http://localhost:4000";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/comments?status=${filter}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Errore caricamento');
      setItems(json);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const act = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`${API_BASE}/admin/comments/${id}/${action}`, { method: 'POST', credentials: 'include' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Operazione fallita');
      await load();
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  // carica all'avvio e quando cambia filtro
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [filter]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm">Filtro</label>
        <select className="p-2 bg-muted border border-border rounded-md" value={filter} onChange={(e)=>setFilter(e.target.value as any)}>
          <option value="PENDING">In Attesa</option>
          <option value="APPROVED">Approvati</option>
          <option value="REJECTED">Rifiutati</option>
        </select>
        <Button variant="outline" onClick={load} disabled={loading}>{loading? 'Aggiorno...' : 'Aggiorna'}</Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nessun commento {filter === 'PENDING' ? 'in attesa' : filter.toLowerCase()}.</p>
      ) : (
        <div className="space-y-3">
          {items.map((c)=> (
            <div key={c.id} className="border border-border rounded-md p-3">
              <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()} • {c.authorName} • Articolo: <a className="underline" href={`#/articles/${c.article?.slug}`}>{c.article?.title || c.article?.slug}</a></div>
              <div className="mt-1 whitespace-pre-wrap">{c.body}</div>
              <div className="mt-2 flex gap-2">
                {filter !== 'APPROVED' && <Button size="sm" onClick={()=>act(c.id,'approve')}>Approva</Button>}
                {filter !== 'REJECTED' && <Button size="sm" variant="destructive" onClick={()=>act(c.id,'reject')}>Rifiuta</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Impostazioni;