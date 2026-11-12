/**
 * Formatierung von Datum, Uhrzeit und Spielstatus (Schweizer Format).
 */

const LOCALE = 'de-CH';

const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
const shortDayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: '2-digit', month: '2-digit' });

/** Heutiges Datum als YYYY-MM-DD in lokaler Zeit */
export const todayIso = () => new Date().toLocaleDateString('sv-SE');

/** Verschiebt ein YYYY-MM-DD-Datum um `days` Tage */
export function shiftDate(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('sv-SE');
}

export const formatTime = (iso) => timeFormat.format(new Date(iso));

export function formatDay(isoDate) {
  const today = todayIso();
  if (isoDate === today) return 'Heute';
  if (isoDate === shiftDate(today, -1)) return 'Gestern';
  if (isoDate === shiftDate(today, 1)) return 'Morgen';
  return dayFormat.format(new Date(`${isoDate}T12:00:00`));
}

export const formatShortDateTime = (iso) => `${shortDayFormat.format(new Date(iso))}, ${formatTime(iso)}`;

const STATUS_LABELS = {
  FT: 'Ende',
  AET: 'n.V.',
  'FT-Pens': 'n.E.',
  HT: 'Pause',
  Postponed: 'Verschoben',
  Canceled: 'Abgesagt',
  Abandoned: 'Abgebrochen',
};

/**
 * Liefert Text und Farbton für den Status eines Spiels.
 * @returns {{ label: string, tone: 'live' | 'final' | 'upcoming' }}
 */
export function formatStatus(match) {
  const label = STATUS_LABELS[match.statusText];
  if (match.status === 'in') return { label: label ?? match.statusText, tone: 'live' };
  if (match.status === 'post') return { label: label ?? 'Ende', tone: 'final' };
  return { label: label ?? formatTime(match.kickoff), tone: 'upcoming' };
}
