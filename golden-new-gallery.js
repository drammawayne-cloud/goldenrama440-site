'use strict';
(()=>{
 const mount=async()=>{
  const section=document.getElementById('photos');if(!section)return;
  const r=await fetch('golden-new-photos.json',{cache:'no-store'});if(!r.ok)return;
  const data=await r.json();if(!Array.isArray(data.photos))return;
  const gallery=document.createElement('div');gallery.className='golden-new-gallery';gallery.id='golden-new-gallery';
  for(const [i,path] of data.photos.entries()){
   if(!/^assets\/portraits\/whatsapp-2026-10-17\/golden-rama-\d{2}\.jpg$/.test(path))continue;
   const a=document.createElement('a');a.href=path;a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','View Golden Rama photo '+(i+1));
   const img=document.createElement('img');img.src=path;img.alt='Golden Rama official portrait '+(i+1);img.loading='lazy';a.append(img);gallery.append(a);
  }
  if(!gallery.children.length)return;
  section.querySelectorAll(':scope > :not(.section-head)').forEach(el=>el.remove());section.append(gallery);
 };
 window.addEventListener('rr:page-ready',mount);if(document.readyState==='complete')mount();
})();
