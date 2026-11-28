const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file)));
test('all 50 songs and seven videos have substantial three-paragraph descriptions and the requested author credit',()=>{
  const tracks=read('golden-music-catalog.json').tracks,videos=read('golden-video-updates.json').videos;
  assert.equal(tracks.length,50);assert.equal(videos.length,7);
  for(const item of [...tracks,...videos]){
    assert.equal(item.descriptionAuthor,'Dwayne Vidal — Author',item.title);
    assert.deepEqual(item.descriptionHeadings,[],item.title+' uses its song title as the only heading');
    assert.ok(Array.isArray(item.description)&&item.description.length>=3,item.title);
    assert.ok(item.description.every(p=>typeof p==='string'&&p.trim().split(/\s+/).length>=22),item.title);
    assert.equal(new Set(item.description).size,item.description.length,item.title);
  }
  assert.equal(videos[0].id,'golden-rama-video-06');
  assert.equal(videos.find(v=>v.id==='golden-rama-video-01').dedication,'Rest in peace, Alqual. Gone but not forgotten. Legends never die.');
  assert.equal(videos.filter(v=>v.dedication).length,1);
  const members=new Set(read('golden-stream-only.json').titles);
  assert.equal(tracks.filter(t=>members.has(t.title)).length,26);
  assert.equal(tracks.filter(t=>!members.has(t.title)).length,24);
});

test('song descriptions flow as three paragraphs without repeated subheadings in cards and full posts',async()=>{
  const previousDocument=global.document;
  class Element {
    constructor(tag){this.tagName=tag;this.children=[];this.textContent='';this.className='';this.dataset={};}
    append(...children){this.children.push(...children);}
  }
  const descendants=node=>node.children.flatMap(child=>[child,...descendants(child)]);
  global.document={createElement:tag=>new Element(tag)};
  try{
    const {songNotes}=await import('../account-assets/song-notes.js');
    const items=[...read('golden-music-catalog.json').tracks,...read('golden-video-updates.json').videos];
    for(const expanded of [false,true])for(const item of items){
      const nodes=descendants(songNotes(item,{expanded}));
      assert.equal(nodes.filter(node=>/^h[1-6]$/.test(node.tagName)).length,0,item.title+' retains the existing card title only');
      assert.deepEqual(nodes.filter(node=>node.tagName==='p'&&!node.className).map(node=>node.textContent),item.description,item.title);
      assert.equal(nodes.filter(node=>node.className==='golden-song-author').length,1,item.title);
      assert.equal(nodes.filter(node=>node.className==='golden-song-dedication').length,item.dedication?1:0,item.title);
      const brief=nodes.find(node=>node.className==='golden-song-card-brief');
      if(!expanded&&item.reactionId.startsWith('golden-rama-video-')){
        assert.ok(brief?.textContent.length>=30,item.title+' has a visible card preview');
        assert.ok(brief.textContent.length<=260,item.title+' stays brief');
        if(item.reactionId==='golden-rama-video-01'){
          const {briefDescription}=await import('../account-assets/reaction-format.js');
          assert.equal(brief.textContent,briefDescription(item.description[0]));
          assert.equal((brief.textContent.match(/[.!?](?:\s|$)/g)||[]).length,1,'Alqual card uses one sentence');
          assert.equal(nodes.find(node=>node.className==='golden-song-dedication').textContent,item.dedication);
        }
      }else assert.equal(brief,undefined);
    }
  }finally{
    if(previousDocument===undefined)delete global.document;else global.document=previousDocument;
  }
});
