const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
class Element{
 constructor(tag,text=''){this.tag=tag;this.textContent=text;this.children=[];this.dataset={};this.listeners={};}
 append(...nodes){this.children.push(...nodes);}setAttribute(k,v){this[k]=v;}addEventListener(k,v){this.listeners[k]=v;}
 querySelector(selector){return selector==='h3'?{textContent:this.title}:null;}
 querySelectorAll(){return this.cards||[];}
}
test('inventory loads before cart decoration and member songs lead to authorized playback',async()=>{
 const member=new Element('article'),paid=new Element('article');member.title='Integrity';paid.title='Yellow Diamond';const main=new Element('main');main.cards=[member,paid];
 let finishProducts;const context={document:{querySelector:()=>main,createElement:t=>new Element(t),body:new Element('body')},MutationObserver:class{observe(){}},queueMicrotask,Intl,Map,Set,Promise,setTimeout,clearTimeout,fetch:async()=>({ok:true,json:async()=>({titles:['Integrity']})}),siteFetch:async path=>({ok:true,json:()=>path.includes('merch-catalog')?Promise.resolve([]):new Promise(resolve=>{finishProducts=resolve;})})};
 vm.createContext(context);vm.runInContext(fs.readFileSync('golden-bundle-shop.js','utf8').replace(/^import .*;\n/gm,''),context);
 assert.equal(paid.children.length,0,'must not permanently mark products unavailable before fetching');
 await new Promise(setImmediate);finishProducts([{id:'12345678-1234-1234-1234-123456789abc',site:'goldenrama440',published:true,product_type:'music',title:'Yellow Diamond',price_cents:144}]);await new Promise(setImmediate);
 const memberActions=member.children[0].children;assert.equal(memberActions[0].tag,'a');assert.equal(memberActions[0].href,'/account.html');assert.match(memberActions[0].textContent,/Listen with membership/);
 assert.equal(memberActions.some(n=>n.tag==='button'),false);
 const button=paid.children[0].children[0];assert.equal(button.disabled,false);assert.equal(button.textContent,'Add song to cart · $1.44');assert.equal(typeof button.listeners.click,'function');
});

test('shared artist branding matches the published website copy',()=>{
 const b=JSON.parse(fs.readFileSync('golden-brand.json')),home=fs.readFileSync('index.html','utf8');
 assert.equal(b.site,'goldenrama440');assert.equal(b.featuredVideoId,'golden-rama-video-06');
 for(const k of ['alias','signature','quote','headline','subheading','introduction','tagline'])assert.ok(home.includes(b[k]),k);
 assert.ok(fs.existsSync(b.hero));
});
