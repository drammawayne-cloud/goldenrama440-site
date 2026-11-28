const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
test('video feed loads actual JSON and links all seven cards to their shareable posts',async()=>{
 const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'account-assets/golden-posts.js'),'utf8');
 const start=source.indexOf('async function videos()'),end=source.indexOf('\nasync function feed()',start);
 const fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,new URL(url,'https://goldenrama440.com').pathname),'utf8'))});
 const videos=vm.runInNewContext('('+source.slice(start,end)+')',{fetch,URL,location:{origin:'https://goldenrama440.com'}});
 const rows=await videos();assert.equal(rows.length,7);assert.equal(rows[0].title,'Code of The Regime');
 for(const row of rows){assert.match(row.url,/^https:\/\/goldenrama440\.com\/videos\/[a-z0-9-]+\/$/);assert.equal(row.description.length,3);assert.ok(row.reactionId);}
});
