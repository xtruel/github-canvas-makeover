import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, FileText, Info, Upload, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Community = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

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
                {isAdmin ? <Upload className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                {isAdmin ? 'Pubblica Articoli' : 'Area Riservata'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {isAdmin ? 'Carica e pubblica contenuti per la community' : 'Solo l\'amministratore può pubblicare articoli. Se sei l\'admin, accedi dall\'area riservata.'}
              </p>
              {isAdmin ? (
                <Button asChild className="w-full">
                  <Link to="/upload">Vai a Upload</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/__admin_only__">Accedi Area Riservata</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-glow border-border/50">
            <CardHeader>
              <CardTitle className="text-roma-gold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Linee guida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Partecipa con rispetto: niente insulti, spam o contenuti fuori tema.
              </p>
              <Button variant="secondary" className="w-full">Scopri di più</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Community;