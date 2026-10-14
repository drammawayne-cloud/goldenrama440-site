'use strict';
(() => {
  const SITE = 'goldenrama440';
  const grid = document.getElementById('catalog-tracks');
  if (!grid) return;
  const normalized = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  };
  const products = new Map();
  function enhance() {
    for (const card of grid.querySelectorAll('article')) {
      if (card.dataset.publicPreview === 'ready') continue;
      const title = card.querySelector('h3')?.textContent;
      const product = products.get(normalized(title));
      const status = card.querySelector('span');
      if (!product) {
        if (status) status.textContent = 'Public preview coming soon';
        continue;
      }
      const preview = safeUrl(product.preview?.url);
      if (preview) {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.preload = 'none';
        audio.src = preview;
        audio.setAttribute('aria-label', 'Free public preview of ' + title);
        card.append(audio);
        if (status) status.textContent = 'Free preview · No membership needed';
      } else if (status) status.textContent = 'Public preview coming soon';
      const buy = document.createElement('a');
      buy.href = '/addons/store/?product=' + encodeURIComponent(product.id);
      buy.textContent = 'Purchase song ↗';
      buy.setAttribute('aria-label', 'Purchase ' + title);
      card.append(buy);
      card.dataset.publicPreview = 'ready';
    }
  }
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; enhance(); });
  });
  observer.observe(grid, {childList:true});
  async function load() {
    try {
      const response = await fetch('https://console.richrowrecords.com/api/addon/catalog?site=' + SITE, {
        credentials:'omit', cache:'no-store', signal:AbortSignal.timeout(12000)
      });
      if (!response.ok) return;
      const catalog = await response.json();
      if (!Array.isArray(catalog)) return;
      for (const item of catalog) {
        if (item.site !== SITE || item.published !== true ||
            !/^[0-9a-f-]{36}$/i.test(item.id || '')) continue;
        products.set(normalized(item.title), item);
      }
      enhance();
    } catch { /* Keep original catalog available when the store API is offline. */ }
  }
  enhance();
  load();
})();
