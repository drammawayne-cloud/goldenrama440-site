const test = require('node:test');
const assert = require('node:assert/strict');

class Element extends EventTarget {
  constructor(){ super(); this.children=[]; this.disabled=false; this.value='auto'; }
  append(...items){ this.children.push(...items); }
  setAttribute(){}
}
class NativeVideo extends EventTarget {
  constructor(){super();this.paused=false;this.currentTime=13;this.duration=219;this.isConnected=true;this.loads=0;this.plays=0;this.sources=[];}
  canPlayType(){return 'probably';}
  set src(value){this.sources.push({value,crossOrigin:this.crossOrigin});this.paused=true;}
  load(){this.loads++;this.dispatchEvent(new Event('loadedmetadata'));}
  play(){this.paused=false;this.plays++;return Promise.resolve();}
}

test('native quality changes and MP4 fallback load despite preload none and retain playback position',async()=>{
  const saved={document:global.document,MutationObserver:global.MutationObserver,location:global.location};
  global.document={createElement:()=>new Element(),documentElement:{}};
  global.location={origin:'https://goldenrama440.com'};
  global.MutationObserver=class{observe(){}disconnect(){}};
  try{
    const {attachQuality}=await import('../account-assets/video-quality.js');
    const video=new NativeVideo(),host=new Element();
    const item={hls:'/assets/updates/2026-11-26/golden-rama-video-06-clean/master.m3u8',src:'/assets/updates/2026-11-26/golden-rama-video-06-clean.mp4'};
    const ready=attachQuality(video,item,host);await ready;
    assert.equal(video.sources[0].crossOrigin,'anonymous','CDN fragments need CORS before native HLS starts');
    const select=host.children[0].children.find(n=>n instanceof Element);
    video.paused=false;select.value='1080';select.dispatchEvent(new Event('change'));
    assert.equal(video.loads,1);assert.equal(video.currentTime,13);assert.equal(video.paused,false);
    assert.match(video.sources.at(-1).value,/\/1080\.m3u8$/);
    video.dispatchEvent(new Event('error'));
    assert.equal(video.loads,2);assert.equal(video.currentTime,13);assert.equal(video.paused,false);
    assert.equal(video.sources.at(-1).value,item.src);assert.equal(select.disabled,true);
    ready.destroy();
  }finally{for(const [key,value]of Object.entries(saved))if(value===undefined)delete global[key];else global[key]=value;}
});
