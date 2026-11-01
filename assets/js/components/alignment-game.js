export async function mountAlignmentGame(rootUrl) {
  const host = document.getElementById('alignment-game');
  const errorMessage = document.getElementById('game-error');
  try {
    const response = await fetch(new URL('assets/games/laser-lab.html', rootUrl));
    if (!response.ok) throw new Error(`Chargement du jeu impossible (${response.status}).`);
    const shadow = host.attachShadow({mode:'open'});
    const template = document.createElement('template');
    template.innerHTML = await response.text();
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = new URL('assets/css/games/laser-lab.css', rootUrl).href;
    const ready = new Promise((resolve,reject) => {
      styles.onload = resolve;
      styles.onerror = () => reject(new Error('Les styles du jeu ne peuvent pas être chargés.'));
    });
    shadow.append(styles,template.content);
    await ready;
    const { startLaserLab } = await import('../games/laser-lab.js');
    const game=startLaserLab(shadow);
    const { mountGameOrientation }=await import('../games/orientation.js');
    mountGameOrientation(game,shadow);
  } catch (error) {
    errorMessage.hidden = false;
    errorMessage.textContent = error.message;
    console.error(error);
  }
}
