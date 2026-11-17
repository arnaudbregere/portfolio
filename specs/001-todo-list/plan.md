# Implementation Plan: Liste de tâches — démo jouable et CRUD

**Branch**: `feat/todo-list` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-todo-list/spec.md`

## Summary

Une démo jouable dans la fiche `/projets/todo-list`, et un CRUD HTTP dans un
paquet `api/` du dépôt. Le même domaine — créer, valider, trier — sert les
deux, depuis `shared/todo/`, et deux adaptateurs de persistance le branchent :
le `localStorage` du visiteur, et le service. Le site reste statique et
prérendu ; la démo reste jouable sans réseau.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node 22.23.4 (`.nvmrc`). `api/`
s'exécute sans étape de build, par retrait des types — vérifié, voir
[research.md](./research.md) D2.

**Primary Dependencies**: Nuxt 4.6.4 / Vue 3.5 pour le front, déjà en place.
Express 5 et Vitest pour `api/`. **Aucune autre** : la validation est écrite à
la main (D5).

**Storage**: `localStorage` côté navigateur ; une `Map` en mémoire côté
service. Pas de base de données (D3).

**Testing**: Vitest dans le paquet principal et dans `api/` ; Playwright et
`@axe-core/playwright` dans `e2e/`.

**Target Platform**: le site sur Vercel, prérendu. `api/` sur un hébergeur
Node, déployé à part — Vercel sert des fonctions, pas un serveur qui tourne.

**Project Type**: site statique avec une démo cliente, plus un service HTTP
séparé.

**Performance Goals**: cent tâches affichées et filtrées sans attente
perceptible (SC-008) ; Lighthouse mobile ≥ 95 sur les quatre catégories, comme
les sept autres pages (SC-005).

**Constraints**: démo entièrement jouable hors réseau (FR-014) ; aucune donnée
de visiteur sur un serveur tant que la source distante n'est pas choisie ;
aucun repli silencieux d'une source sur l'autre (FR-016) ; RGAA 4.1 / WCAG 2.1
AA.

**Scale/Scope**: une page, un bloc de démo, six routes HTTP, une entité.

## Constitution Check

*GATE: passé avant la Phase 0, repassé après la Phase 1.*

| Principe | Verdict | Comment |
|---|---|---|
| **I — Le périmètre est fermé** | ✅ | La route et le projet sont inscrits dans `PRODUCT.md` (PR #88), avant toute ligne de code. |
| **II — Rien de spéculatif** | ✅ | Deux dépendances, chacune due : Express, demandé ; Vitest, déjà le lanceur du dépôt. Zod écarté (D5). `description` retirée du modèle faute de page qui l'affiche. Chaque composant naît avec la page qui l'emploie. |
| **III — Un seul système d'organisation** | ✅ | Atomic Design pour `app/components/`, sens des dépendances respecté. `shared/` et `api/` ne sont pas des composants et n'entrent pas dans la taxonomie. |
| **IV — Le contenu est typé, la preuve est chiffrée** | ⚠️ | La fiche entre dans `content/projects.ts`, typée. Son `result` **ne peut pas être écrit avant le lot 5** : il se relève. Le lot 5 porte ce relevé, et la fiche ne se publie pas sans lui. |
| **V — Accessibilité et design sont des critères de revue** | ✅ | `DESIGN.md` § 5 tranché avant le code (PR #89). FR-021 à FR-025 portent les critères. Le `<select>`, premier du site, a sa forme décidée avant d'être écrit. |
| **VI — Quatre vérifications avant tout commit** | ✅ | `lint`, `typecheck`, `test`, `build`, plus `typecheck` et `test` d'`api/` et d'`e2e/`. Le [quickstart](./quickstart.md) les ordonne par lot. |

**Deux portes supplémentaires, propres à ce dépôt** :

- `tests/unit/no-dead-code.spec.ts` déclare morts les exports qu'aucun autre
  fichier ne nomme, et n'inspecte que six dossiers. `shared/` doit rejoindre
  cette liste **dans le commit qui crée le dossier**.
- `tests/unit/security-headers.spec.ts` tient trois listes **closes**.
  Ajouter l'origine du service à `connect-src` rend la suite rouge tant que le
  test n'a pas été mis à jour **et** le changement justifié par écrit dans
  `server/utils/security-headers.ts` (D7).

Aucune violation à justifier : la section « Complexity Tracking » est donc
absente.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-list/
├── plan.md              # ce fichier
├── spec.md              # /speckit-specify
├── research.md          # Phase 0 — sept décisions
├── data-model.md        # Phase 1 — l'entité et ses règles
├── quickstart.md        # Phase 1 — comment prouver que ça marche
├── contracts/
│   ├── persistance.md   # le port, et ses deux implémentations
│   └── http.md          # les six routes du service
└── checklists/
    └── requirements.md  # qualité de la spécification
```

### Source Code (repository root)

```text
shared/todo/                      # le domaine, lu des deux côtés (D1)
├── types.ts                      # Tache, Priorite, codes de refus
├── validation.ts                 # les gardes, sans dépendance
└── domaine.ts                    # créer, modifier, basculer, trier

api/                              # paquet npm indépendant
├── package.json                  # Express 5, Vitest, TypeScript
├── tsconfig.json                 # strict, erasableSyntaxOnly
├── src/
│   ├── server.ts                 # point d'entrée, `node api/src/server.ts`
│   ├── routes/taches.ts          # transport : lit, appelle, traduit en HTTP
│   ├── services/listes.ts        # l'état en mémoire, la purge
│   └── middlewares/debit.ts      # limitation de débit par liste
└── tests/

app/                              # front Nuxt, existant
├── composables/useTodos.ts       # l'état de la démo, ne connaît que le port
├── adapters/
│   ├── navigateur.ts             # localStorage
│   └── http.ts                   # le service
├── components/
│   ├── atoms/                    # ce que la page exige, et rien de plus
│   ├── molecules/
│   └── organisms/TodoList.vue    # la démo, comme Calculator.vue
└── pages/projets/todo-list.vue   # la fiche, sur le modèle de calculatrice.vue

content/projects.ts               # la fiche, entrée n° 4
tests/unit/                       # Vitest du paquet principal
e2e/tests/                        # Playwright, et l'audit axe
```

**Structure Decision**: trois unités, aucune dépendance croisée dans un
`package.json`. `shared/todo/` n'appartient à personne et est lu par chemin —
par l'alias `~~` côté Nuxt, par un chemin relatif côté `api/`. C'est ce qui
permet à la règle de validation d'exister **une fois** tout en étant appliquée
des deux côtés, comme l'exige FR-018, sans introduire d'espaces de travail npm
dans un projet Vercel. Le raisonnement complet et les quatre alternatives
écartées sont dans [research.md](./research.md) D1.

## Découpage en lots

Chaque lot se livre seul et se vérifie seul. Les trois premiers n'ont aucune
décision visuelle à attendre.

| Lot | Contenu | Histoire servie | Porte de sortie |
|---|---|---|---|
| 1 | `shared/todo/` — types, gardes, domaine | toutes | les quatre codes de refus testés ; `shared/` ajouté à `no-dead-code.spec.ts` |
| 2 | le port, l'adaptateur navigateur, `useTodos` | P1 | la même suite de scénarios passée aux deux adaptateurs |
| 3 | `api/` — Express 5, trois couches, débit, purge | P3 | nominal, refus, 404, 405, 429 ; liste close des six champs |
| 4 | le front — composants, page, adaptateur HTTP, `connect-src` | P1, P2, P3 | clavier seul, focus rendu, axe vert dans les deux thèmes |
| 5 | la fiche — `content/projects.ts`, `ogImage`, mesures | — | skill `new-project`, `result` relevé et daté |

**Le lot 3 s'ouvre par une pointe de dix lignes** : charger Express 5 depuis un
`.ts` exécuté par retrait des types, et vérifier l'interopérabilité du module
CommonJS. C'est le seul risque technique non levé de ce plan (D2), et son
remède est local.

## Ce que ce plan ne décide pas

- La composition visuelle : `DESIGN.md` § 5 l'a tranchée (PR #89), et ce plan
  n'y revient pas.
- Le découpage en composants : il naît de la page, dans le même commit
  qu'elle. Aucun atome n'est nommé ici — six l'avaient été le 26/10/2026, et
  ils ont été supprimés.
- L'hébergeur d'`api/` : le choix se fait au lot 3, et n'engage que le
  déploiement.
