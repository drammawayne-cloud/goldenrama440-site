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
    assert.equal(item.descriptionHeadings?.length,3,item.title);
    assert.ok(item.descriptionHeadings.every(h=>typeof h==='string'&&h.trim().length>=8),item.title);
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
