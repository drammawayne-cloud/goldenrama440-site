'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const collection = JSON.parse(fs.readFileSync(path.join(root, 'golden-video-updates.json')));

test('all seven supplied videos have unique, usable local files and thumbnails', () => {
  assert.equal(collection.site, 'goldenrama440');
  assert.equal(collection.videos.length, 7);
  assert.equal(new Set(collection.videos.map(video => video.src)).size, 7);
  for (const video of collection.videos) {
    assert.ok(video.title.trim());
    assert.ok(video.duration > 0);
    for (const asset of [video.src, video.poster]) {
      assert.ok(!asset.includes('..'));
      assert.ok(asset.startsWith('assets/updates/2026-11-25/'));
      assert.ok(fs.statSync(path.join(root, asset.split('?')[0])).size > 1000);
    }
    const jpeg = fs.readFileSync(path.join(root, video.poster.split('?')[0]));
    assert.equal(jpeg.readUInt16BE(0), 0xffd8);
    assert.equal(jpeg.readUInt16BE(jpeg.length - 2), 0xffd9);
  }
});

test('each MP4 puts playback metadata ahead of media for progressive playback', () => {
  for (const video of collection.videos) {
    const file = fs.readFileSync(path.join(root, video.src.split('?')[0]));
    const atoms = [];
    for (let offset = 0; offset < file.length;) {
      assert.ok(offset + 8 <= file.length, video.src + ': incomplete MP4 atom');
      let size = file.readUInt32BE(offset);
      const type = file.toString('ascii', offset + 4, offset + 8);
      if (size === 1) size = Number(file.readBigUInt64BE(offset + 8));
      if (size === 0) size = file.length - offset;
      assert.ok(size >= 8 && offset + size <= file.length, video.src + ': invalid MP4 atom');
      atoms.push(type);
      offset += size;
    }
    assert.ok(atoms.includes('ftyp'));
    assert.ok(atoms.includes('moov'));
    assert.ok(atoms.includes('mdat'));
    assert.ok(atoms.indexOf('moov') < atoms.indexOf('mdat'), video.src + ': fast start required');
  }
});

test('new portrait is first and all 40 previously published portraits remain available', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'golden-new-photos.json')));
  const photos = manifest.photos;
  assert.equal(manifest.count, photos.length);
  assert.equal(photos.length, 41);
  assert.equal(new Set(photos).size, 41);
  assert.equal(photos[0], 'assets/portraits/content-2026-11-25/golden-rama-01.jpg');
  for (let i = 1; i <= 42; i++) {
    if ([3, 4].includes(i)) continue; // These were not in the published gallery.
    assert.ok(photos.includes('assets/portraits/whatsapp-2026-10-17/golden-rama-' + String(i).padStart(2, '0') + '.jpg'));
  }
  for (const photo of photos) assert.ok(fs.existsSync(path.join(root, photo)), photo);
});
