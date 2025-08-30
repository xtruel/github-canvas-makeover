/**
 * Test page to demonstrate new Italian localization components
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchList } from "@/components/MatchList";
import { MapWithLanguage } from "@/components/MapWithLanguage";
import { useT } from "@/i18n/useT";
import { formatMatchDate, formatDate, formatTime } from "@/lib/formatDate";
import { getItalianStatus } from "@/lib/matches/statusMap";

// Sample match data for demonstration
const sampleMatches = [
  {
    id: "1",
    home_team: { name: "AS Roma", logo_url: "https://example.com/roma.png" },
    away_team: { name: "Napoli", logo_url: "https://example.com/napoli.png" },
    competition: { name: "Serie A", logo_url: "https://example.com/seriea.png" },
    match_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    venue: "Stadio Olimpico",
    status: "NS",
    round: "Regular Season - 15"
  },
  {
    id: "2",
    home_team: { name: "Juventus", logo_url: "https://example.com/juve.png" },
    away_team: { name: "AS Roma", logo_url: "https://example.com/roma.png" },
    competition: { name: "Serie A", logo_url: "https://example.com/seriea.png" },
    match_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    venue: "Allianz Stadium",
    status: "1H",
    home_score: 1,
    away_score: 2,
    elapsed_time: 35,
    round: "Regular Season - 14"
  },
  {
    id: "3",
    home_team: { name: "AS Roma", logo_url: "https://example.com/roma.png" },
    away_team: { name: "Eintracht Frankfurt", logo_url: "https://example.com/frankfurt.png" },
    competition: { name: "Europa League", logo_url: "https://example.com/uel.png" },
    match_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    venue: "Stadio Olimpico",
    status: "FT",
    home_score: 3,
    away_score: 1,
    round: "Round of 16"
  }
];

const TestComponents = () => {
  const { t, getSection } = useT();
  const matchesStrings = getSection('matches');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-roma-gold">
        Test Componenti Italiani
      </h1>

      {/* Translation Test */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Traduzioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Partite:</strong> {t('matches.title')}</p>
              <p><strong>Live:</strong> {t('matches.live')}</p>
              <p><strong>Oggi:</strong> {t('matches.today')}</p>
              <p><strong>VS:</strong> {t('matches.vs')}</p>
            </div>
            <div>
              <p><strong>Stadio:</strong> {t('matches.venue')}</p>
              <p><strong>Caricamento:</strong> {t('common.loading')}</p>
              <p><strong>Errore:</strong> {t('common.error')}</p>
              <p><strong>Cerca:</strong> {t('common.search')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Formatting Test */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Formattazione Date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Data completa:</strong> {formatDate(new Date(), 'dd MMMM yyyy')}</p>
              <p><strong>Data breve:</strong> {formatDate(new Date())}</p>
              <p><strong>Ora:</strong> {formatTime(new Date())}</p>
            </div>
            <div>
              {sampleMatches.map(match => {
                const formatted = formatMatchDate(match.match_date);
                return (
                  <p key={match.id}>
                    <strong>{match.home_team.name} vs {match.away_team.name}:</strong> {' '}
                    {formatted.relative ? `${formatted.relative} ${formatted.time}` : `${formatted.date} ${formatted.time}`}
                  </p>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Mapping Test */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Status Partite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['NS', 'LIVE', '1H', 'HT', '2H', 'FT', 'PST', 'CANC'].map(status => {
              const italianStatus = getItalianStatus(status);
              return (
                <Badge 
                  key={status}
                  variant={italianStatus.isLive ? 'destructive' : 'secondary'}
                  className={italianStatus.isLive ? 'animate-pulse' : ''}
                >
                  {status} → {italianStatus.italian}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Match List Component Test */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Componente Lista Partite</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchList 
            matches={sampleMatches}
            showLiveIndicator={true}
            groupByCompetition={true}
          />
        </CardContent>
      </Card>

      {/* Map Component Test */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Componente Mappa</CardTitle>
        </CardHeader>
        <CardContent>
          <MapWithLanguage 
            height="300px"
            showLanguageNote={true}
            zoom={10}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Istruzioni Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>✅ <strong>Traduzioni:</strong> Tutte le stringhe utilizzano il sistema i18n in italiano</p>
            <p>✅ <strong>Formattazione date:</strong> Usa la libreria date-fns con locale italiano</p>
            <p>✅ <strong>Status partite:</strong> Mapping dei codici API Football in italiano</p>
            <p>✅ <strong>Componenti:</strong> MatchList e MapWithLanguage pronti per l'uso</p>
            <p>✅ <strong>Mappa:</strong> Configurata per etichette in italiano, centrata su Roma</p>
            <p>🔧 <strong>Note:</strong> Per usare i componenti reali, configurare le API keys nel file .env</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestComponents;