import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Heart, FileText, Info, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Community = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Community Romanisti
      </h1>
      
      <div className="grid gap-8">
        {/* Main Community Sections */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Forum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Discuti con altri tifosi romanisti da tutto il mondo
              </p>
              <Button asChild variant="secondary" className="w-full" aria-label="Entra nel forum della community">
                <Link to="/forum">Entra nel Forum</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Live
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Chat in tempo reale durante le partite
              </p>
              <Button asChild variant="secondary" className="w-full" aria-label="Accedi alla chat dal vivo">
                <Link to="/forum">Accedi alla Chat</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Carica Contenuti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Condividi i tuoi momenti romanisti con la community
              </p>
              <Button asChild variant="secondary" className="w-full" aria-label="Carica foto, video e contenuti">
                <Link to="/upload">Carica Contenuti</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Articles Section - Visually Separated */}
        <div className="border-t border-border/30 pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-roma-gold mb-2">📰 Articoli e Interviste</h2>
            <p className="text-muted-foreground">
              Approfondimenti esclusivi, interviste e analisi sulla Roma
            </p>
          </div>
          
          <Card className="shadow-glow border-border/50 bg-gradient-to-r from-roma-gold/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Articoli
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Leggi articoli e interviste esclusive sulla Roma
              </p>
              <Button asChild variant="secondary" className="w-full" aria-label="Leggi gli articoli sulla Roma">
                <Link to="/articles">Leggi Articoli</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Community Features */}
        <div className="border-t border-border/20 pt-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">🔧 Strumenti Community</h3>
          <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Info Forum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Scopri come funziona il forum e le regole della community
              </p>
              <Button asChild variant="secondary" className="w-full" aria-label="Informazioni sul forum">
                <Link to="/about-forum">Info Forum</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Foto & Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Condividi i tuoi momenti romanisti
              </p>
              <Button asChild variant="secondary" className="w-full" aria-label="Carica foto e video">
                <Link to="/upload">Carica Contenuti</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
        
        <Card className="shadow-roma border-border/50">
          <CardHeader>
            <CardTitle className="text-primary">Ultime dal Forum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { autore: "RomanistaDoc", messaggio: "Che partita incredibile ieri sera! Daje Roma!", tempo: "2 ore fa" },
                { autore: "GialloRosso92", messaggio: "Chi viene al raduno di domenica a Milano?", tempo: "4 ore fa" },
                { autore: "CapitanTotti", messaggio: "Nostalgia per i bei tempi... Forza Roma sempre!", tempo: "6 ore fa" }
              ].map((post, index) => (
                <div key={index} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-roma-gold font-medium">{post.autore}</p>
                      <p className="text-muted-foreground">{post.messaggio}</p>
                    </div>
                    <span className="text-sm text-roma-yellow/60">{post.tempo}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Community;