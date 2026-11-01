import { createLevel,scramble,trace,clamp } from './optics.js';
import { drawBench,drawFace } from './renderer.js';
export function startLaserLab(root) {
  const $=id=>root.getElementById(id);
  let model,selection,view='top',hitAreas=[],result,startedAt,winTime=null,pausedAt=null;
  const number=(v,digits=2)=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:digits,minimumFractionDigits:digits}).format(v);
  function selectedMirror(){return model.mirrors.find(m=>m.id===$('mirror-select').value)||model.mirrors[0];}
  function selectedDiaphragm(){return model.diaphragms.find(d=>d.id===$('diaphragm-select').value)||model.diaphragms[0];}
  function control(host,item,key,label,min,max,step,unit='',hint='') {
    const wrapper=document.createElement('div');wrapper.className='control';
    const labelEl=document.createElement('label'),input=document.createElement('input'),output=document.createElement('output');
    input.type='range';input.min=min;input.max=max;input.step=step;input.value=item[key];input.id=item.id+'-'+key;input.setAttribute('aria-label',label+' — '+item.name);
    labelEl.htmlFor=input.id;labelEl.textContent=label;labelEl.append(output);output.htmlFor=input.id;
    const show=()=>output.textContent=number(Number(input.value),step<.1?2:1)+unit;show();
    input.addEventListener('input',()=>{item[key]=clamp(Number(input.value),min,max);show();selection=item.id;winTime=null;update();});
    wrapper.append(labelEl,input);if(hint){const small=document.createElement('small');small.textContent=hint;wrapper.append(small);}host.append(wrapper);
  }
  function mirrorControls(){
    const m=selectedMirror(),host=$('mirror-controls');host.replaceChildren();
    control(host,m,'azimuth','Azimut · déviation',15,90,.1,'°');
    control(host,m,'elevation','Élévation',-5,5,.05,'°');
    control(host,m,'height','Hauteur',10,15,.01);
  }
  function diaphragmControls(){
    const d=selectedDiaphragm();$('diaphragm-empty').hidden=!!d;$('diaphragm-content').hidden=!d;if(!d)return;
    const host=$('diaphragm-controls');host.replaceChildren();
    control(host,d,'position','Position x · entre les miroirs',15,85,.5,' %','Position limitée au segment entre les deux miroirs.');
    if(d.axes===2)control(host,d,'lateral','Position y · déplacement transversal',-1.2,1.2,.01,'','Déplacement limité autour du trajet nominal.');
    control(host,d,'height','Hauteur',10,15,.01);
    control(host,d,'aperture','Ouverture · rayon',.1,1,.01);
  }
  function update() {
    result=trace(model);
    if(result.won&&winTime===null)winTime=((pausedAt??performance.now())-startedAt)/1000;
    $('game-status').textContent=result.won?'Cible alignée — parcours complet !':result.block?'Rayon interrompu : '+result.block.name+'.':'Le rayon atteint la cible. Affinez le centrage.';
    $('game-status').classList.toggle('won',result.won);
    $('target-state').textContent=result.won?'Alignée':result.reached?'À centrer':'Sans signal';
    $('error-out').textContent=result.error===null?'—':number(result.error,3);
    $('intensity-out').textContent=number(result.intensity*100,1)+' %';
    const mirrors=result.events.filter(e=>e.id.startsWith('m')&&e.passed).length;
    const apertures=result.events.filter(e=>e.id.startsWith('d')&&e.passed).length;
    $('mirrors-out').textContent=mirrors+' / '+model.mirrors.length;$('apertures-out').textContent=apertures+' / '+model.diaphragms.length;
    $('path-readout').textContent=model.mirrors.length+' miroir'+(model.mirrors.length>1?'s':'');
    hitAreas=drawBench($('bench'),model,result,selection,view);
    drawFace($('target'),model.target,result);drawFace($('mirror-detail'),selectedMirror(),result);
    if(selectedDiaphragm())drawFace($('diaphragm-detail'),selectedDiaphragm(),result);
  }
  function loadLevel(level,seed) {
    model=scramble(createLevel(level,seed));selection=model.mirrors[0].id;startedAt=performance.now();winTime=null;if(pausedAt!==null)pausedAt=startedAt;
    $('mirror-select').replaceChildren(...model.mirrors.map(item=>new Option(item.name,item.id)));
    $('diaphragm-select').replaceChildren(...model.diaphragms.map(item=>new Option(item.name,item.id)));
    $('level-value').textContent='Niveau '+model.level;
    $('level-description').textContent=model.mirrors.length+' miroir'+(model.mirrors.length>1?'s':'')+' · '+model.diaphragms.length+' diaphragme'+(model.diaphragms.length>1?'s':'')+(model.level>1?' · '+(model.level===2?'1 axe de déplacement':'2 axes de déplacement')+' par diaphragme.':' · Réglez les deux angles et la hauteur.');
    mirrorControls();diaphragmControls();update();
  }
  $('mirror-select').addEventListener('change',()=>{selection=selectedMirror().id;mirrorControls();update();});
  $('diaphragm-select').addEventListener('change',()=>{selection=selectedDiaphragm().id;diaphragmControls();update();});
  $('difficulty').addEventListener('input',()=>loadLevel(Number($('difficulty').value)));
  $('restart').addEventListener('click',()=>loadLevel(model.level,model.seed));
  $('new-bench').addEventListener('click',()=>loadLevel(model.level));
  root.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update();}));
  $('bench').addEventListener('click',event=>{
    const rect=$('bench').getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
    const nearest=hitAreas.filter(h=>h.id!=='target').map(h=>({...h,d:Math.hypot(h.x-x,h.y-y)})).sort((a,b)=>a.d-b.d)[0];
    if(!nearest||nearest.d>28)return;
    selection=nearest.id;
    root.dispatchEvent?.(new CustomEvent('game-selection',{detail:{kind:selection.startsWith('m')?'mirror':'diaphragm'}}));
    if(selection.startsWith('m')){$('mirror-select').value=selection;mirrorControls();}else{$('diaphragm-select').value=selection;diaphragmControls();}
    update();
  });
  loadLevel(1);
  const resize=new ResizeObserver(()=>update());resize.observe($('bench'));
  const clock=setInterval(()=>{$('time-out').textContent=number(winTime??((pausedAt??performance.now())-startedAt)/1000,1)+' s';},100);
  return {refresh:update,setPaused(paused){
    if(paused&&pausedAt===null)pausedAt=performance.now();
    if(!paused&&pausedAt!==null){startedAt+=performance.now()-pausedAt;pausedAt=null;}
  },destroy(){resize.disconnect();clearInterval(clock);},getState:()=>({model,result,selection,view})};
}
