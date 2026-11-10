import { mobileQuery } from './mobile-info.js';
export function mountPdfViewer() {
  const mobileScreen=window.matchMedia(mobileQuery);
  const params = new URLSearchParams(location.search);
  const category = params.get('category') || (params.get('doc') === 'creations' ? 'presentations' : 'rapports');
  const titles = {rapports: 'Rapports', presentations: 'Présentation'};
  const status = document.getElementById('pdf-status');
  const select = document.getElementById('document-select');
  const viewer = document.getElementById('pdf-viewer');
  const pdfRoot = new URL('../assets/pdf/', location.href);
  let documents = [];
  let timer;
  function openDocument() {
    clearTimeout(timer);
    const entry = documents[select.selectedIndex];
    if (!entry) return;
    const pdf = new URL(entry.file, pdfRoot);
    if (!pdf.href.startsWith(pdfRoot.href) || !pdf.pathname.toLowerCase().endsWith('.pdf')) {
      status.hidden = false; status.textContent = 'Chemin de document non autorisé.'; return;
    }
    const url = new URL('../assets/vendor/pdfjs/web/viewer.html', location.href);
    url.searchParams.set('file', pdf.href);
    url.hash = mobileScreen.matches?'zoom=page-width':category==='presentations'?'zoom=60':'zoom=75';
    status.hidden = false;
    status.textContent = `Ouverture de ${entry.title}…`;
    viewer.hidden = false;
    viewer.src = url.href;
    timer = setTimeout(() => {
      status.hidden = false;
      status.textContent = 'Le chargement du PDF prend plus de temps que prévu. Patientez ou sélectionnez un autre document.';
    }, 30000);
  }
  // Le contrôleur classique s’exécute aussi sur file:// pour expliquer le blocage,
  // contrairement à un script de type module bloqué avant son initialisation.
  async function initialize() {
    if (!titles[category]) { status.textContent = 'Rubrique inconnue.'; return; }
    document.title = `Atelier — ${titles[category]}`;
    if (location.protocol === 'file:') {
      status.textContent = 'Lancez lancer-site.cmd puis ouvrez http://127.0.0.1:4173/ pour consulter les PDF.';
      select.replaceChildren(new Option('Serveur local requis', ''));
      return;
    }
    try {
      async function readCatalogue(url) {
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),10000);
        try {
          const response=await fetch(url,{signal:controller.signal,cache:'no-store'});
          if(!response.ok)throw new Error('Catalogue indisponible ('+response.status+')');
          return await response.json();
        }finally{clearTimeout(timeout);}
      }
      let catalogue;
      const staticUrl=new URL('catalogue.json',pdfRoot);
      if(new URL(location.href).hostname.endsWith('.github.io')) {
        // GitHub Pages ne possède pas d’API : charger directement le catalogue publié.
        catalogue=await readCatalogue(staticUrl);
      }else{
        try{catalogue=await readCatalogue('../api/documents');}
        catch{catalogue=await readCatalogue(staticUrl);}
      }
      documents = catalogue[category] || [];
      if (!documents.length) {
        select.replaceChildren(new Option('Aucun PDF disponible', ''));
        status.textContent = `Ajoutez des PDF dans assets/pdf/${category}/ puis rechargez la page.`;
        return;
      }
      select.replaceChildren(...documents.map(entry => new Option(entry.title,entry.file)));
      select.disabled = false;
      select.addEventListener('change',openDocument);
      openDocument();
    } catch (error) { status.textContent = `Impossible de charger la liste : ${error.message}. Vérifiez que le serveur local est lancé.`; }
  }
  viewer.addEventListener('load', async () => {
    try {
      const app = viewer.contentWindow.PDFViewerApplication;
      if (!app) throw new Error('Le visionneur PDF.js n’a pas démarré. Relancez le serveur et rechargez la page.');
      await app.initializedPromise;
      const fit=()=>{if(mobileScreen.matches&&app.pdfViewer?.pagesCount)app.pdfViewer.currentScaleValue='page-width';};
      const ready = () => { clearTimeout(timer); status.hidden = true;fit(); };
      const failure = event => { clearTimeout(timer); status.hidden = false; status.textContent = `Impossible d’ouvrir le PDF : ${event.message || 'erreur de lecture'}.`; };
      app.eventBus.on('documenterror', failure);
      app.eventBus.on('pagesinit', ready);
      if (app.pdfDocument) ready();
    } catch (error) { clearTimeout(timer); status.hidden = false; status.textContent = error.message; }
  });
  document.addEventListener('webviewerloaded', event => {
    const source = event.detail?.source;
    if (!source || source !== viewer.contentWindow) return;
    const options = source.PDFViewerApplicationOptions;
    options.set('disablePreferences', true);
    options.set('viewerCssTheme', 1); // Palette fixe, indépendante du système.
    options.set('annotationEditorMode', -1);
    options.set('annotationMode', 1);
    options.set('enableScripting', false);
    options.set('defaultZoomValue', mobileScreen.matches?'page-width':'0.75');
    options.set('sidebarViewOnLoad', 0); // PDF.js : panneau latéral fermé au démarrage.
    const app = source.PDFViewerApplication;
    for (const method of ['download', 'save', 'downloadOrSave', 'triggerPrinting']) app[method] = async () => {};
    source.addEventListener('keydown', keyboardEvent => {
      if ((keyboardEvent.ctrlKey || keyboardEvent.metaKey) && ['s', 'p'].includes(keyboardEvent.key.toLowerCase())) {
        keyboardEvent.preventDefault(); keyboardEvent.stopImmediatePropagation();
      }
    }, true);
  });
  let lastWidth=0;
  const fitOnResize=()=>{
    const width=viewer.getBoundingClientRect().width;
    if(Math.abs(width-lastWidth)<1)return;lastWidth=width;
    const app=viewer.contentWindow?.PDFViewerApplication;
    if(mobileScreen.matches&&app?.pdfViewer?.pagesCount)app.pdfViewer.currentScaleValue='page-width';
  };
  new ResizeObserver(fitOnResize).observe(viewer);
  mobileScreen.addEventListener('change',()=>{lastWidth=0;fitOnResize();});
  initialize();
}
