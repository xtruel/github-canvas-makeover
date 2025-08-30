import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Trophy, Swords } from "lucide-react";
import { RomaMatches } from "@/components/RomaMatches";
import { useEffect, useState } from "react";

interface ScrapedEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: string;
  source: string;
}

const Eventi = () => {
  const [scrapedEvents, setScrapedEvents] = useState<ScrapedEvent[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchScrapedEvents = async () => {
      try {
        // Try to load Supabase dynamically (optional functionality)
        try {
          const { supabase } = await import("../../legacy/integrations/supabase/client");
          const { data, error } = await supabase.functions.invoke('scrape-roma-events');
          
          if (error) {
            console.error('Error fetching scraped events:', error);
          } else if (data?.success) {
            setScrapedEvents(data.events || []);
          }
        } catch (supabaseError) {
          console.log('Supabase not available for scraped events - using static data only');
        }
      } catch (error) {
        console.error('Error calling scrape function:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScrapedEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'calcio':
        return <Trophy className="h-5 w-5" />;
      case 'scherma':
        return <Swords className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Eventi e Partite
      </h1>
      
      {/* Sezione Partite */}
      <section className="mb-12">
        <RomaMatches />
      </section>

      {/* Sezione Eventi Sportivi da Turismo Roma */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-roma-gold">
          Eventi Sportivi Ufficiali
        </h2>
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-glow border-border/50 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {scrapedEvents.map((evento) => (
              <Card key={evento.id} className="shadow-glow border-border/50 hover:shadow-roma transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-roma-gold flex items-center gap-2">
                    {getEventIcon(evento.type)}
                    {evento.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <p className="text-roma-yellow/80 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(evento.date)}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {evento.location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {evento.description}
                      </p>
                      <p className="text-xs text-roma-gold/60">
                        Fonte: {evento.source}
                      </p>
                    </div>
                    <Button className="shadow-roma">
                      Info & Biglietti
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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