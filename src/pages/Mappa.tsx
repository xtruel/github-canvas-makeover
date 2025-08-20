import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RomaMap from "@/components/RomaMap";

const Mappa = () => {
  return (
    <div className="relative min-h-screen">
      {/* Desktop layout */}
      <div className="hidden sm:block container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-roma-gold">
          Mappa di Roma
        </h1>
        
        <div className="grid gap-6">
          {/* Mappa - normal card layout for desktop */}
          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold">Discover the Eternal City</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <RomaMap />
            </CardContent>
          </Card>
          
          {/* Info cards for desktop */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-roma border-border/50">
              <CardHeader>
                <CardTitle className="text-primary">Luoghi Storici</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esplora i luoghi storici della città eterna legati alla Roma
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-roma border-border/50">
              <CardHeader>
                <CardTitle className="text-primary">Partite Roma</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Scopri dove guardare le partite della Roma maschile in città
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-roma border-border/50">
              <CardHeader>
                <CardTitle className="text-primary">Roma Femminile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trova i luoghi dove seguire la Roma Femminile
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile layout - below header, full remaining screen */}
      <div className="sm:hidden h-[calc(100vh-4rem)] mt-0">
        <div className="h-full relative">
          <div className="absolute top-2 left-2 right-2 z-20 bg-background/95 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <h2 className="text-lg font-semibold text-roma-gold">Discover the Eternal City</h2>
          </div>
          <div className="h-full">
            <RomaMap />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mappa;