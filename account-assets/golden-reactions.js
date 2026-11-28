import {siteFetch} from './site-context.js?v=20261022-stay';
import {openGoldenSignIn} from './golden-sign-in.js?v=20261128';
import {compactCount} from './reaction-format.js';
const pendingKey='golden.pending-reaction.v1',states=new Map(),seen=new WeakSet();
const icons={like:'<path d="M7 10v10H3V10h4Zm0 0 4-7c2 0 3 1 2 5h5a2 2 0 0 1 2 2l-1 8a2 2 0 0 1-2 2H7"/>',love:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',share:'<path d="M12 16V3m-5 5 5-5 5 5M5 13v7h14v-7"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/>'};
const token=()=>sessionStorage.getItem('rr_artist_token');
const svg=kind=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[kind]+'</svg>';
function button(kind,label){const b=document.createElement('button');b.type='button';b.innerHTML=svg(kind);b.setAttribute('aria-label',label);b.title=label;return b;}
async function api(action,body,ids){
  const r=await siteFetch('/api/addon/golden-reactions/'+action+(ids?'?ids='+encodeURIComponent(ids.join(',')):''),{method:body?'POST':'GET',headers:{...(token()?{Authorization:'Bearer '+token()}:{}),...(body?{'Content-Type':'application/json','X-Rich-Row-Request':'1'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});
  const data=await r.json();if(!r.ok)throw Object.assign(Error(data.error||'Your reaction could not be saved. Tap again to retry.'),{status:r.status});return data;
}
function render(state){for(const view of state.views){
  const liked=state.queue.filter(x=>x.kind==='like').at(-1)?.liked??state.data?.liked??false;
  for(const kind of ['like','love']){const count=state.data?.[kind==='like'?'likes':'loves'];view[kind].querySelector('span').textContent=compactCount(count);view[kind].setAttribute('aria-label',(kind==='like'?(liked?'Unlike ':'Like '):'Love ')+view.title);}
  view.like.setAttribute('aria-pressed',String(liked));view.love.dataset.loved=String((state.data?.myLoves||0)>0);view.status.textContent=state.error||'';
}}
async function flush(state){
  if(state.running||!state.queue.length)return;state.running=true;state.error='';
  try{while(state.queue.length){const job=state.queue[0];job.sent=true;state.data=await api('react',job);state.queue.shift();render(state);}}
  catch(e){state.error=e.status===401?'Sign in again to save your reaction.':e.message;}
  finally{state.running=false;render(state);}
}
async function react(state,kind){
  const liked=state.queue.filter(x=>x.kind==='like').at(-1)?.liked??state.data?.liked??false;
  const job={contentId:state.id,requestId:crypto.randomUUID(),kind,...(kind==='like'?{liked:!liked}:{count:1})};
  if(!token()){
    const pending={job,url:location.pathname+location.search+location.hash,created:Date.now()};sessionStorage.setItem(pendingKey,JSON.stringify(pending));
    try{const dialog=await openGoldenSignIn({onSuccess:async()=>{state.data=await api('react',job);sessionStorage.removeItem(pendingKey);render(state);}});dialog?.addEventListener('close',()=>sessionStorage.removeItem(pendingKey),{once:true});}catch(e){state.error=e.message;render(state);}return;
  }
  if(kind==='like'&&!state.data){state.error='Counts are still loading. Please try again.';render(state);return;}
  const batch=state.queue.at(-1);if(kind==='love'&&batch?.kind==='love'&&!batch.sent&&batch.count<50)batch.count++;else state.queue.push(job);
  render(state);clearTimeout(state.timer);state.timer=setTimeout(()=>void flush(state),250);
}
export async function sharePost({title,text,url},status){
  if(navigator.share){try{await navigator.share({title,text,url});return;}catch(e){if(e.name==='AbortError')return;}}
  const dialog=document.createElement('dialog');dialog.className='golden-share-dialog';dialog.setAttribute('aria-label','Share '+title);
  const close=document.createElement('button');close.type='button';close.textContent='×';close.dataset.close='';close.setAttribute('aria-label','Close share options');close.onclick=()=>dialog.close();dialog.append(close);
  const options=document.createElement('div');options.className='golden-share-options';
  const copy=button('copy','Copy post link'),facebook=document.createElement('button'),instagram=button('instagram','Copy post for Instagram');facebook.type='button';facebook.textContent='f';facebook.title='Share on Facebook';facebook.setAttribute('aria-label','Share on Facebook');
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(url);status.textContent='Link copied.';dialog.close();}catch{status.textContent='Copy the link from your browser’s address bar.';}};
  facebook.onclick=()=>{window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url),'_blank','noopener,noreferrer');dialog.close();};
  instagram.onclick=async()=>{try{await navigator.clipboard.writeText([title,text,url].filter(Boolean).join('\n\n'));status.textContent='Post copied.';window.open('https://www.instagram.com/','_blank','noopener,noreferrer');dialog.close();}catch{status.textContent='The post could not be copied.';}};
  options.append(copy,facebook,instagram);dialog.append(options);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
}
let loadTimer;
async function loadCounts(){const ids=[...states.keys()];if(!ids.length)return;try{const rows=await api('counts',null,ids);for(const row of rows){const state=states.get(row.id);if(state){state.data=row;state.error='';render(state);}}}catch{for(const state of states.values()){state.error='Reactions are temporarily unavailable.';render(state);}}}
function mount(){let changed=false;for(const host of document.querySelectorAll('[data-reaction-id]')){
  if(seen.has(host))continue;seen.add(host);const id=host.dataset.reactionId,title=host.dataset.title||'this post';
  let state=states.get(id);if(!state){state={id,data:null,queue:[],views:[],running:false};states.set(id,state);}host.classList.add('golden-reactions');
  const like=button('like','Like '+title),love=button('love','Love '+title),share=button('share','Share '+title),status=document.createElement('p');status.className='golden-reaction-status';status.setAttribute('role','status');
  for(const b of [like,love]){const count=document.createElement('span');count.textContent='—';b.append(count);}like.onclick=()=>void react(state,'like');love.onclick=()=>void react(state,'love');
  share.onclick=()=>void sharePost({title,text:host.dataset.brief||'',url:new URL(host.dataset.postUrl||location.pathname,'https://goldenrama440.com').href},status);
  host.append(like,love,share,status);state.views.push({like,love,status,title});render(state);changed=true;
}if(changed){clearTimeout(loadTimer);loadTimer=setTimeout(()=>void loadCounts(),100);}}
mount();new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
try{const pending=JSON.parse(sessionStorage.getItem(pendingKey)||'null');if(pending&&token()){
  sessionStorage.removeItem(pendingKey);
  if(Date.now()-pending.created<600000&&Date.now()>=pending.created&&/^\/(?!\/)/.test(pending.url)){
    await api('react',pending.job);const target=new URL(pending.url,location.origin);if(target.origin===location.origin)location.replace(target.href);
  }
}}catch{const notice=document.createElement('p');notice.setAttribute('role','alert');notice.className='gp-status';notice.textContent='Your reaction could not be confirmed. Return to the post to try again.';document.querySelector('main')?.prepend(notice);}
