# Portfolio — Arnaud Brégère

Portfolio personnel. **Nuxt 4 / Vue 3**, design system Atomic Design mobile
first, thème clair/sombre, tests unitaires Vitest. La suite Playwright arrive
avec le déploiement (issue #6).

## Prérequis

Node 22 (voir `.nvmrc`) :

```bash
nvm use
```

## Commandes

```bash
npm install        # installer les dépendances
npm run dev        # serveur de développement sur http://localhost:3000
npm run lint       # ESLint
npm run typecheck  # vérification des types
npm test           # tests unitaires (Vitest)
npm run build      # build de production
npm run preview    # prévisualiser le build
```

## Structure

```
app/
├── components/      Atomic Design : atoms, molecules, organisms
├── composables/     logique réutilisable
├── layouts/         enveloppes de page
├── pages/           routes
├── styles/          tokens, police, remise à zéro, styles d'éléments, points de rupture, entrée de page
└── utils/           fonctions pures
content/             contenu éditorial typé (projets, parcours)
tests/unit/          tests Vitest

Un dossier n'est créé qu'au moment où un fichier y entre : un composant naît de
la page qui en a besoin.
```

## Documentation du projet

- `CLAUDE.md` — contrat de travail, workflow git, commandes de vérification
- `PRODUCT.md` — périmètre, rubriques, accessibilité, référencement
- `DESIGN.md` — direction visuelle, tokens, ratios de contraste, écarts assumés
- `.claude/rules/` — conventions par domaine

## Licence

Code sous licence MIT. Contenu éditorial, CV et visuels : tous droits réservés.
