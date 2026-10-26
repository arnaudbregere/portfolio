# PRODUCT — portfolio Arnaud Brégère

## Intention

Obtenir des entretiens pour un poste de lead ou senior développeur front-end.
Le site doit convaincre deux lecteurs en moins de deux minutes, sur mobile.

| Lecteur | Ce qu'il cherche | Ce qu'on lui donne |
|---|---|---|
| Recruteur / RH | profil, séniorité, disponibilité, moyen de contact | accueil synthétique, CV téléchargeable, formulaire |
| Lead tech / CTO | qualité de code, méthode, réalisations | fiches projets problème → solution → résultat, code public, tests et CI visibles |

## Critères de succès

- CV téléchargé ou formulaire de contact envoyé.
- Lighthouse ≥ 95 sur les quatre catégories, en mobile.
- Zéro violation axe de niveau critique ou sérieux sur chaque page.
- Première page utile en moins de 2 s sur connexion 4G.

## Rubriques (v1)

| Route | Contenu | Règle |
|---|---|---|
| `/` | hero éditorial, trois projets mis en avant, chiffres clés, appel au contact | le logo et « Accueil » y ramènent toujours |
| `/projets` | galerie des projets | chaque carte mène à `/projets/[slug]` |
| `/projets/[slug]` | fiche projet détaillée | structure imposée : contexte, problème, solution, résultat, stack, liens |
| `/a-propos` | texte de présentation, parcours, compétences | prose lisible, pas de barres de pourcentage |
| `/contact` | formulaire | envoie un message à arnaud.bregere@gmail.com |
| `/cv` | CV en HTML + bouton de téléchargement PDF | le PDF pèse moins de 500 Ko |

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
- Image Open Graph par page ; les pages sont prérendues pour être indexables
  sans exécution de JavaScript.

## Données personnelles

Le formulaire de contact ne collecte que le nom, l'adresse e-mail et le message,
avec consentement explicite. Aucun cookie de mesure d'audience, donc pas de
bandeau. Aucune adresse e-mail en clair dans le DOM.
