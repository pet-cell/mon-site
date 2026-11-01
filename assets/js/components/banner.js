import { arrowButton } from './buttons.js';
import { defaults } from '../config/defaults.js';
import { setImage } from './images.js';
export function mountBanner(page, key, rootUrl) {
  document.querySelector('.banner-label').textContent = page.bannerLabel ?? `PORTFOLIO / ${page.title.toLocaleUpperCase('fr')}`;
  const text = document.querySelector('.brand > span');
  const subtitle = document.createElement('small');
  subtitle.textContent = page.bannerSubtitle ?? defaults.bannerSubtitle;
  text.textContent = page.bannerText ?? defaults.bannerText;
  text.append(subtitle);
  setImage(document.querySelector('.banner-image'),page.bannerImage,page.bannerImageAlt,rootUrl,defaults.bannerImage);
  if (key !== 'accueil') document.querySelector('.banner').prepend(arrowButton({label:'Retour à l’accueil',className:'banner-back',href:new URL('index.html',rootUrl).href}));
}
