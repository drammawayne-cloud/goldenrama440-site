import {siteFetch} from './account-assets/site-context.js?v=20261010-cover';

const SITE='goldenrama440';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
const key=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const main=document.querySelector('main');
const music=new Map();
let merch=[];
if(!main)throw Error('Music store needs a page');

const dialog=document.createElement('dialog');
dialog.className='golden-bundle-dialog';
dialog.setAttribute('aria-label','Choose clothing to add to your music cart');
document.body.append(dialog);
const make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n};
const api=async route=>{
 const r=await siteFetch('/api/addon/'+route,{credentials:'omit',cache:'no-store'});
 if(!r.ok)throw Error('Store inventory is unavailable');
 return r.json();
};
function add(item){
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Cart is unavailable; open your cart and retry.')),16000);
  window.dispatchEvent(new CustomEvent('rr-cart-add',{detail:{item,complete:error=>{
   clearTimeout(timeout);
   if(error)reject(Error(error));else resolve();
  }}}));
 });
}
function showClothing(){
 dialog.replaceChildren();
 const title=make('h2','Add clothing to your music cart');
 const info=make('p','Choose an available design, color, size and quantity. Clothing receives 20% off when purchased with music, once checkout is enabled.');
 const close=make('button','Close');close.type='button';close.addEventListener('click',()=>dialog.close());
 dialog.append(title,info,close);
 const eligible=merch.filter(p=>p.site===SITE&&p.published===true&&p.checkout_enabled===true&&Array.isArray(p.variants));
 if(!eligible.length){
  dialog.append(make('p','Golden Rama clothing options are not yet available in this checkout.'),
   Object.assign(make('a','Browse existing Golden Rama clothing'),{href:'/merch.html'}));
  dialog.showModal();return;
 }
 const form=make('form');form.addEventListener('submit',async e=>{
  e.preventDefault();const p=eligible[Number(product.value)];
  const v=p?.variants?.[Number(variant.value)];
  const quantity=Number(qty.value);
  if(!v||!Number.isInteger(quantity)||quantity<1||quantity>v.stock){status.textContent='Choose an available option and quantity.';return}
  submit.disabled=true;
  try{
   await add({kind:'merch',product_id:p.id,size:v.size,color:v.color,quantity});
   status.textContent='Clothing added to your cart.';
   dialog.close();
   location.assign('/addons/cart/');
  }catch(err){status.textContent=err.message}finally{submit.disabled=false}
 });
 const product=make('select');product.setAttribute('aria-label','Shirt design');
 for(const [i,p] of eligible.entries()){const o=make('option',p.title+' — '+money(p.price_cents));o.value=i;product.append(o)}
 const variant=make('select');variant.setAttribute('aria-label','Size and color');
 const qty=make('input');qty.type='number';qty.min='1';qty.max='100';qty.value='1';qty.setAttribute('aria-label','Quantity');
 const status=make('p');status.setAttribute('role','status');
 const update=()=>{
  variant.replaceChildren();
  const p=eligible[Number(product.value)];
  for(const [i,v] of p.variants.entries()){
   const o=make('option',[v.size,v.color].filter(Boolean).join(' / ')+(v.stock<1?' — Sold out':''));
   o.value=i;o.disabled=v.stock<1;variant.append(o);
  }
  const first=[...variant.options].find(o=>!o.disabled);if(first)variant.value=first.value;
  qty.max=String(p.variants[Number(variant.value)]?.stock||1);
 };
 product.addEventListener('change',update);
 variant.addEventListener('change',()=>qty.max=String(eligible[Number(product.value)].variants[Number(variant.value)]?.stock||1));
 update();
 const submit=make('button','Add clothing to cart');submit.type='submit';
 const label=(name,control)=>{const el=make('label',name);el.append(control);return el};
 form.append(label('Design',product),label('Size / color',variant),label('Quantity',qty),submit,status);
 dialog.append(form);
 dialog.showModal();
}
function decorate(){
 for(const card of main.querySelectorAll('#music .catalog-card,#catalog-tracks article')){
  if(card.dataset.goldenShop==='1')continue;
  const title=card.querySelector('h3')?.textContent||'';
  const product=music.get(key(title));
  const area=make('div');area.className='golden-buy-actions';
  const button=make('button',product?'Add song to cart · '+money(product.price_cents):'Song purchase coming soon');
  button.type='button';
  button.disabled=!product;
  if(product)button.addEventListener('click',async()=>{
   button.disabled=true;
   try{
    await add({kind:'music',product_id:product.id});
    showClothing();
   }catch(err){button.textContent=err.message}
   finally{button.disabled=false}
  });
  area.append(button);
  if(product){
   const cart=make('a','View cart ↗');cart.href='/addons/cart/';area.append(cart);
  }
  card.append(area);
  card.dataset.goldenShop='1';
 }
}
let scheduled=false;
new MutationObserver(()=>{
 if(scheduled)return;
 scheduled=true;queueMicrotask(()=>{scheduled=false;decorate()});
}).observe(main,{childList:true,subtree:true});
const cartPage=document.body.dataset.page==='cart';
if(cartPage){
 const addClothing=make('button','Choose clothing design / size / color');
 addClothing.className='golden-cart-clothing';
 addClothing.addEventListener('click',showClothing);
 const header=make('section');header.className='golden-cart-upsell';header.append(addClothing);
 main.before(header);
}
Promise.allSettled([api('catalog?site='+SITE),api('merch-catalog')]).then(([a,b])=>{
 if(a.status==='fulfilled'&&Array.isArray(a.value)){
  for(const p of a.value)if(p.site===SITE&&p.published===true&&p.product_type==='music'&&
   /^[0-9a-f-]{36}$/i.test(p.id||''))music.set(key(p.title),p);
 }
 if(b.status==='fulfilled'&&Array.isArray(b.value))merch=b.value;
 decorate();
});
decorate();
