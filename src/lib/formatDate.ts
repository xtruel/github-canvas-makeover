/**
 * Date formatting utilities with Italian locale support
 */

import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Format a date for display in Italian
 */
export function formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern, { locale: it });
}

/**
 * Format a time for display in Italian
 */
export function formatTime(date: Date | string, pattern: string = 'HH:mm'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern, { locale: it });
}

/**
 * Format a full date and time for display in Italian
 */
export function formatDateTime(date: Date | string, pattern: string = 'dd/MM/yyyy HH:mm'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern, { locale: it });
}

/**
 * Format a match date with smart formatting (today, tomorrow, etc.)
 */
export function formatMatchDate(date: Date | string): {
  date: string;
  time: string;
  relative?: string;
} {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  let relative: string | undefined;
  
  if (isToday(dateObj)) {
    relative = 'Oggi';
  } else if (isTomorrow(dateObj)) {
    relative = 'Domani';
  } else if (isYesterday(dateObj)) {
    relative = 'Ieri';
  }

  return {
    date: format(dateObj, 'dd/MM', { locale: it }),
    time: format(dateObj, 'HH:mm', { locale: it }),
    relative
  };
}

/**
 * Format a relative time distance in Italian
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { 
    addSuffix: true,
    locale: it 
  });
}

/**
 * Format a match day display (for competitions like "Giornata 15")
 */
export function formatMatchDay(round: string): string {
  // Handle common round formats
  if (round.includes('Regular Season')) {
    const match = round.match(/Regular Season - (\d+)/);
    if (match) {
      return `Giornata ${match[1]}`;
    }
  }
  
  if (round.includes('Matchday')) {
    const match = round.match(/Matchday (\d+)/);
    if (match) {
      return `Giornata ${match[1]}`;
    }
  }

  // Handle specific tournament phases
  const phaseTranslations: Record<string, string> = {
    'Final': 'Finale',
    'Semi-finals': 'Semifinali',
    'Quarter-finals': 'Quarti di finale',
    'Round of 16': 'Ottavi di finale',
    'Round of 32': 'Sedicesimi di finale',
    'Group Stage': 'Fase a gironi',
    'Preliminary Round': 'Turno preliminare',
    'Play-offs': 'Play-off',
    '1st Qualifying Round': '1° turno di qualificazione',
    '2nd Qualifying Round': '2° turno di qualificazione',
    '3rd Qualifying Round': '3° turno di qualificazione',
  };

  for (const [english, italian] of Object.entries(phaseTranslations)) {
    if (round.includes(english)) {
      return round.replace(english, italian);
    }
  }

  // Return as-is if no translation found
  return round;
}

/**
 * Get Italian day name
 */
export function getDayName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE', { locale: it });
}

/**
 * Get Italian month name
 */
export function getMonthName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM', { locale: it });
}