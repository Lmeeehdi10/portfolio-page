/**
 * fetch-Wrapper mit Timeout, verständlichen Fehlern und einem Wiederholungsversuch.
 */

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(url, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new ApiError(`Die Daten konnten nicht geladen werden (HTTP ${response.status}).`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw new ApiError('Der Server antwortet nicht (Zeitüberschreitung).');
    if (error instanceof ApiError) throw error;
    throw new ApiError('Keine Verbindung zum Datenanbieter.');
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Lädt JSON von einer URL. Netzwerk- und Serverfehler (5xx) werden einmal wiederholt.
 */
export async function fetchJson(url, { timeout = 10000, retries = 1 } = {}) {
  try {
    return await request(url, timeout);
  } catch (error) {
    const retryable = error.status === 0 || error.status >= 500;
    if (retries > 0 && retryable) return fetchJson(url, { timeout, retries: retries - 1 });
    throw error;
  }
}
