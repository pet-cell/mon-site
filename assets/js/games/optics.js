// Modèle optique indépendant du rendu. Distances en unités du banc.
export const V = (x=0,y=0,z=0) => ({x,y,z});
export const add=(a,b)=>V(a.x+b.x,a.y+b.y,a.z+b.z);
export const sub=(a,b)=>V(a.x-b.x,a.y-b.y,a.z-b.z);
export const mul=(a,s)=>V(a.x*s,a.y*s,a.z*s);
export const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
export const length=a=>Math.hypot(a.x,a.y,a.z);
export const norm=a=>mul(a,1/(length(a)||1));
export const cross=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const rad=d=>d*Math.PI/180;
export const reflect=(ray,normal)=>norm(sub(ray,mul(normal,2*dot(ray,normal))));
export function mirrorNormal(mirror) {
  const az=mirror.referenceYaw+rad(mirror.turn*mirror.azimuth);
  const e=rad(mirror.elevation);
  const out=V(Math.cos(az)*Math.cos(e),Math.sin(e),Math.sin(az)*Math.cos(e));
  return norm(sub(mirror.incoming,out));
}
export function centerOf(item) {
  if(item.kind!=='diaphragm')return V(item.position.x,item.height,item.position.z);
  const point=add(item.start,mul(sub(item.end,item.start),item.position/100));
  return add(V(point.x,item.height,point.z),mul(item.lateralAxis,item.lateral));
}
export function planeHit(origin,direction,center,normal) {
  const denominator=dot(direction,normal);
  if(Math.abs(denominator)<1e-9)return null;
  const t=dot(sub(center,origin),normal)/denominator;
  return t>1e-5?{point:add(origin,mul(direction,t)),t}:null;
}
// Générateur déterministe : une graine permet de rejouer exactement le même banc.
function randomGenerator(seed) {
  let state=seed>>>0;
  return () => {state+=0x6D2B79F5;let value=state;value=Math.imul(value^(value>>>15),value|1);value^=value+Math.imul(value^(value>>>7),value|61);return ((value^(value>>>14))>>>0)/4294967296;};
}
function randomSeed() {
  if(globalThis.crypto?.getRandomValues)return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
  return Math.floor(Math.random()*4294967296);
}
const round=(value,step)=>Math.round(value/step)*step;
export function applySolution(model) {
  model.mirrors.forEach((item,index)=>Object.assign(item,model.solution.mirrors[index]));
  model.diaphragms.forEach((item,index)=>Object.assign(item,model.solution.diaphragms[index]));
  return model;
}
export function createLevel(level=1, seed=randomSeed()) {
  level=clamp(Math.round(level),1,5);
  const random=randomGenerator(seed),between=(min,max)=>min+(max-min)*random();
  const mirrors=[],diaphragms=[];
  const initialHeight=round(between(11.7,13.3),.01);
  let point=V(between(5.5,8),initialHeight,0),incoming=V(1,0,0),yaw=0;
  for(let i=0;i<level;i++) {
    // Le banc progresse vers l’avant ; les coudes restent éloignés des demi-tours.
    const azimuth=round(between(28,58),.1);
    let turn=random()<.5?-1:1;
    if(Math.abs(yaw+rad(turn*azimuth))>rad(65))turn=-turn;
    const elevation=round(between(.5,1.5),.05)*(random()<.5?-1:1);
    const mirror={id:'m'+(i+1),name:'Miroir '+(i+1),kind:'mirror',position:{...point},height:point.y,azimuth,elevation,referenceYaw:yaw,incoming:{...incoming},turn,radius:1.65};
    mirrors.push(mirror);
    yaw+=rad(turn*azimuth);
    const e=rad(elevation);
    incoming=V(Math.cos(yaw)*Math.cos(e),Math.sin(e),Math.sin(yaw)*Math.cos(e));
    // Les hauteurs de la solution tombent exactement sur le pas de 0,01 des curseurs.
    const rise=round(between(6.5,9)*Math.sin(e),.01);
    const distance=rise/Math.sin(e);
    point=add(point,mul(incoming,distance));point.y=round(point.y,.01);
  }
  for(let i=0;i<mirrors.length-1;i++) {
    const start=mirrors[i].position,end=mirrors[i+1].position,normal=norm(sub(end,start));
    const position=round(between(30,70),.5);
    const height=round(start.y+(end.y-start.y)*position/100,.01);
    diaphragms.push({id:'d'+(i+1),name:'Diaphragme '+(i+1),kind:'diaphragm',start:{...start},end:{...end},normal,lateralAxis:norm(cross(V(0,1,0),normal)),position,lateral:0,height,aperture:round(between(.35,.7),.01),axes:level===2?1:2});
  }
  const model={seed:seed>>>0,level,mirrors,diaphragms,source:V(0,initialHeight,0),target:{kind:'target',id:'target',name:'Cible',position:point,height:point.y,normal:incoming,radius:2.1},tolerance:.075};
  model.solution={mirrors:mirrors.map(({azimuth,elevation,height})=>({azimuth,elevation,height})),diaphragms:diaphragms.map(({position,lateral,height,aperture})=>({position,lateral,height,aperture}))};
  // Ne jamais proposer un banc dont le trajet de référence n’atteint pas la cible.
  if(!trace(model).won)throw new Error('Le banc généré ne possède pas de solution validée.');
  return model;
}
export function scramble(model) {
  applySolution(model);
  const random=randomGenerator(model.seed^0x9E3779B9),sign=()=>random()<.5?-1:1;
  model.mirrors.forEach(m=>{
    m.azimuth=round(clamp(m.azimuth+sign()*(2+random()*5),15,90),.1);
    m.elevation=round(clamp(m.elevation+sign()*(.3+random()*.9),-5,5),.05);
    m.height=round(clamp(m.height+sign()*(.1+random()*.3),10,15),.01);
  });
  model.diaphragms.forEach(d=>{
    d.position=round(clamp(d.position+(random()-.5)*20,15,85),.5);
    d.lateral=d.axes===2?round((random()-.5)*.8,.01):0;
    d.height=round(clamp(d.height+(random()-.5)*.4,10,15),.01);
    d.aperture=round(.25+random()*.4,.01);
  });
  // Écarter aussi le cas exceptionnel d’un désalignement qui resterait gagnant.
  if(trace(model).won)model.mirrors[0].height=model.source.y<12.5?15:10;
  return model;
}
export function trace(model) {
  let origin=model.source,direction=V(1,0,0),intensity=1;
  const segments=[],events=[];let error=null,targetHit=null,block=null;
  const route=[];
  model.mirrors.forEach((m,i)=>{route.push(m);if(model.diaphragms[i])route.push(model.diaphragms[i]);});route.push(model.target);
  for(const item of route) {
    const center=centerOf(item);
    const normal=item.kind==='mirror'?mirrorNormal(item):item.normal;
    const hit=planeHit(origin,direction,center,normal);
    if(!hit){segments.push({from:origin,to:add(origin,mul(direction,10))});block=item;break;}
    const delta=sub(hit.point,center),distance=length(delta);
    segments.push({from:origin,to:hit.point});
    if(item.kind==='mirror') {
      if(distance>item.radius){events.push({id:item.id,point:hit.point,passed:false,offset:delta,distance});block=item;break;}
      events.push({id:item.id,point:hit.point,passed:true,offset:delta,distance});
      direction=reflect(direction,normal);intensity*=.97;
    }else if(item.kind==='diaphragm') {
      const passed=distance<=item.aperture;
      events.push({id:item.id,point:hit.point,passed,offset:delta,distance});
      if(!passed){block=item;break;}
      intensity*=.995;
    }else{
      targetHit=hit.point;error=distance;
      events.push({id:item.id,point:hit.point,passed:distance<=item.radius,offset:delta,distance});
      if(distance>item.radius)block=item;
    }
    origin=hit.point;
  }
  const reached=!!targetHit&&!block;
  return {segments,events,block,targetHit,error,reached,intensity:reached?intensity*Math.exp(-error*error*1.8):0,won:reached&&error<model.tolerance};
}
