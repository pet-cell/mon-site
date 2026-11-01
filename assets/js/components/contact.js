const icons = {
  linkedin:'<path d="M7 10v10M7 6v.2M12 20v-10h4v1.5c1-2 5-2 5 2V20M12 14c0-4 5-4 5 0"/>',
  orcid:'<circle cx="12" cy="12" r="10"/><path d="M7 9v9M7 6v.2M11 8h3a5 5 0 0 1 0 10h-3z"/>',
  github:'<path d="M9 20c-5 1-5-2-7-2m14 5v-4c0-1-.2-2-1-2 4-.5 7-2 7-6 0-2-.6-3-2-4 .4-1 .4-3-.2-4-2-.2-4 1-5 1a14 14 0 0 0-6 0c-1 0-3-1-5-1-.6 1-.6 3-.2 4-1.4 1-2 2-2 4 0 4 3 5.5 7 6-.8 0-1 1-1 2v4"/>'
};
export function mountContact(page) {
  const settings=page.contact || {};
  const profiles=settings.profiles || [];
  const host=document.getElementById('social-links');
  const button=document.getElementById('copy-email');
  host.replaceChildren(...profiles.map(profile=>{
    let url;
    try {const parsed=new URL(profile.url);if(['https:','http:'].includes(parsed.protocol))url=parsed.href;}catch{}
    const item=document.createElement(url?'a':'button');
    item.className='social-link';
    if(url){item.href=url;item.target='_blank';item.rel='noopener noreferrer';}
    else {item.type='button';item.disabled=true;item.title='Lien à venir';}
    item.setAttribute('aria-label',profile.label+(url?' — ouvrir le profil':' — lien à venir'));
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 26 26');icon.setAttribute('aria-hidden','true');
    icon.innerHTML=icons[profile.service] || icons.orcid;
    const text=document.createElement('span');text.textContent=profile.label;
    item.append(icon,text);return item;
  }));
  host.append(button);
  const status=document.getElementById('contact-status');
  let fadeTimer,hideTimer;
  status.hidden=true;
  function notify(copied) {
    clearTimeout(fadeTimer);clearTimeout(hideTimer);
    status.dataset.state=copied?'success':'error';
    status.dataset.phase='visible';
    status.textContent=copied?'ask to git owner':'Le navigateur a refusé la copie. Réessayez en autorisant l’accès au presse-papiers.';
    status.hidden=false;
    if(copied) {
      fadeTimer=setTimeout(()=>{status.dataset.phase='fading';},1700);
      hideTimer=setTimeout(()=>{status.hidden=true;status.textContent='';},2000);
    }
  }
  button.disabled=settings.emailCopyEnabled===false || !settings.email;
  button.setAttribute('aria-label',button.disabled?'Mail — indisponible':'Copier l’adresse e-mail');
  button.title=button.disabled?'Mail indisponible':'Copier l’adresse e-mail';
  if(button.disabled)return;
  button.addEventListener('click',async()=>{
    try {
      await navigator.clipboard.writeText(settings.email);
      notify(true);
    }catch {
      let copied=false;
      const field=document.createElement('textarea');
      field.value=settings.email;
      field.setAttribute('aria-hidden','true');field.tabIndex=-1;
      field.style.cssText='position:fixed;opacity:0;pointer-events:none;';
      try {
        document.body.append(field);field.select();
        copied=!!document.execCommand?.('copy');
      }catch{}finally{field.remove();button.focus();}
      notify(copied);
    }
  });
}
