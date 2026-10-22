(()=>{'use strict';
const intro=()=>{
 const overlay=document.getElementById('gr-intro'),logo=overlay?.querySelector('.gr-intro-logo');
 if(!overlay||!logo)return;
 let finished=false,frame=0;
 const onKey=e=>{if(e.key==='Escape')finish()};
 const finish=()=>{if(finished)return;finished=true;cancelAnimationFrame(frame);document.removeEventListener('keydown',onKey);overlay.classList.add('gr-exit');document.documentElement.classList.add('gr-intro-done');setTimeout(()=>overlay.remove(),750)};
 document.addEventListener('keydown',onKey);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){setTimeout(finish,1000);return}
 const explode=()=>{
  if(finished)return;
  const canvas=document.createElement('canvas');canvas.className='gr-explosion';canvas.setAttribute('aria-hidden','true');overlay.append(canvas);
  const ctx=canvas.getContext('2d');if(!ctx){finish();return}
  const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(h*dpr);ctx.scale(dpr,dpr);
  const box=logo.getBoundingClientRect(),x=box.left+box.width*.36,y=box.top+box.height*.44;
  const reach=Math.min(Math.hypot(w,h)*.65,950),started=performance.now();
  const sparks=Array.from({length:110},()=>{const a=Math.random()*Math.PI*2,s=150+Math.random()*reach;return {vx:Math.cos(a)*s,vy:Math.sin(a)*s,size:1+Math.random()*3,life:.45+Math.random()*.75}});
  const smoke=Array.from({length:22},()=>{const a=Math.random()*Math.PI*2;return {a,d:35+Math.random()*140,r:22+Math.random()*55}});
  overlay.classList.add('gr-detonating');
  const draw=now=>{
   if(finished)return;
   const t=(now-started)/1000;ctx.clearRect(0,0,w,h);
   ctx.globalCompositeOperation='source-over';
   for(const p of smoke){const d=p.d*t,px=x+Math.cos(p.a)*d,py=y+Math.sin(p.a)*d-t*65,r=p.r*(.35+t*1.7);const g=ctx.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,`rgba(113,85,48,${Math.max(0,.35*(1-t/1.3))})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill()}
   ctx.globalCompositeOperation='lighter';
   const radius=18+reach*(1-Math.exp(-t*5)),glow=ctx.createRadialGradient(x,y,0,x,y,radius);
   const alpha=Math.max(0,1-t*1.7);glow.addColorStop(0,`rgba(255,249,220,${alpha})`);glow.addColorStop(.18,`rgba(255,194,57,${alpha*.85})`);glow.addColorStop(.52,`rgba(219,96,15,${alpha*.25})`);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
   for(let i=0;i<2;i++){const q=Math.max(0,t-i*.07),r=12+reach*(1-Math.exp(-q*3.4));ctx.strokeStyle=`rgba(255,203,104,${Math.max(0,.65-q)})`;ctx.lineWidth=2+7*(1-Math.min(q,1));ctx.beginPath();ctx.ellipse(x,y,r,r*.82,0,0,Math.PI*2);ctx.stroke()}
   for(const p of sparks){const a=Math.max(0,1-t/p.life);if(!a)continue;const drag=(1-Math.exp(-t*2.3))/2.3,px=x+p.vx*drag,py=y+p.vy*drag+100*t*t;ctx.strokeStyle=`rgba(255,211,116,${a})`;ctx.lineWidth=p.size*a;ctx.beginPath();ctx.moveTo(px-p.vx*.018,py-p.vy*.018);ctx.lineTo(px,py);ctx.stroke()}
   ctx.globalCompositeOperation='source-over';
   if(t<1.25)frame=requestAnimationFrame(draw);else finish();
  };
  frame=requestAnimationFrame(draw);
 };
 setTimeout(explode,1750);
 setTimeout(finish,4500);
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
// Browser back/forward cache can restore an already dismissed intro.
window.addEventListener('pageshow',e=>{
 if(!e.persisted||!document.body.classList.contains('artist-home'))return;
 const logo=document.querySelector('header .brand-logo-image');
 const overlay=document.createElement('div');overlay.id='gr-intro';overlay.className='gr-intro';overlay.setAttribute('aria-label','Golden Rama 440 introduction');
 const img=document.createElement('img');img.src='brand-logo.png?v=20260929';img.className='gr-intro-logo';img.alt='Golden Rama 440';overlay.append(img);document.body.prepend(overlay);
 document.documentElement.classList.remove('gr-intro-done');intro();
});
})();
