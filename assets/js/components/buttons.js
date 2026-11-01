// Un seul composant pour les flèches du carnet, du calendrier et du retour.
export function arrowButton({label, direction = 'left', className = '', id, href}) {
  const button = document.createElement(href ? 'a' : 'button');
  button.className = `arrow-button ${className}`.trim();
  button.setAttribute('aria-label', label);
  if (id) button.id = id;
  if (href) button.href = href; else button.type = 'button';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 32 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', direction === 'right' ? 'M4 12h23M19 4l8 8-8 8' : 'M28 12H5M13 4l-8 8 8 8');
  for (const [key,value] of Object.entries({fill:'none',stroke:'currentColor','stroke-width':'2.5','stroke-linecap':'round','stroke-linejoin':'round'})) path.setAttribute(key,value);
  svg.append(path); button.append(svg);
  return button;
}
export function mountButtons(root = document) {
  root.querySelectorAll('[data-arrow]').forEach(slot => slot.replaceWith(arrowButton({label:slot.dataset.label,direction:slot.dataset.direction,className:slot.dataset.arrow,id:slot.dataset.arrow.startsWith('calendar-')?slot.dataset.arrow:undefined})));
}
