import { mobileQuery } from './mobile-info.js';
import { defaults } from '../config/defaults.js';
import { setImage } from './images.js';
export function mountTiles(page, rootUrl) {
  const grid = document.querySelector('.tile-grid');
  if (!grid) return;
  const touch=window.matchMedia('(hover: none) and (pointer: coarse)');
  const mobile=window.matchMedia(mobileQuery);
  let pendingNavigation;
  const collapse=()=>{clearTimeout(pendingNavigation);pendingNavigation=null;grid.querySelectorAll('.project-tile').forEach(item=>item.setAttribute('aria-expanded','false'));};
  document.addEventListener('click',event=>{if(!grid.contains(event.target))collapse();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')collapse();});
  touch.addEventListener('change',collapse);mobile.addEventListener('change',collapse);
  grid.replaceChildren(...(page.tiles ?? defaults.tiles).map((tile,index) => {
    const fallback = defaults.tiles[index % defaults.tiles.length];
    const link = document.createElement('a');link.className = 'project-tile';
    const url = new URL(tile.href || fallback.href, rootUrl);
    link.href = ['http:','https:'].includes(url.protocol) ? url.href : new URL(fallback.href, rootUrl).href;
    const art = document.createElement('img');art.className = 'tile-art';
    setImage(art,tile.image,tile.imageAlt,rootUrl,fallback.image);
    const band = document.createElement('span');band.className = 'tile-band';
    const title = document.createElement('span');title.textContent = tile.title ?? fallback.title;
    const mark = document.createElement('span');mark.className = 'tile-mark';mark.textContent = '↗';mark.setAttribute('aria-hidden','true');
    const description = document.createElement('small');description.textContent = tile.description ?? fallback.description;
    link.setAttribute('aria-expanded','false');
    link.addEventListener('click',event=>{
      if(!mobile.matches||!touch.matches||event.detail===0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      if(link.getAttribute('aria-expanded')==='true')return;
      collapse();link.setAttribute('aria-expanded','true');
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      pendingNavigation=setTimeout(()=>{window.location.assign(link.href);},reduced?0:420);
    });
    band.append(title,mark,description);link.append(art,band);return link;
  }));
}
