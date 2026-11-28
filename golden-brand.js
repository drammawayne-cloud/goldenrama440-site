// Share the website's artist language and imagery with the native app.
fetch('/golden-brand.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Brand information unavailable');return r.json();}).then(b=>{
 if(b.site!=='goldenrama440')return;
 const update=(selector,value)=>{const n=document.querySelector(selector);if(n&&typeof value==='string'&&value.trim())n.textContent=value;};
 update('.hero-alias',b.alias);update('.hero-aujur',b.signature);update('#intro','“'+b.quote+'”');
 update('.spotlight-intro p',b.introduction);update('.site-footer>div>p',b.tagline);
 const heading=document.querySelector('.spotlight-intro h2');
 if(heading){const em=document.createElement('em');em.textContent=b.subheading;heading.replaceChildren(b.headline,document.createElement('br'),em);}
}).catch(()=>{/* The server-rendered artist copy remains available. */});
