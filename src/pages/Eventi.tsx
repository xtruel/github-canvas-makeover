import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { RomaMatches } from "@/components/RomaMatches";

const Eventi = () => {
  const eventiCommunity = [
    {
      id: 1,
      titolo: "Raduno pre-partita Roma vs Napoli",
      data: "28 Gennaio 2025",
      luogo: "Pub Da Checco, Trastevere",
      partecipanti: 85,
    },
    {
      id: 2,
      titolo: "Trasferta organizzata Udinese",
      data: "2 Febbraio 2025", 
      luogo: "Pullman da Ponte Milvio",
      partecipanti: 42,
    },
    {
      id: 3,
      titolo: "Derby della Capitale - Serata insieme",
      data: "1 Marzo 2025",
      luogo: "Casa Roma Garbatella",
      partecipanti: 156,
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Eventi e Partite
      </h1>
      
      {/* Sezione Partite */}
      <section className="mb-12">
        <RomaMatches />
      </section>

      {/* Sezione Eventi Community */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-roma-gold">
          Eventi della Community
        </h2>
        <div className="grid gap-6">
          {eventiCommunity.map((evento) => (
            <Card key={evento.id} className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-roma-gold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {evento.titolo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-roma-yellow/80 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {evento.data}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {evento.luogo}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {evento.partecipanti} partecipanti
                    </p>
                  </div>
                  <Button className="shadow-roma">
                    Partecipa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Eventi;