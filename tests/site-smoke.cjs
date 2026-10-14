'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'contact.html', 'biography.html', 'merch.html', 'membership.html', 'live.html', 'catalog.html'];
const required = ['site.js', 'style.css', 'golden-radio.js', 'golden-radio.css', 'brand-logo.png', 'catalog-deeplink.js', 'catalog-public-previews.js', 'home-public-previews.js', 'home-music-browser.js', 'golden-music-catalog.json', 'golden-preview-player.js', 'black-white-preview.js', 'black-white-preview.css'];
let checked = 0;
for (const file of [...pages, ...required]) {
  assert.ok(fs.existsSync(path.join(root, file)), 'Missing required file: ' + file);
}
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(home, /<body\b[^>]*\bdata-site=["']goldenrama440["']/i, 'Wrong site identity');
assert.match(home, /<title>[^<]*Golden Rama 440/i, 'Wrong site title');
assert.match(home, /https:\/\/goldenrama440\.com\//i, 'Missing canonical domain');
const music = JSON.parse(fs.readFileSync(path.join(root, 'golden-music-catalog.json'), 'utf8'));
assert.equal(music.site, 'goldenrama440');
assert.equal(music.tracks.length, 51);
assert.equal(music.tracks.filter(t => t.collection === 'Singles').length, 37);
assert.equal(music.tracks.filter(t => t.collection === 'Collaborations').length, 14);
assert.ok(home.includes('home-music-browser.js'), 'Homepage catalog script not included');
assert.ok(!fs.readFileSync(path.join(root, 'site.js'), 'utf8').includes('Sign in / Join to listen'), 'Music browsing must be public');
for (const page of ['index.html', 'catalog.html']) {
  const markup = fs.readFileSync(path.join(root, page), 'utf8');
  assert.ok(markup.includes('black-white-preview.css'));
  assert.ok(markup.includes('black-white-preview.js'));
}
const mono = fs.readFileSync(path.join(root, 'black-white-preview.css'), 'utf8');
assert.ok(mono.includes('background:#080808'));
assert.ok(mono.includes('color:#fff'));
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.doesNotMatch(html, /orizen(?:global)?|oriz[e’']n|OG Marketplace|OG Circle/i, page + ': reference-site content found');
  for (const match of html.matchAll(/<(?:script|link|img)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)) {
    const ref = match[1];
    if (/^(?:[a-z]+:|\/\/|#|\?)/i.test(ref)) continue;
    const local = decodeURIComponent(ref.split(/[?#]/)[0]).replace(/^\/+/, '');
    if (!local) continue;
    const resolved = path.resolve(root, local);
    assert.ok(resolved.startsWith(root + path.sep), page + ': unsafe asset path ' + ref);
    assert.ok(fs.existsSync(resolved) || fs.existsSync(path.join(resolved, 'index.html')), page + ': missing asset ' + ref);
    checked++;
  }
}
console.log('PASS: Golden Rama 440 identity, original-content guard, and ' + checked + ' local asset references across ' + pages.length + ' pages.');
