(() => {
  const key = 'goldenrama440-theme';
  const root = document.documentElement;
  const selector = '[data-golden-toggle]';
  const controls = new WeakSet();
  function savedMode() {
    try { return localStorage.getItem(key) === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  }
  function update() {
    const dark = root.dataset.theme === 'dark';
    document.body?.classList.toggle('dark', dark);
    document.querySelectorAll(selector).forEach(button => {
      button.textContent = dark ? '☀' : '☾';
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    });
  }
  function set(mode) {
    root.dataset.theme = mode === 'light' ? 'light' : 'dark';
    try { localStorage.setItem(key, root.dataset.theme); } catch {}
    update();
  }
  function mount() {
    if (!document.body) return;
    const header = document.body.querySelector(':scope > header');
    if (header && !header.querySelector(selector)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-toggle golden-theme-control';
      button.dataset.goldenToggle = '';
      header.append(button);
    }
    const existing = document.getElementById('theme');
    if (existing) existing.dataset.goldenToggle = '';
    document.querySelectorAll(selector).forEach(button => {
      if (controls.has(button)) return;
      controls.add(button);
      button.addEventListener('click', event => {
        event.stopImmediatePropagation();
        set(root.dataset.theme === 'dark' ? 'light' : 'dark');
      }, true);
    });
    update();
  }
  root.dataset.theme = savedMode();
  window.GoldenTheme = { set, mount };
  document.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      root.dataset.theme = savedMode();
      update();
    }
  });
})();
