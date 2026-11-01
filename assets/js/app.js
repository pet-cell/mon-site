import { pages } from './config/pages.js';
import { loadComponents, rootUrl } from './components/loader.js';
import { mountButtons } from './components/buttons.js';
import { mountBanner } from './components/banner.js';
import { mountIntro } from './components/intro.js';
import { mountTiles } from './components/tiles.js';
import { mountInfoPanel } from './components/info-panel.js';
import { mountMobileInfo } from './components/mobile-info.js';
import { mountWidgets } from './components/widgets.js';
import { mountPdfViewer } from './components/pdf-viewer.js';

export async function startPage() {
  let key = document.body.dataset.page;
  if (key === 'documents') {
    const params = new URLSearchParams(location.search);
    key = params.get('category') || (params.get('doc') === 'creations' ? 'presentations' : 'rapports');
  }
  const page = pages[key] || pages.nouvelle;
  await loadComponents();
  document.title = `Atelier — ${page.title}`;
  mountButtons();
  mountBanner(page,key,rootUrl);
  mountIntro(page,rootUrl);
  mountInfoPanel(page,rootUrl);
  mountMobileInfo();
  mountTiles(page,rootUrl);
  mountWidgets(document.querySelector('.status-panel'),page.widgets);
  if (document.getElementById('project-options')) {
    const { mountProjectBrowser } = await import('./components/project-browser.js');
    mountProjectBrowser(page,rootUrl);
  }
  if (document.getElementById('copy-email')) {
    const { mountContact } = await import('./components/contact.js');
    mountContact(page);
  }
  await import('./background.js');
  if (document.getElementById('pdf-viewer')) mountPdfViewer();
  if (document.getElementById('alignment-game')) {
    const { mountAlignmentGame } = await import('./components/alignment-game.js');
    await mountAlignmentGame(rootUrl);
  }
}
startPage().catch(error => {
  console.error(error);
  const alert = document.getElementById('app-error');
  alert.hidden = false;
  alert.textContent = `Impossible d’afficher la page : ${error.message} Ouvrez le site via lancer-site.cmd.`;
});
