# Publier le site sur GitHub Pages

## Première publication

1. Installer GitHub Desktop depuis https://desktop.github.com/ et se connecter à son compte.
2. Dans File > Add local repository, choisir le dossier existant C:/Users/peter/Desktop/projet site. S’il ne contient pas encore de dépôt Git, suivre Create a repository here en gardant ce dossier (ne pas créer une seconde copie). Conserver le .gitignore déjà présent.
3. Utiliser une branche nommée main. Vérifier que les dossiers .asset-originals, dist et les fichiers verify* ne figurent pas dans les changements à envoyer.
4. Si des modifications restent à enregistrer, indiquer Première version dans Summary puis Commit to main.
5. Cliquer Publish repository, choisir le nom atelier et décocher Keep this code private pour utiliser GitHub Pages avec un compte gratuit. Cela rend aussi le code et les documents du dépôt publics. Publier.
6. Sur github.com, ouvrir le dépôt puis Settings > Pages. Dans Build and deployment > Source, sélectionner GitHub Actions.
7. Ouvrir Actions > Publier le site > Run workflow, choisir main et lancer. Si un premier lancement a échoué avant l’activation de Pages, ce lancement le remplace.
8. Après réussite, l’adresse est indiquée dans Settings > Pages et dans le déploiement : https://TON-PSEUDO.github.io/atelier/.

## Mises à jour

Modifier et tester sur l’ordinateur comme avant. Dans GitHub Desktop, donner un résumé, cliquer Commit to main puis Push origin. Chaque envoi sur main relance la publication. Le catalogue des PDF est régénéré depuis assets/pdf/rapports et assets/pdf/presentations à chaque publication. Une erreur de préparation conserve la version en ligne précédente.

## Fichiers de publication

.github/workflows/pages.yml lance la préparation et la publication. scripts/build-pages.cjs copie uniquement index.html, pages/, components/ et assets/ dans dist/, puis génère le catalogue. Il doit être envoyé sur GitHub : c’est un script de publication, pas un script local verify*. Il ne demande aucune clé API personnelle.

Le dossier dist est généré et ignoré par Git. Les originaux sauvegardés, les secrets, les lanceurs locaux et les vérifications restent sur cet ordinateur. Ne pas envoyer tout le dossier manuellement avec le navigateur : utiliser GitHub Desktop pour respecter le .gitignore et transférer les vidéos volumineuses.

Préparation locale facultative : node scripts/build-pages.cjs. Le fonctionnement habituel via lancer-site.cmd reste disponible.

## Cache des mises à jour

La préparation attribue un nom contenant une empreinte de version aux scripts, styles et composants. Chaque modification de ces fichiers produit de nouvelles adresses, pour éviter de mélanger des fichiers anciens et nouveaux. Les sources utilisées en local restent lisibles et gardent leurs noms habituels. scripts/version-assets.cjs doit rester suivi avec scripts/build-pages.cjs et le chargeur des composants.

Après publication, https://TON-PSEUDO.github.io/atelier/version.json indique la version servie et le commit publié. Remplacer TON-PSEUDO et atelier par le compte et le dépôt choisis. Une page déjà ouverte peut nécessiter un rechargement pour charger la nouvelle version HTML.
