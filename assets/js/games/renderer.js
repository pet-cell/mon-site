import { V,add,sub,mul,dot,norm,cross,centerOf,mirrorNormal } from './optics.js';
const TAU=Math.PI*2;
function prepare(canvas) {
  const {width,height}=canvas.getBoundingClientRect();
  const ratio=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
  const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
  return {ctx,w:width,h:height};
}
function line(ctx,a,b,color,width=1) {ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function faceAxes(normal) {const horizontal=norm(cross(V(0,1,0),normal));return {horizontal,vertical:norm(cross(normal,horizontal))};}
export function drawBench(canvas,model,result,selection,view) {
  const {ctx,w,h}=prepare(canvas);
  ctx.strokeStyle='#142331';ctx.lineWidth=1;
  for(let x=0;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  const raw=p=>view==='top'?{x:p.x,y:p.z}:view==='side'?{x:p.x,y:-(p.y-12.5)*2}:{x:p.x*.82-p.z*.56,y:p.x*.25+p.z*.36-(p.y-12.5)*2};
  const items=[...model.mirrors,...model.diaphragms,model.target];
  const bounds=[model.source,...items.map(centerOf),V(0,10,0),V(0,15,0)].map(raw);
  const minX=Math.min(...bounds.map(p=>p.x))-3,maxX=Math.max(...bounds.map(p=>p.x))+3,minY=Math.min(...bounds.map(p=>p.y))-3,maxY=Math.max(...bounds.map(p=>p.y))+3;
  // Réserver des bandes aux noms, hors de la surface de tracé du laser.
  const compact=w<320;
  const labelHeight=compact?16:22;
  const columns=Math.max(1,Math.floor((w-16)/(compact?36:96)));
  const topItems=items.filter(item=>item.kind!=='diaphragm');
  const bottomItems=items.filter(item=>item.kind==='diaphragm');
  const topHeight=Math.ceil(topItems.length/columns)*labelHeight+(compact?6:12);
  const bottomHeight=Math.ceil(bottomItems.length/columns)*labelHeight+(compact?22:32);
  const plotHeight=Math.max(1,h-topHeight-bottomHeight);
  const scale=Math.min(Math.max(1,w-50)/(maxX-minX),plotHeight/(maxY-minY));
  const ox=(w-(maxX-minX)*scale)/2-minX*scale,oy=topHeight+(plotHeight-(maxY-minY)*scale)/2-minY*scale;
  const project=p=>{const q=raw(p);return {x:ox+q.x*scale,y:oy+q.y*scale};};
  const hits=[];
  for(const item of items) {
    const center=centerOf(item),p=project(center),selected=selection===item.id;
    const normal=item.kind==='mirror'?mirrorNormal(item):item.normal;
    const axes=faceAxes(normal),radius=item.kind==='diaphragm'?1.6:item.radius;
    if(view!=='top')line(ctx,project(V(center.x,10,center.z)),p,'#496073',2);
    ctx.beginPath();
    for(let i=0;i<=40;i++){const angle=TAU*i/40;const point=project(add(center,add(mul(axes.horizontal,Math.cos(angle)*radius),mul(axes.vertical,Math.sin(angle)*radius))));if(i===0)ctx.moveTo(point.x,point.y);else ctx.lineTo(point.x,point.y);}
    ctx.closePath();ctx.fillStyle=item.kind==='mirror'?'#496d8570':'#21374b99';ctx.fill();ctx.lineWidth=selected?3:1.7;ctx.strokeStyle=selected?'#ffbe83':item.kind==='target'?'#91d9a0':item.kind==='diaphragm'?'#c6a5df':'#9bb9cd';ctx.stroke();
    ctx.beginPath();ctx.arc(p.x,p.y,selected?5:3,0,TAU);ctx.fillStyle=selected?'#ffbe83':'#a2bacb';ctx.fill();
    hits.push({id:item.id,x:p.x,y:p.y});
  }
  const labels=[];
  function labelRow(group,bottom) {
    const sorted=[...group].sort((a,b)=>project(centerOf(a)).x-project(centerOf(b)).x);
    sorted.forEach((item,index)=>{
      const row=Math.floor(index/columns),column=index%columns;
      const count=Math.min(columns,sorted.length-row*columns),slot=(w-16)/count;
      const x=8+column*slot,y=bottom?h-bottomHeight+6+row*labelHeight:6+row*labelHeight;
      const center={x:x+slot/2,y:y+(bottom?0:compact?13:18)};
      const point=project(centerOf(item));
      ctx.save();ctx.setLineDash([2,4]);line(ctx,point,center,selection===item.id?'#b88b68':'#375064',1);ctx.restore();
      labels.push({item,x,y,width:slot-4});
    });
  }
  labelRow(topItems,false);labelRow(bottomItems,true);
  ctx.save();ctx.beginPath();ctx.rect(0,topHeight,w,plotHeight);ctx.clip();
  result.segments.forEach((segment,i)=>{line(ctx,project(segment.from),project(segment.to),i===0?'#f36f65':'#56d9ed',2);});
  if(result.targetHit){const p=project(result.targetHit);ctx.fillStyle=result.won?'#91d9a0':'#56d9ed';ctx.beginPath();ctx.arc(p.x,p.y,4,0,TAU);ctx.fill();}
  ctx.restore();
  const source=project(model.source);ctx.fillStyle='#f36f65';ctx.fillRect(source.x-5,source.y-5,10,10);ctx.font='10px Arial';ctx.fillText('Laser',source.x-10,source.y+22);
  const selectedItem=items.find(item=>item.id===selection);
  if(selectedItem){const origin=centerOf(selectedItem);const x=selectedItem.kind==='mirror'?selectedItem.incoming:selectedItem.normal;const z=norm(cross(x,V(0,1,0)));for(const [axis,label,color]of [[x,'x','#ef8070'],[V(0,1,0),'h','#a8d8a0'],[z,'y','#8bbbf1']]){const start=project(origin),end=project(add(origin,mul(axis,2.5)));line(ctx,start,end,color,1.5);ctx.fillStyle=color;ctx.fillText(label,end.x+4,end.y-3);}}
  for(const label of labels) {
    const selected=selection===label.item.id;
    ctx.fillStyle=selected?'#3b2c25':'#102236';ctx.fillRect(label.x,label.y,label.width,compact?13:18);
    ctx.font=(compact?'9':'10')+'px Arial';ctx.fillStyle=selected?'#ffbe83':'#bccbd7';
    const name=compact?(label.item.kind==='target'?'Cible':label.item.id.toUpperCase()):label.item.name;
    ctx.textAlign='center';ctx.fillText(name,label.x+label.width/2,label.y+(compact?10:12),label.width-6);ctx.textAlign='start';
  }
  ctx.fillStyle='#91a6b8';ctx.font='10px Arial';ctx.fillText('Repère local : '+(selectedItem?.name||'banc'),12,h-13);
  return hits;
}
export function drawFace(canvas,item,result) {
  const {ctx,w,h}=prepare(canvas),cx=w/2,cy=h/2;
  const isTarget=item.kind==='target',normal=item.kind==='mirror'?mirrorNormal(item):item.normal;
  const outer=isTarget?item.radius:item.kind==='mirror'?item.radius:1.6;
  const scale=Math.min(w,h)*.38/outer;
  ctx.lineWidth=1;ctx.strokeStyle='#345168';
  for(let i=1;i<=4;i++){ctx.beginPath();ctx.arc(cx,cy,outer*scale*i/4,0,TAU);ctx.stroke();}
  line(ctx,{x:cx-outer*scale,y:cy},{x:cx+outer*scale,y:cy},'#456274');line(ctx,{x:cx,y:cy-outer*scale},{x:cx,y:cy+outer*scale},'#456274');
  if(item.kind==='diaphragm'){ctx.beginPath();ctx.arc(cx,cy,item.aperture*scale,0,TAU);ctx.strokeStyle='#dfb3fa';ctx.lineWidth=2;ctx.stroke();}
  if(isTarget){ctx.beginPath();ctx.arc(cx,cy,Math.max(2,.075*scale),0,TAU);ctx.strokeStyle='#91d9a0';ctx.stroke();}
  const event=result.events.find(event=>event.id===item.id);
  if(event){const axes=faceAxes(normal);const x=cx+dot(event.offset,axes.horizontal)*scale,y=cy-dot(event.offset,axes.vertical)*scale;ctx.fillStyle=event.passed?'#56d9ed':'#ef8070';if(x>=0&&x<=w&&y>=0&&y<=h){ctx.beginPath();ctx.arc(x,y,4,0,TAU);ctx.fill();}else{ctx.font='10px Arial';ctx.fillText('Impact hors cadre',8,h-10);}}
  else {ctx.fillStyle='#91a6b8';ctx.font='10px Arial';ctx.fillText('Rayon non reçu',10,h-10);}
}
