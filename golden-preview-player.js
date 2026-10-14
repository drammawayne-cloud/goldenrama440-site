'use strict';
(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const key = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const previews = new Map();
  let pending = false;
  function enhance() {
    for (const card of main.querySelectorAll('#music .catalog-card, #catalog-tracks article')) {
      if (card.querySelector('audio')) continue;
      const title = card.querySelector('h3')?.textContent;
      const clip = previews.get(key(title));
      if (!clip || typeof clip.preview !== 'string') continue;
      const url = new URL(clip.preview, location.origin);
      if (url.origin !== location.origin || !url.pathname.startsWith('/previews/') ||
          !url.pathname.endsWith('.mp3')) continue;
      const player = document.createElement('audio');
      player.controls = true;
      player.preload = 'none';
      player.src = url.href;
      player.setAttribute('aria-label', 'Free preview of ' + title);
      const action = card.querySelector('a[href*="/addons/store/"], a.golden-track-link');
      if (action) card.insertBefore(player, action);
      else card.append(player);
      const status = card.querySelector('.golden-preview-status') || card.querySelector('span');
      if (status) status.textContent = 'Free 30-second preview · No membership';
    }
  }
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    queueMicrotask(() => { pending = false; enhance(); });
  }).observe(main, {childList:true,subtree:true});
  fetch('golden-preview-manifest.json', {cache:'no-store'})
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data?.site !== 'goldenrama440' || !Array.isArray(data.tracks)) return;
      for (const clip of data.tracks) {
        if (typeof clip.title === 'string') previews.set(key(clip.title), clip);
      }
      enhance();
    }).catch(() => {});
})();
