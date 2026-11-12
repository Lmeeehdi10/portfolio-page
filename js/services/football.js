/**
 * Zentrale Daten-Schnittstelle der App.
 * Entscheidet pro Liga, welche API zuständig ist, und cached die Ergebnisse.
 */
import { CACHE_TTL, LEAGUES, getLeague } from '../config.js';
import { cached } from './cache.js';
import * as espn from './espn.js';

const providers = { espn };

const todayIso = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD in lokaler Zeit

function matchesTtl(date) {
  const today = todayIso();
  if (date === today) return CACHE_TTL.matchesToday;
  return date < today ? CACHE_TTL.matchesPast : CACHE_TTL.matchesFuture;
}

/**
 * Lädt die Spiele aller Ligen an einem Datum parallel.
 * Fällt eine Liga aus, werden die übrigen trotzdem angezeigt.
 * @returns {{ groups: Array<{league, matches}>, failed: string[] }}
 */
export async function getMatchesByDate(date) {
  const results = await Promise.allSettled(
    LEAGUES.map((league) =>
      cached(`matches:${league.id}:${date}`, matchesTtl(date), () =>
        providers[league.provider].fetchScoreboard(league.id, date),
      ),
    ),
  );

  const groups = [];
  const failed = [];
  results.forEach((result, index) => {
    const league = LEAGUES[index];
    if (result.status === 'rejected') failed.push(league.name);
    else if (result.value.length > 0) groups.push({ league, matches: result.value });
  });
  return { groups, failed };
}

export function getStandings(leagueId) {
  const league = getLeague(leagueId);
  return cached(`standings:${leagueId}`, CACHE_TTL.standings, () =>
    providers[league.provider].fetchStandings(leagueId),
  );
}

export function getTeams(leagueId) {
  const league = getLeague(leagueId);
  return cached(`teams:${leagueId}`, CACHE_TTL.teams, () => providers[league.provider].fetchTeams(leagueId));
}

export function getNextMatch(leagueId, teamId) {
  return cached(`next:${leagueId}:${teamId}`, CACHE_TTL.nextMatch, () => espn.fetchNextMatch(leagueId, teamId));
}
