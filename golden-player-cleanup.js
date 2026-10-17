'use strict';
(()=>{
 const remove=()=>document.querySelectorAll('.golden-sticky-player').forEach(node=>{node.querySelectorAll('audio,video').forEach(media=>media.pause());node.remove()});
 remove();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',remove,{once:true});
 const watch=new MutationObserver(remove);
 watch.observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('pageshow',remove);
})();
