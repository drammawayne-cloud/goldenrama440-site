const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('Golden reactions, publishing, library and owner sign-in use verified site and role callbacks',async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../account-assets/golden-sign-in.js'),'utf8').replace(/^import .*;\n/gm,'').replace('export async function','async function');
 for(const role of ['customer','artist','staff']){
  let options;const calls=[];
  const context={apiOrigin:'https://console.example',location:{origin:'https://goldenrama440.com'},AbortSignal,botCheck:async()=>'',saveSession(){},openSignIn:value=>{options=value;},fetch:async(url,init)=>{calls.push({url,init});return {ok:true,json:async()=>init?{}:{supabaseUrl:'https://auth.example',publishableKey:'public-test'}};}};
  vm.runInNewContext(source+'\nthis.run=openGoldenSignIn;',context);
  await context.run({role});
  for(const action of ['signup','recover','resend']){
   await options[action]({email:'test@example.invalid',captchaToken:'test'});
   const url=new URL(calls.at(-1).url),callback=new URL(url.searchParams.get('redirect_to'));
   assert.equal(callback.pathname,'/account.html');assert.equal(callback.searchParams.get('site'),'goldenrama440');assert.equal(callback.searchParams.get('role'),role);
   assert.equal(callback.searchParams.get(action==='recover'?'recovery':'verified'),'1');
  }
 }
});
