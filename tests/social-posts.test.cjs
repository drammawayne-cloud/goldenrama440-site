const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
test('all 57 posts have crawlable social previews, one title, three paragraphs and a canonical URL',()=>{
 const items=[...read('golden-music-catalog.json').tracks,...read('golden-video-updates.json').videos],ids=new Set(),urls=new Set();
 for(const item of items){
  assert.ok(!ids.has(item.reactionId));ids.add(item.reactionId);assert.ok(!urls.has(item.postUrl));urls.add(item.postUrl);
  const html=fs.readFileSync(path.join(root,item.postUrl,'index.html'),'utf8');
  assert.equal((html.match(/<h1>/g)||[]).length,1,item.title);
  assert.ok(html.includes('property="og:title"'));assert.ok(html.includes('property="og:description"'));assert.ok(html.includes('property="og:image"'));assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.includes('href="https://goldenrama440.com'+item.postUrl+'"'));
  assert.ok(html.includes('data-reaction-id="'+item.reactionId+'"'));
  const description=html.match(/<div class="golden-post-description">([\s\S]*?)<\/div>/)[1];
  assert.equal((description.match(/<p>/g)||[]).length,3,item.title);assert.doesNotMatch(description,/<h[1-6]/);
 }
 assert.equal(ids.size,57);
});
test('reaction counts use compact factual totals, and unknown counts never become fabricated numbers',async()=>{
 const {compactCount,briefDescription}=await import('../account-assets/reaction-format.js');
 for(const [value,expected] of [[0,'0'],[73,'73'],[999,'999'],[1000,'1K'],[1500,'1.5K'],[1999,'1.9K'],[2000,'2K'],[1000000,'1M'],[undefined,'—'],[-1,'—']])assert.equal(compactCount(value),expected);
 assert.equal(briefDescription('A complete introduction to this song. '+ 'More detail. '.repeat(30)),'A complete introduction to this song.');
 assert.ok(briefDescription('word '.repeat(100)).length<=180);
});
