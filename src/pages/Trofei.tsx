import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Star } from "lucide-react";

const Trofei = () => {
  const trofei = [
    { nome: "Serie A", anni: ["2000-01"], icona: Trophy },
    { nome: "Coppa Italia", anni: ["1963-64", "1968-69", "1979-80", "1980-81", "1983-84", "1985-86", "1990-91", "2006-07", "2007-08"], icona: Medal },
    { nome: "Supercoppa Italiana", anni: ["2001", "2007"], icona: Star },
    { nome: "Champions League", anni: ["1983-84"], icona: Trophy },
    { nome: "Coppa delle Fiere", anni: ["1960-61"], icona: Medal },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Palmares AS Roma
      </h1>
      
      <div className="grid gap-6">
        <div className="text-center mb-8">
          <p className="text-xl text-roma-yellow/80">
            La storia gloriosa dei trofei giallorossi
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trofei.map((trofeo, index) => {
            const IconComponent = trofeo.icona;
            return (
              <Card key={index} className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-roma-gold flex items-center gap-3">
                    <IconComponent className="h-6 w-6" />
                    {trofeo.nome}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Vittorie: {trofeo.anni.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trofeo.anni.map((anno, annoIndex) => (
                        <span
                          key={annoIndex}
                          className="bg-primary/20 text-roma-yellow px-2 py-1 rounded text-sm"
                        >
                          {anno}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <Card className="shadow-roma border-border/50 mt-8">
          <CardHeader>
            <CardTitle className="text-primary text-center">
              💛❤️ FORZA ROMA ❤️💛
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-roma-yellow/80 text-lg">
              "Roma non si discute, si ama"
            </p>
            <p className="text-muted-foreground mt-2">
              Dal 1927 con orgoglio giallorosso
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Trofei;