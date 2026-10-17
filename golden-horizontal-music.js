'use strict';
(async()=>{
 const section=document.getElementById('music');if(!section)return;
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const [catalog,clips,exclusions]=await Promise.all(['golden-music-catalog.json','golden-preview-manifest.json','golden-stream-only.json'].map(async path=>{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('Catalog unavailable');return r.json()})).catch(()=>[null,null,null]);
 if(!catalog?.tracks||!clips?.tracks||!exclusions?.titles)return;
 const stream=new Set(exclusions.titles.map(norm)),preview=new Map(clips.tracks.map(t=>[norm(t.title),t.preview]));
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
 const player=el('div','golden-sticky-player'),label=el('span','golden-playing-label','Choose a song preview'),audio=el('audio');player.hidden=true;audio.controls=true;audio.preload='none';audio.setAttribute('aria-label','Golden Rama audio player');
 const close=el('button','','×');close.type='button';close.setAttribute('aria-label','Close player');close.onclick=()=>{audio.pause();player.hidden=true};player.append(label,audio,close);document.body.append(player);
 const shell=el('div','golden-horizontal-music');shell.id='golden-public-music';
 function row(title,items,isStream){const group=el('section','golden-track-section'),heading=el('h3','',title),hint=el('p','','Swipe or scroll sideways to browse tracks. Free 30-second previews.');const scroller=el('div','golden-track-scroller');scroller.tabIndex=0;scroller.setAttribute('aria-label',title+' horizontal tracks');
 for(const t of items){const card=el('article','golden-track-tile'),img=el('img');img.src=t.art;img.loading='lazy';img.alt=t.title+' cover';const name=el('h4','',t.title);const buttons=el('div','golden-track-actions');const clip=preview.get(norm(t.title));if(clip&&/^previews\/[\w.-]+\.mp3$/.test(clip)){const play=el('button','','▶ Preview');play.type='button';play.onclick=()=>{const url=new URL(clip,location.href);if(url.origin!==location.origin)return;audio.src=url.href;label.textContent=t.title+' · 30-second preview';player.hidden=false;audio.play().catch(()=>{});};buttons.append(play)}
 const link=el('a','',isStream?'Membership streaming ↗':'Shop release ↗');link.href=isStream?'membership.html':'addons/store/';buttons.append(link);card.append(img,name,buttons);scroller.append(card)}group.append(heading,hint,scroller);return group}
 const paid=catalog.tracks.filter(t=>!stream.has(norm(t.title))),streaming=catalog.tracks.filter(t=>stream.has(norm(t.title)));
 shell.append(row('Music store · Purchasable releases',paid,false),row('Streaming links · Members',streaming,true));
 const old=section.querySelector('#golden-public-music');old?.remove();section.append(shell);
 // Replace the prior grid only for this music section; avoid duplicate audio controls.
 const observer=new MutationObserver(()=>{for(const p of section.querySelectorAll('.golden-music-browser:not(.golden-horizontal-music)'))p.remove()});observer.observe(section,{childList:true});
})().catch(console.error);
