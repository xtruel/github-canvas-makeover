import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-roma opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-roma bg-clip-text text-transparent">
              Ovunque Romaniti
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              La comunità globale dei tifosi della AS Roma. Uniti dalla passione giallorossa, 
              ovunque nel mondo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-roma">
                Entra nella Comunità
              </Button>
              <Button variant="secondary" size="lg">
                Scopri di Più
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-primary">Mappa Interattiva</CardTitle>
              <CardDescription>
                Trova i romanisti più vicini a te e i locali dove guardare le partite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Una mappa globale che connette tutti i tifosi della Roma nel mondo.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-primary">Eventi Live</CardTitle>
              <CardDescription>
                Partecipa agli eventi organizzati dai club locali
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Scopri tutti gli eventi in programma nella tua città e nelle vicinanze.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-primary">Community</CardTitle>
              <CardDescription>
                Connettiti con altri tifosi appassionati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Condividi la passione giallorossa con una community globale.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-card/50 border-t border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">
            Forza Roma, Sempre e Ovunque!
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unisciti alla più grande community di tifosi romanisti al mondo. 
            Condividi la passione, trova nuovi amici, vivi la Roma insieme.
          </p>
          <Button size="lg" className="shadow-roma">
            Registrati Ora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
