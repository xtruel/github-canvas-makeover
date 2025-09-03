import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, FileText, Info, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Community = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Community Romanisti
      </h1>
      
      <div className="grid gap-6">
        <div className="grid md:grid-cols-3 gap-6">
        
          <Card className="shadow-glow border-border/50">
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
              <Button asChild variant="secondary" className="w-full">
                <Link to="/articles">Leggi Articoli</Link>
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
              <Button asChild variant="secondary" className="w-full">
                <Link to="/upload">Carica Contenuti</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Info Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Scopri come funziona la community e le regole di partecipazione
              </p>
              <Button variant="secondary" className="w-full">Linee guida</Button>
        </CardContent>
          </Card>
          
          {/* Chat Live rimossa su richiesta */}
          
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
              <Button asChild variant="secondary" className="w-full">
                <Link to="/upload">Carica Contenuti</Link>
              </Button>
            </CardContent>
          </Card>
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