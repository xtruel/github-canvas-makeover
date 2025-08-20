import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  eventDate: string;
  venue: string;
  status: string;
}

interface MatchesData {
  menMatches: Match[];
  womenMatches: Match[];
}

export const RomaMatches = () => {
  const [matches, setMatches] = useState<MatchesData>({ menMatches: [], womenMatches: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const { data, error: functionError } = await supabase.functions.invoke('fetch-roma-matches');
        
        if (functionError) {
          console.error('Error calling function:', functionError);
          setError('Errore nel caricamento delle partite');
          return;
        }

        setMatches(data || { menMatches: [], womenMatches: [] });
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Errore nel caricamento delle partite');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: '2-digit'
      }),
      time: date.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const isRomaHome = (match: Match) => {
    return match.homeTeam.toLowerCase().includes('roma');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Partite Maschili - Sezione Principale */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-roma-red" />
          <h2 className="text-2xl font-bold text-foreground">Prossime Partite AS Roma</h2>
        </div>
        
        {matches.menMatches.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nessuna partita programmata al momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {matches.menMatches.map((match) => {
              const { date, time } = formatDate(match.eventDate);
              const romaHome = isRomaHome(match);
              
              return (
                <Card key={match.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {match.competition}
                          </Badge>
                          {romaHome && (
                            <Badge variant="outline" className="text-xs border-roma-red text-roma-red">
                              CASA
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-lg font-semibold mb-2">
                          <span className={romaHome ? "text-roma-red font-bold" : ""}>
                            {match.homeTeam}
                          </span>
                          <span className="mx-3 text-muted-foreground">vs</span>
                          <span className={!romaHome ? "text-roma-red font-bold" : ""}>
                            {match.awayTeam}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{match.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Partite Femminili - Sezione Secondaria */}
      <section className="border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-roma-yellow" />
          <h3 className="text-lg font-semibold text-foreground">AS Roma Femminile</h3>
        </div>
        
        {matches.womenMatches.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Nessuna partita programmata</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {matches.womenMatches.map((match) => {
              const { date, time } = formatDate(match.eventDate);
              const romaHome = isRomaHome(match);
              
              return (
                <Card key={match.id} className="bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {match.competition}
                          </Badge>
                          {romaHome && (
                            <Badge variant="outline" className="text-xs border-roma-yellow text-roma-yellow">
                              CASA
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm font-medium mb-1">
                          <span className={romaHome ? "text-roma-yellow font-semibold" : ""}>
                            {match.homeTeam}
                          </span>
                          <span className="mx-2 text-muted-foreground">vs</span>
                          <span className={!romaHome ? "text-roma-yellow font-semibold" : ""}>
                            {match.awayTeam}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{date} • {time}</span>
                          <span>• {match.venue}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};