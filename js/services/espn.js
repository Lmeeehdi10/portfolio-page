/**
 * Adapter für die ESPN-API.
 * Wandelt die verschachtelten ESPN-Antworten in einfache, einheitliche Objekte um,
 * damit der Rest der App nicht vom Format des Anbieters abhängt.
 */
import { API } from '../config.js';
import { fetchJson } from './http.js';

const PROVIDER = 'espn';

function normalizeCompetitor(competitor = {}) {
  const team = competitor.team ?? {};
  const score = typeof competitor.score === 'object' ? competitor.score?.displayValue : competitor.score;
  return {
    id: String(team.id ?? ''),
    provider: PROVIDER,
    name: team.shortDisplayName ?? team.displayName ?? 'Unbekannt',
    logo: team.logo ?? team.logos?.[0]?.href ?? '',
    score: score ?? null,
    winner: competitor.winner === true,
  };
}

function normalizeEvent(event) {
  const competition = event.competitions?.[0] ?? {};
  const competitors = competition.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === 'home') ?? competitors[0];
  const away = competitors.find((c) => c.homeAway === 'away') ?? competitors[1];
  const status = competition.status ?? event.status ?? {};

  return {
    id: `${PROVIDER}-${event.id}`,
    kickoff: event.date,
    status: status.type?.state ?? 'pre', // 'pre' | 'in' | 'post'
    statusText: status.type?.shortDetail ?? '',
    venue: competition.venue?.fullName ?? '',
    home: normalizeCompetitor(home),
    away: normalizeCompetitor(away),
  };
}

function normalizeStanding(entry) {
  const stats = Object.fromEntries((entry.stats ?? []).map((stat) => [stat.name, stat.value ?? 0]));
  const team = entry.team ?? {};
  return {
    teamId: String(team.id),
    provider: PROVIDER,
    name: team.displayName,
    shortName: team.shortDisplayName ?? team.displayName,
    logo: team.logos?.[0]?.href ?? '',
    rank: stats.rank ?? 0,
    played: stats.gamesPlayed ?? 0,
    won: stats.wins ?? 0,
    drawn: stats.ties ?? 0,
    lost: stats.losses ?? 0,
    goalsFor: stats.pointsFor ?? 0,
    goalsAgainst: stats.pointsAgainst ?? 0,
    goalDiff: stats.pointDifferential ?? 0,
    points: stats.points ?? 0,
    note: entry.note?.description ?? '',
    noteColor: entry.note?.color ?? '',
  };
}

/** Spiele einer Liga an einem Datum (Format YYYY-MM-DD) */
export async function fetchScoreboard(leagueId, date) {
  const data = await fetchJson(`${API.espnSite}/${leagueId}/scoreboard?dates=${date.replaceAll('-', '')}`);
  return (data.events ?? []).map(normalizeEvent);
}

/** Tabelle(n) einer Liga – manche Wettbewerbe haben mehrere Gruppen */
export async function fetchStandings(leagueId) {
  const data = await fetchJson(`${API.espnStandings}/${leagueId}/standings`);
  return (data.children ?? []).map((group) => ({
    name: group.name,
    rows: (group.standings?.entries ?? []).map(normalizeStanding).sort((a, b) => a.rank - b.rank),
  }));
}

/** Alle Teams einer Liga, alphabetisch sortiert */
export async function fetchTeams(leagueId) {
  const data = await fetchJson(`${API.espnSite}/${leagueId}/teams`);
  const teams = data.sports?.[0]?.leagues?.[0]?.teams ?? [];
  return teams
    .map(({ team }) => ({
      id: String(team.id),
      provider: PROVIDER,
      leagueId,
      name: team.displayName,
      shortName: team.shortDisplayName ?? team.displayName,
      logo: team.logos?.[0]?.href ?? '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

/** Nächstes noch nicht gespieltes Spiel eines Teams (oder null) */
export async function fetchNextMatch(leagueId, teamId) {
  const data = await fetchJson(`${API.espnSite}/${leagueId}/teams/${teamId}/schedule?fixture=true`);
  const upcoming = (data.events ?? [])
    .map(normalizeEvent)
    .filter((match) => match.status !== 'post')
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  return upcoming[0] ?? null;
}
