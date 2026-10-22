export const CART_KEY='goldenrama440-song-cart';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function musicCart(saved,products){const allowed=new Set(products.map(p=>p.id));return Array.isArray(saved)?[...new Set(saved.filter(id=>typeof id==='string'&&uuid.test(id)&&allowed.has(id)))].slice(0,24):[];}
export const cartCents=ids=>ids.length*144;
export function addSong(ids,id){return ids.includes(id)?ids:[...ids,id].slice(0,24);}
export const removeSong=(ids,id)=>ids.filter(v=>v!==id);
