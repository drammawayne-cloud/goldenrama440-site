'use strict';
(() => {
  const root = document.getElementById('content');
  if (!root) return;
  const key = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const products = new Map();
  const streamingOnly = new Set(["forbibbenbond4", "taken", "alienbrain", "cemetery440", "propagal", "cahcountgoldenramanickapella", "guhfidemcova", "moblandftyardiebritish440", "shewantitftdonyute", "workdatremixftpapajay", "clapitinnaface", "anyweh", "integrity", "liveinnait", "achancemaster", "gudgudmaster", "zombie", "divideconquerp2", "aroundtheworldv2", "capitalp", "whineponditipmix", "fucktonight", "lovetonight", "pollyclassicaldancemix440"]);
  const safe = value => {
    try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : null; }
    catch { return null; }
  };
  function enhance() {
    for (const card of root.querySelectorAll('#music .catalog-card')) {
      if (card.dataset.publicPreview === 'ready') continue;
      const title = card.querySelector('h3')?.textContent;
      const product = products.get(key(title));
      if (!product) continue;
      const audioUrl = safe(product.preview?.url);
      if (audioUrl && !card.querySelector('audio')) {
        const status = card.querySelector('.golden-preview-status');
        if (status) status.textContent = 'Free preview · No membership';
        const audio = document.createElement('audio');
        audio.src = audioUrl;
        audio.controls = true;
        audio.preload = 'none';
        audio.setAttribute('aria-label', 'Free public preview of ' + title);
        card.append(audio);
      }
      const buy = document.createElement('a');
      const streamsOnly = streamingOnly.has(key(title));
      buy.href = streamsOnly ? '/membership.html' : '/addons/store/?product=' + encodeURIComponent(product.id);
      buy.textContent = streamsOnly ? 'Stream with membership ↗' : 'Purchase song ↗';
      card.append(buy);
      card.dataset.publicPreview = 'ready';
    }
  }
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; enhance(); });
  }).observe(root, {childList:true,subtree:true});
  fetch('https://console.richrowrecords.com/api/addon/catalog?site=goldenrama440', {
    credentials:'omit', cache:'no-store', signal:AbortSignal.timeout(12000)
  }).then(r => r.ok ? r.json() : []).then(rows => {
    if (!Array.isArray(rows)) return;
    for (const item of rows) {
      if (item.site !== 'goldenrama440' || item.published !== true ||
          !/^[0-9a-f-]{36}$/i.test(item.id || '')) continue;
      products.set(key(item.title), item);
    }
    enhance();
  }).catch(() => {});
})();
