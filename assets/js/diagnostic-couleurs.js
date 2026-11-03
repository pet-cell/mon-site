// Comparaison volontairement isolée des composants du site.
const canvas = document.getElementById('canvas-sample');
const context = canvas.getContext('2d');
if (context) {
  context.scale(2,2);
  context.fillStyle='#eee4cf'; context.fillRect(0,0,600,240);
  context.fillStyle='#12253a'; context.font='bold 28px Arial'; context.fillText('Atelier',24,52);
  context.font='15px Arial'; context.fillText('Texte bleu marine sur fond crème.',24,90);
  context.fillStyle='#ad4829'; context.fillRect(24,120,200,46);
  context.fillStyle='#eee4cf'; context.font='16px Arial'; context.fillText('Bouton orange →',40,149);
  document.getElementById('png-sample').src=canvas.toDataURL('image/png');
} else {
  document.getElementById('diagnostic-status').textContent='Le navigateur ne permet pas le test du canvas.';
}
