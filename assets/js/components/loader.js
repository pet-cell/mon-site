// Tous les chemins des composants partent de la racine du site.
const rootUrl = new URL('../../../', import.meta.url);
const allowed = new Set(['background','banner','info-panel','intro','tiles','pdf-viewer','widgets','alignment-game','project-browser','contact']);
export async function loadComponents() {
  const slots = [...document.querySelectorAll('[data-component]')];
  const fragments = await Promise.all(slots.map(async slot => {
    const name = slot.dataset.component;
    if (!allowed.has(name)) throw new Error(`Composant inconnu : ${name}`);
    const response = await fetch(new URL(`components/${name}.html`, rootUrl));
    if (!response.ok) throw new Error(`Chargement du composant ${name} impossible (${response.status}).`);
    const template = document.createElement('template');
    template.innerHTML = (await response.text()).replaceAll('{{root}}',rootUrl.href);
    return template.content;
  }));
  slots.forEach((slot,index) => slot.replaceWith(fragments[index]));
}
export { rootUrl };
