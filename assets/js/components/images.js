// Une image manquante revient au visuel d’exemple sans boucle d’erreur.
export function setImage(image, source, alt, rootUrl, fallback) {
  image.alt = alt || '';
  image.onerror = () => {
    image.onerror = null;
    image.src = new URL(fallback, rootUrl).href;
  };
  image.src = new URL(source || fallback, rootUrl).href;
}
