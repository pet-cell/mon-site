import { defaults } from '../config/defaults.js';
import { setImage } from './images.js';
export function mountInfoPanel(page, rootUrl) {
  document.querySelector('.info-topline span').textContent = page.infoLabel ?? defaults.infoLabel;
  const host = document.querySelector('.info-illustration');
  host.removeAttribute('role');host.removeAttribute('aria-label');
  const image = document.createElement('img');host.replaceChildren(image);
  const entries = page.info?.length ? page.info : [{category:'Information',title:page.title,description:''}];
  let current = 0;
  function showInfo(direction = 0) {
    current = (current + direction + entries.length) % entries.length;
    const entry = entries[current];
    setImage(image,entry.image || page.infoImage,entry.imageAlt ?? page.infoImageAlt,rootUrl,defaults.infoImage);
    document.getElementById('info-category').textContent = entry.category;
    document.getElementById('info-title').textContent = entry.title;
    const description=document.getElementById('info-description');
    description.textContent = entry.description;
    if (Array.isArray(entry.descriptionParts)) {
      description.replaceChildren(...entry.descriptionParts.map(part => {
        let href;
        try {const url=new URL(part.href);if(['https:','http:'].includes(url.protocol))href=url.href;}catch{}
        const node=document.createElement(href?'a':part.italic?'em':'span');
        node.textContent=part.text || '';
        if(href){node.href=href;node.target='_blank';node.rel='noopener noreferrer';}
        return node;
      }));
    }
    document.getElementById('info-count').textContent = `${current + 1} / ${entries.length}`;
    const copy = document.querySelector('.info-copy');
    copy.classList.remove('changing');
    requestAnimationFrame(() => copy.classList.add('changing'));
  }
  document.querySelector('.previous-info').addEventListener('click', () => showInfo(-1));
  document.querySelector('.next-info').addEventListener('click', () => showInfo(1));
  document.querySelectorAll('.info-controls button').forEach(button => button.disabled = entries.length < 2);
  showInfo();
}
