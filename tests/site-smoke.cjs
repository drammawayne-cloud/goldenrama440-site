'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'contact.html', 'biography.html', 'merch.html', 'membership.html', 'live.html', 'catalog.html'];
const required = ['site.js', 'style.css', 'golden-radio.js', 'golden-radio.css', 'brand-logo.png', 'catalog-deeplink.js', 'catalog-public-previews.js'];
let checked = 0;
for (const file of [...pages, ...required]) {
  assert.ok(fs.existsSync(path.join(root, file)), 'Missing required file: ' + file);
}
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(home, /<body\b[^>]*\bdata-site=["']goldenrama440["']/i, 'Wrong site identity');
assert.match(home, /<title>[^<]*Golden Rama 440/i, 'Wrong site title');
assert.match(home, /https:\/\/goldenrama440\.com\//i, 'Missing canonical domain');
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
