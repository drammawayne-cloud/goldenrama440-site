(()=>{'use strict';
const intro=()=>{
 const overlay=document.getElementById('gr-intro'),logo=overlay?.querySelector('.gr-intro-logo');
 if(!overlay||!logo)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const header=document.querySelector('header .brand-logo-image');
 let finished=false;
 const finish=()=>{if(finished)return;finished=true;overlay.classList.add('gr-exit');document.documentElement.classList.add('gr-intro-done');setTimeout(()=>overlay.remove(),750)};
 if(reduce){setTimeout(finish,1200);return}
 const fly=()=>{
  if(finished)return;
  const target=header?.getBoundingClientRect(),source=logo.getBoundingClientRect();
  if(!target||!target.width||!target.height){finish();return}
  const dx=(target.left+target.width/2)-(source.left+source.width/2);
  const dy=(target.top+target.height/2)-(source.top+source.height/2);
  overlay.classList.add('gr-flying');
  logo.style.setProperty('--gr-dx',`${dx}px`);
  logo.style.setProperty('--gr-dy',`${dy}px`);
  logo.style.setProperty('--gr-scale',String(Math.min(target.width/source.width,target.height/source.height)));
  setTimeout(finish,800);
 };
 // No click-to-skip: navigation clicks must not cancel the first-load intro.

 document.addEventListener('keydown',e=>{if(e.key==='Escape')finish()});
 setTimeout(()=>{if(!finished){overlay.classList.add('gr-flash');setTimeout(fly,230)}},1450);
 setTimeout(finish,4000);
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
