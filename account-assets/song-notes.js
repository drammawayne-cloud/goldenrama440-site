export function songNotes(item, {expanded = false} = {}) {
  const paragraphs = Array.isArray(item.description) ? item.description.filter(value => typeof value === 'string' && value.trim()) : [];
  if (!paragraphs.length && !item.dedication) return null;
  const section = document.createElement('section'); section.className = 'golden-song-notes';
  if (typeof item.dedication === 'string' && item.dedication.trim()) {
    const tribute = document.createElement('p'); tribute.className = 'golden-song-dedication'; tribute.textContent = item.dedication; section.append(tribute);
  }
  if (paragraphs.length) {
    const content = document.createElement(expanded ? 'div' : 'details');
    if (!expanded) { const summary = document.createElement('summary'); summary.textContent = 'About this song'; content.append(summary); }
    if (item.descriptionAuthor) { const author = document.createElement('p'); author.className = 'golden-song-author'; author.textContent = 'Written by ' + item.descriptionAuthor; content.append(author); }
    for (const [index,text] of paragraphs.entries()) { const headingText=item.descriptionHeadings?.[index]; if(typeof headingText==='string'&&headingText.trim()){const heading=document.createElement(expanded?'h2':'h4');heading.className='golden-song-heading';heading.textContent=headingText;content.append(heading);} const paragraph = document.createElement('p'); paragraph.textContent = text; content.append(paragraph); }
    section.append(content);
  }
  return section;
}
