'use strict';
(()=>{
 const images=['golden-rama-11.jpg','golden-rama-15.jpg','golden-rama-30.jpg','golden-rama-40.jpg'].map(n=>'assets/portraits/whatsapp-2026-10-17/'+n);
 const hero=document.querySelector('.campaign-hero');if(!hero)return;
 const original=hero.querySelector('.hero-image');if(!original)return;
 const slides=document.createElement('div');slides.className='golden-hero-slides';slides.setAttribute('aria-label','Golden Rama photo slideshow');
 const elements=images.map((src,i)=>{const img=document.createElement('img');img.src=src;img.alt='Golden Rama featured photo '+(i+1);img.className='golden-hero-slide';img.style.opacity=i===0?'1':'0';if(i)img.loading='lazy';slides.append(img);return img});
 original.replaceWith(slides);
 const controls=document.createElement('div');controls.className='golden-slide-controls';let active=0;const dots=[];
 const show=n=>{active=(n+images.length)%images.length;elements.forEach((img,i)=>{img.style.opacity=i===active?'1':'0';img.setAttribute('aria-hidden',String(i!==active))});dots.forEach((d,i)=>d.setAttribute('aria-current',String(i===active)))};
 const arrow=(label,delta)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',delta<0?'Previous photo':'Next photo');b.onclick=()=>{show(active+delta);restart()};return b};
 controls.append(arrow('‹',-1));for(let i=0;i<images.length;i++){const b=document.createElement('button');b.type='button';b.textContent=String(i+1);b.setAttribute('aria-label','Show photo '+(i+1));b.onclick=()=>{show(i);restart()};dots.push(b);controls.append(b)}controls.append(arrow('›',1));hero.append(controls);show(0);
 let timer;const restart=()=>{clearInterval(timer);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>{if(!document.hidden)show(active+1)},5500)};restart();
 hero.addEventListener('mouseenter',()=>clearInterval(timer));hero.addEventListener('mouseleave',restart);hero.addEventListener('focusin',()=>clearInterval(timer));hero.addEventListener('focusout',e=>{if(!hero.contains(e.relatedTarget))restart()});
})();
