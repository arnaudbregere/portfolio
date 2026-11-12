# Portfolio — Arnaud Brégère

**En ligne : [arnaud-bregere.fr](https://arnaud-bregere.fr)**

Portfolio personnel. **Nuxt 4 / Vue 3**, rendu hybride — pages prérendues au
build, routes serveur Nitro pour ce qui en a besoin. Design system Atomic
Design mobile first, thème clair/sombre, aucun framework CSS.

Le site est lui-même une pièce du dossier : son code, ses tests et son
accessibilité comptent autant que son contenu.

| | |
|---|---|
| Hébergement | **Vercel**, redéployé à chaque push sur `main` |
| Domaine | enregistré chez Hostinger, qui n'en tient que le DNS |
| Vérification du déploiement | [`/api/health`](https://arnaud-bregere.fr/api/health) rend le commit en ligne |
| Tests | **210** tests unitaires (Vitest), **82** tests de bout en bout (Playwright) |
| Audit | `@axe-core/playwright` sur les sept pages, dans les deux thèmes |
| Lighthouse mobile | 99 / 96 / 100 / 100 — mesuré sur la production, le 12/11/2026 |

## Prérequis

**Node 22** (voir `.nvmrc`) :

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

Vitest transforme par esbuild et ne vérifie pas les types : `typecheck` se
lance séparément, systématiquement.

### Tests de bout en bout

`e2e/` est un **package npm indépendant** : aucune dépendance croisée avec le
`package.json` principal. Il construit puis sert la sortie de production,
jamais `nuxt dev`, sur un port dédié (4320).

```bash
cd e2e
npm install
npx playwright install chromium   # une seule fois
npm test                          # Playwright + audit axe
npm run typecheck
npm run report                    # ouvrir le rapport HTML
```

## Structure

```
app/
├── components/      Atomic Design : atoms, molecules, organisms
├── composables/     logique réutilisable
├── layouts/         enveloppes de page
├── pages/           routes
├── styles/          tokens, police, remise à zéro, éléments, points de rupture, entrée de page
└── utils/           fonctions pures
content/             contenu éditorial typé — projets, parcours, navigation, contact
server/              trois routes Nitro : /robots.txt, /sitemap.xml, /api/health
public/              police, CV, visuels, images de partage
scripts/             composition des images Open Graph
tests/unit/          tests Vitest
e2e/                 package Playwright indépendant
docs/sessions/       rapports de session
```

Un dossier n'est créé qu'au moment où un fichier y entre : un composant naît
de la page qui en a besoin.

## Intégration continue

Les sept pages sortent du build en fichiers statiques ; seules `/api/health`
et les deux routes de référencement sont rendues à la requête.

`main` est **protégée** : jamais de push direct, toujours une branche puis une
PR. Cinq checks sont requis, un par vérification — `Lint`, `Types`,
`Tests unitaires`, `Build`, `Tests e2e`. L'installation commune est factorisée
dans l'action composite `.github/actions/deps`.

La CI ne lance pas `nuxt dev` : une montée de version de Nuxt se vérifie aussi
par `npm run dev`.

## Sécurité

Les en-têtes de sécurité sont des constantes de
`server/utils/security-headers.ts`, posées sur toutes les réponses par les
`routeRules` de `nuxt.config.ts` — documents, routes prérendues, `/api/health`
et fichiers de `public/` compris.

Les tests tiennent des **interdictions**, pas des valeurs : une origine
tierce, un joker, un schéma d'URL, `'unsafe-eval'` ou une permission de
navigateur accordée font échouer la suite. La tolérance du script en ligne et
sa condition de péremption sont justifiées dans l'utilitaire.

## Versions verrouillées

`package.json` fige deux choix, pour une raison chacun :

- **`vue-router` en 5.x** — Nuxt 4.6 génère un `tsconfig` qui référence
  `vue-router/volar/*`, absent de la 4.x : `npm run typecheck` casse sinon.
- **`vitest` en 5.x avec `@nuxt/test-utils` en 4.x** — la 3.x de
  `@nuxt/test-utils` exige Vitest 3, incompatible avec le Vite 8 de Nuxt 4.6.

## Documentation du projet

Ces fichiers sont la source unique : ils ne se recopient pas, ils se citent.

- `CLAUDE.md` — contrat de travail, workflow git, commandes de vérification
- `PRODUCT.md` — périmètre, rubriques, accessibilité, référencement
- `DESIGN.md` — direction visuelle, tokens, ratios de contraste, écarts assumés
- `.claude/rules/` — conventions par domaine : frontend, design system,
  contenu, backend, e2e
- `.claude/skills/deploy/SKILL.md` — check-list de déploiement
- `.claude/skills/new-project/SKILL.md` — ajouter un projet au portfolio

## Licence

Code sous licence MIT. Contenu éditorial, CV et visuels : tous droits
réservés.
