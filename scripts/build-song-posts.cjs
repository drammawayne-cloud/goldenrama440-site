const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute=value=>new URL(value,'https://goldenrama440.com/').href;
(async()=>{
  const {briefDescription}=await import('../account-assets/reaction-format.js');
  const members=new Set(read('golden-stream-only.json').titles),clips=read('golden-preview-manifest.json').tracks;
  const tracks=read('golden-music-catalog.json').tracks,videos=read('golden-video-updates.json').videos,paths=new Set();
  for(const [kind,items] of [['song',tracks],['video',videos]])for(const item of items){
    if(!/^\/(songs|videos)\/[a-z0-9-]+\/$/.test(item.postUrl)||paths.has(item.postUrl))throw Error('Invalid or duplicate post path: '+item.title);
    paths.add(item.postUrl);
    const url=absolute(item.postUrl),image=absolute(kind==='video'?item.poster:item.art),brief=briefDescription(item.description[0]);
    const reaction=`<div data-reaction-id="${escape(item.reactionId)}" data-title="${escape(item.title)}" data-post-url="${escape(item.postUrl)}" data-brief="${escape(brief)}"></div>`;
    let media,access='';
    if(kind==='video')media=`<div id="post-video-host"><video id="post-video" controls playsinline crossorigin="anonymous" preload="none" poster="${escape(image)}" src="${escape(absolute(item.src))}" aria-label="${escape(item.title)} music video"></video></div>`;
    else {
      const preview=clips.find(c=>c.title===item.title)?.preview;
      media=`<img class="golden-post-art" src="${escape(image)}" alt="${escape(item.title)} artwork">${preview?`<audio controls preload="none" src="${escape(absolute(preview))}" aria-label="30-second preview of ${escape(item.title)}"></audio>`:''}`;
      access=`<p><a class="gp-link" href="${members.has(item.title)?'/membership.html':'/catalog.html?q='+encodeURIComponent(item.title)}">${members.has(item.title)?'Membership streaming':'Shop this release'}</a></p>`;
    }
    const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/theme-init.js?v=20261128-theme"></script>
<title>${escape(item.title)} · Golden Rama 440</title><meta name="description" content="${escape(brief)}"><link rel="canonical" href="${escape(url)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Golden Rama 440"><meta property="og:title" content="${escape(item.title)}"><meta property="og:description" content="${escape(brief)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(image)}"><meta property="og:image:alt" content="${escape(item.title)} — Golden Rama">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(item.title)}"><meta name="twitter:description" content="${escape(brief)}"><meta name="twitter:image" content="${escape(image)}">
<link rel="icon" href="/brand-icon-32.png"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/account-assets/golden-posts.css"><link rel="stylesheet" href="/golden-unified-player.css"><link rel="stylesheet" href="/account-assets/song-notes.css"><link rel="stylesheet" href="/account-assets/golden-reactions.css?v=20261128-share2"><link rel="stylesheet" href="/theme-accessibility.css?v=20261128-theme">
<script type="module" src="/account-assets/golden-reactions.js?v=20261128-share2"></script><script type="module" src="/account-assets/golden-post-page.js?v=20261128"></script><script defer src="/golden-unified-player.js"></script><script defer src="/account-assets/golden-analytics.js?v=20261125-library1"></script>
</head><body data-site="goldenrama440" data-post-kind="${kind}" data-content-id="${escape(item.reactionId)}" class="golden-posts-page">
<a class="skip" href="#main">Skip to content</a><header><a class="brand" href="/"><img src="/brand-logo.png" width="56" height="56" alt="Golden Rama 440"><span>GOLDEN RAMA 440</span></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/feed/">Feed</a><a href="/catalog.html">Music</a><a href="/account.html">My account</a></nav></header>
<main id="main" class="golden-posts" data-golden-posts="article"><article class="gp-card"><p class="gp-eyebrow">GOLDEN RAMA · BOMBSHOP RECORDS</p><h1>${escape(item.title)}</h1><div class="gp-media">${media}</div>${reaction}${access}
${item.dedication?`<p class="golden-song-dedication">${escape(item.dedication)}</p>`:''}<p class="golden-post-byline">Written by ${escape(item.descriptionAuthor)}</p><div class="golden-post-description">${item.description.map(p=>'<p>'+escape(p)+'</p>').join('\n')}</div></article><p><a class="gp-link" href="${kind==='video'?'/feed/':'/catalog.html'}">${kind==='video'?'More videos':'More music'}</a></p></main>
<footer><strong>GOLDEN RAMA 440</strong><p>Bombshop Records · <a href="/privacy.html">Privacy</a> · <a href="/contact.html">Contact</a></p></footer></body></html>\n`;
    const dest=path.join(root,item.postUrl,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html);
  }
  console.log('Generated '+paths.size+' shareable posts with server-readable titles, descriptions and images.');
})();
