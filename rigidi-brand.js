'use strict';
(()=>{
 const apply=()=>{
  const hero=document.querySelector('.campaign-hero .hero-copy');if(!hero)return;
  const title=hero.querySelector('#hero-title');if(title)title.innerHTML='<span>RIGIDI</span><em>Golden Rama.</em><small>440</small>';
  const intro=hero.querySelector('#intro');if(intro)intro.textContent='To be in total control of the outcome.';
  const eyebrow=hero.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='RIGIDI / GOLDEN RAMA 440 · BOMBSHOP RECORDS';
 };
 apply();window.addEventListener('rr:page-ready',apply);
})();
