/**
 * API Football integration module for fetching fixtures and team data
 */

interface ApiFootballConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

interface ApiFootballFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, unknown>;
  errors: unknown[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

class ApiFootball {
  private config: ApiFootballConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://v3.football.api-sports.io',
      timeout: 30000
    };
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<ApiFootballResponse<T>> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    
    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.config.apiKey,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      },
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`API Football request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors && data.errors.length > 0) {
      throw new Error(`API Football errors: ${JSON.stringify(data.errors)}`);
    }

    return data;
  }

  /**
   * Fetch fixtures for a specific team and season
   */
  async getTeamFixtures(teamId: number, season: number): Promise<ApiFootballFixture[]> {
    const response = await this.makeRequest<ApiFootballFixture>('/fixtures', {
      team: teamId,
      season: season
    });

    return response.response;
  }

  /**
   * Fetch specific fixtures by their IDs
   */
  async getFixturesByIds(fixtureIds: number[]): Promise<ApiFootballFixture[]> {
    if (fixtureIds.length === 0) {
      return [];
    }

    // API Football allows multiple IDs separated by dashes
    const ids = fixtureIds.join('-');
    const response = await this.makeRequest<ApiFootballFixture>('/fixtures', {
      ids: ids
    });

    return response.response;
  }

  /**
   * Fetch live fixtures for a specific team
   */
  async getLiveFixtures(teamId?: number): Promise<ApiFootballFixture[]> {
    const params: Record<string, unknown> = { live: 'all' };
    if (teamId) {
      params.team = teamId;
    }

    const response = await this.makeRequest<ApiFootballFixture>('/fixtures', params);
    return response.response;
  }

  /**
   * Fetch fixtures for a specific date range
   */
  async getFixturesByDateRange(from: string, to: string, teamId?: number): Promise<ApiFootballFixture[]> {
    const params: Record<string, unknown> = { from, to };
    if (teamId) {
      params.team = teamId;
    }

    const response = await this.makeRequest<ApiFootballFixture>('/fixtures', params);
    return response.response;
  }
}

// Create a singleton instance to be used throughout the application
let apiFootballInstance: ApiFootball | null = null;

export function getApiFootball(): ApiFootball {
  if (!apiFootballInstance) {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      throw new Error('API_FOOTBALL_KEY environment variable is required');
    }
    apiFootballInstance = new ApiFootball(apiKey);
  }
  return apiFootballInstance;
}

export { ApiFootball, type ApiFootballFixture, type ApiFootballResponse };