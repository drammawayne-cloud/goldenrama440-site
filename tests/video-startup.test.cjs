const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../golden-video-updates.js'),'utf8');

test('videos wait for published-page rendering even if the document already finished loading',async()=>{
  let requests=0;const listeners={};
  let requested;
  const context={document:{readyState:'complete',documentElement:{dataset:{}},getElementById:()=>({})},window:{addEventListener:(event,fn)=>listeners[event]=fn},AbortSignal,console:{warn(){}},fetch:async url=>{requested=url;requests++;throw Error('controlled unavailable response');}};
  vm.runInNewContext(code,context);
  assert.equal(requests,0,'An early video could be replaced by the pending page response');
  await listeners['rr:page-ready']();
  assert.equal(requests,1);
  assert.equal(new URL(requested,'https://goldenrama440.com').pathname,'/golden-video-updates.json');
});
