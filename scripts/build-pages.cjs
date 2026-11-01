const fs = require('node:fs');
const path = require('node:path');

// Ce script sert aussi sur GitHub : il doit rester suivi dans le dépôt.
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const publicEntries = ['index.html', 'pages', 'components', 'assets'];
const privateName = /^(?:\.|credentials|auth\.json$|cookies.*\.(?:json|txt)$|sessions?.*\.json$|storage[-_]?state.*\.json$)|\.(?:pem|key|p12|pfx|keystore|har|bak|tmp|log)$/i;

function inspect(file) {
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink()) throw new Error('Lien symbolique interdit dans la publication : ' + path.relative(root, file));
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(file)) {
      if (name === '.gitkeep') continue;
      if (privateName.test(name)) throw new Error('Fichier privé à retirer du contenu public : ' + path.relative(root, path.join(file, name)));
      inspect(path.join(file, name));
    }
  } else if (stat.size >= 100 * 1024 * 1024) {
    throw new Error('Fichier dépassant 100 Mio : ' + path.relative(root, file));
  }
}

function listPdf(category) {
  const folder = path.join(root, 'assets', 'pdf', category);
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.pdf$/i.test(entry.name))
    .map(entry => ({ title: entry.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '), file: category + '/' + entry.name }));
}

// Valider avant de remplacer le dossier généré, et ne jamais suivre un lien vers ailleurs.
for (const entry of publicEntries) inspect(path.join(root, entry));
if (output !== path.resolve(root, 'dist')) throw new Error('Dossier de publication inattendu.');
if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) throw new Error('dist ne doit pas être un lien.');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const entry of publicEntries) {
  fs.cpSync(path.join(root, entry), path.join(output, entry), {
    recursive: true,
    filter: file => path.basename(file) !== '.gitkeep'
  });
}
const catalogue = { rapports: listPdf('rapports'), presentations: listPdf('presentations') };
fs.writeFileSync(path.join(output, 'assets', 'pdf', 'catalogue.json'), JSON.stringify(catalogue, null, 2) + '\n');
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log(`Publication préparée dans dist : ${catalogue.rapports.length} rapports, ${catalogue.presentations.length} présentations.`);
