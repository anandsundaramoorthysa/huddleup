/* Runs as early as possible in <head> to avoid a flash of wrong theme. */
(function () {
  const STORAGE_KEY = 'huddleup:theme';
  const root = document.documentElement;
  root.classList.add('no-flash');

  function preferred() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // ignore
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0F1A' : '#FFFFFF');
  }

  apply(preferred());

  function ready() {
    root.classList.remove('no-flash');
    root.classList.add('theme-ready');
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = root.classList.contains('dark') ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
      apply(next);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
