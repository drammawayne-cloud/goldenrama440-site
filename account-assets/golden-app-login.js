import {botCheck} from './bot-check.js?v=20261022-stay';
import {goldenAccountCallback,passwordError,passwordHint,validEmail,accountError} from './account-policy.js?v=20261126-account2';
const form=document.querySelector('form'),status=document.getElementById('status'),submit=form.querySelector('[type=submit]');
let config,mode='signin',busy=false,retryAt=0;
const email=()=>form.email.value.trim();
function setBusy(value){busy=value;for(const button of form.querySelectorAll('button'))button.disabled=value;form.setAttribute('aria-busy',String(value));}
async function auth(path,body){
  if(!config){const response=await fetch('https://console.richrowrecords.com/api/addon/config',{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Account service unavailable');config=await response.json();}
  const captcha=await botCheck(config.turnstileSiteKey,'account');
  const r=await fetch(config.supabaseUrl+'/auth/v1/'+path,{method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({...body,...(captcha?{gotrue_meta_security:{captcha_token:captcha}}:{})}),signal:AbortSignal.timeout(20000)});
  const data=await r.json();if(!r.ok)throw Error(data.msg||data.error_description||data.message||'Sign-in failed.');return data;
}
function setMode(value){
  mode=value;const signup=mode==='signup';
  document.getElementById('heading').textContent=signup?'Create your account.':'Welcome back.';
  submit.textContent=signup?'Create account':'Sign in';
  document.getElementById('register').textContent=signup?'I already have an account':'Create a free account';
  document.getElementById('confirm-field').hidden=!signup;
  document.getElementById('password-hint').hidden=!signup;
  form.password.autocomplete=signup?'new-password':'current-password';
  form.password.minLength=signup?8:1;form.password.maxLength=signup?128:1024;
  form.confirm_password.required=signup;form.confirm_password.value='';status.textContent='';
}
document.getElementById('password-hint').textContent=passwordHint;
form.onsubmit=async e=>{
  e.preventDefault();if(busy)return;
  if(!validEmail(email())){status.textContent='Enter a valid email address.';return;}
  if(mode==='signup'){const error=passwordError(form.password.value,form.confirm_password.value);if(error){status.textContent=error;return;}if(Date.now()<retryAt){status.textContent='Please wait a minute before requesting another verification email.';return;}}
  setBusy(true);status.textContent=mode==='signup'?'Creating account…':'Signing in…';
  try{
    if(mode==='signup'){
      await auth('signup?redirect_to='+encodeURIComponent(goldenAccountCallback()),{email:email(),password:form.password.value,data:{requested_site:'goldenrama440',requested_role:'customer'}});
      retryAt=Date.now()+60000;form.password.value='';setMode('signin');
      status.textContent='Check your email to verify your account, then return here to sign in. If you already have an account, use Sign in or Forgot password.';return;
    }
    const session=await auth('token?grant_type=password',{email:email(),password:form.password.value});
    form.password.value='';if(!session.access_token||!session.user?.email_confirmed_at)throw Error('Verify your email before signing in.');
    if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify({type:'golden-session',session}));status.textContent='Signed in. Returning to the app…';}
    else status.textContent='This sign-in page is for the Golden Rama app. Open My account on the website to sign in there.';
  }catch(e){status.textContent=accountError(e);}finally{setBusy(false);}
};
async function requestEmail(recovery){
  if(busy)return;if(!validEmail(email())){status.textContent='Enter a valid email address first.';return;}
  if(Date.now()<retryAt){status.textContent='Please wait a minute before requesting another email.';return;}
  setBusy(true);status.textContent='Sending email…';
  try{
    await auth((recovery?'recover':'resend')+'?redirect_to='+encodeURIComponent(goldenAccountCallback(recovery)),{email:email(),...(recovery?{}:{type:'signup'})});
    retryAt=Date.now()+60000;
    status.textContent=recovery?'If this email has an account, a reset link will arrive shortly. Choose your password there, then return to the app.':'If verification is needed, check your email for the new link.';
  }catch(e){status.textContent=accountError(e);}finally{setBusy(false);}
}
document.getElementById('reset').onclick=()=>requestEmail(true);
document.getElementById('resend').onclick=()=>requestEmail(false);
document.getElementById('register').onclick=()=>{if(!busy)setMode(mode==='signin'?'signup':'signin');};
document.getElementById('show-password').onclick=e=>{const visible=form.password.type==='password';form.password.type=visible?'text':'password';form.confirm_password.type=visible?'text':'password';e.currentTarget.textContent=visible?'Hide password':'Show password';e.currentTarget.setAttribute('aria-pressed',String(visible));};
setMode('signin');
