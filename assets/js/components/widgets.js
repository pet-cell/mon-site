import { mountWidgetCollapse } from './widget-collapse.js';

export function mountWidgets(panel, options = {}) {
  let timeZone = options.timeZone || 'Europe/Paris';
  try { new Intl.DateTimeFormat('fr-FR',{timeZone}).format(); } catch { timeZone = 'Europe/Paris'; }
  let locale = options.locale || 'fr-FR';
  try { new Intl.DateTimeFormat(locale).format(); } catch { locale = 'fr-FR'; }
  const city = options.city ?? 'Paris';
  document.getElementById('local-time').setAttribute('aria-label',city ? 'Heure de '+city : 'Heure locale');
  let shown = new Date();
  let year = Number(new Intl.DateTimeFormat('en',{timeZone,year:'numeric'}).format(shown));
  let month = Number(new Intl.DateTimeFormat('en',{timeZone,month:'numeric'}).format(shown))-1;
  const popup=document.getElementById('calendar-popup');
  const toggle=document.querySelector('.calendar-toggle');
  function calendar() {
    document.getElementById('calendar-month').textContent=new Intl.DateTimeFormat(locale,{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month,1)));
    const grid=document.getElementById('calendar-grid');grid.replaceChildren();
    for (const label of ['Lu','Ma','Me','Je','Ve','Sa','Di']) {const day=document.createElement('b');day.textContent=label;grid.append(day);}
    const offset=(new Date(Date.UTC(year,month,1)).getUTCDay()+6)%7;
    for(let i=0;i<offset;i++)grid.append(document.createElement('span'));
    const today=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    for(let i=1;i<=new Date(Date.UTC(year,month+1,0)).getUTCDate();i++) {const day=document.createElement('span');day.textContent=i;if(today===`${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`){day.className='today';day.setAttribute('aria-current','date');}grid.append(day);}
  }
  function miniature() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const values = Object.fromEntries(parts.map(part => [part.type,part.value]));
    const y=Number(values.year),m=Number(values.month)-1,d=Number(values.day);
    toggle.querySelector('.mini-month').textContent = new Intl.DateTimeFormat(locale,{timeZone,month:'short'}).format(now);
    const grid=toggle.querySelector('.mini-days'); grid.replaceChildren();
    const offset=(new Date(Date.UTC(y,m,1)).getUTCDay()+6)%7;
    for(let n=0;n<offset;n++)grid.append(document.createElement('i'));
    for(let n=1;n<=new Date(Date.UTC(y,m+1,0)).getUTCDate();n++){const day=document.createElement('i');day.textContent=n;if(n===d)day.className='mini-today';grid.append(day);}
  }
  miniature();
  setInterval(miniature,60000);
  toggle.addEventListener('click',()=>{popup.hidden=!popup.hidden;toggle.setAttribute('aria-expanded',String(!popup.hidden));if(!popup.hidden)calendar();});
  for(const [id,direction] of [['calendar-previous',-1],['calendar-next',1]])document.getElementById(id).addEventListener('click',()=>{const date=new Date(Date.UTC(year,month+direction,1));year=date.getUTCFullYear();month=date.getUTCMonth();calendar();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!popup.hidden){popup.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();}});
  document.addEventListener('click',event=>{if(!panel.contains(event.target)){popup.hidden=true;toggle.setAttribute('aria-expanded','false');}});
  function clock(){const now=new Date();const time=document.getElementById('local-time');time.dateTime=now.toISOString();time.textContent=new Intl.DateTimeFormat(locale,{timeZone,hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now)+(city ? ' · '+city : '');document.getElementById('local-date').textContent=new Intl.DateTimeFormat(locale,{timeZone,weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}).format(now);}
  clock();setInterval(clock,1000);
  const updateBottomSpace=()=>document.documentElement.style.setProperty('--block-8-height',panel.getBoundingClientRect().height+'px');
  updateBottomSpace();
  const sizeObserver=new ResizeObserver(updateBottomSpace);
  sizeObserver.observe(panel);
  mountWidgetCollapse(panel,updateBottomSpace);
}
