(()=>{
 const site=document.body.dataset.site||'artist';
 const header=document.querySelector('header');if(!header)return;
 const button=document.createElement('button');button.type='button';button.className='theme-toggle';
 const set=mode=>{document.documentElement.dataset.theme=mode;button.textContent=mode==='dark'?'☀ Light mode':'◐ Dark mode';button.setAttribute('aria-label',mode==='dark'?'Switch to cream mode':'Switch to dark mode');button.setAttribute('aria-pressed',String(mode==='dark'));try{localStorage.setItem(`${site}-theme`,mode)}catch{}};
 let saved='light';try{saved=localStorage.getItem(`${site}-theme`)==='dark'?'dark':'light'}catch{}set(saved);
 button.addEventListener('click',()=>set(document.documentElement.dataset.theme==='dark'?'light':'dark'));
 const cart=document.createElement('a');cart.className='site-cart rr-cart-icon';cart.href='https://console.richrowmusic.com/addons/cart';cart.setAttribute('aria-label','Shopping cart');cart.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.2 11.5a2 2 0 0 0 2 1.6h10.3a2 2 0 0 0 2-1.6L22 7H5"/></svg>';
 header.append(cart,button);
})();
