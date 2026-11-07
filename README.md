# Atelier — site modulaire

## Lancer en local

Double-cliquer sur lancer-site.cmd, garder le terminal ouvert puis ouvrir http://127.0.0.1:4173/.
Node.js est nécessaire. Le site charge ses composants via le serveur local.

## Organisation

```text
index.html                     Appels des composants de l’accueil
pages/                         Appels des composants des autres pages
templates/page.html            Modèle de nouvelle page
components/                    Structure HTML de chaque zone
  background.html              Canvas et décor
  banner.html                  Bandeau non cliquable
  info-panel.html              Zone 5 : encadré avec fiches
  intro.html                   Zone 3 : image, titre et texte
  widgets.html                 Zone 8 : calendrier, heure et date
  tiles.html                   Vignettes de l’accueil
  pdf-viewer.html               Sélecteur et visionneur
assets/js/
  app.js                       Chargement et initialisation de la page
  config/pages.js              Textes et images propres à chaque page
  components/
    loader.js                  Charge les fichiers HTML des composants
    buttons.js                 Flèches réutilisables
    banner.js                  Contenu du bandeau et bouton retour
    info-panel.js              Navigation des fiches de la zone 5
    intro.js                   Contenu de la zone 3
    widgets.js                 Calendrier miniature et horloge de Paris
    pdf-viewer.js               Liste des PDF et politique de lecture seule
  background.js                Fond animé et réglage des rectangles
assets/css/
  style.css                    Point d’entrée, importe les styles
  base.css                     Couleurs, typographie et disposition générale
  background.css               Fond animé et décor
  components/                  Un fichier CSS par composant
assets/pdf/
  rapports/                    PDF de Rapports uniquement
  presentations/               PDF de Présentation uniquement
  catalogue.json               Liste de secours pour hébergement statique
assets/vendor/pdfjs/            Bibliothèque Mozilla PDF.js et sa licence
```

## Modifier une zone

- Apparence et disposition HTML : components/nom-du-composant.html.
- Styles : assets/css/components/nom-du-composant.css.
- Comportement : assets/js/components/nom-du-composant.js.
- Textes et images d’une page : assets/js/config/pages.js. `info` contient les fiches de la zone 5 ; `heading`, `description`, `image` et `imageAlt` configurent la zone 3 ; `bannerText` et `bannerImage` peuvent personnaliser le bandeau. Les chemins d’image sont relatifs à la racine du site.
- Les boutons à flèche sont créés par buttons.js ; leur style et leurs animations sont dans buttons.css. Les composants HTML utilisent des emplacements data-arrow pour les appeler.

Une page appelle par exemple la zone 5 avec `<div data-component="info-panel"></div>`. app.js attend le chargement de tous les composants avant de démarrer leurs comportements. Il ne faut pas recopier leur HTML dans les pages.

## Nouvelle page

Copier templates/page.html dans pages/, définir une entrée dans config/pages.js et renseigner sa clé dans data-page sur body. Conserver les appels des composants communs et ajouter le contenu propre dans page-specific.

## PDF

Déposer chaque PDF dans le dossier de sa rubrique puis recharger la page : le serveur actualise automatiquement la liste. Aucun encodage en JavaScript n’est nécessaire.
PDF.js démarre à 75 %. Les commandes d’édition, d’enregistrement et d’impression sont désactivées dans l’interface. Les fichiers restent accessibles au navigateur ; ce réglage ne protège pas contre leur récupération.
Les rectangles du fond sont conservés mais désactivés par SHOW_BACKGROUND_RECTANGLES dans assets/js/background.js.

## Vérifications

- node verify-site.cjs : sélection du PDF, rubriques, catalogue, types MIME, HEAD et lecture partielle.
- node verify-components.cjs : présence des composants, chemins et navigation circulaire de toutes les zones 5.

Ces vérifications ne remplacent pas une vérification visuelle dans le navigateur. preview.cjs et les scripts de vérification sont des outils locaux de développement. Pour un hébergement statique, conserver components/ et actualiser assets/pdf/catalogue.json avant publication.

## Personnalisation complète et exemples conservés

Tout se règle dans assets/js/config/pages.js, pour chaque page :

- title : nom de page et libellé secondaire du bandeau (bannerLabel permet de remplacer ce libellé).
- bannerText, bannerSubtitle, bannerImage, bannerImageAlt : bandeau.
- heading, description, image, imageAlt : zone 3.
- infoLabel : titre du carnet ; infoImage et infoImageAlt : image commune de la zone 5.
- info : liste des fiches ; chaque fiche possède category, title, description, image et imageAlt. L’image de la fiche est prioritaire sur infoImage. Retirer image de la fiche pour utiliser l’image commune.
- tiles : liste des vignettes (présente sur accueil) ; chaque vignette possède title, description, href, image et imageAlt.
- widgets : timeZone, city et locale pour l’horloge et le calendrier.

Les chemins sont relatifs à la racine : assets/images/ma-photo.jpg. Ajouter ses fichiers dans assets/images/, puis modifier la configuration. Aucun texte n’est incrusté sur les images.

Les dessins d’exemple sont conservés dans assets/images/defaut_bandeau.svg, defaut_zone3.svg, defaut_zone5.svg et defaut_vignette_1.svg à defaut_vignette_4.svg. SVG est un format d’image vectoriel, éditable et net quelle que soit sa taille.
Une image vide ou introuvable revient au visuel defaut correspondant. Les textes d’exemple sont sauvegardés localement dans .asset-originals/nettoyage-2026-11-07/configuration/defaut_pages.js : ce fichier sert de référence pour restaurer une configuration et n’est pas publié. Les valeurs de secours utilisées à l’exécution sont dans assets/js/config/defaults.js.
Les PDF originaux restent dans leurs dossiers de rubrique ; ils n’ont pas été modifiés ni dupliqués.


## Jeu d’alignement — banc à plusieurs miroirs

Le jeu conserve les composants du site et son isolation dans un Shadow DOM.

- assets/games/laser-lab.html : les six zones du jeu.
- assets/css/games/laser-lab.css : grille et adaptation à la largeur du composant.
- assets/js/games/optics.js : génération des niveaux, intersections avec les surfaces, réflexion, diaphragmes et victoire.
- assets/js/games/renderer.js : projections dessus/profil/isométrique et vues locales des impacts.
- assets/js/games/laser-lab.js : sélection, réglages, chronomètre et redémarrage.
- assets/js/components/alignment-game.js : chargement du jeu.

Les niveaux 1 à 5 comportent respectivement 1 à 5 miroirs et 0 à 4 diaphragmes. Le niveau 2 propose un axe de déplacement du diaphragme ; à partir du niveau 3, deux axes. La hauteur et l’ouverture sont également réglables.

Chaque miroir possède un azimut de déviation compris entre 15 et 90 degrés par rapport à son rayon incident de référence, une élévation de -5 à +5 degrés et une hauteur de 10 à 15 unités du banc. Le centre du miroir reste fixe horizontalement. Les déplacements des diaphragmes sont bornés : position entre 15 et 85 pour cent du segment entre deux miroirs, déplacement transversal entre -1,2 et +1,2 à partir du niveau 3, hauteur de 10 à 15 et rayon d’ouverture de 0,1 à 1. Ces bornes, laissées libres dans les croquis, sont définies dans laser-lab.js.

Le tracé suit l’ordre prévu du banc : miroir, diaphragme, miroir, jusqu’à la cible. Un rayon manquant une surface ou bloqué par une ouverture n’atteint pas la cible. Les miroirs ont une surface finie. Les distances sont des unités de simulation ; les pertes lumineuses sont un modèle simplifié.

Cliquer un élément sur le banc ou utiliser sa liste le sélectionne sans modifier ses réglages. Le repère dessiné suit l’élément sélectionné. Le chronomètre se fige à l’alignement et reprend si un réglage change. « Rejouer ce même banc » remet le banc courant dans son état initial désaligné. « Nouveau banc aléatoire » génère une autre géométrie au même niveau.

node verify-game.cjs vérifie les solutions des cinq niveaux, le départ désaligné, la réflexion, le blocage par les diaphragmes, les bornes et sélections du contrôleur et les projections. La vérification visuelle dans un navigateur reste à effectuer.

### Bancs aléatoires et faisabilité

Chaque nouveau banc est construit à partir d’un trajet résolu : angles, distances entre miroirs, déviations verticales, hauteurs et positions des diaphragmes varient. Les valeurs de la solution respectent les pas et les limites des commandes. Le rayon est ensuite recalculé pour valider cette solution avant de désaligner les éléments. Le désalignement est lui aussi vérifié pour éviter de commencer avec la cible déjà centrée.

Une graine interne reproduit la géométrie et les réglages initiaux. createLevel(niveau, graine) permet les vérifications reproductibles ; sans graine, un nouveau banc est généré. Le changement de difficulté crée aussi un nouveau banc. La solution interne sert uniquement à construire et tester le niveau, elle n’est pas appliquée automatiquement pendant la partie.

verify-game.cjs vérifie notamment 2 500 bancs (500 graines pour chacun des cinq niveaux), leur diversité, les solutions réalisables avec les pas des curseurs, leur reproduction à graine identique et le départ désaligné.

## Projets scolaires, IA embarquée et contact

L’accueil comporte six vignettes. Les nouvelles pages sont pages/ia-embarquee.html et pages/contact.html ; elles réutilisent les composants communs.

Les pages scolaire et embarque se configurent dans assets/js/config/pages.js avec la liste projects. Chaque projet possède : id, title, category, summary, paragraphs (liste de textes), image, imageAlt, video, videoPoster, videoTitle et videoCaption. Mettre video à false pour ne pas afficher de lecteur. Les chemins partent de la racine du site. Le changement de projet arrête la vidéo précédente.

La liste scolaire contient AI4Industry 2022, Station météo, Q-Learner / Speedrunner et IRM Segmentation. IA embarquée contient Boîte à outils et Hello world. Les textes sont des exemples à remplacer par les présentations réelles. Les médias d’exemple sont conservés dans assets/images/defaut_projet.svg et assets/videos/defaut_projet.webm. La vidéo locale contient une animation géométrique de 3 secondes, sans son. Les nouvelles vignettes utilisent defaut_vignette_5.svg et defaut_vignette_6.svg.

Le composant project-browser.html et ses fichiers CSS/JS portent la sélection de projet et le contenu. Le composant contact.html et ses fichiers CSS/JS portent les profils et le bouton de copie de l’adresse e-mail.

Dans pages.contact.contact, configurer email, heading, description et profiles (service, label, url). Les trois services prévus sont linkedin, orcid et github. Un lien absent reste désactivé ; aucune adresse de profil n’est inventée.
Le bouton Copier place l’adresse e-mail dans le presse-papiers. L’adresse n’est pas affichée : le bouton Mail rond utilise le même style que les profils. Si le presse-papiers moderne est refusé, une copie de secours est tentée ; en cas d’échec, une erreur explicite est affichée. Aucun message n’est envoyé par le site et aucun identifiant Gmail n’est nécessaire.

Les nouveaux exemples sont aussi conservés dans la copie locale archivée de defaut_pages.js ; l’adresse personnelle n’est pas recopiée dans cet exemple.
Après mise à jour de preview.cjs, relancer lancer-site.cmd pour activer les types MIME des vidéos WebM et MP4.
node verify-pages.cjs vérifie les nouvelles destinations, les listes de projets, les médias, les changements de contenu et la copie de l’adresse e-mail.

### Vidéos réelles des projets scolaires

Station météo affiche les deux vidéos VMORPH ; Q-Learner / Speedrunner utilise Q_learner_speedrun.mp4 ; Connected Watch utilise connected_watch.mp4. Les médias d’exemple restent conservés pour les projets qui n’ont pas encore de vidéo fournie.
Pour plusieurs vidéos dans un projet, renseigner videos : une liste d’objets { src, title, caption, poster }. Cette liste est prioritaire sur video. Les champs video/videoTitle/videoCaption restent utilisables pour une seule vidéo.
Le serveur déclare aussi le type vidéo QuickTime pour les fichiers .mov. Relancer le serveur après sa modification. Les fichiers originaux ne sont pas modifiés ni dupliqués.

### Miniatures vidéo

videoPoster: "first-frame" (ou poster: "first-frame" sur une entrée de videos) utilise la première image décodée de la vidéo comme affiche du lecteur. La capture est effectuée localement par le navigateur, sans lecture automatique ni copie des fichiers vidéo. Une image personnalisée peut toujours être indiquée à la place de first-frame. Le composant correspondant est assets/js/components/video-poster.js.

Les miniatures automatiques ignorent désormais les images noires : un lecteur de préparation muet recherche une image visible à plusieurs instants, sans déplacer le lecteur principal ni lancer la lecture. Le volume initial de chaque lecteur est réglé à 10 %. L’utilisateur conserve les commandes de volume.

## Version mobile

Sous 650 px, ou jusqu’à 950 px avec un pointeur tactile, la zone 5 est remplacée par un bouton i. La bulle conserve au moins 260 px de largeur et une hauteur agrandie proche de 40 % de l’écran, selon l’espace disponible. Le bouton i est placé à 21 % de la hauteur d’écran, près du coin supérieur gauche occupé par le carnet sur ordinateur. Son texte défile intérieurement. Fermeture par la croix, un appui à l’extérieur ou Échap. La navigation entre fiches et les liens restent disponibles.
Le bloc crème passe en deux colonnes compactes, sans étirer les images ni réduire le texte par une transformation. Les listes de projets passent en deux colonnes aux espacements réduits. Leur hauteur reste adaptable pour ne pas tronquer les titres longs.
Les PDF utilisent page-width sur mobile et 75 % au chargement sur ordinateur. L’ajustement mobile est recalculé au changement de largeur du lecteur.
Sur écran tactile mobile, un appui ouvre le volet puis ouvre automatiquement la page après 420 ms. Un appui extérieur ou Échap referme les volets. La navigation au clavier reste directe.
Les styles restent dans les fichiers de chaque composant. mobile-info.js gère la bulle et fournit la condition responsive commune. node verify-responsive.cjs vérifie les interactions ; verify-site.cjs vérifie les zooms initiaux mobile et ordinateur.

### Encadrés du jeu sur ordinateur

Au-delà de 950 px de fenêtre et de 760 px de largeur de jeu, les panneaux sont compactés : cible, métriques et difficulté dans la colonne droite ; réglages miroir et diaphragme regroupés sur deux colonnes avec petits aperçus locaux. Les marges et en-têtes sont réduits. Le canvas principal du banc conserve sa hauteur de 420 px, ses projections et son comportement. Les autres pages et les dispositions mobiles ne changent pas.

### Jeu sur téléphone

Le jeu reprend la même grille que sur ordinateur en paysage, sans bulles ni panneaux déplacés. En portrait sur téléphone, seul le jeu est masqué et remplacé par une invitation à tourner le téléphone. La partie et ses réglages sont conservés ; le chronomètre est suspendu en portrait puis reprend en paysage. Les autres pages conservent leur responsive habituel. Le comportement est dans assets/js/games/orientation.js.

En paysage sur téléphone, le jeu reste dans le défilement normal de la page, dans une zone de hauteur 125svh - 45px. La grille conserve son redimensionnement proportionnel pour tenir dans cette zone. Le bandeau, l’encadré crème, la bulle info, le bloc 8 et le bouton retour habituels restent présents. Vérification : node verify-game-fit.cjs.

La vue paysage du jeu utilise une grille de travail moins large (minimum 800px, facteur 1,6) pour agrandir les éléments. Les textes des panneaux, mesures, commandes et aides ont aussi une taille renforcée, uniquement dans cette vue.

Sur mobile, le bloc 8 se replie avec sa flèche : seule une poignée « Date et heure » reste visible. Le calendrier se ferme au repli et la réserve en bas de page suit la hauteur réelle du widget. Sur ordinateur, le bloc reste toujours ouvert. Le comportement est dans assets/js/components/widget-collapse.js. En paysage mobile, la bulle info commence à 112px du haut (plus la zone de sécurité) pour dégager le retour.

La version originale de la grande vidéo VMORPH et l’ancienne configuration de comparaison sont conservées dans .asset-originals/. Le site utilise sa copie optimisée Full HD de 83,3 Mio.

## Optimisation des assets

Les assets utilisés par le site passent de 717,0 Mio à 149,2 Mio (79,2 % de moins). Les vidéos conservent leur résolution d’origine et leurs pistes audio lorsqu’elles en avaient. Les trois autres vidéos ont été réencodées en H.264 ; le MOV VMORPH est désormais en MP4. Les fichiers de débogage .map de PDF.js ont été retirés, avec leurs liens de source map. Les licences restent présentes.

Les PDF sont conservés : la tentative sans perte n’apportait aucun gain. Le papier HAL reste strictement inchangé. Les SVG, les polices, les cartes de caractères et les ressources binaires déjà compactes restent dans leur format de fonctionnement.

Sauvegarde complète avant optimisation : .asset-originals/2026-11-01T13-43-30-559Z ; bilan détaillé : rapport-optimisation.json dans cette sauvegarde. Les dossiers .asset-originals/ et .asset-work/ sont exclus de Git avec .gitignore. La sauvegarde occupe toujours de la place sur cet ordinateur ; le gain annoncé concerne les fichiers assets actifs et à publier.

## Secrets et fichiers privés

Le .gitignore exclut les fichiers .env (sauf les exemples), les dossiers .secrets/ et credentials/, les clés privées, les sauvegardes d’assets, les dépendances et les fichiers temporaires. Les fichiers .env.example doivent uniquement contenir des valeurs fictives.

Aucune clé API, aucun jeton d’accès ni mot de passe n’a été détecté dans le code et les configurations lors de la vérification. L’adresse du bouton Contact et les liens de profils font partie du contenu public du site ; leur présence est volontaire.

Si une intégration exige un secret plus tard, le conserver dans .env ou .secrets/ et l’utiliser uniquement côté serveur. Le déplacer dans un fichier séparé puis le charger depuis le JavaScript du navigateur ne le rend pas secret. Le .gitignore évite les nouveaux ajouts à Git : il ne retire pas un fichier déjà suivi et ne remplace pas les règles d’accès de l’hébergement.

Les fichiers verify*, preview.cjs et lancer-site.cmd sont réservés au travail local et exclus de Git. Ils restent disponibles sur cet ordinateur. Les fichiers courants d’authentification, exports de cookies, états de connexion et captures HAR sont également ignorés. Aucun jeton Codex/ChatGPT, cookie de connexion ou jeton JWT n’a été détecté lors de la vérification du code et des fichiers locaux hors assets. Cette vérification concerne le dossier du projet.

## Publication GitHub Pages

La procédure complète est dans DEPLOIEMENT.md. La publication utilise .github/workflows/pages.yml et scripts/build-pages.cjs ; ce dernier est volontairement versionné, contrairement aux scripts locaux verify*. Le dossier généré dist/ est ignoré par Git. Aucune publication distante n’a été effectuée pendant cette préparation.
