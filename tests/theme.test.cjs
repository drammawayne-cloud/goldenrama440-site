const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../theme-init.js'),'utf8');
function setup(saved,blocked=false){
 const stored=new Map(saved?[['goldenrama440-theme',saved]]:[]),events={},buttons=[];
 const header={querySelector:()=>buttons.find(b=>'goldenToggle' in b.dataset),append:b=>buttons.push(b)};
 const document={documentElement:{dataset:{}},body:{classList:{toggle(){}},querySelector:()=>header},querySelectorAll:()=>buttons,getElementById:()=>null,addEventListener:(type,fn)=>events[type]=fn,createElement:()=>({dataset:{},attrs:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(type,fn){this[type]=fn}})};
 const window={addEventListener:(type,fn)=>events[type]=fn};
 vm.runInNewContext(code,{document,window,localStorage:{getItem:key=>{if(blocked)throw Error('Denied');return stored.get(key)},setItem:(k,v)=>{if(blocked)throw Error('Denied');stored.set(k,v)}}});
 return {document,window,events,buttons,stored};
}
test('first visits and unavailable storage start dark before page rendering',()=>{for(const blocked of [false,true]){const f=setup(null,blocked);assert.equal(f.document.documentElement.dataset.theme,'dark');f.events.DOMContentLoaded();assert.equal(f.buttons[0].textContent,'☀');}});
test('one icon-only control remembers a deliberate light choice across pages',()=>{const f=setup();f.events.DOMContentLoaded();f.window.GoldenTheme.mount();assert.equal(f.buttons.length,1);f.buttons[0].click({stopImmediatePropagation(){}});assert.equal(f.document.documentElement.dataset.theme,'light');assert.equal(f.buttons[0].textContent,'☾');assert.equal(f.buttons[0].attrs['aria-label'],'Switch to dark mode');assert.equal(setup(f.stored.get('goldenrama440-theme')).document.documentElement.dataset.theme,'light');});
test('theme changes in another tab update the visible icon without resetting the visitor preference',()=>{const f=setup('light');f.events.DOMContentLoaded();f.stored.set('goldenrama440-theme','dark');f.events.storage({key:'goldenrama440-theme'});assert.equal(f.buttons[0].textContent,'☀');assert.equal(f.document.documentElement.dataset.theme,'dark');});
