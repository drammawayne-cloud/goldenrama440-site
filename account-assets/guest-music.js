import {stripeCheckoutURL} from './team-crate-checkout.js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const tokenPattern=/^[a-f0-9]{64}$/;
function proofFor(product){const key='rr-guest-music-'+product;let p;try{p=JSON.parse(sessionStorage.getItem(key)||'null')}catch{}if(!p||!uuid.test(p.id)||!tokenPattern.test(p.token)){p={id:crypto.randomUUID(),token:Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')};sessionStorage.setItem(key,JSON.stringify(p))}return p;}
export async function goldenStore({main,el,api,button,title,configured}){
 const params=new URLSearchParams(location.search),wanted=params.get('product');
 const rows=await api('catalog?site=goldenrama440');
 title('GOLDEN RAMA / SHOP RELEASES','Own the full song.','Buy for $1.44 without membership. Sign in is optional. Your private receipt provides the full-length download.');
 const eligible=rows.filter(p=>p.site==='goldenrama440'&&p.member_access==='none'&&['download','both'].includes(p.delivery_mode)&&p.price_cents===144&&(!wanted||p.id===wanted||p.title===wanted));
 for(const p of eligible){const status=el('p',{role:'status'});let busy=false;
 const buy=button('Buy as guest — $1.44',async()=>{if(busy)return;busy=true;status.textContent='Opening Stripe checkout…';try{const result=await api('guest-music-checkout',{...proofFor(p.id),product_id:p.id,site:'goldenrama440'});location.assign(stripeCheckoutURL(result.url));}catch(e){status.textContent=e.message;if(/ended/.test(e.message))sessionStorage.removeItem('rr-guest-music-'+p.id);}finally{busy=false;}});
 buy.disabled=!configured;
 main.append(el('article',{class:'card'},p.cover?el('img',{src:p.cover.url,alt:p.title+' cover',loading:'lazy'}):null,el('h2',{},p.title),el('p',{},p.artist),el('p',{},p.description),p.preview?el('audio',{src:p.preview.url,controls:true,preload:'none'}):null,buy,status));}
 if(!eligible.length)main.append(el('p',{},'Shop releases are being prepared. Public previews remain available in the music catalog.'));
 main.append(el('a',{href:'https://goldenrama440.com/catalog.html',class:'secondary'},'Back to music catalog'));
}
export async function musicReceipt({main,el,api,button,title}){
 const params=new URLSearchParams(location.search),id=params.get('id');if(!uuid.test(id||''))throw Error('Invalid receipt.');
 const key='rr-music-receipt-'+id,token=params.get('receipt')||sessionStorage.getItem(key);if(!tokenPattern.test(token||''))throw Error('Open your private receipt link.');
 sessionStorage.setItem(key,token);if(params.has('receipt')){const u=new URL(location.href);u.searchParams.delete('receipt');history.replaceState(null,'',u);}
 const proof={id,token,site:'goldenrama440'},row=await api('guest-music-receipt',proof);
 title('GOLDEN RAMA / YOUR PURCHASE',row.title,'Your private song receipt. No membership required.');
 const status=el('p',{role:'status'},'Payment: '+row.status);
 main.append(status,row.download_available?button('Download full song',async()=>{try{const r=await api('guest-music-download',proof);const u=new URL(r.url);if(u.protocol!=='https:'||u.username||u.password)throw Error('Invalid download address.');location.assign(u.href);}catch(e){status.textContent=e.message;}}):button('Check payment',()=>location.reload()),el('a',{href:'/addons/store/?site=goldenrama440'},'Back to shop'));
}
