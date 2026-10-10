// Presentation only: keep the existing published catalog and membership links.
(()=>{
 'use strict';
 const main=document.querySelector('main'),content=document.getElementById('content');
 if(!main||!content)return;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const link=(text,href,cls='action')=>{const n=el('a',text,cls);n.href=href;return n;};
 function enhanceAlbum(){let target=document.getElementById('photos');if(!target&&content.querySelector('.notice')?.textContent.startsWith('Updates are temporarily unavailable')){target=el('section');target.id='photos';content.append(target);}if(!target||target.dataset.album)return;target.dataset.album='ready';target.replaceChildren(el('p','MEMBERSHIP / GALLERY','eyebrow'),el('h2','Inside the collection.'),el('p','One $15/month membership includes this artist’s gallery and live broadcasts. Higher tiers include these benefits too.','album-intro'),link('Open the gallery ↗','/gallery.html','album-more'));}
 function enhanceCatalog(){
  const grid=document.querySelector('#music .catalog-grid');if(!grid||grid.dataset.browse)return;grid.dataset.browse='ready';grid.id='music-catalog';
  const cards=[...grid.querySelectorAll('.catalog-card')];if(!cards.length)return;
  const toolbar=el('div',null,'catalog-toolbar'),label=el('label','Find a release','catalog-search'),input=el('input');input.type='search';input.placeholder='Search music or credits';input.setAttribute('aria-label','Search Golden Rama music');input.setAttribute('aria-controls',grid.id);label.append(input);
  const status=el('p',null,'catalog-status');status.setAttribute('role','status');toolbar.append(label,status);grid.before(toolbar);
  const more=el('button',null,'catalog-more');more.type='button';more.setAttribute('aria-controls',grid.id);grid.after(more);
  let expanded=false;
  function update(){const query=input.value.trim().toLowerCase(),matches=cards.filter(card=>card.textContent.toLowerCase().includes(query));cards.forEach(card=>card.hidden=true);const shown=query||expanded?matches:matches.slice(0,6);shown.forEach(card=>card.hidden=false);status.textContent=matches.length?`${shown.length} of ${matches.length} releases`:'No matching releases. Try another title or credit.';more.hidden=!!query||matches.length<=6;more.textContent=expanded?'Show latest releases':`View all ${cards.length} releases`;more.setAttribute('aria-expanded',String(expanded));}
  input.addEventListener('input',update);more.onclick=()=>{expanded=!expanded;update();};update();
 }
 function enhanceAbout(){
  const target=document.getElementById('about');if(!target||target.dataset.campaign)return;target.dataset.campaign='ready';
  const figure=el('figure',null,'artist-story-photo'),img=el('img');img.src='assets/portraits/01-studio-hero.jpg';img.alt='Golden Rama wearing a burgundy knit polo in a sandstone studio';img.loading='lazy';img.width=1122;img.height=1402;figure.append(img);target.append(figure);
  const links=el('div',null,'artist-story-links');links.append(link('Biography ↗','biography.html',''),link('Press kit ↗','epk.html',''));target.append(links);
 }
 function enhanceConnect(){
  const target=document.getElementById('connect');if(!target||target.dataset.campaign)return;target.dataset.campaign='ready';
  for(const [label,url] of [['Audiomack ↗','https://audiomack.com/golden-rama-1']]){const block=el('div',null,'block');const a=link(label,url);a.target='_blank';a.rel='noopener noreferrer';block.append(a);target.append(block);}
 }
 function addInvites(){
  if(document.getElementById('artist-experience'))return;
  const section=el('section',null,'experience-invite');section.id='artist-experience';section.setAttribute('aria-label','More from Golden Rama');
  for(const [kicker,title,body,label,url] of [['REGIDI / GOLDEN RAMA','Wear the sound.','Discover the Regidi Golden Rama Crown collection in black and white.','Explore merch ↗','merch.html'],['MEMBERSHIP','Your access. Your way.','Explore the Golden Rama membership tiers and access your member catalog.','Explore membership ↗','membership.html']]){const card=el('article');card.append(el('p',kicker,'eyebrow'),el('h2',title),el('p',body),link(label,url));section.append(card);}
  content.after(section);
 }
 function enhance(){enhanceAlbum();enhanceCatalog();enhanceAbout();enhanceConnect();}
 addInvites();enhance();let queued=false;
 new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}).observe(main,{childList:true,subtree:true});
})();
