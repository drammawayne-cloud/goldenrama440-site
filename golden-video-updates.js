'use strict';
(() => {
  const validAsset = (value, extension) => typeof value === 'string' &&
    new RegExp('^assets/updates/2026-11-25/golden-rama-video-0[1-7]\\.' + extension + '(?:\\?v=20261126)?$').test(value);
  let pending;

  async function mount() {
    if (!document.getElementById('videos')) return;
    try {
      if (!pending) pending = fetch('golden-video-updates.json?v=20261126', {
        cache: 'no-store', signal: AbortSignal.timeout(12000)
      }).then(response => {
        if (!response.ok) throw new Error('Video collection unavailable');
        return response.json();
      });
      const data = await pending;
      const {songNotes} = await import('./account-assets/song-notes.js?v=20261126');
      const section = document.getElementById('videos');
      if (!section || section.querySelector('.golden-video-updates')) return;
      if (data.site !== 'goldenrama440' || !Array.isArray(data.videos)) throw new Error('Invalid video collection');
      const grid = document.createElement('div');
      grid.className = 'golden-video-updates';
      const seen = new Set();
      for (const item of data.videos) {
        if (!validAsset(item.src, 'mp4') || !validAsset(item.poster, 'jpg') ||
            typeof item.title !== 'string' || !item.title.trim() || seen.has(item.src)) continue;
        seen.add(item.src);
        const card = document.createElement('article');
        card.className = 'golden-video-card';
        card.dataset.artist = 'Golden Rama';
        const title = document.createElement('h3');
        title.textContent = item.title;
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'none';
        video.poster = item.poster;
        video.src = item.src;
        const quality = document.createElement('div');
        const controller = import('./account-assets/video-quality.js?v=20261128-cors').then(module => module.attachVideo(video, item, quality));
        video.setAttribute('aria-label', item.title + ' music video');
        const row = document.createElement('div');
        row.className = 'golden-video-actions';
        const button = document.createElement('button');
        button.type = 'button';
        const sync = () => {
          button.textContent = video.paused ? 'Play video' : 'Pause video';
          button.setAttribute('aria-label', (video.paused ? 'Play ' : 'Pause ') + item.title);
        };
        const error = document.createElement('p');
        error.className = 'golden-video-error';
        error.setAttribute('role', 'status');
        error.hidden = true;
        const showError = () => {
          error.textContent = 'This video could not start. Check your connection and try again.';
          error.hidden = false;
          sync();
        };
        button.addEventListener('click', async () => {
          error.hidden = true;
          try {
            if (video.paused) {
              await (await controller).ready();
              if (video.error) video.load();
              await video.play();
            } else video.pause();
          } catch { showError(); }
        });
        for (const event of ['play', 'pause', 'ended', 'emptied']) video.addEventListener(event, sync);
        video.addEventListener('error', showError);
        video.addEventListener('playing', () => { error.hidden = true; });
        sync();
        row.append(button);
        if (Number.isFinite(item.duration) && item.duration > 0) {
          const duration = document.createElement('span');
          const seconds = Math.floor(item.duration);
          duration.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
          duration.setAttribute('aria-label', 'Duration ' + Math.floor(seconds / 60) + ' minutes ' + seconds % 60 + ' seconds');
          row.append(duration);
        }
        card.append(video, title, row, quality, error);
        const notes = songNotes(item); if (notes) card.append(notes);
        grid.append(card);
      }
      if (!grid.children.length) return;
      // Only replace the empty collection message; retain existing published videos.
      for (const node of section.querySelectorAll(':scope > p, :scope > .block')) {
        if (node.textContent.trim() === 'Official videos will appear here.') node.remove();
      }
      const head = section.querySelector('.section-head');
      if (head) head.after(grid); else section.append(grid);
    } catch (error) {
      pending = null;
      console.warn('Golden Rama video update:', error.message);
    }
  }
  window.addEventListener('rr:page-ready', mount);
  // Wait for the published page so its render cannot replace a playing video.
  if (document.documentElement.dataset.goldenPageReady === '1') mount();
})();
