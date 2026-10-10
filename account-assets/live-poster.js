// Capture only the already-public mixed output; failures never interrupt broadcasting.
export function createLivePoster({video,api,getRecord,now=Date.now,documentImpl=globalThis.document}){
 let sentAt=0,busy=false;
 return async function publish(force=false){const r=getRecord();if(busy||r?.audience!=='public'||!r.id||video.readyState<2||!video.videoWidth||(!force&&now()-sentAt<60000))return false;busy=true;try{const canvas=documentImpl.createElement('canvas'),scale=Math.min(1,960/video.videoWidth,960/video.videoHeight);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);await api('poster',{id:r.id,image:canvas.toDataURL('image/jpeg',.75)});sentAt=now();return true;}catch{return false;}finally{busy=false;}};
}
