'use strict';
const stationStatus = document.getElementById('golden-nowplaying');
let polling = false;
async function goldenNow() {
  if (polling || !stationStatus) return;
  polling = true;
  try {
    const response = await fetch('https://richrow-radio.129-213-164-255.sslip.io/api/nowplaying/golden_rama_radio', {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error('Radio status unavailable');
    const data = await response.json();
    const song = data?.now_playing?.song?.text;
    stationStatus.textContent = data?.is_online && typeof song === 'string' && song.trim()
      ? 'Now playing: ' + song.trim()
      : data?.is_online
        ? 'Golden Rama Radio is live.'
        : 'The station is temporarily offline. Please try again shortly.';
  } catch {
    stationStatus.textContent = 'Radio status unavailable. Please try again shortly.';
  } finally {
    polling = false;
  }
}
goldenNow();
setInterval(goldenNow, 30000);
import('./golden-speaker-player.js?v=20261012').then(({ mountSpeakerRadio }) => {
  const section = document.getElementById('golden-radio');
  if (!section) return;
  const root = document.createElement('div');
  const old = section.querySelector('audio');
  if (old) {
    old.pause();
    old.replaceWith(root);
  }
  mountSpeakerRadio(root);
  const intro = section.querySelector('h2 + p');
  if (intro) intro.textContent = "Golden Rama's own music station. Press the gold speaker to listen.";
}).catch(() => {
  if (stationStatus) stationStatus.textContent = 'Radio player unavailable. Please try again shortly.';
});
