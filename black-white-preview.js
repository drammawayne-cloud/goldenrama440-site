'use strict';
(() => {
  const root = document.querySelector('main');
  if (!root) return;
  const selector = '#music .catalog-card audio, #catalog-tracks article audio';
  const format = seconds => {
    const n = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
    return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
  };
  const players = new Set();
  function upgrade(audio) {
    if (audio.dataset.bwPlayer) return;
    audio.dataset.bwPlayer = 'ready';
    const card = audio.closest('article');
    const title = card?.querySelector('h3')?.textContent?.trim() || 'song';
    const bar = document.createElement('div');
    bar.className = 'bw-preview-player';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Public preview player for ' + title);
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'bw-preview-play';
    play.textContent = '▶';
    play.setAttribute('aria-label', 'Play preview of ' + title);
    const timeline = document.createElement('input');
    timeline.type = 'range';
    timeline.className = 'bw-preview-seek';
    timeline.min = '0';
    timeline.max = '30';
    timeline.step = '0.1';
    timeline.value = '0';
    timeline.setAttribute('aria-label', 'Seek through preview of ' + title);
    const clock = document.createElement('span');
    clock.className = 'bw-preview-time';
    clock.textContent = '0:00 / 0:30';
    const update = () => {
      const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 30;
      timeline.max = String(duration);
      timeline.value = String(Math.min(duration, audio.currentTime || 0));
      timeline.style.setProperty('--played', (Math.min(100, (audio.currentTime || 0) / duration * 100)) + '%');
      clock.textContent = format(audio.currentTime) + ' / ' + format(duration);
      const playing = !audio.paused && !audio.ended;
      play.textContent = playing ? '❚❚' : '▶';
      play.setAttribute('aria-label', (playing ? 'Pause' : 'Play') + ' preview of ' + title);
    };
    audio.controls = false;
    audio.classList.add('bw-preview-audio');
    audio.before(bar);
    bar.append(play, timeline, clock);
    play.addEventListener('click', async () => {
      if (!audio.paused) { audio.pause(); return; }
      for (const other of players) if (other !== audio && !other.paused) other.pause();
      try { await audio.play(); } catch { clock.textContent = 'Preview unavailable'; }
    });
    timeline.addEventListener('input', () => {
      if (audio.seekable.length) audio.currentTime = Math.min(Number(timeline.value), audio.duration || 30);
      update();
    });
    for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended']) {
      audio.addEventListener(event, update);
    }
    audio.addEventListener('error', () => { clock.textContent = 'Preview unavailable'; });
    players.add(audio);
    update();
  }
  const scan = () => root.querySelectorAll(selector).forEach(upgrade);
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; scan(); });
  }).observe(root, {childList: true, subtree: true});
  scan();
})();
