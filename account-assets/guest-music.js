import {stripeCheckoutURL} from './team-crate-checkout.js';
import {CART_KEY,musicCart,cartCents,addSong,removeSong} from './golden-music-cart.js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,tokenPattern=/^[a-f0-9]{64}$/;
const money=cents=>'$'+(cents/100).toFixed(2);
const readCart=()=>{try{const rows=JSON.parse(localStorage.getItem(CART_KEY)||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}};
const saveCart=ids=>{try{localStorage.setItem(CART_KEY,JSON.stringify(ids))}catch{}};
function proofFor(ids){const key='rr-guest-music-'+[...ids].sort().join(',');let p;try{p=JSON.parse(sessionStorage.getItem(key)||'null')}catch{}if(!p||!uuid.test(p.id)||!tokenPattern.test(p.token)){p={id:crypto.randomUUID(),token:Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')};sessionStorage.setItem(key,JSON.stringify(p))}return {key,...p};}
if(typeof window!=='undefined')window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
export async function goldenStore({main,el,api,button,title,configured}){
 const wanted=new URLSearchParams(location.search).get('product'),rows=await api('catalog?site=goldenrama440');
 title('GOLDEN RAMA / SHOP RELEASES','Build your collection.','Full-length songs, $1.44 each. Add several to your cart and pay once. No membership required. Sign in is optional.');
 const eligible=rows.filter(p=>p.site==='goldenrama440'&&p.member_access==='none'&&['download','both'].includes(p.delivery_mode)&&p.price_cents===144).sort((a,b)=>a.title.localeCompare(b.title));
 let ids=musicCart(readCart(),eligible),busy=false;saveCart(ids);
 const basket=el('section',{class:'golden-cart','aria-label':'Shopping cart'}),grid=el('section',{class:'golden-shop-grid','aria-label':'Shop releases'}),status=el('p',{role:'status','aria-live':'polite',class:'golden-cart-status'});
 const drawCart=()=>{basket.replaceChildren(el('h2',{},'Your cart'),el('p',{class:'golden-cart-total'},ids.length+' '+(ids.length===1?'song':'songs')+' · '+money(cartCents(ids))+' USD'));
  if(ids.length){const list=el('ul',{class:'golden-cart-list'});for(const id of ids){const p=eligible.find(p=>p.id===id);list.append(el('li',{},el('span',{},p.title+' · $1.44'),button('Remove',()=>{ids=removeSong(ids,id);saveCart(ids);draw();status.textContent=p.title+' removed.';})));}basket.append(list);}
  else basket.append(el('p',{},'Choose songs below to start your order.'));
  const checkout=button('Checkout as guest · '+money(cartCents(ids)),async()=>{if(busy||!ids.length)return;busy=true;const proof=proofFor(ids);status.textContent='Opening secure Stripe checkout…';try{const result=await api('guest-music-checkout',{id:proof.id,token:proof.token,product_ids:ids,site:'goldenrama440'});location.assign(stripeCheckoutURL(result.url));}catch(e){status.textContent=e.message;if(/ended/.test(e.message))sessionStorage.removeItem(proof.key);}finally{busy=false;}});
  checkout.disabled=!configured||!ids.length;basket.append(checkout,status);
 };
 const draw=()=>{drawCart();grid.replaceChildren();for(const p of eligible){const added=ids.includes(p.id),add=button(added?'In your cart ✓':'Add to cart',()=>{ids=addSong(ids,p.id);saveCart(ids);draw();status.textContent=p.title+' added. Cart total '+money(cartCents(ids))+'.';});add.disabled=added||!configured;
  const card=el('article',{class:'card golden-product'+(wanted===p.id||wanted===p.title?' golden-product-selected':'')},p.cover?el('img',{src:p.cover.url,alt:p.title+' cover',loading:'lazy',width:160,height:160}):null,el('h2',{},p.title),el('p',{class:'golden-product-artist'},p.artist),el('p',{class:'golden-product-detail'},p.description.replace(/\s*·\s*\$1\.44 USD$/,'')),el('strong',{class:'golden-product-price'},'$1.44'),add);grid.append(card);
 }};
 main.append(basket,grid,el('a',{href:'https://goldenrama440.com/catalog.html',class:'secondary'},'Listen to free previews in the music catalog'));draw();
 if(!eligible.length)grid.append(el('p',{},'New releases are being prepared.'));
}
export async function musicReceipt({main,el,api,button,title}){
 const params=new URLSearchParams(location.search),id=params.get('id');if(!uuid.test(id||''))throw Error('Invalid receipt.');
 const key='rr-music-receipt-'+id,token=params.get('receipt')||sessionStorage.getItem(key);if(!tokenPattern.test(token||''))throw Error('Open your private receipt link.');
 sessionStorage.setItem(key,token);if(params.has('receipt')){const u=new URL(location.href);u.searchParams.delete('receipt');history.replaceState(null,'',u);}
 const proof={id,token,site:'goldenrama440'},row=await api('guest-music-receipt',proof);
 title('GOLDEN RAMA / YOUR PURCHASE',row.title,'Your private song receipt. No membership required.');
 const status=el('p',{role:'status'},'Payment: '+row.status+' · '+money(row.amount)+' USD');main.append(status);
 const items=row.items||[];
 if(row.download_available){saveCart(readCart().filter(id=>!items.some(i=>i.product_id===id)));
  if(!items.length)items.push({title:row.title});
  for(const item of items)main.append(el('article',{class:'card'},el('h2',{},item.title),button('Download full song',async()=>{try{const r=await api('guest-music-download',{...proof,...(item.product_id?{product_id:item.product_id}:{})});const u=new URL(r.url);if(u.protocol!=='https:'||u.username||u.password)throw Error('Invalid download address.');location.assign(u.href);}catch(e){status.textContent=e.message;}})));
 }else main.append(button('Check payment',()=>location.reload()));
 main.append(el('a',{href:'/addons/store/?site=goldenrama440'},'Back to shop'));
}
