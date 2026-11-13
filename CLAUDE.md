# portfolio

Portfolio personnel d'Arnaud Brégère — **Nuxt 4 / Vue 3**, rendu hybride
(pages prérendues, routes serveur Nitro pour ce qui en a besoin).

Objectif : décrocher un poste de lead / senior front-end. Le site est lui-même
une pièce du dossier : son code, ses tests et son accessibilité sont jugés au
même titre que son contenu.

Déploiement : **Vercel**, projet lié au dépôt, redéployé à chaque push sur
`main`. Le domaine `arnaud-bregere.fr` est enregistré chez Hostinger, qui n'en
tient que le DNS — il ne sert aucune page. Détails et check-list :
`.claude/skills/deploy/SKILL.md`.

## Structure

```
portfolio/
├── app/          UI Nuxt — components (Atomic Design), pages, layouts, composables, styles, utils
├── content/      Contenu typé en TypeScript (projets, parcours) — source unique
├── server/       Routes Nitro — référencement et contrôle de santé, rien d'autre
├── tests/unit/   Vitest
└── e2e/          Playwright (package npm indépendant, créé en P6)
```

Règles détaillées par domaine : @.claude/rules/frontend.md,
@.claude/rules/design-system.md, @.claude/rules/content.md,
@.claude/rules/backend.md et @.claude/rules/e2e.md.

## Environnement

- **Node 22** obligatoire (`.nvmrc`). Sous Node 20, Nuxt 4.6 émet un
  avertissement et poursuit — ce n'est pas un refus. `package.json` reprend la
  plage que `nuxt` déclare lui-même. Avant toute commande npm dans une session
  neuve : `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use`.
- **`package.json` ne déclare que ce que ce dépôt importe** : `nuxt` et
  `@nuxt/image`. `vue` et `vue-router` en sortent le 13/11/2026 — `nuxt@4.6.4`
  les déclare lui-même (`vue: ^3.5.44`, `vue-router: ^5.4.0`), aucun fichier
  n'importe l'un ou l'autre en direct, et deux plages déclarées en double
  finissent par diverger à une montée de version, ce qui installe deux copies.
  `npm ls vue-router` doit donc rendre un arbre à une seule branche, sous
  `nuxt`.

  Le verrou qui tenait `vue-router` en **5.x** disparaît avec la ligne, et il
  ne protégeait plus rien : Nuxt 4.6 génère un `tsconfig` qui référence
  `vue-router/volar/*`, absent de la 4.x, mais c'est `nuxt` qui exige déjà
  `^5.4.0` — npm ne peut pas résoudre une 4.x. Le juge reste le même,
  `npm run typecheck`.
- Versions verrouillées par `package.json` : `vitest` en **5.x** avec
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
| Contenu ou texte de page modifié | `.claude/rules/content.md` § « Le contenu change, le référencement change avec lui » | relire `description`, `title`, Open Graph et JSON-LD **dans le même commit** |
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
- **Une montée de version de Nuxt se vérifie aussi par `npm run dev`.** La CI
  ne le lance jamais : ses cinq jobs sont lint, types, tests unitaires, build
  et e2e. Le passage en 4.6.4 (PR #49) a cassé le serveur de développement
  avec cinq checks verts — `options.hostname.toLowerCase is not a function`,
  corrigé par `devServer.host` dans `nuxt.config.ts`.
- **Les renvois entre fichiers de contexte sont opposables depuis le
  13/11/2026.** `tests/unit/docs-links.spec.ts` vérifie les imports
  `@chemin` de ce fichier, les liens Markdown relatifs et les chemins cités
  entre accents graves, dans les dix-neuf documents vivants du dépôt. La liste
  de ces documents est **close**, et le test la tient complète : une règle
  ajoutée dans `.claude/rules/` sans rejoindre la liste fait rougir la suite.
  Hors périmètre, et pour deux raisons opposées : l'outillage tiers
  (`impeccable`, `speckit-*`, `.specify/`), que ce dépôt n'écrit pas, et les
  rapports de `docs/sessions/`, qui sont des instantanés — un chemin devenu
  faux y est exact pour sa date. Ce qu'aucun test ne tient : un renvoi en
  prose, « `DESIGN.md` § 5 », qui reste vert si la section change de numéro.
- **Rien d'écrit n'est spéculatif, et `tests/unit/no-dead-code.spec.ts` le
  tient.** Un composant, un export d'`app/utils`, d'`app/composables`, de
  `content/` ou de `server/utils`, ou un token de `_tokens.scss` que
  **personne d'autre ne nomme** fait rougir la suite. C'est le garde-fou de la
  règle de `.claude/rules/design-system.md` — « nommer la page qui l'utilise
  dans le même commit » — qui ne tenait jusque-là qu'à la relecture.
- **`/_ds` n'est dans aucun des cinq jobs.** `nuxt.config.ts` retire la route
  du build de production, donc rien ne compile son style hors de `npm run dev`.
  Un commentaire `// 44px` dans son `<style scoped lang="scss">` a fait
  `CssSyntaxError · Unknown word 44px` le 13/11/2026, cinq checks verts :
  écrire `/* */` dans ce fichier, et ouvrir la planche après l'avoir touchée.
- **Ne jamais conclure depuis un `nuxt dev` qui tourne depuis longtemps.** Le
  13/11/2026, le serveur lancé à 16:41 a continué de rendre l'ancien
  `content/cv.ts` — l'objet brut à la place du texte, à l'écran — pendant que
  le disque, les tests et le build de production étaient justes. `touch` sur
  le fichier n'y a rien changé, et les fichiers d'`app/` se rechargeaient
  normalement dans la même session : **`content/` sort du périmètre du
  rechargement à chaud**.

  Un rendu faux à l'écran se **prouve** avant d'être attribué à un cache. La
  preuve tient en une commande, et elle ne touche pas au serveur en cours :

  ```bash
  NUXT_IGNORE_LOCK=1 npm run dev -- --port 3031
  ```

  Deux rendus différents du même disque disent où est le défaut. Le même
  rendu faux des deux côtés dit que le code est en cause. Sans cette
  comparaison, « c'est le cache » est une hypothèse, pas un diagnostic.

## Périmètre

`PRODUCT.md` fait foi. Hors périmètre v1, à refuser sans accord explicite :
blog, internationalisation, CMS, animations WebGL, démo d'outil IA en ligne.
