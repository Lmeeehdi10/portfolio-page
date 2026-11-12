/**
 * Startseite: Aktuelle Spiele aller Ligen des Tages.
 */
import { getMatchesByDate } from '../services/football.js';
import { render } from '../ui/dom.js';
import { emptyState, errorState, leagueGroup, loadingState } from '../ui/components.js';
import { todayIso } from '../ui/format.js';

const state = {
  date: todayIso(),
  groups: [],
};

const dom = {
  list: document.getElementById('matches'),
};

function renderMatches() {
  if (state.groups.length === 0) {
    render(dom.list, emptyState('Keine Spiele', 'An diesem Tag finden in den ausgewählten Ligen keine Spiele statt.'));
    return;
  }
  render(dom.list, state.groups.map((group) => leagueGroup(group)));
}

async function loadMatches() {
  render(dom.list, loadingState('Spiele werden geladen …'));
  try {
    const { groups } = await getMatchesByDate(state.date);
    state.groups = groups;
    renderMatches();
  } catch (error) {
    render(dom.list, errorState(error.message, loadMatches));
  }
}

export function initHomePage() {
  if (!dom.list) return;
  loadMatches();
}
