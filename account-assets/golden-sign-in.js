import {openSignIn} from './shared-login.js?v=20261126-account2';
import {apiOrigin,saveSession} from './site-context.js?v=20261022-stay';
import {botCheck} from './bot-check.js?v=20261022-stay';
let configuration;
export async function openGoldenSignIn({role='customer',onSuccess=async()=>{}}={}) {
  configuration ||= await fetch(apiOrigin+'/api/addon/config').then(r=>{if(!r.ok)throw Error('Sign-in is temporarily unavailable.');return r.json();});
  const callback=location.origin+'/account.html?site=goldenrama440&role='+role;
  async function auth(path,input){
    const {captchaToken,...data}=input;
    const captcha=captchaToken||await botCheck(configuration.turnstileSiteKey,'account');
    const response=await fetch(configuration.supabaseUrl+'/auth/v1/'+path,{method:'POST',headers:{apikey:configuration.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({...data,...(captcha?{gotrue_meta_security:{captcha_token:captcha}}:{})}),signal:AbortSignal.timeout(20000)});
    const result=await response.json();if(!response.ok)throw Error(result.msg||result.error_description||result.message||'Sign-in failed.');return result;
  }
  return openSignIn({name:'Golden Rama 440',site:'goldenrama440',role,
    authenticate:data=>auth('token?grant_type=password',data),
    signup:data=>auth('signup?redirect_to='+encodeURIComponent(callback+'&verified=1'),{...data,data:{requested_site:'goldenrama440',requested_role:role}}),
    recover:data=>auth('recover?redirect_to='+encodeURIComponent(callback+'&recovery=1'),{email:data.email,captchaToken:data.captchaToken}),
    resend:data=>auth('resend?redirect_to='+encodeURIComponent(callback+'&verified=1'),{...data,type:'signup'}),
    onSuccess:async session=>{if(!session.access_token)throw Error('Please confirm your email before signing in.');saveSession(session);await onSuccess(session);}
  });
}
