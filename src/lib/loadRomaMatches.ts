/**
 * Utility to load Roma matches from the JSON file
 * 
 * This utility provides a client-side loader for the Roma matches data
 * stored in the versioned JSON file. It fetches the data dynamically
 * so updates appear immediately after redeploy.
 */

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

/**
 * Load Roma matches from the JSON file
 * @returns Promise resolving to Roma matches data
 */
export async function loadRomaMatches(): Promise<RomaMatchesData> {
  try {
    // Use dynamic fetch to ensure we get the latest data after redeploy
    const response = await fetch('/data/roma-matches.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load Roma matches: ${response.status} ${response.statusText}`);
    }
    
    const data: RomaMatchesData = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading Roma matches:', error);
    
    // Return empty data structure as fallback
    return {
      lastUpdated: new Date().toISOString(),
      teamId: 497,
      season: new Date().getFullYear(),
      fixtures: []
    };
  }
}

/**
 * Get upcoming Roma matches (matches with status 'NS' - Not Started)
 * @param data Roma matches data
 * @returns Array of upcoming fixtures
 */
export function getUpcomingMatches(data: RomaMatchesData): RomaFixture[] {
  return data.fixtures
    .filter(fixture => fixture.status === 'NS')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get completed Roma matches (matches with status 'FT' - Full Time)
 * @param data Roma matches data
 * @returns Array of completed fixtures sorted by date (most recent first)
 */
export function getCompletedMatches(data: RomaMatchesData): RomaFixture[] {
  return data.fixtures
    .filter(fixture => fixture.status === 'FT')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Check if Roma is playing at home for a given fixture
 * @param fixture The fixture to check
 * @param romaTeamId Roma's team ID (default: 497)
 * @returns true if Roma is the home team
 */
export function isRomaHome(fixture: RomaFixture, romaTeamId: number = 497): boolean {
  return fixture.home.id === romaTeamId;
}