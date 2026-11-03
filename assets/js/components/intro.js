import { defaults } from '../config/defaults.js';
import { setImage } from './images.js';
export function mountIntro(page, rootUrl) {
  const heading = document.getElementById('intro-title');
  heading.textContent = page.heading;
  heading.style.whiteSpace = 'pre-line';
  const copy=document.querySelector('.intro-copy');
  copy.replaceChildren(...[page.description,...(page.introParagraphs || [])].filter(Boolean).map(text=>{
    const paragraph=document.createElement('p');paragraph.textContent=text;return paragraph;
  }));
  const image = document.createElement('img');
  setImage(image,page.image,page.imageAlt,rootUrl,defaults.image);
  if(['contain','cover'].includes(page.imageFit))image.style.objectFit=page.imageFit;
  const host = document.querySelector('.intro-image');
  host.style.aspectRatio=page.imageAspectRatio || '';
  host.classList.toggle('intro-image--double',page.imageScale===2);
  host.removeAttribute('role');host.removeAttribute('aria-label');
  host.replaceChildren(image);
}
