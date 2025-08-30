/**
 * API Football status code mapping to Italian descriptions
 */

export interface MatchStatus {
  code: string;
  long: string;
  short: string;
  italian: string;
  color: 'gray' | 'green' | 'red' | 'yellow' | 'blue';
  isLive: boolean;
  isFinished: boolean;
}

/**
 * Complete mapping of API Football status codes to Italian
 */
export const statusMap: Record<string, MatchStatus> = {
  // Scheduled matches
  'TBD': {
    code: 'TBD',
    long: 'Time To Be Defined',
    short: 'TBD',
    italian: 'Da definire',
    color: 'gray',
    isLive: false,
    isFinished: false,
  },
  'NS': {
    code: 'NS',
    long: 'Not Started',
    short: 'NS',
    italian: 'Non iniziata',
    color: 'gray',
    isLive: false,
    isFinished: false,
  },
  'PST': {
    code: 'PST',
    long: 'Postponed',
    short: 'PST',
    italian: 'Rinviata',
    color: 'yellow',
    isLive: false,
    isFinished: false,
  },
  'CANC': {
    code: 'CANC',
    long: 'Cancelled',
    short: 'CANC',
    italian: 'Annullata',
    color: 'red',
    isLive: false,
    isFinished: true,
  },
  'ABD': {
    code: 'ABD',
    long: 'Abandoned',
    short: 'ABD',
    italian: 'Sospesa',
    color: 'red',
    isLive: false,
    isFinished: true,
  },
  'AWD': {
    code: 'AWD',
    long: 'Technical Loss',
    short: 'AWD',
    italian: 'Vittoria a tavolino',
    color: 'blue',
    isLive: false,
    isFinished: true,
  },
  'WO': {
    code: 'WO',
    long: 'WalkOver',
    short: 'WO',
    italian: 'Vittoria a tavolino',
    color: 'blue',
    isLive: false,
    isFinished: true,
  },

  // Live matches
  '1H': {
    code: '1H',
    long: 'First Half',
    short: '1T',
    italian: 'Primo tempo',
    color: 'green',
    isLive: true,
    isFinished: false,
  },
  'HT': {
    code: 'HT',
    long: 'Halftime',
    short: 'HT',
    italian: 'Intervallo',
    color: 'green',
    isLive: true,
    isFinished: false,
  },
  '2H': {
    code: '2H',
    long: 'Second Half',
    short: '2T',
    italian: 'Secondo tempo',
    color: 'green',
    isLive: true,
    isFinished: false,
  },
  'ET': {
    code: 'ET',
    long: 'Extra Time',
    short: 'TS',
    italian: 'Tempi supplementari',
    color: 'green',
    isLive: true,
    isFinished: false,
  },
  'BT': {
    code: 'BT',
    long: 'Break Time',
    short: 'BT',
    italian: 'Pausa TS',
    color: 'green',
    isLive: true,
    isFinished: false,
  },
  'P': {
    code: 'P',
    long: 'Penalty In Progress',
    short: 'RIG',
    italian: 'Rigori',
    color: 'green',
    isLive: true,
    isFinished: false,
  },
  'SUSP': {
    code: 'SUSP',
    long: 'Match Suspended',
    short: 'SUSP',
    italian: 'Sospesa',
    color: 'yellow',
    isLive: false,
    isFinished: false,
  },
  'INT': {
    code: 'INT',
    long: 'Match Interrupted',
    short: 'INT',
    italian: 'Interrotta',
    color: 'yellow',
    isLive: false,
    isFinished: false,
  },
  'LIVE': {
    code: 'LIVE',
    long: 'In Progress',
    short: 'LIVE',
    italian: 'In corso',
    color: 'green',
    isLive: true,
    isFinished: false,
  },

  // Finished matches
  'FT': {
    code: 'FT',
    long: 'Match Finished',
    short: 'FT',
    italian: 'Finita',
    color: 'gray',
    isLive: false,
    isFinished: true,
  },
  'AET': {
    code: 'AET',
    long: 'Match Finished After Extra Time',
    short: 'AET',
    italian: 'Finita ai TS',
    color: 'gray',
    isLive: false,
    isFinished: true,
  },
  'PEN': {
    code: 'PEN',
    long: 'Match Finished After Penalty',
    short: 'PEN',
    italian: 'Finita ai rigori',
    color: 'gray',
    isLive: false,
    isFinished: true,
  },
};

/**
 * Get Italian status description for a given status code
 */
export function getItalianStatus(statusCode: string): MatchStatus {
  return statusMap[statusCode] || {
    code: statusCode,
    long: 'Unknown',
    short: statusCode,
    italian: 'Sconosciuto',
    color: 'gray',
    isLive: false,
    isFinished: false,
  };
}

/**
 * Check if a match is currently live
 */
export function isMatchLive(statusCode: string): boolean {
  const status = statusMap[statusCode];
  return status ? status.isLive : false;
}

/**
 * Check if a match is finished
 */
export function isMatchFinished(statusCode: string): boolean {
  const status = statusMap[statusCode];
  return status ? status.isFinished : false;
}

/**
 * Get status color for UI display
 */
export function getStatusColor(statusCode: string): string {
  const status = statusMap[statusCode];
  const colorMap = {
    gray: '#6B7280',
    green: '#10B981',
    red: '#EF4444',
    yellow: '#F59E0B',
    blue: '#3B82F6',
  };
  
  return colorMap[status?.color || 'gray'];
}

/**
 * Get all live status codes
 */
export function getLiveStatusCodes(): string[] {
  return Object.entries(statusMap)
    .filter(([_, status]) => status.isLive)
    .map(([code, _]) => code);
}

/**
 * Get all finished status codes
 */
export function getFinishedStatusCodes(): string[] {
  return Object.entries(statusMap)
    .filter(([_, status]) => status.isFinished)
    .map(([code, _]) => code);
}