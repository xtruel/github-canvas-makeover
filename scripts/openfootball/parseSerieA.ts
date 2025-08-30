export interface OpenFootballMatch {
  id: number;
  date: string;
  status: 'SCHEDULED' | 'FINISHED';
  league: string;
  round: string | null;
  venue: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface RomaMatchesData {
  lastUpdated: string;
  source: string;
  live: boolean;
  teamName: string;
  season: string;
  fixtures: OpenFootballMatch[];
}

/**
 * Parse Serie A text file from OpenFootball GitHub repository
 * Expected format is based on openfootball/italy repo structure
 */
export function parseSerieAText(content: string): OpenFootballMatch[] {
  const matches: OpenFootballMatch[] = [];
  const lines = content.split('\n');
  
  let currentRound = '';
  let currentDate = '';
  let matchId = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#') || line.startsWith('=')) continue;
    
    // Check for round/matchday indicators
    if (line.match(/^» Matchday \d+/i) || line.match(/^Matchday \d+/i) || line.match(/^Giornata \d+/i)) {
      currentRound = line.replace('»', '').trim();
      continue;
    }
    
    // Check for date lines - format like "Sat Aug/17 2024" or "Sun Aug/18"
    const dateMatch = line.match(/^\s*(\w{3})\s+(\w{3})\/(\d{1,2})(?:\s+(\d{4}))?/);
    if (dateMatch) {
      const [, dayOfWeek, month, day, year] = dateMatch;
      
      // Determine year: if not specified, use 2025 for May onwards, 2024 for earlier months
      let currentYear = year;
      if (!currentYear) {
        const monthMap: { [key: string]: number } = {
          'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
          'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
          'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };
        
        const monthNum = monthMap[month] || 8;
        // Use 2025 for May and later months (end of season), 2024 for earlier
        currentYear = monthNum >= 5 ? '2025' : '2024';
      }
      
      // Convert month abbreviation to number
      const monthNumMap: { [key: string]: string } = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      
      const monthNum = monthNumMap[month] || '01';
      const dayPadded = day.padStart(2, '0');
      currentDate = `${currentYear}-${monthNum}-${dayPadded}`;
      continue;
    }
    
    // Check for time and match lines
    // Format: "    20.45  Cagliari Calcio         v AS Roma                  0-0"
    // or:     "           AS Roma                 v Empoli FC                1-2 (0-1)"
    // or:     "           Torino FC               v AS Roma" (no score = scheduled)
    const matchRegex = /^\s*(?:(\d{1,2}\.\d{2}))?\s+(.+?)\s+v\s+(.+?)(?:\s+(\d+)-(\d+)(?:\s+\(.+\))?)?[\s\r]*$/;
    const match = line.match(matchRegex);
    
    if (match) {
      const [, time, homeTeam, awayTeam, homeScore, awayScore] = match;
      
      // Clean up team names
      const cleanHomeTeam = homeTeam.trim();
      const cleanAwayTeam = awayTeam.trim();
      
      // Only include matches involving Roma
      if (cleanHomeTeam.toLowerCase().includes('roma') || cleanAwayTeam.toLowerCase().includes('roma')) {
        // Parse time if available
        let matchDateTime = currentDate;
        if (time && currentDate) {
          const [hours, minutes] = time.split('.');
          matchDateTime = `${currentDate}T${hours.padStart(2, '0')}:${minutes}:00.000Z`;
        } else if (currentDate) {
          matchDateTime = `${currentDate}T15:00:00.000Z`; // Default time
        } else {
          continue; // Skip if no date available
        }
        
        const status = (homeScore !== undefined && awayScore !== undefined) ? 'FINISHED' : 'SCHEDULED';
        
        matches.push({
          id: matchId++,
          date: matchDateTime,
          status,
          league: 'Serie A',
          round: currentRound || `Matchday ${Math.ceil(matchId / 2)}`,
          venue: null,
          homeTeam: cleanHomeTeam,
          awayTeam: cleanAwayTeam,
          homeScore: homeScore ? parseInt(homeScore) : null,
          awayScore: awayScore ? parseInt(awayScore) : null
        });
      }
    }
  }
  
  return matches;
}

/**
 * Convert OpenFootball matches to the format expected by the UI
 */
export function convertToUIFormat(matches: OpenFootballMatch[]): RomaMatchesData {
  return {
    lastUpdated: new Date().toISOString(),
    source: 'openfootball',
    live: false,
    teamName: 'Roma',
    season: '2024-25',
    fixtures: matches
  };
}