import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RomaMatches } from "@/components/RomaMatches";
import RomaMap from "@/components/RomaMap";
import { MapPin, Calendar, Users, Trophy, MessageCircle, Settings, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      title: "Mappa Romanisti",
      description: "Trova altri tifosi della Roma nella tua zona",
      icon: MapPin,
      link: "/mappa",
      color: "text-roma-gold"
    },
    {
      title: "Eventi",
      description: "Scopri raduni e partite da guardare insieme",
      icon: Calendar,
      link: "/eventi",
      color: "text-roma-yellow"
    },
    {
      title: "Community",
      description: "Discuti e condividi la passione giallorossa",
      icon: MessageCircle,
      link: "/community",  
      color: "text-roma-gold"
    },
    {
      title: "Trofei",
      description: "Celebra la storia gloriosa della Roma",
      icon: Trophy,
      link: "/trofei",
      color: "text-roma-yellow"
    }
  ];

  const breakingNews = [
    {
      title: "Roma Prepara Derby della Capitale",
      description: "La squadra si allena intensamente per la sfida contro la Lazio",
      category: "Training",
      time: "2 ore fa"
    },
    {
      title: "Nuovo Store Ufficiale a Milano",
      description: "Aperto il nuovo punto vendita per i tifosi del nord",
      category: "Fan Zone", 
      time: "5 ore fa"
    },
    {
      title: "Raduno Romanisti Domenica",
      description: "Tutti i tifosi sono invitati al raduno settimanale",
      category: "Community",
      time: "1 giorno fa"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Roma Official Colors */}
      <div className="relative bg-[hsl(var(--roma-red))] text-white py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--roma-red))] to-[hsl(var(--roma-gold))] opacity-90" />
        <div className="container relative mx-auto text-center">
          <div className="mb-8">
            <img
              src="/lovable-uploads/af321201-3c36-40c5-862e-fed415398b56.png"
              alt="AS Roma Official Logo"
              className="w-28 h-28 mx-auto object-contain mb-6 drop-shadow"
            />
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-semibold mb-5 tracking-tight">
            FORZA ROMA
          </h1>

          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
            La tua destinazione definitiva per notizie, eventi e contenuti esclusivi dell'AS Roma
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-black shadow-roma">
              <Link to="/eventi">Ultimi Eventi</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[hsl(var(--roma-red))] shadow-none"
            >
              <Link to="/community">Entra nella Community</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Mappa Interattiva Roma */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Esplora Roma Giallorossa</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Scopri i luoghi storici, gli stadi e i ritrovi dei romanisti nella Città Eterna
            </p>
          </div>
          <div className="md:h-[500px] rounded-lg overflow-hidden shadow-roma border border-border/50">
            <RomaMap />
          </div>
        </div>

        {/* Prossime Partite - Sezione Principale */}
        <div className="mb-16">
          <RomaMatches />
        </div>

        {/* Breaking News Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Ultime Notizie</h2>
            <Button variant="ghost" className="text-roma-gold hover:text-roma-red">
              Vedi Tutto <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {breakingNews.map((news, index) => (
              <Card key={index} className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-roma-red text-white px-2 py-1 rounded-full">{news.category}</span>
                    <span className="text-xs text-muted-foreground">{news.time}</span>
                  </div>
                  <CardTitle className="text-lg text-foreground">{news.title}</CardTitle>
                  <CardDescription>{news.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="text-roma-gold hover:text-roma-red p-0">
                    Leggi tutto <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Esplora la Community</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                  <CardTitle className="text-roma-gold">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full shadow-roma">
                    <Link to={feature.link}>Esplora</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <Card className="shadow-roma border-border/50 bg-gradient-to-r from-[hsl(var(--roma-red))]/20 to-[hsl(var(--roma-gold))]/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-roma-gold mb-4">Forza Roma Sempre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-roma-gold">1927</div>
                <div className="text-muted-foreground">Fondata</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-roma-yellow">3</div>
                <div className="text-muted-foreground">Scudetti</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-roma-gold">∞</div>
                <div className="text-muted-foreground">Passione</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
