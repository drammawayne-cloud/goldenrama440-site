// Preserve both full-quality masters. Version and network quality are separate choices.
export function trustedStream(value, origin = location.origin) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value, origin);
    return url.origin === origin && !url.username && !url.password &&
      /^\/assets\/updates\/2026-11-26\/golden-rama-video-06(?:-original|-clean)?\/master\.m3u8$/.test(url.pathname) && !url.search && !url.hash ? url.href : '';
  } catch { return ''; }
}
export function videoVersions(item, origin = location.origin) {
  if (!Array.isArray(item.versions)) return [];
  const approved = ['original', 'clean'].map(id => {
    const version = item.versions.find(v => v.id === id);
    if (!version) return null;
    try {
      const url = new URL(version.src, origin);
      if (url.origin !== origin || url.username || url.password || url.hash ||
        !/^\/assets\/updates\/2026-11-(?:25\/golden-rama-video-06|26\/golden-rama-video-06-clean)\.mp4$/.test(url.pathname) ||
        (url.search && url.search !== '?v=20261126')) return null;
      return {...version, id, label:id === 'original' ? 'Original' : 'Clean', src:url.href, hls:trustedStream(version.hls,origin)};
    } catch { return null; }
  });
  return approved.every(Boolean) && approved[0].src !== approved[1].src ? approved : [];
}

export function attachQuality(video, item, host) {
  let hls, disposed = false, observer;
  const start = () => hls?.startLoad(-1);
  const destroy = () => {
    disposed = true; hls?.destroy(); hls = null; observer?.disconnect();
    video.removeEventListener('play', start); video.removeEventListener('error', fallback);
  };
  const stream = trustedStream(item.hls);
  // Native HLS must request CORS permission when a rendition uses our CDN.
  // Every public segment host sends Access-Control-Allow-Origin: *.
  if (stream) video.crossOrigin = 'anonymous';
  const label = document.createElement('label');
  const select = document.createElement('select');
  const fallback = () => {
    if (disposed || select.disabled) return;
    const resume = !video.paused, time = video.currentTime;
    hls?.destroy(); hls = null;
    video.removeEventListener('play',start); video.removeEventListener('error',fallback);
    select.disabled = true;
    const notice = document.createElement('span'); notice.textContent = 'Using compatible playback.'; notice.setAttribute('role','status');
    label.append(notice);
    video.addEventListener('loadedmetadata', () => { if(disposed)return; video.currentTime = Math.min(time, Math.max(0,video.duration - .1)); if (resume) video.play().catch(() => {}); }, {once:true});
    video.src = item.src;
    video.load();
  };
  if (!stream) return Object.assign(Promise.resolve(),{destroy});
  label.className = 'golden-video-quality'; label.append('Quality ');
  select.setAttribute('aria-label', 'Video quality');
  for (const [value, text] of [['auto','Auto (best available)'], ['1080','1080p · full quality'], ['720','720p · lower data']]) {
    const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option);
  }
  label.append(select); host.append(label);
  let everConnected = video.isConnected;
  observer = new MutationObserver(() => {
    if (video.isConnected) everConnected = true;
    else if (everConnected) destroy();
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = stream;
    select.addEventListener('change', () => {
      const time = video.currentTime, resume = !video.paused;
      video.addEventListener('loadedmetadata', () => { if(disposed)return; video.currentTime = Math.min(time,Math.max(0,video.duration-.1)); if (resume) video.play().catch(() => {}); }, {once:true});
      video.src = select.value === 'auto' ? stream : stream.replace('master.m3u8', select.value + '.m3u8');
      video.load();
    });
    video.addEventListener('error', fallback, {once:true});
    return Object.assign(Promise.resolve(),{destroy});
  }
  const ready = import('./vendor/hls-1.6.19.mjs').then(({default:Hls}) => {
    if (disposed) return;
    if (!Hls.isSupported()) { fallback(); return; }
    const resume = !video.paused;
    hls = new Hls({autoStartLoad:false, maxBufferLength:18, maxMaxBufferLength:30, capLevelToPlayerSize:false});
    video.addEventListener('play', start);
    const applyQuality = () => {
      if (!hls) return;
      const level = select.value === 'auto' ? -1 : hls.levels.findIndex(item => item.height === Number(select.value));
      hls.startLevel = level; hls.currentLevel = level;
      if (!video.paused) start();
    };
    hls.on(Hls.Events.MANIFEST_PARSED, () => { applyQuality(); if (resume || !video.paused) { start(); video.play().catch(() => {}); } });
    hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) fallback(); });
    select.addEventListener('change', applyQuality);
    hls.loadSource(stream); hls.attachMedia(video);
  }).catch(fallback);
  return Object.assign(ready,{destroy});
}

export function attachVideo(video, item, host) {
  const versions = videoVersions(item);
  const quality = document.createElement('div');
  let active = versions[0] || item, ready, generation = 0;
  if (versions.length) {
    const group = document.createElement('div'); group.className = 'golden-video-versions';
    group.setAttribute('role','group'); group.setAttribute('aria-label','Choose video version');
    const buttons = versions.map(version => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = version.label;
      button.setAttribute('aria-label',version.id === 'original' ? 'Original, unedited version' : 'Clean, edited version');
      button.setAttribute('aria-pressed', String(version.id === active.id));
      button.addEventListener('click', async () => {
        if (version.id === active.id) return;
        const current = ++generation, resume = !video.paused, time = video.currentTime;
        video.pause(); ready?.destroy(); active = version;
        quality.replaceChildren(); video.src = version.src;
        buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(versions[i].id === active.id)));
        ready = attachQuality(video, version, quality);
        await ready;
        if(current !== generation)return;
        video.addEventListener('loadedmetadata', () => {
          if(current !== generation)return;
          video.currentTime = Math.min(time,Math.max(0,video.duration-.1));
        }, {once:true});
        if(resume) video.play().catch(()=>{});
      });
      group.append(button); return button;
    });
    host.append(group);
    video.src = active.src;
  }
  host.append(quality); ready = attachQuality(video,active,quality);
  return {ready:()=>ready,destroy:()=>{generation++;ready?.destroy();}};
}
