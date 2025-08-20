import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Heart } from "lucide-react";

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
                <Users className="h-5 w-5" />
                Forum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Discuti con altri tifosi romanisti da tutto il mondo
              </p>
              <Button variant="secondary" className="w-full">
                Entra nel Forum
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
              <Button variant="secondary" className="w-full">
                Accedi alla Chat
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
              <Button variant="secondary" className="w-full">
                Carica Contenuti
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