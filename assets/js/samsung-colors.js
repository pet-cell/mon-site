// Contournement isolé : Samsung applique ses propres conversions en mode sombre.
export const samsungColors = /SamsungBrowser\//i.test(globalThis.navigator?.userAgent || '');
if (samsungColors) document.documentElement.dataset.samsungColors = 'true';

// Conserver les SVG source ; seule leur représentation à l'écran devient matricielle.
export function preserveSvgImage(image) {
  if (!samsungColors) return;
  image.addEventListener('load', () => {
    if (!/\.svg(?:[?#]|$)/i.test(image.currentSrc || image.src)) return;
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) return;
    try {
      const scale = Math.min(2, 2048 / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = canvas.toDataURL('image/png');
    } catch {
      // Une image externe sans autorisation CORS conserve son affichage original.
    }
  });
}
