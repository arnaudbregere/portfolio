# portfolio Constitution

Portfolio personnel d'Arnaud Brégère — Nuxt 4 / Vue 3. Le site est lui-même une
pièce du dossier de candidature : son code, ses tests et son accessibilité sont
jugés au même titre que son contenu.

Ce fichier ne redit pas les règles du dépôt, il les rend opposables et pointe
vers leur source : `CLAUDE.md`, `.claude/rules/*.md`, `PRODUCT.md` et
`DESIGN.md`. Aucune valeur (token, seuil, version) n'est recopiée ici.

## Core Principles

### I. Le périmètre est fermé
`PRODUCT.md` fait foi sur ce que le site contient. Les quatre rubriques sont
`/`, `/projets` (et `/projets/[slug]`), `/a-propos` et `/contact` ;
`/projets/calculatrice` s'y ajoute comme démo jouable, inscrite dans
`PRODUCT.md` le 03/11/2026. Le CV est un document à télécharger, jamais une
page HTML — décision du 26/10/2026. Blog,
internationalisation, CMS, animations WebGL et démo d'outil d'IA en ligne MUST
être refusés sans accord explicite de l'auteur. Une feature absente de
`PRODUCT.md` ne s'implémente pas : elle s'y écrit d'abord.

### II. Rien de spéculatif
Un composant, une couche, un dossier ou un export naît du besoin prouvé qui
l'utilise **dans le même commit**, jamais pour cocher une case de phase : les
six atomes écrits le 26/10/2026 ont été supprimés pour cette raison. Pas de code
mort, pas de doublon, pas de fichier vide. Avant d'ajouter une dépendance npm,
vérifier qu'une plateforme ou le dépôt lui-même ne couvre pas déjà le besoin —
une police se vendorise, elle ne s'installe pas.

### III. Un seul système d'organisation
**Atomic Design**, et lui seul, structure `app/components/`. ITCSS a été
abandonné le 26/10/2026 : deux taxonomies en parallèle dupliquaient les règles.
Le sens des dépendances est `pages → organisms → molecules → atoms`, jamais
l'inverse. Les règles de structure sont dans `.claude/rules/design-system.md`,
celles du code dans `.claude/rules/frontend.md`.

### IV. Le contenu est typé, la preuve est chiffrée
Tout le contenu éditorial vit dans `content/`, en TypeScript typé, sans logique,
sans chaîne HTML et sans `v-html` — l'ancien portfolio stockait son CV en HTML
rendu par `v-html` : invisible pour les moteurs, intestable, exposé à
l'injection. Chaque projet publié porte un `result` mesuré, avec sa source et sa
date. Une affirmation invérifiable MUST être écartée plutôt qu'arrondie : sur un
site qui sert de dossier de candidature, elle se défend en entretien. Voir
`.claude/rules/content.md`.

### V. Accessibilité et design sont des critères de revue
Les critères opposables sont ceux de `PRODUCT.md`, section « Accessibilité et
inclusion » : RGAA 4.1 / WCAG 2.1 niveau AA. Les décisions visuelles se
prennent dans `DESIGN.md` avant le code, jamais dans le code ; un écart
volontaire s'y documente avant le commit. Toute modification de
`app/**/*.vue` ou `*.scss` MUST respecter la direction épinglée le 26/10/2026
(mazarine.com et arter.studio) et n'utiliser que des tokens.

### VI. Quatre vérifications avant tout commit
`npm run lint`, `npm run typecheck`, `npm test` et `npm run build` MUST passer,
et leur sortie réelle MUST être rapportée — pas une affirmation qu'elles
devraient passer. `npm test` seul ne suffit pas : Vitest transforme via esbuild
et ne vérifie pas les types. À partir de P6, la suite Playwright de `e2e/`
rejoint cette liste. Un test s'écrit avec le code qu'il couvre, pas après.

## Stack et contraintes d'exploitation

- **Node 22** obligatoire (`.nvmrc`). Dans une session neuve :
  `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use`.
- Versions verrouillées pour une raison écrite dans `CLAUDE.md` : `vue-router`
  en 5.x, `vitest` en 5.x avec `@nuxt/test-utils` en 4.x. Ne pas les relever
  sans vérifier cette raison.
- Rendu hybride visé : pages prérendues, routes serveur Nitro pour ce qui en a
  besoin. `server/` est créé au besoin, pas avant, et suit les trois couches de
  `.claude/rules/backend.md`. Au 04/11/2026, `nuxt.config.ts` ne prérend que
  `/sitemap.xml` et `/robots.txt` : le prérendu des pages est traité avec le
  déploiement (issues #17 et #6).
- `runtimeConfig.public.siteUrl` est la seule source de l'origine du site.
  Aucune URL absolue en dur.
- Secrets par `runtimeConfig` et variables d'environnement, jamais dans le code,
  jamais sous un préfixe `NUXT_PUBLIC_`.
- Déploiement : Vercel, projet lié au dépôt, redéployé à chaque push sur `main`
  (`.claude/skills/deploy/`). Hostinger n'est que le registrar et le DNS du
  domaine ; il ne sert aucune page. Corrigé le 10/11/2026 : la constitution
  désignait Render, qui n'a jamais rien servi.

## Workflow git et livraison

- `main` est protégée : jamais de push direct. Chaque changement passe par une
  branche (`chore/`, `docs/`, `fix/`, `feat/`) et une PR.
- **Commits petits, chacun avec un sens unique**, pas une somme de features.
  La séquence de commits s'annonce et se fait valider avant d'être déroulée, et
  chaque diff est présenté à l'auteur avant le commit suivant.
- Avant tout `git push` et tout merge : présenter ce qui part, avec le résultat
  des vérifications, et attendre l'accord explicite de l'auteur.
- Merge en squash avec suppression de la branche :
  `gh pr merge --squash --delete-branch`.
- Une décision non déductible du code se consigne dans le fichier qui en fait
  foi, avec sa date et son numéro d'issue, pas dans un commentaire de code.
- Chaque séance se clôt par un rapport dans `docs/sessions/`, écrit par le skill
  `rapport-session`. Ces rapports font foi sur l'état du projet.

## Governance

Cette constitution prévaut sur les autres pratiques écrites dans le dépôt. En
cas de contradiction entre `CLAUDE.md`, `.claude/rules/*.md`, `DESIGN.md` ou
`PRODUCT.md`, l'agent MUST le signaler au lieu de trancher (voir `CLAUDE.md`,
section « Design et agents »).

Procédure d'amendement : modification de ce fichier via une PR dédiée, avec
justification dans la description. Les amendements MUST être approuvés par
l'auteur du projet avant merge.

Politique de version : MAJOR pour suppression ou redéfinition incompatible d'un
principe ; MINOR pour un principe ou une section ajoutée ; PATCH pour
clarifications et corrections de forme.

Conformité : la revue de PR MUST vérifier le respect des principes. L'agent
`reviewer` (`.claude/agents/reviewer.md`) contrôle les conventions du dépôt,
`a11y-seo-auditor` l'accessibilité et le référencement avant merge. Toute
complexité ajoutée MUST être justifiée dans la PR.

**Version**: 1.0.0 | **Ratified**: 2026-11-04 | **Last Amended**: 2026-11-04
