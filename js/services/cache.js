/**
 * Einfacher Cache im localStorage mit Ablaufzeit (TTL).
 * Laufende Anfragen werden zusätzlich im Speicher gehalten, damit
 * gleichzeitige Aufrufe denselben Request teilen (keine Doppel-Requests).
 */

const PREFIX = 'tfp-cache:';
const inflight = new Map();

function read(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() > entry.expires) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function write(key, data, ttl) {
  const value = JSON.stringify({ expires: Date.now() + ttl, data });
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // Speicher voll: abgelaufene Einträge löschen und einmal neu versuchen
    pruneExpired();
    try {
      localStorage.setItem(PREFIX + key, value);
    } catch {
      /* Cache ist optional – ohne Speicherung weiterfahren */
    }
  }
}

/** Entfernt alle abgelaufenen Cache-Einträge */
export function pruneExpired() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => {
        const entry = JSON.parse(localStorage.getItem(key));
        if (!entry || Date.now() > entry.expires) localStorage.removeItem(key);
      });
  } catch {
    /* localStorage nicht verfügbar */
  }
}

/**
 * Liefert Daten aus dem Cache oder lädt sie über `loader` und speichert sie.
 * @param {string} key  eindeutiger Cache-Schlüssel
 * @param {number} ttl  Gültigkeit in Millisekunden
 * @param {() => Promise<any>} loader  Funktion, die die Daten lädt
 */
export async function cached(key, ttl, loader) {
  const hit = read(key);
  if (hit !== null) return hit;
  if (inflight.has(key)) return inflight.get(key);

  const request = loader()
    .then((data) => {
      write(key, data, ttl);
      return data;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, request);
  return request;
}

pruneExpired();
