(()=>{'use strict';
const intro=()=>{
 const overlay=document.getElementById('gr-intro');
 if(!overlay)return;
 let finished=false;const finish=()=>{if(finished)return;finished=true;overlay.classList.add('gr-exit');document.documentElement.classList.add('gr-intro-done');document.body.style.overflow='';setTimeout(()=>overlay.remove(),850)};
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Intro is skippable by click, keyboard, or reduced-motion preference.
 const skip=()=>finish();
 overlay.addEventListener('click',skip,{once:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Enter')skip()},{once:true});
 setTimeout(finish,reduce?250:2550);
};
const start=()=>{
 intro();
 if(!document.body.classList.contains('artist-home'))return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const targets=document.querySelectorAll('.artist-spotlight,.artist-home #golden-radio,.artist-home #content > section');
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('motion-visible');observer.unobserve(entry.target)}}},{threshold:0.08,rootMargin:'0px 0px 45px 0px'});
 targets.forEach(el=>{el.classList.add('motion-reveal');observer.observe(el)});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
