# portfolio

Portfolio personnel d'Arnaud Brégère — **Nuxt 4 / Vue 3**, rendu hybride
(pages prérendues, routes serveur Nitro pour ce qui en a besoin).

Objectif : décrocher un poste de lead / senior front-end. Le site est lui-même
une pièce du dossier : son code, ses tests et son accessibilité sont jugés au
même titre que son contenu.

Déploiement cible : Render (service web unique).

## Structure

```
portfolio/
├── app/          UI Nuxt — components (Atomic Design), pages, layouts, composables, styles (ITCSS)
├── content/      Contenu typé en TypeScript (projets, parcours, CV) — source unique
├── server/       Routes Nitro et services (créé au besoin, pas avant)
├── tests/unit/   Vitest
└── e2e/          Playwright (package npm indépendant, créé en P6)
```

Règles détaillées par domaine : @.claude/rules/frontend.md,
@.claude/rules/design-system.md, @.claude/rules/content.md,
@.claude/rules/backend.md et @.claude/rules/e2e.md.

## Environnement

- **Node 22** obligatoire (`.nvmrc`). Nuxt 4.6 refuse Node 20. Avant toute
  commande npm dans une session neuve :
  `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use`.
- Versions verrouillées par `package.json` : `vue-router` doit rester en **5.x**
  (Nuxt 4.6 génère un `tsconfig` qui référence `vue-router/volar/*`, absent de
  la 4.x — `npm run typecheck` casse sinon), `vitest` en **5.x** avec
  `@nuxt/test-utils` en **4.x** (la 3.x exige Vitest 3, incompatible avec le
  Vite 8 de Nuxt 4.6).

## Workflow git

- `main` est **protégée** : jamais de push direct, toujours une branche + PR
  (`gh pr create`), même pour un changement mineur.
- Préfixes de branche : `chore/...`, `docs/...`, `fix/...`, `feat/...`.
- **Avant tout `git push`** : présenter à l'utilisateur ce qui part (résumé du
  diff + résultat des vérifications lancées) et attendre son accord explicite.
  Ne jamais enchaîner commit → push sans ce point de passage.
- Merge en squash (`gh pr merge --squash --delete-branch`).

## Design et agents

Les fichiers de contexte sont la source unique : ne pas recopier leur contenu
ailleurs, pointer vers eux.

| Tâche | Lire d'abord | Faire ensuite |
|---|---|---|
| Toute modif UI (`app/**/*.vue`, `*.scss`) | `DESIGN.md`, `.claude/rules/design-system.md` | `/impeccable detect` sur les fichiers touchés ; `/impeccable critique` si la composition ou la hiérarchie change |
| Relecture de PR | `.claude/rules/*.md` du domaine touché | agent `reviewer` |
| Accessibilité / SEO avant merge | `PRODUCT.md` section « Accessibilité et inclusion » | agent `a11y-seo-auditor` |
| Nouvelle feature | `.specify/memory/constitution.md`, `PRODUCT.md` | spec-kit : `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` |
| Nouvelle feature avec UI | `PRODUCT.md`, `DESIGN.md` | `/impeccable shape` d'abord (composition, hiérarchie), spec-kit ensuite |
| Ajouter un projet au portfolio | `.claude/skills/new-project/SKILL.md` | suivre la procédure du skill |
| Tests | `.claude/rules/*.md` du domaine | agent `tester` |
| Déploiement | `.claude/skills/deploy/SKILL.md` | — |

Règles de passage :
- Pour une feature UI, le design tranche avant la spécification.
- Un agent qui trouve une règle contradictoire dans ces fichiers le signale au
  lieu de choisir.
- Les décisions de design se prennent dans `DESIGN.md`, pas dans le code. Un
  écart volontaire se documente dans `DESIGN.md` avant le commit.

## Tests et vérifications

- `npm run lint`, `npm run typecheck`, `npm test` (Vitest), `npm run build`.
- `npm test` dans `e2e/` pour Playwright (à partir de P6).
- Ne pas se fier à `npm test` seul : Vitest transforme via esbuild et ne
  vérifie pas les types. Lancer `typecheck` systématiquement.
- Toujours lancer lint + typecheck + tests après une modif, avant de proposer
  un commit, et rapporter la sortie réelle — pas une affirmation que « ça
  devrait passer ».

## Périmètre

`PRODUCT.md` fait foi. Hors périmètre v1, à refuser sans accord explicite :
blog, internationalisation, CMS, animations WebGL, démo d'outil IA en ligne.
