import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Eye, Bookmark, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// Backend API base (optional) – falls back to localhost:4000 if not set
const API_BASE = (import.meta as any).env?.VITE_API_BASE || (window as any).__API_BASE__ || "http://localhost:4000";

const Articles = () => {
  const mockArticles = [
    {
      id: 1,
      type: "article",
      title: "Roma: Il Nuovo Progetto Tecnico di De Rossi",
      excerpt:
        "Analisi approfondita delle scelte tattiche e tecniche del nuovo allenatore giallorosso. Come cambierà il gioco della Roma nella prossima stagione.",
      author: "Marco Sportivo",
      publishedDate: "2024-01-15",
      readTime: "8 min",
      views: 1247,
      imageUrl: `${import.meta.env.BASE_URL}mock/roma-logo.svg`,
      category: "Tattica",
      featured: true,
    },
    {
      id: 2,
      type: "interview",
      title: "Intervista Esclusiva: Pellegrini Racconta la Sua Roma",
      excerpt:
        "Il capitano giallorosso si confida sui suoi sogni, le ambizioni per il futuro e il legame speciale con la città eterna e i tifosi romanisti.",
      author: "Giulia Giornalista",
      publishedDate: "2024-01-14",
      readTime: "12 min",
      views: 2156,
      imageUrl: `${import.meta.env.BASE_URL}mock/totti-celebration.svg`,
      category: "Interviste",
      featured: false,
    },
    {
      id: 3,
      type: "article",
      title: "Stadio Olimpico: I Lavori di Ristrutturazione",
      excerpt:
        "Tutti i dettagli sui miglioramenti previsti per la casa della Roma. Nuove tecnologie, comfort per i tifosi e sostenibilità ambientale.",
      author: "Roberto Architettura",
      publishedDate: "2024-01-13",
      readTime: "6 min",
      views: 892,
      imageUrl: `${import.meta.env.BASE_URL}mock/stadium-olimpico.svg`,
      category: "Stadio",
      featured: false,
    },
    {
      id: 4,
      type: "interview",
      title: "Dybala: 'Roma è Casa Mia, Qui Voglio Vincere'",
      excerpt:
        "L'argentino parla del suo amore per i colori giallorossi, degli obiettivi personali e di squadra per questa stagione ricca di sfide.",
      author: "Antonio Calcio",
      publishedDate: "2024-01-12",
      readTime: "10 min",
      views: 3421,
      imageUrl: `${import.meta.env.BASE_URL}mock/roma-fans-2.svg`,
      category: "Interviste",
      featured: true,
    },
    {
      id: 5,
      type: "article",
      title: "La Storia dei Derby: Roma vs Lazio",
      excerpt:
        "Un viaggio attraverso i derby più memorabili della storia. Dalle vittorie leggendarie ai momenti che hanno fatto la storia del calcio romano.",
      author: "Francesco Storia",
      publishedDate: "2024-01-11",
      readTime: "15 min",
      views: 1876,
      imageUrl: `${import.meta.env.BASE_URL}mock/roma-fans-1.svg`,
      category: "Storia",
      featured: false,
    },
    {
      id: 6,
      type: "interview",
      title: "Mourinho Ricorda: 'La Roma Nel Mio Cuore'",
      excerpt:
        "L'ex allenatore portoghese ripercorre i momenti più belli vissuti in giallorosso, dalla Conference League ai rapporti con squadra e tifosi.",
      author: "Luca Interviste",
      publishedDate: "2024-01-10",
      readTime: "14 min",
      views: 2987,
      imageUrl: `${import.meta.env.BASE_URL}mock/roma-logo.svg`,
      category: "Interviste",
      featured: false,
    },
  ];

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

  // Fetch from backend (public: GET /articles)
  const { data: apiArticles, isLoading, isError } = useQuery<ArticleAPI[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/articles`, { credentials: "include" });
      if (!res.ok) throw new Error("Errore caricamento articoli");
      return res.json();
    },
  });

  // Normalize into UI shape
  const isBackend = !!(apiArticles && apiArticles.length);
  const uiArticles = isBackend
    ? apiArticles!.map((a, i) => ({
        id: a.id,
        type: "article",
        title: a.title,
        excerpt: a.body.length > 220 ? a.body.slice(0, 220) + "…" : a.body,
        author: "Redazione",
        publishedDate: a.publishedAt || a.createdAt || new Date().toISOString(),
        readTime: undefined as any,
        views: undefined as any,
        imageUrl: `${import.meta.env.BASE_URL}mock/roma-logo.svg`,
        category: "Articoli",
        featured: i < 2,
        slug: a.slug,
      }))
    : mockArticles;

  const categories = isBackend
    ? [{ name: "Tutte", count: uiArticles.length, active: true }]
    : [
        { name: "Tutte", count: mockArticles.length, active: true },
        { name: "Interviste", count: mockArticles.filter((a) => a.type === "interview").length, active: false },
        { name: "Tattica", count: mockArticles.filter((a) => a.category === "Tattica").length, active: false },
        { name: "Storia", count: mockArticles.filter((a) => a.category === "Storia").length, active: false },
        { name: "Stadio", count: mockArticles.filter((a) => a.category === "Stadio").length, active: false },
      ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case "Interviste":
        return "bg-roma-gold/20 text-roma-gold";
      case "Tattica":
        return "bg-roma-red/20 text-roma-red";
      case "Storia":
        return "bg-roma-yellow/20 text-roma-yellow";
      case "Stadio":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-roma-gold mb-2">Articoli & Interviste</h1>
        <p className="text-muted-foreground">
          {isLoading
            ? "Caricamento articoli…"
            : isError
            ? "Impossibile caricare gli articoli dal server. Mostro una selezione."
            : "Approfondimenti, analisi e interviste esclusive dal mondo giallorosso"}
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category, index) => (
          <Button
            key={index}
            variant={category.active ? "default" : "outline"}
            size="sm"
            className={category.active ? "bg-roma-gold text-black hover:bg-roma-yellow" : ""}
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      <div className="grid gap-8">
        {/* Featured Articles */}
        <div className="grid lg:grid-cols-2 gap-6">
          {uiArticles
            .filter((article: any) => (isBackend ? article.featured : article.featured))
            .map((article: any) => (
              <Card
                key={article.id}
                className="shadow-roma border-border/50 hover:shadow-glow transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                  <Badge className={`absolute top-4 left-4 ${getBadgeColor(article.category || "Articoli")}`}>
                    {article.category || "Articoli"}
                  </Badge>
                  {article.featured && (
                    <Badge className="absolute top-4 right-4 bg-roma-red text-white">In Evidenza</Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-foreground hover:text-roma-gold transition-colors">
                    {article.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">{article.excerpt}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {article.author || "Redazione"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(article.publishedDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {article.readTime || ""}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {article.views ? `${article.views.toLocaleString()} visualizzazioni` : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-roma-yellow">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-roma-gold">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      {isBackend && (article as any).slug ? (
                        <Button asChild size="sm" className="bg-roma-gold hover:bg-roma-yellow text-black">
                          <Link to={`/articles/${article.slug}`} className="text-primary hover:underline">Leggi</Link>
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-roma-gold hover:bg-roma-yellow text-black">Leggi</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Regular Articles Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Altri Articoli</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uiArticles
              .filter((article: any) => (isBackend ? !article.featured : !article.featured))
              .map((article: any) => (
                <Card
                  key={article.id}
                  className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `${import.meta.env.BASE_URL}placeholder.svg`;
                      }}
                    />
                    <Badge className={`absolute top-2 left-2 text-xs ${getBadgeColor(article.category || "Articoli")}`}>
                      {article.category || "Articoli"}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground hover:text-roma-gold transition-colors cursor-pointer line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author || "Redazione"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.publishedDate)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {article.views ? `${article.views.toLocaleString()}` : ""}
                      </div>
                      {isBackend && (article as any).slug ? (
                        <Button asChild size="sm" className="bg-roma-gold hover:bg-roma-yellow text-black">
                          <Link to={`/articles/${(article as any).slug}`}>Leggi</Link>
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-roma-gold hover:bg-roma-yellow text-black">Leggi</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Articles;