// Une rotation conserve la partie ; le paysage ajuste tout le jeu à la fenêtre.
export function mountGameOrientation(game,root) {
  const portrait=window.matchMedia('(max-width:650px) and (orientation:portrait), (max-width:950px) and (pointer:coarse) and (orientation:portrait)');
  const landscape=window.matchMedia('(max-width:650px) and (orientation:landscape), (max-width:1400px) and (max-height:650px) and (pointer:coarse) and (orientation:landscape)');
  const lab=root.querySelector('.laser-lab');
  const stage=document.createElement('div');stage.className='game-stage';lab.before(stage);stage.append(lab);
  let frame;
  function fit() {
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      if(landscape.matches) {
        const width=stage.clientWidth,height=stage.clientHeight;
        if(width<=0||height<=0)return;
        // Une largeur de travail réduite agrandit les éléments, tout en conservant la grille.
        const designWidth=Math.max(800,width*1.6);
        lab.style.width=designWidth+'px';
        const scale=Math.min(1,(width-2)/designWidth,(height-2)/lab.offsetHeight);
        lab.style.setProperty('--game-fit-scale',String(scale));
      }
      game.refresh();
    });
  }
  function sync() {
    game.setPaused(portrait.matches);
    root.host.classList.toggle('landscape-game',landscape.matches);
    if(!landscape.matches){lab.style.removeProperty('width');lab.style.removeProperty('--game-fit-scale');}
    if(!portrait.matches)fit();
  }
  const observer=new ResizeObserver(fit);observer.observe(stage);observer.observe(lab);
  portrait.addEventListener('change',sync);landscape.addEventListener('change',sync);
  window.visualViewport?.addEventListener('resize',fit);window.addEventListener('resize',fit);sync();
  return {destroy(){
    cancelAnimationFrame(frame);observer.disconnect();portrait.removeEventListener('change',sync);landscape.removeEventListener('change',sync);
    window.visualViewport?.removeEventListener('resize',fit);window.removeEventListener('resize',fit);
    root.host.classList.remove('landscape-game');
  }};
}
