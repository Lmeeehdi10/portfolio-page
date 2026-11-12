/**
 * Zentrale Konfiguration: API-Endpunkte, Ligen, Cache-Dauer und Grenzwerte.
 */

export const API = {
  espnSite: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
  espnStandings: 'https://site.api.espn.com/apis/v2/sports/soccer',
  // "123" ist der öffentliche Gratis-Key von TheSportsDB
  sportsDb: 'https://www.thesportsdb.com/api/v1/json/123',
};

/**
 * Unterstützte Wettbewerbe.
 * provider: welche API die Spiele liefert
 * selectable: Teams dieser Liga können als Favorit gewählt werden (inkl. Tabelle)
 */
export const LEAGUES = [
  { id: 'eng.1', name: 'Premier League', country: 'England', provider: 'espn', selectable: true },
  { id: 'esp.1', name: 'LaLiga', country: 'Spanien', provider: 'espn', selectable: true },
  { id: 'ger.1', name: 'Bundesliga', country: 'Deutschland', provider: 'espn', selectable: true },
  { id: 'ita.1', name: 'Serie A', country: 'Italien', provider: 'espn', selectable: true },
  { id: 'fra.1', name: 'Ligue 1', country: 'Frankreich', provider: 'espn', selectable: true },
  { id: 'ned.1', name: 'Eredivisie', country: 'Niederlande', provider: 'espn', selectable: true },
  { id: 'por.1', name: 'Primeira Liga', country: 'Portugal', provider: 'espn', selectable: true },
  { id: 'uefa.champions', name: 'Champions League', country: 'Europa', provider: 'espn', selectable: false },
  { id: 'uefa.europa', name: 'Europa League', country: 'Europa', provider: 'espn', selectable: false },
];

export const getLeague = (id) => LEAGUES.find((league) => league.id === id);

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** Wie lange Antworten im localStorage-Cache gültig bleiben */
export const CACHE_TTL = {
  matchesToday: 2 * MINUTE,
  matchesFuture: 30 * MINUTE,
  matchesPast: 12 * HOUR,
  standings: 30 * MINUTE,
  teams: 24 * HOUR,
  nextMatch: 30 * MINUTE,
  teamInfo: 7 * 24 * HOUR,
};
