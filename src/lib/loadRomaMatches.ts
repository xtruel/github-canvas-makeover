import { RomaMatchesData } from '../scripts/openfootball/parseSerieA';

/**
 * Load Roma matches from local JSON file
 * This provides a fallback data source that doesn't require API keys
 */
export async function loadRomaMatches(): Promise<RomaMatchesData | null> {
  try {
    // In production build, the JSON file should be available in the public directory
    // For development, we'll read from the data directory
    const response = await fetch('/data/roma-matches.json');
    
    if (!response.ok) {
      console.warn('Roma matches file not found, falling back to Supabase');
      return null;
    }
    
    const data = await response.json();
    
    // Validate the data structure
    if (!data || typeof data !== 'object' || !Array.isArray(data.fixtures)) {
      console.warn('Invalid Roma matches data format');
      return null;
    }
    
    return data as RomaMatchesData;
  } catch (error) {
    console.warn('Error loading Roma matches from file:', error);
    return null;
  }
}

/**
 * Convert OpenFootball format to the format expected by RomaMatches component
 */
export function convertToComponentFormat(data: RomaMatchesData) {
  const matches = data.fixtures.map(match => ({
    id: match.id.toString(),
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    competition: match.league,
    eventDate: match.date,
    venue: match.venue || 'TBD',
    status: match.status.toLowerCase(),
    homeScore: match.homeScore,
    awayScore: match.awayScore
  }));

  // Split into men's and women's matches (OpenFootball only has men's Serie A)
  return {
    menMatches: matches,
    womenMatches: [] // OpenFootball doesn't include women's matches for Serie A
  };
}