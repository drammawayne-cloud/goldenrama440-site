'use strict';
(() => {
  const search = document.getElementById('catalog-search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  if (!search || !filters.length) return;
  const params = new URLSearchParams(location.search);
  const initial = params.get('q');
  const selected = params.get('collection');
  if (initial) {
    search.value = initial.slice(0, 120);
    search.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const chosen = filters.find(button => button.dataset.filter === selected);
  if (chosen) chosen.click();
  function remember() {
    const url = new URL(location.href);
    const q = search.value.trim();
    const active = filters.find(button => button.getAttribute('aria-pressed') === 'true');
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    if (active && active.dataset.filter !== 'All') url.searchParams.set('collection', active.dataset.filter);
    else url.searchParams.delete('collection');
    history.replaceState(history.state, '', url);
  }
  search.addEventListener('input', remember);
  filters.forEach(button => button.addEventListener('click', remember));
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape' && search.value) {
      search.value = '';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
})();
