// Chercher une image visible sans déplacer la tête de lecture du lecteur affiché.
export function useFirstFramePoster(video) {
  const prepare = () => {
    const probe=document.createElement('video');
    probe.preload='metadata';probe.muted=true;probe.playsInline=true;
    let times=[],index=0,target=0,bestScore=-1,bestPoster='',finished=false;
    const timeout=setTimeout(finish,20000);
    function finish() {
      if(finished)return;
      finished=true;clearTimeout(timeout);
      if(bestPoster)video.poster=bestPoster;
      probe.removeAttribute('src');probe.load();
    }
    function next() {
      if(finished)return;
      if(index>=times.length){finish();return;}
      target=times[index++];probe.currentTime=target;
    }
    function capture() {
      if(finished||probe.seeking||probe.readyState<2||Math.abs(probe.currentTime-target)>.15)return;
      try {
        const canvas=document.createElement('canvas');
        const ratio=Math.min(1,960/probe.videoWidth);
        canvas.width=Math.max(1,Math.round(probe.videoWidth*ratio));
        canvas.height=Math.max(1,Math.round(probe.videoHeight*ratio));
        const context=canvas.getContext('2d');
        if(!context){finish();return;}
        context.drawImage(probe,0,0,canvas.width,canvas.height);
        const sample=document.createElement('canvas');sample.width=64;sample.height=36;
        const sampleContext=sample.getContext('2d',{willReadFrequently:true});
        sampleContext.drawImage(canvas,0,0,64,36);
        const pixels=sampleContext.getImageData(0,0,64,36).data;
        let total=0,visible=0;
        for(let i=0;i<pixels.length;i+=4){const light=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];total+=light;if(light>24)visible++;}
        const average=total/(pixels.length/4),coverage=visible/(pixels.length/4);
        const score=average+coverage*50;
        if(score>bestScore){bestScore=score;bestPoster=canvas.toDataURL('image/jpeg',.85);}
        if(average>12&&coverage>.08){finish();return;}
        next();
      }catch{finish();}
    }
    probe.addEventListener('loadedmetadata',()=>{
      const duration=probe.duration;
      if(!Number.isFinite(duration)||duration<=0){finish();return;}
      const limit=Math.max(0,duration-.1);
      times=[...new Set([1,3,5,10,duration*.25,duration*.5].map(time=>Math.min(time,limit)))];
      next();
    },{once:true});
    probe.addEventListener('seeked',capture);
    probe.addEventListener('loadeddata',capture);
    probe.addEventListener('error',finish,{once:true});
    probe.src=video.currentSrc||video.src;
  };
  video.addEventListener('loadedmetadata',prepare,{once:true});
  if(video.readyState>=1)prepare();
}
