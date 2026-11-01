import { useFirstFramePoster } from './video-poster.js';
import { setImage } from './images.js';
export function mountProjectBrowser(page, rootUrl) {
  const options = document.getElementById('project-options');
  const content = document.getElementById('project-content');
  const projects = page.projects || [];
  if (!projects.length) { content.textContent = 'Les projets seront disponibles prochainement.'; return; }
  const url = value => {
    const result = new URL(value,rootUrl);
    if (!['http:','https:'].includes(result.protocol)) throw new Error('Adresse de média non autorisée.');
    return result.href;
  };
  function show(project) {
    content.querySelectorAll('video').forEach(video => video.pause());
    content.replaceChildren();
    const category = document.createElement('p');category.className='eyebrow';category.textContent=project.category || page.title;
    const heading=document.createElement('h2');heading.id='project-title';heading.textContent=project.title;
    const summary=document.createElement('p');summary.className='project-summary';summary.textContent=project.summary || '';
    content.append(category,heading,summary);
    if(project.image!==false) {
    const figure=document.createElement('figure');
    const image=document.createElement('img');image.loading='lazy';
    setImage(image,project.image,project.imageAlt,rootUrl,'assets/images/defaut_projet.svg');figure.append(image);content.append(figure);
    }
    for (const text of project.paragraphs || []) {const p=document.createElement('p');p.textContent=text;content.append(p);}
    const videos=Array.isArray(project.videos)?project.videos:project.video===false?[]:[{src:project.video,title:project.videoTitle,caption:project.videoCaption,poster:project.videoPoster}];
    for(const item of videos) {
      const media=document.createElement('figure');media.className='project-video';
      if(item.youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(item.youtubeId)) {
        const frame=document.createElement('iframe');
        const embed=new URL('https://www.youtube-nocookie.com/embed/'+item.youtubeId);
        embed.searchParams.set('start',String(Math.max(0,Math.floor(Number(item.start)||0))));
        embed.searchParams.set('autoplay','0');embed.searchParams.set('rel','0');
        frame.src=embed.href;frame.title=item.title || 'Présentation vidéo';
        frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;
        frame.referrerPolicy='strict-origin-when-cross-origin';
        media.append(frame);content.append(media);continue;
      }
      const video=document.createElement('video');video.controls=true;video.preload='metadata';video.playsInline=true;video.volume=0.1;
      video.setAttribute('aria-label',item.title || 'Vidéo du projet');
      const poster=item.poster ?? project.videoPoster;
      if(!poster || poster==='first-frame')useFirstFramePoster(video);
      else video.poster=url(poster);
      const source=url(item.src || 'assets/videos/defaut_projet.webm');
      let usedFallback=false;
      video.addEventListener('error',()=>{
        if(!usedFallback && source!==url('assets/videos/defaut_projet.webm')) {
          usedFallback=true;video.src=url('assets/videos/defaut_projet.webm');video.load();
          if(caption)caption.textContent='Vidéo indisponible : animation d’exemple.';
        }else{
          video.hidden=true;caption.textContent='La vidéo ne peut pas être lue dans ce navigateur.';
        }
      });
      const caption=document.createElement('figcaption');caption.textContent=item.caption || '';
      video.src=source;media.append(video,caption);content.append(media);
    }
    content.dataset.project=project.id;
  }
  const initial=projects.find(project=>'#'+project.id===location.hash)||projects[0];
  options.replaceChildren(...projects.map((project,index)=>{
    const label=document.createElement('label');label.className='project-choice';
    const radio=document.createElement('input');radio.type='radio';radio.name='project';radio.value=project.id;radio.checked=project===initial;
    const title=document.createElement('span');title.textContent=project.title;
    radio.addEventListener('change',()=>{if(!radio.checked)return;show(project);});
    label.append(radio,title);return label;
  }));
  show(initial);
}
