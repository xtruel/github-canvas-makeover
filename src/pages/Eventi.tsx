import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

const Eventi = () => {
  const eventi = [
    {
      id: 1,
      titolo: "Roma vs Lazio - Derby della Capitale",
      data: "15 Marzo 2024",
      luogo: "Stadio Olimpico",
      partecipanti: 120,
    },
    {
      id: 2,
      titolo: "Raduno Romanisti Milano",
      data: "22 Marzo 2024", 
      luogo: "Pub The Corner, Milano",
      partecipanti: 45,
    },
    {
      id: 3,
      titolo: "Roma vs Juventus - Serata Insieme",
      data: "28 Marzo 2024",
      luogo: "Casa Roma Torino",
      partecipanti: 78,
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Eventi Prossimi
      </h1>
      
      <div className="grid gap-6">
        {eventi.map((evento) => (
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
    </div>
  );
};

export default Eventi;