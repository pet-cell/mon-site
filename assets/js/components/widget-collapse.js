import { mobileQuery } from './mobile-info.js';

// Sur mobile, replier les widgets ferme aussi le calendrier et conserve une poignée visible.
export function mountWidgetCollapse(panel,onResize=()=>{}) {
  const media=window.matchMedia(mobileQuery);
  const button=panel.querySelector('.widgets-toggle');
  const content=panel.querySelector('.widgets-content');
  const calendar=panel.querySelector('#calendar-popup');
  const calendarButton=panel.querySelector('.calendar-toggle');
  let collapsed=false;
  function sync() {
    const folded=media.matches&&collapsed;
    content.hidden=folded;button.hidden=!media.matches;
    panel.classList.toggle('is-collapsed',folded);
    button.setAttribute('aria-expanded',String(!folded));
    button.setAttribute('aria-label',folded?'Agrandir la date et l’heure':'Réduire la date et l’heure');
    calendar.hidden=true;calendarButton.setAttribute('aria-expanded','false');
    onResize();
  }
  button.addEventListener('click',()=>{collapsed=!collapsed;sync();});
  media.addEventListener('change',sync);sync();
}
