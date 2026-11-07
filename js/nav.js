/**
 * Mobile Navigation: Öffnet/schliesst das Menü über den Hamburger-Button.
 */
export function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.visually-hidden').textContent = open ? 'Menü schliessen' : 'Menü öffnen';
    nav.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Menü mit Escape oder beim Wechsel auf Desktop-Breite schliessen
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  window.matchMedia('(min-width: 768px)').addEventListener('change', () => setOpen(false));
}
