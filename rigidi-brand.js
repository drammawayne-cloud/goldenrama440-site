'use strict';
(()=>{
 const apply=()=>{
  const hero=document.querySelector('.campaign-hero .hero-copy');if(!hero)return;
  const title=hero.querySelector('#hero-title');if(title)title.innerHTML='<span>Golden</span><em>Rama.</em><small>440</small>';
  const eyebrow=hero.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='BOMBSHOP RECORDS / GOLDEN RAMA 440';
 };apply();window.addEventListener('rr:page-ready',apply);
})();
