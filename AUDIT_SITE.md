# Audit léger du site public

Site : https://pet-cell.github.io/mon-site/
Date : 1 novembre 2026.

## Périmètre

52 requêtes HTTP de contrôle à faible concurrence, sans téléchargement complet des vidéos, complétées par des interactions dans le navigateur. Revue des fichiers locaux correspondant aux versions publiques de pages.js, pdf-viewer.js, orientation.js et contact.js (empreintes identiques). Aucune modification ni publication du site en ligne. Les scripts de cet audit et les réponses détaillées restent locaux et ignorés par Git.

## Résultats positifs

- Toutes les pages, composants et ressources structurantes testés répondent 200.
- Catalogue public : 3 rapports et 1 présentation.
- Les 4 PDF et 5 vidéos testés répondent correctement aux requêtes partielles (206, 1024 octets), ce qui permet la lecture progressive. Les lectures des rapports HAL et Master 2 et de la présentation REX II ont été confirmées dans le navigateur.
- Les 12 chemins de fichiers privés et outils locaux testés répondent 404 : .env, .env.local, .git/config, .gitignore, une sauvegarde connue, preview.cjs, lancer-site.cmd, verify-site.cjs, README.md, DEPLOIEMENT.md, le workflow et le script de préparation.
- HTTPS actif avec Strict-Transport-Security.
- Une tentative d’injection HTML dans category est rejetée par « Rubrique inconnue », sans apparition d’une boîte JavaScript. Cela ne constitue pas une preuve d’absence de toute XSS.
- Les deux vidéos Station météo se chargent (readyState 4), utilisent les versions optimisées et ne démarrent pas automatiquement.
- Copie du contact : confirmation de réussite affichée. Liens externes de Contact avec noopener. Le bouton GitHub reste volontairement non renseigné.
- Jeu : niveau 5, nouveau banc et redémarrage fonctionnels. Portrait 390×844 : invitation à tourner l’appareil. Petit paysage 640×360 : classe de réduction activée, aucune largeur dépassant la fenêtre, bulle info séparée du retour. Le réglage de viewport ne reproduit pas un vrai périphérique tactile.
- Bloc 8 : repli et réouverture fonctionnels. Bulle info : ouverture et fermeture fonctionnelles. Volet de l’accueil : une seule activation déclenche la navigation après l’animation.

## Anomalie reproduite : catégorie héritée acceptée (gravité faible)

Adresse de reproduction : https://pet-cell.github.io/mon-site/pages/document.html?category=constructor

Résultat : titre « Atelier — undefined », initialisation interrompue et message Cannot read properties of undefined (reading 'toLocaleUpperCase'). Le catalogue reste en chargement. Effet limité à la page ouverte avec cette adresse ; aucun accès supplémentaire aux fichiers n’a été constaté.

Cause : assets/js/app.js utilise pages[key] sans vérifier que key est une propriété propre du dictionnaire. constructor est une propriété héritée des objets JavaScript. Le même principe de vérification est à appliquer au dictionnaire titles et au catalogue dans pdf-viewer.js.

Correction recommandée : accepter uniquement les catégories prévues et utiliser Object.hasOwn pour les dictionnaires. Afficher une rubrique inconnue proprement, sans interrompre le démarrage des autres composants.

## Durcissement possible

La réponse HTML ne fournit pas de Content-Security-Policy ni de X-Frame-Options. Aucune exploitation n’a été démontrée à partir de cette absence ; une CSP adaptée aux composants, à YouTube, aux workers et à PDF.js apporterait une défense supplémentaire. Une directive frame-ancestors exige un en-tête HTTP, pas une balise meta.

Les PDF, vidéos et l’adresse mail du bouton Contact sont publics et récupérables. Le mode lecture seule du visionneur et l’affichage masqué de l’adresse ne constituent pas un contrôle d’accès. C’est cohérent avec un portfolio public.

## Limites

Audit ciblé, sans charge intensive, sans scan de l’infrastructure GitHub ni accès aux comptes ou sessions. Les fichiers non devinés, les autres scénarios XSS, les vulnérabilités inconnues des bibliothèques et tous les appareils réels ne sont pas couverts. Aucun problème critique n’a été mis en évidence dans le périmètre testé. Le bug de catégorie reste à corriger ; aucun changement applicatif n’a été appliqué pendant cet audit.

## Références PDF.js consultées

La bibliothèque locale indique la version 6.4.299 et l’intégration du site désactive enableScripting. Les avis officiels consultés indiquent des correctifs en 4.2.67 pour CVE-2024-4367 et 6.2.108 pour CVE-2026-16633 ; ce contrôle ne remplace pas une surveillance des futurs avis de sécurité.

- https://github.com/mozilla/pdf.js/security/advisories/GHSA-wgrm-67xf-hhpq
- https://github.com/mozilla/pdf.js/security/advisories/GHSA-hq66-cqwq-w95j
