const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Les noms changent avec le contenu ; le navigateur ne peut pas réutiliser un ancien module.
module.exports = function versionAssets(output) {
  function walk(folder) {
    return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
      const file = path.join(folder, entry.name);
      return entry.isDirectory() ? walk(file) : [path.relative(output, file).split(path.sep).join('/')];
    });
  }
  const files = walk(output).sort();
  const versioned = files.filter(file =>
    (file.startsWith('assets/js/') && file.endsWith('.js')) ||
    (file.startsWith('assets/vendor/pdfjs/') && file.endsWith('.mjs')) ||
    (file.startsWith('assets/css/') && file.endsWith('.css')) ||
    (file.startsWith('components/') && file.endsWith('.html')) ||
    (file.startsWith('assets/games/') && file.endsWith('.html')) ||
    file === 'assets/vendor/pdfjs/web/viewer.html' || file === 'assets/vendor/pdfjs/web/atelier.css');
  const digest = crypto.createHash('sha256');
  digest.update(fs.readFileSync(__filename));
  for (const file of versioned) digest.update(file).update(fs.readFileSync(path.join(output, file)));
  const version = digest.digest('hex').slice(0, 12);
  const names = new Map(versioned.map(file => [file, file.replace(/(\.[^.]+)$/, '.' + version + '$1')]));
  function resolve(reference, from) {
    if (/^(?:[a-z]+:|\/|#)/i.test(reference)) return reference;
    const split = reference.search(/[?#]/);
    const bare = split < 0 ? reference : reference.slice(0, split);
    const suffix = split < 0 ? '' : reference.slice(split);
    const target = reference.startsWith('assets/') || reference.startsWith('components/')
      ? bare : path.posix.normalize(path.posix.join(path.posix.dirname(from), bare));
    let mapped = names.get(target);
    // Le visionneur est référencé depuis l’adresse de la page, pas depuis celle du module JS.
    if(!mapped && bare.startsWith('../assets/')) {
      mapped=names.get(bare.slice(3));
      if(mapped)return '../'+mapped+suffix;
    }
    if (!mapped) return reference;
    if (reference.startsWith('assets/') || reference.startsWith('components/')) return mapped + suffix;
    const relative = path.posix.relative(path.posix.dirname(from), mapped);
    return (relative.startsWith('.') ? relative : './' + relative) + suffix;
  }
  for (const file of files.filter(file => versioned.includes(file) || file === 'index.html' || (file.startsWith('pages/') && file.endsWith('.html')))) {
    let text = fs.readFileSync(path.join(output, file), 'utf8');
    if (file === 'assets/js/components/loader.js') {
      if (!text.includes("const componentVersion = '';")) throw new Error('Version des composants absente du chargeur.');
      text = text.replace("const componentVersion = '';", "const componentVersion = '." + version + "';");
    }
    text = text.replace(/(['"])([^'"\r\n]+)\1/g, (whole, quote, reference) => quote + resolve(reference, file) + quote);
    fs.writeFileSync(path.join(output, names.get(file) || file), text);
  }
  // Les chemins historiques restent disponibles pour les anciens onglets pendant la transition.
  fs.writeFileSync(path.join(output, 'version.json'), JSON.stringify({ version, commit: process.env.GITHUB_SHA || null, files: Object.fromEntries(names) }, null, 2) + '\n');
  return version;
};
