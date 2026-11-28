const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('copy shares the exact individual post and still offers that URL if clipboard access fails',async()=>{
 const source=fs.readFileSync(require.resolve('../account-assets/golden-reactions.js'),'utf8');
 const body=source.slice(source.indexOf('export async function sharePost'),source.indexOf('\nlet loadTimer;')).replace('export ','');
 class Element{constructor(tag){this.tag=tag;this.children=[];this.dataset={};}append(...nodes){this.children.push(...nodes);}setAttribute(){}addEventListener(){}showModal(){}close(){this.closed=true;}focus(){this.focused=true;}select(){this.selected=true;}querySelector(tag){return this.children.find(child=>child.tag===tag);}}
 for(const denied of [false,true]){
  let copied;const root=new Element('body');
  const context={document:{createElement:tag=>new Element(tag),body:root},navigator:{clipboard:{writeText:async value=>{if(denied)throw Error('Clipboard denied');copied=value;}}},button:()=>new Element('button'),window:{open(){}}};
  vm.runInNewContext(body+';this.sharePost=sharePost;',context);
  const url='https://goldenrama440.com/videos/mi-nuh-know-yu-ft-alqual/',status={textContent:''};
  await context.sharePost({title:'Mi Nuh Know Yu Ft Alqual',text:'Brief',url},status);
  const dialog=root.children[0],options=dialog.children[1];await options.children[0].onclick();
  if(denied){const input=dialog.querySelector('input');assert.equal(input.value,url);assert.equal(input.readOnly,true);assert.equal(input.selected,true);assert.ok(!dialog.closed);}else{assert.equal(copied,url);assert.equal(dialog.closed,true);}
 }
});
