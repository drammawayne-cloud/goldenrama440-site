const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const helper = import('../account-assets/video-quality.js');

test('HD streams stay on the approved public collection, rejecting credential and remote URLs', async () => {
  const {trustedStream} = await helper;
  const origin='https://goldenrama440.com';
  const asset='/assets/updates/2026-11-26/golden-rama-video-06/master.m3u8';
  assert.equal(trustedStream(asset,origin),origin+asset);
  for(const value of ['https://attacker.example'+asset,'https://user:password@goldenrama440.com'+asset,'//attacker.example'+asset,asset+'?redirect=evil',asset+'#x','/private/member.m3u8',null]) assert.equal(trustedStream(value,origin),'');
});

test('both quality levels have complete approved segments and preserve the seven public post IDs', () => {
  const collection=JSON.parse(fs.readFileSync(path.join(root,'golden-video-updates.json')));
  assert.deepEqual(collection.videos.map(v=>v.id),[6,1,2,3,4,5,7].map(i=>'golden-rama-video-0'+i));
  const featured=collection.videos.find(v=>v.id==='golden-rama-video-06');
  assert.equal(featured.hls,featured.versions[0].hls);
  assert.deepEqual(featured.versions.map(v=>v.id),['original','clean']);
  for(const version of featured.versions){
  const video={...version,duration:featured.duration};
  assert.ok(video.hls);
  const dir=path.dirname(path.join(root,video.hls));
  const master=fs.readFileSync(path.join(root,video.hls),'utf8');
  assert.match(master,/RESOLUTION=1920x1080/);assert.match(master,/RESOLUTION=1280x720/);
  for(const height of [720,1080]) {
    const playlist=fs.readFileSync(path.join(dir,height+'.m3u8'),'utf8');
    assert.match(playlist,/#EXT-X-ENDLIST/);
    const files=[...playlist.matchAll(/URI="([^"]+)"/g)].map(m=>m[1]).concat(playlist.split('\n').filter(v=>v&&!v.startsWith('#')));
    assert.ok(files.length>20);
    if(version.id==='clean'&&height===1080){
      const {segments}=JSON.parse(fs.readFileSync(path.join(dir,'hosted-segments.json')));
      assert.equal(files.length,38);assert.equal(Object.keys(segments).length,38);
      for(const file of files){
        assert.match(file,/^https:\/\/vajjwfxbbncqzrdbbvgu\.supabase\.co\/storage\/v1\/object\/public\/rr-addon-public\/goldenrama-hd-20261126\/clean-1080-(?:init|\d{3})\.mp4$/);
        assert.ok(segments[file].bytes>0&&segments[file].bytes<50*1024*1024);
        assert.match(segments[file].sha256,/^[a-f0-9]{64}$/);
      }
    }else for(const file of files) {assert.match(file,/^[\w.-]+$/);const bytes=fs.statSync(path.join(dir,file)).size;assert.ok(bytes>0&&bytes<100*1024*1024);}
    const duration=[...playlist.matchAll(/#EXTINF:([\d.]+)/g)].reduce((sum,m)=>sum+Number(m[1]),0);
    assert.ok(Math.abs(duration-video.duration)<0.1);
  }
  }
});

 test('version controls always choose the original first and reject unapproved sources',async()=>{
 const {videoVersions}=await helper,origin='https://goldenrama440.com';
 const item=JSON.parse(fs.readFileSync(path.join(root,'golden-video-updates.json'))).videos[0];
 assert.deepEqual(videoVersions({...item,versions:[...item.versions].reverse()},origin).map(v=>v.id),['original','clean']);
 assert.deepEqual(videoVersions({...item,versions:[item.versions[1]]},origin),[]);
 assert.deepEqual(videoVersions({...item,versions:[item.versions[0],{...item.versions[1],src:'https://attacker.example/video.mp4'}]},origin),[]);
});
