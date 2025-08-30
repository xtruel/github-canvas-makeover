/**
 * Data normalization utilities for API Football fixtures
 */

import type { ApiFootballFixture } from '../apiFootball';

export interface NormalizedTeam {
  api_football_id: number;
  name: string;
  logo_url: string;
  country?: string;
  founded?: number;
  venue_name?: string;
  venue_city?: string;
}

export interface NormalizedCompetition {
  api_football_id: number;
  name: string;
  country: string;
  logo_url: string;
  type: string;
  season: number;
}

export interface NormalizedMatch {
  api_football_id: number;
  home_team: NormalizedTeam;
  away_team: NormalizedTeam;
  competition: NormalizedCompetition;
  match_date: string; // ISO string
  venue: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  elapsed_time: number | null;
  referee: string | null;
  season: number;
  round: string;
}

/**
 * Normalize API Football status to our internal status format
 */
function normalizeMatchStatus(apiStatus: { long: string; short: string; elapsed: number | null }): string {
  const statusMap: Record<string, string> = {
    // Scheduled matches
    'TBD': 'scheduled',        // Time To Be Defined
    'NS': 'scheduled',         // Not Started
    'PST': 'postponed',        // Postponed
    'CANC': 'cancelled',       // Cancelled
    'ABD': 'abandoned',        // Abandoned
    'AWD': 'awarded',          // Technical Loss
    'WO': 'walkover',          // WalkOver
    
    // Live matches
    '1H': 'live',              // First Half
    'HT': 'live',              // Halftime
    '2H': 'live',              // Second Half
    'ET': 'live',              // Extra Time
    'BT': 'live',              // Break Time (in Extra Time)
    'P': 'live',               // Penalty In Progress
    'SUSP': 'suspended',       // Match Suspended
    'INT': 'interrupted',      // Match Interrupted
    'LIVE': 'live',            // Match In Progress
    
    // Finished matches
    'FT': 'finished',          // Match Finished
    'AET': 'finished',         // Match Finished After Extra Time
    'PEN': 'finished',         // Match Finished After Penalty
  };

  return statusMap[apiStatus.short] || 'unknown';
}

/**
 * Determine competition type based on competition name
 */
function getCompetitionType(competitionName: string): string {
  const name = competitionName.toLowerCase();
  
  if (name.includes('serie a') || name.includes('premier league') || name.includes('la liga') || 
      name.includes('bundesliga') || name.includes('ligue 1')) {
    return 'league';
  }
  
  if (name.includes('champions league') || name.includes('europa league') || 
      name.includes('conference league')) {
    return 'european_cup';
  }
  
  if (name.includes('coppa') || name.includes('cup') || name.includes('coupe')) {
    return 'domestic_cup';
  }
  
  if (name.includes('supercoppa') || name.includes('super cup')) {
    return 'super_cup';
  }
  
  return 'other';
}

/**
 * Normalize a single API Football fixture to our internal format
 */
export function normalizeFixture(fixture: ApiFootballFixture): NormalizedMatch {
  // Normalize teams
  const homeTeam: NormalizedTeam = {
    api_football_id: fixture.teams.home.id,
    name: fixture.teams.home.name,
    logo_url: fixture.teams.home.logo,
    venue_name: fixture.fixture.venue.name || undefined,
    venue_city: fixture.fixture.venue.city || undefined,
  };

  const awayTeam: NormalizedTeam = {
    api_football_id: fixture.teams.away.id,
    name: fixture.teams.away.name,
    logo_url: fixture.teams.away.logo,
  };

  // Normalize competition
  const competition: NormalizedCompetition = {
    api_football_id: fixture.league.id,
    name: fixture.league.name,
    country: fixture.league.country,
    logo_url: fixture.league.logo,
    type: getCompetitionType(fixture.league.name),
    season: fixture.league.season,
  };

  // Normalize match
  const normalizedMatch: NormalizedMatch = {
    api_football_id: fixture.fixture.id,
    home_team: homeTeam,
    away_team: awayTeam,
    competition,
    match_date: fixture.fixture.date,
    venue: fixture.fixture.venue.name,
    status: normalizeMatchStatus(fixture.fixture.status),
    home_score: fixture.goals.home,
    away_score: fixture.goals.away,
    elapsed_time: fixture.fixture.status.elapsed,
    referee: fixture.fixture.referee,
    season: fixture.league.season,
    round: fixture.league.round,
  };

  return normalizedMatch;
}

/**
 * Normalize multiple API Football fixtures
 */
export function normalizeFixtures(fixtures: ApiFootballFixture[]): NormalizedMatch[] {
  return fixtures.map(normalizeFixture);
}

/**
 * Extract unique teams from normalized matches
 */
export function extractUniqueTeams(matches: NormalizedMatch[]): NormalizedTeam[] {
  const teamsMap = new Map<number, NormalizedTeam>();

  matches.forEach(match => {
    teamsMap.set(match.home_team.api_football_id, match.home_team);
    teamsMap.set(match.away_team.api_football_id, match.away_team);
  });

  return Array.from(teamsMap.values());
}

/**
 * Extract unique competitions from normalized matches
 */
export function extractUniqueCompetitions(matches: NormalizedMatch[]): NormalizedCompetition[] {
  const competitionsMap = new Map<number, NormalizedCompetition>();

  matches.forEach(match => {
    competitionsMap.set(match.competition.api_football_id, match.competition);
  });

  return Array.from(competitionsMap.values());
}