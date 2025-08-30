/**
 * Fetch AS Roma fixtures from API-Football
 * 
 * Environment variables required:
 * - API_FOOTBALL_KEY: Your API key from api-football.com
 * - ROMA_TEAM_ID: Team ID for AS Roma (default: 497)
 * - SEASON: Season year (default: current year)
 */

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
    };
    venue: {
      id: number;
      name: string;
    };
    periods: {
      first: number | null;
      second: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface ApiFootballResponse {
  get: string;
  parameters: Record<string, any>;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: ApiFootballFixture[];
}

export interface RomaFixture {
  id: number;
  date: string;
  status: string;
  league: {
    id: number;
    name: string;
  };
  home: {
    id: number;
    name: string;
    goals: number | null;
  };
  away: {
    id: number;
    name: string;
    goals: number | null;
  };
  venue: string;
  round: string;
}

export interface RomaMatchesData {
  lastUpdated: string;
  teamId: number;
  season: number;
  fixtures: RomaFixture[];
}

export async function fetchRomaMatches(): Promise<RomaMatchesData> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY environment variable is required');
  }

  const teamId = parseInt(process.env.ROMA_TEAM_ID || '497');
  const season = parseInt(process.env.SEASON || new Date().getFullYear().toString());

  const url = `https://v3.football.api-sports.io/fixtures?team=${teamId}&season=${season}`;
  
  const response = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'v3.football.api-sports.io'
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data: ApiFootballResponse = await response.json();

  if (data.errors && data.errors.length > 0) {
    throw new Error(`API returned errors: ${JSON.stringify(data.errors)}`);
  }

  // Normalize the fixtures to our simplified format
  const fixtures: RomaFixture[] = data.response.map((fixture) => ({
    id: fixture.fixture.id,
    date: fixture.fixture.date,
    status: fixture.fixture.status.short,
    league: {
      id: fixture.league.id,
      name: fixture.league.name,
    },
    home: {
      id: fixture.teams.home.id,
      name: fixture.teams.home.name,
      goals: fixture.goals.home,
    },
    away: {
      id: fixture.teams.away.id,
      name: fixture.teams.away.name,
      goals: fixture.goals.away,
    },
    venue: fixture.fixture.venue.name,
    round: fixture.league.round,
  }));

  return {
    lastUpdated: new Date().toISOString(),
    teamId,
    season,
    fixtures,
  };
}