import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RomaMap from "@/components/RomaMap";

const Mappa = () => {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-2 sm:py-4">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold sm:text-2xl sm:mb-4">
        Mappa di Roma
      </h1>
      
      <div className="grid gap-6 sm:gap-4">
        {/* Mappa - responsive container */}
        <div className="sm:fixed sm:inset-0 sm:z-10 sm:bg-background">
          <div className="sm:absolute sm:top-0 sm:left-0 sm:right-0 sm:bottom-0">
            <Card className="shadow-glow border-border/50 h-full sm:border-0 sm:shadow-none">
              <CardHeader className="sm:absolute sm:top-2 sm:left-2 sm:right-2 sm:z-20 sm:bg-background/95 sm:backdrop-blur-sm sm:rounded-lg sm:p-3">
                <CardTitle className="text-roma-gold sm:text-lg">Discover the Eternal City</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-0 sm:h-full">
                <RomaMap />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Cards info - hidden on mobile when map is fullscreen */}
        <div className="grid md:grid-cols-3 gap-6 sm:hidden">
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
  );
};

export default Mappa;