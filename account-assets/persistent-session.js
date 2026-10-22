export const SESSION_KEY='rr_member_session';
const legacy=['rr_artist_token','rr_refresh_token','rr_session_expires'];
export function createPersistentSession({persistent,tab,renew,locks,now=Date.now}){
 let memory=null,pending=null,revision=0;
 const read=(s,k)=>{try{return s?.getItem(k)}catch{return null}};
 const write=(s,k,v)=>{try{v===null?s?.removeItem(k):s?.setItem(k,v)}catch{}};
 const mirror=s=>legacy.forEach((k,i)=>write(tab,k,s?[s.access_token,s.refresh_token,String(s.expires_at||0)][i]||null:null));
 const get=()=>{let s;try{s=JSON.parse(read(persistent,SESSION_KEY)||'null')}catch{};s=s||memory;if(s?.signed_out){mirror(null);return null}if(s?.access_token){memory=s;mirror(s);return s}return null};
 const save=s=>{if(!s?.access_token)return;const value={access_token:s.access_token,refresh_token:s.refresh_token||'',expires_at:Number(s.expires_at)?Number(s.expires_at)*1000:now()+Number(s.expires_in||3600)*1000};memory=value;write(persistent,SESSION_KEY,JSON.stringify(value));mirror(value);revision++};
 const clear=()=>{revision++;memory={signed_out:true};write(persistent,SESSION_KEY,JSON.stringify(memory));mirror(null)};
 if(!read(persistent,SESSION_KEY)){const access_token=read(tab,legacy[0]);if(access_token){const ends=Number(read(tab,legacy[2]))||now();save({access_token,refresh_token:read(tab,legacy[1])||'',expires_at:ends/1000})}}else get();
 const token=async(force=false)=>{
  const s=get();if(!s)return '';if(!s.refresh_token||(!force&&s.expires_at>now()+90000))return s.access_token;
  if(!pending){const work=async()=>{const current=get();if(!current)return '';if(current.access_token!==s.access_token||(!force&&current.expires_at>now()+90000))return current.access_token;
   const version=revision;let result;try{result=await renew(current.refresh_token)}catch(e){if(revision===version&&get()?.refresh_token===current.refresh_token&&[400,401].includes(e.status))clear();throw e}
   if(revision!==version||get()?.refresh_token!==current.refresh_token)return get()?.access_token||'';
   if(!result?.access_token||!result?.refresh_token)throw Error('Session renewal is temporarily unavailable.');save(result);return result.access_token;
  };pending=(locks?.request?locks.request('rr-member-refresh',work):work()).finally(()=>{pending=null})}
  return pending;
 };
 return {get,save,clear,token};
}
