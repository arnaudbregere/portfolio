# Portfolio — Arnaud Brégère

Portfolio personnel. **Nuxt 4 / Vue 3**, design system Atomic Design mobile
first, styles ITCSS, thème clair/sombre, tests Vitest et Playwright.

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
├── components/
│   ├── atoms/       éléments indivisibles
│   ├── molecules/   assemblages d'atomes
│   ├── organisms/   sections de page
│   └── templates/   squelettes de mise en page
├── composables/     logique réutilisable
├── layouts/         enveloppes de page
├── pages/           routes
└── styles/          ITCSS : settings → tools → generic → elements → objects → components → utilities
content/             contenu éditorial typé (projets, parcours, CV)
tests/unit/          tests Vitest
```

## Documentation du projet

- `CLAUDE.md` — contrat de travail, workflow git, commandes de vérification
- `PRODUCT.md` — périmètre, rubriques, accessibilité, référencement
- `DESIGN.md` — tokens et règles visuelles (généré en phase design system)
- `.claude/rules/` — conventions par domaine

## Licence

Code sous licence MIT. Contenu éditorial, CV et visuels : tous droits réservés.
