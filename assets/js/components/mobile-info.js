export const mobileQuery='(max-width: 650px), (max-width: 950px) and (pointer: coarse)';
export function mountMobileInfo() {
  const panel=document.getElementById('info-panel');
  const toggle=document.getElementById('info-toggle');
  const closeButton=document.getElementById('info-close');
  const media=window.matchMedia(mobileQuery);
  function close(restoreFocus=false) {
    panel.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');
    if(restoreFocus)toggle.focus();
  }
  function sync() {
    close();
    if(media.matches){panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');}
    else{panel.removeAttribute('role');panel.removeAttribute('aria-modal');}
  }
  toggle.addEventListener('click',()=>{
    if(toggle.getAttribute('aria-expanded')==='true'){close();return;}
    panel.classList.add('is-open');toggle.setAttribute('aria-expanded','true');closeButton.focus();
  });
  closeButton.addEventListener('click',()=>close(true));
  document.addEventListener('keydown',event=>{if(media.matches&&event.key==='Escape'&&panel.classList.contains('is-open')){close(true);}});
  document.addEventListener('click',event=>{if(media.matches&&!panel.contains(event.target)&&!toggle.contains(event.target))close();});
  media.addEventListener('change',sync);sync();
}
