const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('intro handles an animation timestamp preceding setup without negative canvas radii',()=>{
 const timers=[],frames=[],radii=[];
 const ctx=new Proxy({createRadialGradient(...args){assert.ok(args[2]>=0);assert.ok(args[5]>=0);radii.push(args[5]);return {addColorStop(){}};}},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
 const logo={getBoundingClientRect:()=>({left:20,top:20,width:100,height:100})};
 const overlay={querySelector:()=>logo,append(){},classList:{add(){}},remove(){}};
 const document={readyState:'complete',getElementById:()=>overlay,addEventListener(){},removeEventListener(){},documentElement:{classList:{add(){}}},body:{classList:{contains:()=>false}},createElement:()=>({setAttribute(){},getContext:()=>ctx})};
 vm.runInNewContext(fs.readFileSync(require.resolve('../golden-motion.js'),'utf8'),{document,window:{addEventListener(){}},innerWidth:390,innerHeight:844,devicePixelRatio:2,performance:{now:()=>1000},matchMedia:()=>({matches:false}),setTimeout:(fn,ms)=>timers.push({fn,ms}),requestAnimationFrame:fn=>frames.push(fn),cancelAnimationFrame(){}});
 timers.find(t=>t.ms===1750).fn();frames.shift()(900);
 assert.ok(radii.length>0);assert.ok(radii.every(Number.isFinite));
 frames.shift()(1050);assert.ok(frames.length>0);
});
