'use strict';
(() => {
  const root = document.getElementById('content');
  if (!root) return;
  let tracks = [];
  let expanded = false;
  const make = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  function render() {
    const section = document.getElementById('music');
    if (!section || !tracks.length || section.querySelector('#golden-public-music')) return;
    const panel = make('div', 'golden-music-browser');
    panel.id = 'golden-public-music';
    const head = make('div', 'golden-music-browser-head');
    head.append(make('h3', '', 'Browse Golden Rama music'),
      make('p', '', 'Free public song previews. No membership needed. Purchase options appear as releases become available.'));
    const link = make('a', 'action', 'Browse all 51 tracks ↗');
    link.href = 'catalog.html';
    head.append(link);
    const grid = make('div', 'golden-music-browser-grid');
    const featured = [...tracks.filter(t => t.collection === 'Singles').slice(0, 8),
      ...tracks.filter(t => t.collection === 'Collaborations').slice(0, 4)];
    const ordered = [...featured, ...tracks.filter(t => !featured.includes(t))];
    const draw = () => {
      grid.replaceChildren();
      for (const track of ordered.slice(0, expanded ? ordered.length : 12)) {
        const card = make('article', 'catalog-card');
        const art = make('img');
        art.src = track.art;
        art.alt = 'Plaqes & Racks ' + track.collection + ' cover';
        art.loading = 'lazy';
        const name = make('h3', '', track.title);
        const collection = make('p', '', (track.artist || 'Golden Rama') + ' · ' + track.collection);
        const status = make('span', 'golden-preview-status', 'Free preview coming soon');
        const open = make('a', 'golden-track-link', 'View track ↗');
        open.href = 'catalog.html?q=' + encodeURIComponent(track.title);
        card.append(art, name, collection, status, open);
        grid.append(card);
      }
    };
    draw();
    panel.append(head, grid);
    const more = make('button', 'golden-music-more', 'Show all 51 tracks');
    more.type = 'button';
    more.addEventListener('click', () => {
      expanded = !expanded;
      more.textContent = expanded ? 'Show fewer tracks' : 'Show all 51 tracks';
      draw();
    });
    panel.append(more);
    section.append(panel);
  }
  window.addEventListener('rr:page-ready', render);
  fetch('golden-music-catalog.json', {cache:'no-store'})
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data?.site !== 'goldenrama440' || !Array.isArray(data.tracks)) return;
      tracks = data.tracks.filter(t => typeof t.title === 'string' &&
        ['Singles', 'Collaborations'].includes(t.collection));
      render();
    }).catch(() => {});
})();
