export function compactCount(value){
  const count=Number(value);if(!Number.isSafeInteger(count)||count<0)return '—';
  if(count<1000)return String(count);
  const unit=count>=1000000?'M':'K',scale=unit==='M'?1000000:1000;
  return (Math.floor(count/scale*10)/10).toFixed(1).replace(/\.0$/,'')+unit;
}
export function briefDescription(paragraph){
  const text=String(paragraph||'').replace(/\s+/g,' ').trim();
  if(text.length<=180)return text;
  const first=text.match(/^.{20,180}?[.!?](?:\s|$)/)?.[0]?.trim();
  return first||text.slice(0,177).replace(/\s+\S*$/,'')+'…';
}
export function cardBrief(paragraph){
  const text=String(paragraph||'').replace(/\s+/g,' ').trim();
  const sentences=text.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  const opening=sentences?.slice(0,2).join('').trim()||text;
  return opening.length<=260?opening:opening.slice(0,257).replace(/\s+\S*$/,'')+'…';
}
