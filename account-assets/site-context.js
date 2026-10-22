import {createPersistentSession,SESSION_KEY} from './persistent-session.js?v=20261022-stay';
export const apiOrigin='https://console.richrowrecords.com';
export const currentSite=document.body.dataset.site;
export const artistName=document.body.dataset.artistName||'Rich Row Music';
const validSites=['richrow','waynekastro','dracodon17','goldenrama440'];
if(!validSites.includes(currentSite))throw Error('Artist website configuration is unavailable.');
const q=new URLSearchParams(location.search);if(q.get('site')!==currentSite){q.set('site',currentSite);history.replaceState(null,'',location.pathname+'?'+q+location.hash);}
export const apiURL=value=>{const u=new URL(value,location.origin);if(u.origin===location.origin&&u.pathname.startsWith('/api/addon/'))return apiOrigin+u.pathname+u.search;return u.href;};
export function localLink(value){try{const u=new URL(value,location.href);if(u.origin===apiOrigin||u.origin===location.origin){if(u.pathname.startsWith('/addons/admin')||u.pathname==='/#/login')return '/settings.html';if(u.pathname.startsWith('/addons/connect'))return '/account.html'+u.search+u.hash;if(u.pathname.startsWith('/addons/artist-membership')||u.pathname.startsWith('/addons/membership'))return '/membership.html'+u.search+u.hash;if(u.pathname.startsWith('/addons/portal'))return (u.searchParams.has('watch')||u.searchParams.has('feed')||u.searchParams.has('guest')?'/live.html':'/portal.html')+u.search+u.hash;if(u.pathname.startsWith('/addons/'))return u.pathname.replace(/\/$/,'')+'/'+u.search+u.hash;if(u.origin===apiOrigin&&u.origin!==location.origin&&!u.pathname.startsWith('/api/'))return '/account.html';}return value;}catch{return value;}}
let publicConfig,refreshing;
const nativeFetch=window.fetch.bind(window);
async function config(){return publicConfig||=await(await nativeFetch(apiOrigin+'/api/addon/config')).json();}
const sessions=createPersistentSession({persistent:window.localStorage,tab:window.sessionStorage,locks:navigator.locks,renew:async refresh_token=>{
 const c=await config(),r=await nativeFetch(c.supabaseUrl+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:c.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Object.assign(Error(r.status>=500?'Connection interrupted. Your session is saved.':'Sign in again to continue.'),{status:r.status});
 return r.json();
}});
export const saveSession=s=>sessions.save(s);
export function clearSession(){const token=sessions.get()?.access_token;sessions.clear();if(token)config().then(c=>nativeFetch(c.supabaseUrl+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:c.publishableKey,Authorization:'Bearer '+token},keepalive:true})).catch(()=>{});}
const freshToken=force=>sessions.token(force);
export async function siteFetch(input,options={}){
 const target=apiURL(input);if(target.startsWith(apiOrigin+'/api/addon/')){const headers=new Headers(options.headers||{});headers.set('X-Rich-Row-Site',currentSite);if(headers.has('Authorization')){const t=await freshToken();if(t)headers.set('Authorization','Bearer '+t);else headers.delete('Authorization');}let r=await nativeFetch(target,{...options,headers,credentials:'omit',referrerPolicy:'no-referrer'});if(r.status===401&&headers.has('Authorization')){const t=await freshToken(true);if(t){headers.set('Authorization','Bearer '+t);r=await nativeFetch(target,{...options,headers,credentials:'omit',referrerPolicy:'no-referrer'});}}return r;}
 const r=await nativeFetch(input,options);if(r.ok&&String(input).includes('/auth/v1/token')){const s=await r.clone().json();saveSession(s);}return r;
}
export async function startGoogle(role='customer'){
 const c=await config(),bytes=crypto.getRandomValues(new Uint8Array(48)),enc=a=>btoa(String.fromCharCode(...a)).replaceAll('+','-').replaceAll('/','_').replaceAll('=',''),verifier=enc(bytes),nonce=crypto.randomUUID(),challenge=enc(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
 sessionStorage.setItem('rr_pkce',JSON.stringify({verifier,nonce,role,created:Date.now()}));
 const redirect=location.origin+'/account.html?site='+currentSite+'&role='+role+'&flow='+nonce;
 const u=new URL(c.supabaseUrl+'/auth/v1/authorize');u.search=new URLSearchParams({provider:'google',redirect_to:redirect,code_challenge:challenge,code_challenge_method:'s256'});location.assign(u.href);
}
export let authError='';
if(q.has('code')){try{const flow=JSON.parse(sessionStorage.getItem('rr_pkce')||'null');sessionStorage.removeItem('rr_pkce');if(!flow||q.get('flow')!==flow.nonce||Date.now()-flow.created>600000)throw Error('Sign-in expired. Please start again.');const c=await config(),r=await nativeFetch(c.supabaseUrl+'/auth/v1/token?grant_type=pkce',{method:'POST',headers:{apikey:c.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({auth_code:q.get('code'),code_verifier:flow.verifier})}),s=await r.json();if(!r.ok||!s.access_token)throw Error('Sign-in could not be completed. Please try again.');saveSession(s);}catch(e){authError=e.message;}finally{q.delete('code');q.delete('flow');history.replaceState(null,'',location.pathname+'?'+q);}}
const theme=document.getElementById('theme');if(theme)theme.addEventListener('click',()=>{const value=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=value;localStorage.setItem('artist-theme',value);});

try{await freshToken();}catch(e){authError=e.message;}
window.addEventListener('storage',e=>{if(e.key===SESSION_KEY){const was=sessionStorage.getItem('rr_artist_token'),next=sessions.get()?.access_token;if(was&&!next)location.reload();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)freshToken().catch(()=>{});});
setInterval(()=>{if(!document.hidden)freshToken().catch(()=>{});},60000);
