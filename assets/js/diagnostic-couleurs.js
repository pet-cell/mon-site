// Comparaison volontairement isolée des composants du site.
const canvas = document.getElementById('canvas-sample');
const context = canvas.getContext('2d');
if (context) {
  const layout=document.querySelector('.canvas-layout');
  const button=document.getElementById('canvas-button');
  // Le DOM assure la mise en page, les retours à la ligne et le clic.
  // Le canvas peint seulement les pixels, à la densité réelle de l'écran.
  function paint() {
    const bounds=layout.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio=window.devicePixelRatio || 1;
    canvas.width=Math.round(bounds.width*ratio);
    canvas.height=Math.round(bounds.height*ratio);
    context.setTransform(ratio,0,0,ratio,0,0);
    context.fillStyle='#eee4cf'; context.fillRect(0,0,bounds.width,bounds.height);
    const box=button.getBoundingClientRect();
    context.fillStyle='#ad4829'; context.fillRect(box.left-bounds.left,box.top-bounds.top,box.width,box.height);
    for (const element of layout.children) {
      const style=getComputedStyle(element);
      context.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      context.fillStyle=element===button?'#eee4cf':'#12253a';
      context.textBaseline='alphabetic';
      const node=element.firstChild;
      const range=document.createRange();
      const lines=[];
      // Mesurer les lignes du navigateur plutôt que réinventer leur césure.
      for(let i=0;i<node.length;i++) {
        range.setStart(node,i); range.setEnd(node,i+1);
        const rect=range.getBoundingClientRect();
        let line=lines.at(-1);
        if(!line || Math.abs(line.top-rect.top)>1) {
          line={text:'',left:rect.left,top:rect.top,height:rect.height};lines.push(line);
        }
        line.text+=node.textContent[i];
      }
      const metrics=context.measureText('Mg');
      const ascent=metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize)*.8;
      const descent=metrics.fontBoundingBoxDescent ?? parseFloat(style.fontSize)*.2;
      for(const line of lines) {
        const baseline=line.top-bounds.top+(line.height-ascent-descent)/2+ascent;
        context.fillText(line.text,line.left-bounds.left,baseline);
      }
    }
    document.getElementById('png-sample').src=canvas.toDataURL('image/png');
  }
  new ResizeObserver(paint).observe(layout);
  window.addEventListener('resize',paint);
  document.fonts.ready.then(paint);
  button.addEventListener('click',()=>{
    document.getElementById('diagnostic-status').textContent='Le bouton de la carte E fonctionne.';
  });
  paint();
} else {
  document.getElementById('diagnostic-status').textContent='Le navigateur ne permet pas le test du canvas.';
}
