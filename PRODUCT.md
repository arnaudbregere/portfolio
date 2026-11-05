# PRODUCT — portfolio Arnaud Brégère

## Intention

Obtenir des entretiens pour un poste de lead ou senior développeur front-end.
Le site doit convaincre deux lecteurs en moins de deux minutes, sur mobile.

| Lecteur | Ce qu'il cherche | Ce qu'on lui donne |
|---|---|---|
| Recruteur / RH | profil, séniorité, disponibilité, moyen de contact | accueil synthétique, CV téléchargeable, téléphone et adresse e-mail en clair |
| Lead tech / CTO | qualité de code, méthode, réalisations | fiches projets problème → solution → résultat, code public, tests et CI visibles |

## Critères de succès

- CV téléchargé, ou téléphone ou adresse e-mail activés depuis `/contact`.
- Lighthouse ≥ 95 sur les quatre catégories, en mobile.
- Zéro violation axe de niveau critique ou sérieux sur chaque page.
- Première page utile en moins de 2 s sur connexion 4G.

## Rubriques (v1)

| Route | Contenu | Règle |
|---|---|---|
| `/` | hero éditorial, deux projets mis en avant, chiffres clés, appel au contact | le logo et « Accueil » y ramènent toujours |
| `/projets` | galerie des projets | chaque carte mène à `/projets/[slug]` |
| `/projets/[slug]` | fiche projet détaillée | structure imposée : contexte, problème, solution, résultat, stack, liens |
| `/projets/calculatrice` | fiche **et** démo jouable dans la page | décision du 03/11/2026 : une démo vaut mieux qu'une capture pour un exercice de base |
| `/a-propos` | texte de présentation, parcours, compétences | prose lisible, pas de barres de pourcentage |
| `/contact` | nom, téléphone, adresse e-mail, profils publics, disponibilité et poste recherché | **aucun formulaire** : décision du 05/11/2026 (issue #5) |
Les projets mis en avant sont **deux** et non trois : décision du 04/11/2026
(issue #15). La Calculatrice est un exercice de base assumé — la hisser au rang
de Japan Manga Explorer et d'Agenda affaiblirait la première vue, qui doit
convaincre en moins de deux minutes. Elle reste accessible depuis `/projets`.

Le **CV n'est qu'un document à télécharger** : décision du 26/10/2026. Il n'y a
pas de route `/cv` en HTML. Le bouton de téléchargement vit sur `/` et
`/a-propos` ; le PDF pèse moins de 500 Ko.

## Projets retenus

1. **agenda-app-event** — application calendrier Vue 3 + Express, développée avec
   un dispositif agentique (rules, skills, agents, spec-kit). Angle : méthode et
   outillage.
2. **japan-react** — application React. Angle : résultats mesurés (rapports
   Lighthouse et RGAA disponibles).
3. **Calculatrice** — application Nuxt. Angle : exercice de base soigné.
4. **Figaro Classifieds** et **Groupe La Poste** — expérience professionnelle,
   présentée en fiches sans captures d'écran propriétaires.

Hors périmètre : AccessiCheck (auditeur RGAA multi-agent) n'est pas repris.

## Contenu

Le contenu vit dans `content/*.ts`, typé. Aucune chaîne HTML, aucun `v-html` :
leçon directe de l'ancien portfolio, où 399 lignes de HTML en chaîne rendues par
`v-html` rendaient le CV invisible aux moteurs de recherche et intestable.

## Accessibilité et inclusion

Référence : **RGAA 4.1 / WCAG 2.1 niveau AA**. Critères opposables :

- Contraste du texte ≥ 4,5:1 (≥ 3:1 pour le texte large et les éléments
  d'interface), dans les deux thèmes. Tout couple de couleurs est mesuré et
  consigné dans `DESIGN.md`.
- Tout élément interactif est atteignable et activable au clavier seul, dans un
  ordre de tabulation logique, avec un indicateur de focus visible.
- Un composant qui s'ouvre en surcouche (menu plein écran, dialogue) piège le
  focus, se ferme par `Échap` et restitue le focus à l'élément déclencheur.
- Une seule balise `h1` par page, hiérarchie de titres sans saut de niveau.
- Toute image porteuse de sens a une alternative textuelle ; les images
  décoratives ont `alt=""`.
- Les changements d'état et les erreurs de formulaire sont annoncés via
  `aria-live` ; un champ en erreur est relié à son message par
  `aria-describedby`.
- `prefers-reduced-motion` supprime les animations non essentielles.
- Le site reste utilisable sans JavaScript pour la lecture du contenu
  (prérendu).

## Référencement

- Une balise `title` et une méta `description` propres à chaque page.
- Données structurées JSON-LD `Person` sur l'accueil, `CreativeWork` sur chaque
  fiche projet.
- `sitemap.xml` et `robots.txt` générés, URL canonique sur chaque page.
- Métadonnées de partage sur chaque page : `og:title`, `og:description` et
  `og:image`. Une seule image de partage sert le site ; chaque fiche projet lui
  substitue sa première capture. Décision du 04/11/2026 (issue #17) : une image
  dessinée par page demandait cinq visuels, et un de plus à chaque page
  ajoutée, pour un gain nul sur une page dont le contenu est du texte.
- Les pages sont prérendues pour être indexables sans exécution de
  JavaScript.

## Données personnelles

**Le site ne collecte rien.** Le formulaire de contact est abandonné le
05/11/2026 (issue #5) : il demandait une route serveur, un fournisseur d'envoi,
une limitation de débit et un piège à robots, pour faire ce qu'un `mailto:`
fait déjà. Sans formulaire, il n'y a aucune donnée de visiteur à recevoir, à
stocker ni à justifier. Aucun cookie de mesure d'audience non plus, donc pas de
bandeau.

L'adresse e-mail paraît en clair sur `/`, sur `/a-propos` et dans le JSON-LD
`Person`. Cette règle renverse le 04/11/2026 (issue #17) celle d'origine, qui
interdisait toute adresse en clair dans le DOM : le site est une pièce de
candidature, un recruteur doit pouvoir écrire en un clic sans remplir un
formulaire, et une adresse structurée sert le référencement. Le risque de
collecte automatisée est connu et accepté.

**Aucun délai de réponse n'est annoncé.** « Réponse sous 24 h », « disponible
9h-18h » et « entretien sous 48 h » ont été écartés le 05/11/2026 : ce sont des
engagements vérifiables, tenus par une seule personne, sur la page même qui
doit prouver sa rigueur. Un recruteur qui constate l'écart retient l'écart.

Le **téléphone** paraît en clair sur `/a-propos` depuis le 03/11/2026, et sur
`/contact` depuis le 05/11/2026. Sur mobile, `tel:` ouvre l'application
téléphone avec le numéro prérempli : c'est le chemin le plus court entre un
recruteur et un entretien. L'adresse postale, elle, ne paraît nulle part — une
page publique n'a pas à porter le domicile de qui que ce soit.
