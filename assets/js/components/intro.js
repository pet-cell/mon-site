import { defaults } from '../config/defaults.js';
import { setImage } from './images.js';
export function mountIntro(page, rootUrl) {
  const heading = document.getElementById('intro-title');
  heading.textContent = page.heading;
  heading.style.whiteSpace = 'pre-line';
  document.querySelector('.intro-copy > p').textContent = page.description;
  const image = document.createElement('img');
  setImage(image,page.image,page.imageAlt,rootUrl,defaults.image);
  const host = document.querySelector('.intro-image');
  host.removeAttribute('role');host.removeAttribute('aria-label');
  host.replaceChildren(image);
}
