import {attachVideo} from './video-quality.js?v=20261128-cors';
const video=document.getElementById('post-video');
if(video){
  try{
    const response=await fetch('/golden-video-updates.json',{cache:'no-store'});
    if(!response.ok)throw Error('Video options unavailable.');
    const item=(await response.json()).videos.find(v=>v.reactionId===document.body.dataset.contentId);
    if(item)attachVideo(video,item,document.getElementById('post-video-host'));
  }catch(error){console.warn(error.message);}
}
