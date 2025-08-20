import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Mappa = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Mappa Romanisti nel Mondo
      </h1>
      
      <div className="grid gap-6">
        <Card className="shadow-glow border-border/50">
          <CardHeader>
            <CardTitle className="text-roma-gold">Mappa Interattiva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-roma-yellow/80">
                Mappa interattiva in arrivo - Trova i romanisti più vicini a te!
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-roma border-border/50">
            <CardHeader>
              <CardTitle className="text-primary">Club Locali</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Scopri i club di tifosi romanisti nella tua città
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-roma border-border/50">
            <CardHeader>
              <CardTitle className="text-primary">Locali Partite</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Trova i migliori locali dove guardare le partite della Roma
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Mappa;