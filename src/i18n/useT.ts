/**
 * Translation hook for internationalization
 */

import { strings, type SupportedLanguage, type Strings } from './strings';

// Current language - can be made dynamic in the future
const currentLanguage: SupportedLanguage = 'it';

/**
 * Translation hook for accessing localized strings
 * 
 * @returns Object with translation function and current strings
 */
export function useT() {
  const currentStrings = strings[currentLanguage];

  /**
   * Get a translated string by key path
   * 
   * @param keyPath - Dot-separated path to the string (e.g., 'matches.live')
   * @param fallback - Fallback value if key is not found
   * @returns Translated string
   */
  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    let value: unknown = currentStrings;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return fallback || keyPath;
      }
    }

    return typeof value === 'string' ? value : fallback || keyPath;
  };

  /**
   * Get a section of translations
   * 
   * @param section - Section name (e.g., 'matches', 'common')
   * @returns Section object
   */
  const getSection = <K extends keyof Strings>(section: K): Strings[K] => {
    return currentStrings[section];
  };

  return {
    t,
    getSection,
    strings: currentStrings,
    language: currentLanguage,
  };
}

/**
 * Direct translation function for use outside of React components
 * Note: This creates a new translation context each time it's called
 * 
 * @param keyPath - Dot-separated path to the string
 * @param fallback - Fallback value if key is not found
 * @returns Translated string
 */
export function translate(keyPath: string, fallback?: string): string {
  const currentStrings = strings[currentLanguage];
  const keys = keyPath.split('.');
  let value: unknown = currentStrings;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return fallback || keyPath;
    }
  }

  return typeof value === 'string' ? value : fallback || keyPath;
}

/**
 * Get current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): SupportedLanguage[] {
  return Object.keys(strings) as SupportedLanguage[];
}