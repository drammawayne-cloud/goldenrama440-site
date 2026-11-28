import {songNotes} from './account-assets/song-notes.js?v=20261126';
const grid=document.getElementById('catalog-tracks');
if(grid){
  fetch('golden-music-catalog.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('Song descriptions unavailable');return response.json();}).then(data=>{
    const tracks=new Map(data.tracks.map(track=>[track.title,track]));
    const render=()=>{for(const card of grid.querySelectorAll('article')){if(card.querySelector('.golden-song-notes'))continue;const item=tracks.get(card.querySelector('h3')?.textContent);if(item){const notes=songNotes(item);if(notes)card.append(notes);}}};
    render();new MutationObserver(render).observe(grid,{childList:true});
  }).catch(error=>console.warn(error.message));
}
