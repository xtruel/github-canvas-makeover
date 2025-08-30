import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Trophy } from "lucide-react";
import { loadRomaMatches, getUpcomingMatches, isRomaHome, type RomaFixture } from "@/lib/loadRomaMatches";

interface LegacyMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  eventDate: string;
  venue: string;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
}

interface LegacyMatchesData {
  menMatches: LegacyMatch[];
  womenMatches: LegacyMatch[];
}

export const RomaMatches = () => {
  const [matches, setMatches] = useState<RomaFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'json' | 'supabase'>('json');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Try loading from JSON first
        try {
          const data = await loadRomaMatches();
          const upcomingMatches = getUpcomingMatches(data);
          setMatches(upcomingMatches);
          setDataSource('json');
          console.log(`Loaded ${upcomingMatches.length} matches from JSON data (last updated: ${data.lastUpdated})`);
          return;
        } catch (jsonError) {
          console.warn('Failed to load from JSON, trying Supabase fallback:', jsonError);
        }

        // Fallback to Supabase if available
        try {
          const { supabase } = await import("../../legacy/integrations/supabase/client");
          const { data, error: functionError } = await supabase.functions.invoke('fetch-roma-matches');
          
          if (functionError) {
            throw new Error(`Supabase error: ${functionError.message}`);
          }

          const legacyData = data as LegacyMatchesData;
          // Convert legacy format to new format
          const convertedMatches: RomaFixture[] = legacyData.menMatches.map((match, index) => ({
            id: parseInt(match.id) || index,
            date: match.eventDate,
            status: match.status === 'scheduled' ? 'NS' : match.status.toUpperCase(),
            league: {
              id: 135, // Serie A default
              name: match.competition,
            },
            home: {
              id: match.homeTeam.toLowerCase().includes('roma') ? 497 : 0,
              name: match.homeTeam,
              goals: match.homeScore,
            },
            away: {
              id: match.awayTeam.toLowerCase().includes('roma') ? 497 : 0,
              name: match.awayTeam,
              goals: match.awayScore,
            },
            venue: match.venue || '',
            round: 'Regular Season',
          }));

          setMatches(convertedMatches);
          setDataSource('supabase');
          console.log(`Loaded ${convertedMatches.length} matches from Supabase fallback`);
        } catch (supabaseError) {
          console.warn('Supabase fallback also failed:', supabaseError);
          throw new Error('No data sources available');
        }

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-roma-red">
          <Trophy className="h-5 w-5" />
          Prossime Partite AS Roma
        </CardTitle>
        {dataSource === 'json' && (
          <p className="text-xs text-muted-foreground">
            Aggiornato automaticamente da API-Football
          </p>
        )}
        {dataSource === 'supabase' && (
          <p className="text-xs text-muted-foreground">
            Dati da fonte alternativa
          </p>
        )}
      </CardHeader>

      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-sm text-muted-foreground">Nessuna partita programmata al momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {matches.slice(0, 6).map((match) => {
              const { date, time } = formatDate(match.date);
              const romaHome = isRomaHome(match);
              
              return (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {match.league.name}
                          </Badge>
                          {romaHome && (
                            <Badge variant="outline" className="text-xs border-roma-red text-roma-red">
                              CASA
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          <span className={romaHome ? "text-roma-red font-semibold" : ""}>
                            {match.home.name}
                          </span>
                          {" vs "}
                          <span className={!romaHome ? "text-roma-red font-semibold" : ""}>
                            {match.away.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {time}
                          </div>
                          {match.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {match.venue}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};