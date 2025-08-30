/**
 * MatchList component for displaying Roma matches with Italian labels
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Trophy, Zap } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { formatMatchDate, formatRelativeTime, formatMatchDay } from '@/lib/formatDate';
import { getItalianStatus, isMatchLive } from '@/lib/matches/statusMap';

interface Match {
  id: string;
  home_team: {
    name: string;
    logo_url?: string;
  };
  away_team: {
    name: string;
    logo_url?: string;
  };
  competition: {
    name: string;
    logo_url?: string;
  };
  match_date: string;
  venue?: string;
  status: string;
  home_score?: number;
  away_score?: number;
  elapsed_time?: number;
  round?: string;
}

interface MatchListProps {
  matches: Match[];
  loading?: boolean;
  error?: string;
  className?: string;
  showLiveIndicator?: boolean;
  groupByCompetition?: boolean;
}

export function MatchList({ 
  matches, 
  loading = false, 
  error, 
  className = '',
  showLiveIndicator = true,
  groupByCompetition = false
}: MatchListProps) {
  const { t, getSection } = useT();
  const matchesStrings = getSection('matches');

  // Group matches by competition if requested
  const groupedMatches = groupByCompetition
    ? matches.reduce((groups, match) => {
        const competition = match.competition.name;
        if (!groups[competition]) {
          groups[competition] = [];
        }
        groups[competition].push(match);
        return groups;
      }, {} as Record<string, Match[]>)
    : { 'All Matches': matches };

  const isRomaHome = (match: Match) => {
    return match.home_team.name.toLowerCase().includes('roma');
  };

  const isRomaMatch = (match: Match) => {
    return match.home_team.name.toLowerCase().includes('roma') || 
           match.away_team.name.toLowerCase().includes('roma');
  };

  const getScoreDisplay = (match: Match) => {
    if (match.home_score !== null && match.home_score !== undefined && 
        match.away_score !== null && match.away_score !== undefined) {
      return `${match.home_score} - ${match.away_score}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">{matchesStrings.noMatches}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groupedMatches).map(([competitionName, competitionMatches]) => (
        <div key={competitionName}>
          {groupByCompetition && (
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-roma-red" />
              {competitionName}
            </h3>
          )}
          
          <div className="space-y-3">
            {competitionMatches.map((match) => {
              const matchStatus = getItalianStatus(match.status);
              const isLive = isMatchLive(match.status);
              const romaHome = isRomaHome(match);
              const { date, time, relative } = formatMatchDate(match.match_date);
              const score = getScoreDisplay(match);

              return (
                <Card key={match.id} className={`transition-all duration-200 hover:shadow-lg ${
                  isLive ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                } ${isRomaMatch(match) ? 'border-roma-red border-opacity-30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {/* Status and Live Indicator */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={isLive ? 'destructive' : 'secondary'}
                            className={`text-xs ${isLive ? 'animate-pulse bg-green-600' : ''}`}
                          >
                            {isLive && showLiveIndicator && (
                              <Zap className="w-3 h-3 mr-1" />
                            )}
                            {isLive ? matchesStrings.live : matchStatus.italian}
                          </Badge>
                          
                          {match.elapsed_time && isLive && (
                            <Badge variant="outline" className="text-xs">
                              {match.elapsed_time}'
                            </Badge>
                          )}

                          {match.round && (
                            <Badge variant="outline" className="text-xs">
                              {formatMatchDay(match.round)}
                            </Badge>
                          )}
                        </div>

                        {/* Teams and Score */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-semibold mb-1">
                              <span className={romaHome ? "text-roma-red font-bold" : ""}>
                                {match.home_team.name}
                              </span>
                              <span className="mx-2 text-muted-foreground">{matchesStrings.vs}</span>
                              <span className={!romaHome ? "text-roma-red font-bold" : ""}>
                                {match.away_team.name}
                              </span>
                            </div>
                          </div>
                          
                          {score && (
                            <div className="text-lg font-bold text-center min-w-[60px] px-2 py-1 bg-gray-100 rounded">
                              {score}
                            </div>
                          )}
                        </div>

                        {/* Match Details */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {relative ? `${relative} • ${time}` : `${date} • ${time}`}
                            </span>
                          </div>
                          
                          {match.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{match.venue}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            <span>{match.competition.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}