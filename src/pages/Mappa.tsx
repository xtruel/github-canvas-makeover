import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Mappa = () => {
  return (
    <div
      className="flex flex-col w-full"
      // Use min-height so internal sections (like map + drawer) have stable space
      style={{ minHeight: "calc(var(--app-height, 100vh) - 4rem)" }}
    >
      <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg border border-border/50">
        <div className="text-center p-8">
          <div className="text-muted-foreground mb-4">
            <svg className="w-24 h-24 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Mappa in Manutenzione</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            La mappa dei tifosi romanisti è temporaneamente non disponibile. 
            Stiamo lavorando per migliorare l'esperienza utente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/">Torna alla Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/community">Vai alla Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mappa;