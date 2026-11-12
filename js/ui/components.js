/**
 * Wiederverwendbare UI-Bausteine. Jede Funktion gibt ein DOM-Element zurück.
 */
import { el } from './dom.js';
import { formatStatus } from './format.js';

export function teamLogo(src, name, size = 28) {
  if (!src) {
    return el('span', { class: 'logo-fallback', style: `--size:${size}px`, 'aria-hidden': 'true' }, name.charAt(0));
  }
  return el('img', { class: 'team-logo', src, alt: '', width: size, height: size, loading: 'lazy' });
}

function matchTeam(team, showScore) {
  return el(
    'div',
    { class: `match__team${team.winner ? ' is-winner' : ''}` },
    teamLogo(team.logo, team.name, 24),
    el('span', { class: 'match__name' }, team.name),
    showScore ? el('span', { class: 'match__score' }, team.score ?? '-') : null,
  );
}

/**
 * Ein einzelnes Spiel.
 * @param {object} match  normalisiertes Spiel
 * @param {boolean} highlight  true, wenn ein Lieblingsteam mitspielt
 */
export function matchCard(match, highlight = false) {
  const status = formatStatus(match);
  const showScore = match.status !== 'pre';

  return el(
    'li',
    { class: `match${highlight ? ' match--favorite' : ''}`, title: match.venue || null },
    el('div', { class: `match__status match__status--${status.tone}` }, status.label),
    el('div', { class: 'match__teams' }, matchTeam(match.home, showScore), matchTeam(match.away, showScore)),
  );
}

/** Alle Spiele einer Liga als Karte */
export function leagueGroup({ league, matches }, isHighlighted = () => false) {
  return el(
    'article',
    { class: 'card league-group' },
    el(
      'header',
      { class: 'league-group__header' },
      el('div', {}, el('h3', {}, league.name), el('p', { class: 'text-muted' }, league.country)),
      el('span', { class: 'badge' }, `${matches.length} ${matches.length === 1 ? 'Spiel' : 'Spiele'}`),
    ),
    el('ul', { class: 'match-list' }, matches.map((match) => matchCard(match, isHighlighted(match)))),
  );
}

export function loadingState(text = 'Daten werden geladen …') {
  return el('div', { class: 'state', role: 'status' }, el('span', { class: 'spinner', 'aria-hidden': 'true' }), text);
}

export function emptyState(title, text) {
  return el('div', { class: 'state state--empty' }, el('strong', {}, title), text ? el('p', {}, text) : null);
}

export function errorState(message, onRetry) {
  return el(
    'div',
    { class: 'state state--error', role: 'alert' },
    el('strong', {}, 'Etwas ist schiefgelaufen'),
    el('p', {}, message),
    onRetry ? el('button', { class: 'btn btn--secondary', type: 'button', onClick: onRetry }, 'Erneut versuchen') : null,
  );
}
