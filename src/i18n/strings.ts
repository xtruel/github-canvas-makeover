/**
 * Internationalization strings for the application
 */

export interface Strings {
  common: {
    loading: string;
    error: string;
    retry: string;
    save: string;
    cancel: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    all: string;
    none: string;
  };
  matches: {
    title: string;
    noMatches: string;
    live: string;
    finished: string;
    scheduled: string;
    postponed: string;
    cancelled: string;
    vs: string;
    venue: string;
    referee: string;
    competition: string;
    season: string;
    matchday: string;
    kickoff: string;
    fulltime: string;
    halftime: string;
    extratime: string;
    penalties: string;
    homeTeam: string;
    awayTeam: string;
    score: string;
    elapsed: string;
    today: string;
    tomorrow: string;
    yesterday: string;
  };
  teams: {
    asRoma: string;
    asRomaWomen: string;
    roster: string;
    statistics: string;
    nextMatch: string;
    lastMatch: string;
  };
  competitions: {
    serieA: string;
    serieAFemminile: string;
    europaLeague: string;
    conferenceLeague: string;
    championsLeague: string;
    coppaItalia: string;
    supercoppaItaliana: string;
  };
  map: {
    title: string;
    romanistiBars: string;
    historicalSites: string;
    stadiums: string;
    neighborhoods: string;
    loading: string;
    error: string;
    searchPlaces: string;
    filters: string;
    showAll: string;
    roma: string;
    lazio: string;
    venue: string;
    description: string;
    directions: string;
  };
  navigation: {
    home: string;
    matches: string;
    map: string;
    news: string;
    community: string;
    profile: string;
  };
}

export const italianStrings: Strings = {
  common: {
    loading: 'Caricamento...',
    error: 'Errore',
    retry: 'Riprova',
    save: 'Salva',
    cancel: 'Annulla',
    close: 'Chiudi',
    back: 'Indietro',
    next: 'Avanti',
    previous: 'Precedente',
    search: 'Cerca',
    filter: 'Filtra',
    all: 'Tutti',
    none: 'Nessuno',
  },
  matches: {
    title: 'Partite',
    noMatches: 'Nessuna partita trovata',
    live: 'IN DIRETTA',
    finished: 'Finita',
    scheduled: 'Programmata',
    postponed: 'Rinviata',
    cancelled: 'Annullata',
    vs: 'vs',
    venue: 'Stadio',
    referee: 'Arbitro',
    competition: 'Competizione',
    season: 'Stagione',
    matchday: 'Giornata',
    kickoff: 'Calcio d\'inizio',
    fulltime: 'Tempo regolamentare',
    halftime: 'Primo tempo',
    extratime: 'Tempi supplementari',
    penalties: 'Rigori',
    homeTeam: 'Casa',
    awayTeam: 'Trasferta',
    score: 'Risultato',
    elapsed: 'Minuto',
    today: 'Oggi',
    tomorrow: 'Domani',
    yesterday: 'Ieri',
  },
  teams: {
    asRoma: 'AS Roma',
    asRomaWomen: 'AS Roma Femminile',
    roster: 'Rosa',
    statistics: 'Statistiche',
    nextMatch: 'Prossima partita',
    lastMatch: 'Ultima partita',
  },
  competitions: {
    serieA: 'Serie A',
    serieAFemminile: 'Serie A Femminile',
    europaLeague: 'Europa League',
    conferenceLeague: 'Conference League',
    championsLeague: 'Champions League',
    coppaItalia: 'Coppa Italia',
    supercoppaItaliana: 'Supercoppa Italiana',
  },
  map: {
    title: 'Mappa Romanisti',
    romanistiBars: 'Locali Romanisti',
    historicalSites: 'Siti Storici',
    stadiums: 'Stadi',
    neighborhoods: 'Quartieri',
    loading: 'Caricamento mappa...',
    error: 'Errore nel caricamento della mappa',
    searchPlaces: 'Cerca luoghi...',
    filters: 'Filtri',
    showAll: 'Mostra tutti',
    roma: 'Roma',
    lazio: 'Lazio',
    venue: 'Luogo',
    description: 'Descrizione',
    directions: 'Indicazioni',
  },
  navigation: {
    home: 'Home',
    matches: 'Partite',
    map: 'Mappa',
    news: 'News',
    community: 'Community',
    profile: 'Profilo',
  },
};

// Future extensibility - can add more languages here
export const strings = {
  it: italianStrings,
};

export type SupportedLanguage = keyof typeof strings;