(()=>{'use strict';
const start=()=>{
 if(!document.body.classList.contains('artist-home'))return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const targets=document.querySelectorAll('.artist-spotlight,.artist-home #golden-radio,.artist-home #content > section');
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('motion-visible');observer.unobserve(entry.target)}}},{threshold:0.08,rootMargin:'0px 0px 45px 0px'});
 targets.forEach(el=>{el.classList.add('motion-reveal');observer.observe(el)});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
