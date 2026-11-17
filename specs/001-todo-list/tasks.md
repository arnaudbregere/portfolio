---

description: "Tâches d'implémentation — liste de tâches, démo jouable et CRUD"
---

# Tasks: Liste de tâches — démo jouable et CRUD

**Input**: documents de conception de `specs/001-todo-list/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: inclus, et non optionnels ici. Le principe VI de la constitution
l'impose — « un test s'écrit avec le code qu'il couvre, pas après » — et
SC-004 en fait un critère de succès.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable — fichier différent, aucune dépendance en cours.
- **[Story]** : l'histoire servie (US1, US2, US3).
- Chaque tâche porte son chemin de fichier.

## Les lots du plan, et les phases de cette liste

Les phases suivent l'ordre des **histoires**, parce que c'est lui qui rend
chaque incrément livrable. Les lots du plan s'y rangent ainsi :

| Lot du plan | Phase ici | Remarque |
|---|---|---|
| 1 — domaine pur | Phase 2 | bloque tout le reste |
| 2 — port et adaptateur navigateur | Phase 3 (US1) | |
| 3 — API Express | Phase 5 (US3) | l'API ne sert que l'histoire P3 |
| 4 — front | **réparti** sur les phases 3, 4 et 5 | le sélecteur de source ne peut pas naître avant l'API |
| 5 — fiche projet | Phase 6 | |

Le lot 4 est le seul à se scinder, et c'est voulu : une interface pour une
source qui n'existe pas encore serait du code spéculatif.

---

## Phase 1 — Setup

- [ ] T001 Ajouter `'shared/'` au tableau `sources` de `tests/unit/no-dead-code.spec.ts`, avec le commentaire disant pourquoi le domaine n'appartient ni à `app/` ni à `api/`

**Porte** : sans T001, tout export de `shared/todo/` est déclaré mort dès le
premier commit de la phase 2. T001 et T002 partent donc dans le **même
commit**.

---

## Phase 2 — Foundational : le domaine

**Bloquant pour les trois histoires.** Aucune de ces tâches ne monte un
composant, n'ouvre un réseau ni ne lit une horloge réelle.

- [ ] T002 Créer `shared/todo/types.ts` : `Tache` (`id: string`, `title: string`, `done: boolean`, `priority`, `createdAt: string`, `updatedAt: string`), `Priorite` en **union de chaînes** `'low' | 'medium' | 'high'` — jamais un `enum`, que Node refuse en retrait de types —, et le type des codes de refus
- [ ] T003 [P] Créer `shared/todo/validation.ts` : les quatre gardes rendant un refus **nommé** et jamais une exception — `titre-vide` (titre absent ou vide après retrait des espaces), `titre-trop-long` (plus de 120 caractères après retrait des espaces), `priorite-inconnue` (valeur hors des trois admises), `tache-introuvable` (identifiant absent de la liste)
- [ ] T004 Créer `shared/todo/domaine.ts` : `creer` (retire les espaces de bord, `done: false`, `priority: 'medium'` par défaut, `updatedAt` égal à `createdAt`), `modifier` (pose `updatedAt`), `basculer`, `trier` (de la plus récemment créée à la plus ancienne), `filtrer`
- [ ] T005 `creer` et `modifier` reçoivent l'identifiant et l'horodatage **en paramètres**, jamais `crypto.randomUUID()` ni `Date.now()` appelés dedans, dans `shared/todo/domaine.ts` — sans quoi aucun test ne peut affirmer une valeur
- [ ] T006 [P] Tester les quatre codes de refus un par un dans `tests/unit/todo-validation.spec.ts`, titre d'espaces et titre de 121 caractères compris
- [ ] T007 [P] Tester `creer`, `modifier`, `basculer`, `trier` et `filtrer` dans `tests/unit/todo-domaine.spec.ts`, avec horloge et identifiants injectés
- [ ] T008 [P] Tester que `trier` rend le même ordre quelle que soit l'entrée, et que `filtrer` sur `faites` d'une liste sans tâche faite rend une liste vide sans erreur, dans `tests/unit/todo-domaine.spec.ts`

**Vérification** : `npm test -- todo` et `npm run typecheck` au vert.

---

## Phase 3 — US1 : jouer la liste sans réseau (P1) 🎯 MVP

**But** : la page se joue entière, hors réseau, et prouve le soin
d'exécution.

**Test indépendant** : ouvrir `/projets/todo-list` réseau coupé, enchaîner
ajout, bascule, filtre, suppression, annulation, rechargement,
réinitialisation.

### Port et persistance

- [ ] T009 [US1] Déclarer le port dans `app/adapters/port.ts` : `lister`, `creer`, `lire`, `modifier`, `supprimer`, toutes asynchrones, plus `disponible()` qui rend un booléen et **ne lève jamais** — voir `contracts/persistance.md`
- [ ] T010 [US1] Écrire l'adaptateur navigateur dans `app/adapters/navigateur.ts` : une clé unique portant un numéro de version de format, toute lecture et toute écriture **enveloppées** — en navigation privée l'accès lève
- [ ] T011 [US1] Dans `app/adapters/navigateur.ts`, écarter sans erreur un contenu illisible, d'une version inconnue, ou qui ne passe pas les gardes : la démo repart des trois tâches d'exemple
- [ ] T012 [US1] Écrire les trois tâches d'exemple dans `shared/todo/exemples.ts` — une faite, les trois priorités couvertes — et les semer à la première visite comme à la réinitialisation
- [ ] T013 [US1] Écrire `app/composables/useTodos.ts` : l'état de la démo, le filtre courant, la dernière suppression annulable. Il ne connaît **que** le port, jamais une implémentation

### Tests du port

- [ ] T014 [P] [US1] Écrire dans `tests/unit/todo-port.spec.ts` une suite de scénarios **passée à n'importe quelle implémentation du port**, dix opérations et un état final attendu — c'est elle qui vérifiera FR-020 en phase 5
- [ ] T015 [P] [US1] Passer cette suite à l'adaptateur navigateur dans `tests/unit/todo-port.spec.ts`
- [ ] T016 [P] [US1] Tester les trois échecs de stockage dans `tests/unit/todo-navigateur.spec.ts` : accès qui lève, contenu illisible, version de format inconnue
- [ ] T017 [P] [US1] Tester `useTodos` dans `tests/unit/use-todos.spec.ts` : ajout, bascule, filtre, suppression, annulation, réinitialisation, contre un port simulé

### Interface

- [ ] T018 [US1] Écrire l'organisme `app/components/organisms/TodoList.vue` sur le modèle de `Calculator.vue` : il consomme `useTodos` et ne porte aucune logique métier
- [ ] T019 [US1] Créer la page `app/pages/projets/todo-list.vue` sur le modèle de `app/pages/projets/calculatrice.vue` — `useSeoMeta` par `pageSeoMeta`, `useProjectJsonLd`, et `<TodoList />` dans le slot de `ProjectDetail`
- [ ] T020 [US1] Formulaire d'ajout avec `@submit.prevent` dans `TodoList.vue` : la touche Entrée doit valider, et `form-action 'none'` rester tenu puisque rien n'est soumis
- [ ] T021 [US1] Rendre chaque tâche en `<li>` d'une `<ul>`, avec un vrai `<input type="checkbox">` et son `<label>` lié ; la cible de 44 px est portée par le libellé, pas par le carré
- [ ] T022 [US1] Rendre la priorité en lecture par l'atome `TagList` existant, sans aucun token de couleur nouveau
- [ ] T023 [US1] Rendre une tâche faite lisible **sans couleur** : case cochée **et** libellé barré
- [ ] T024 [US1] Filtres en `<input type="radio">` réels dans un `<fieldset>` nommé, rendus en texte avec l'actif à l'encre — `DESIGN.md` § 5
- [ ] T025 [US1] Afficher en permanence le nombre de tâches et le nombre restantes dans `TodoList.vue`
- [ ] T026 [US1] Suppression avec message et bouton « Annuler », **sans minuteur** : le message disparaît à l'action suivante
- [ ] T027 [US1] L'annulation restaure l'`id`, le `createdAt` et l'`updatedAt` d'origine — elle défait, elle ne recrée pas
- [ ] T028 [US1] Une seule région `aria-live="polite"` dans `TodoList.vue`, annonçant ajout, suppression, annulation et nombre restant
- [ ] T029 [US1] Après suppression, poser le focus sur un élément vivant et prévisible, jamais sur le document
- [ ] T030 [US1] État vide après suppression de tout : une invitation à saisir, et le focus gardé dans le champ
- [ ] T031 [US1] Distinguer « aucune tâche pour ce filtre » de « aucune tâche du tout », dans `TodoList.vue`
- [ ] T032 [US1] Message de refus rattaché au champ par `aria-describedby`, pour titre vide et titre trop long
- [ ] T033 [US1] Dire au visiteur que rien ne sera retenu quand le stockage est indisponible, sans l'empêcher de jouer
- [ ] T034 [US1] Bouton « Réinitialiser » ramenant aux trois tâches d'exemple
- [ ] T035 [US1] Style `scoped` n'employant que des tokens, classes BEM préfixées par niveau, aucune marge extérieure posée par le composant

### Tests d'interface

- [ ] T036 [P] [US1] Tester le rendu, les rôles et les noms accessibles dans `tests/unit/todo-list.spec.ts`, en interrogeant le DOM par rôle et non par classe
- [ ] T037 [P] [US1] Tester que le balisage **ne dépend pas du thème** dans `tests/unit/todo-list.spec.ts`, sur le modèle de `tests/unit/site-footer.spec.ts`
- [ ] T038 [P] [US1] Écrire `e2e/tests/todo-list.spec.ts` : les six gestes **au clavier seul**, du début à la fin

**Vérification** : `npm run lint && npm run typecheck && npm test && npm run build`, puis `npm run dev` sur une instance neuve, console relue dans les deux thèmes — aucune divergence d'hydratation.

---

## Phase 4 — US2 : corriger une tâche sans quitter la liste (P2)

**But** : exercer la modification depuis l'interface.

**Test indépendant** : ouvrir le mode d'édition d'une ligne, changer les deux
champs, enregistrer ; recommencer et abandonner.

- [ ] T039 [US2] Ajouter un mode d'édition par ligne dans `app/components/organisms/TodoList.vue` : un champ texte **et** un `<select>` de priorité, « Enregistrer » et « Annuler »
- [ ] T040 [US2] Décider la forme du `<select>` dans `DESIGN.md` **avant** de l'écrire — premier du site : filet, hauteur et tokens de texte de `Button`, chevron de l'atome `Icon` et non la flèche du système
- [ ] T041 [US2] À l'ouverture du mode, poser le focus dans le champ texte, avec le titre courant et la priorité courante déjà renseignés
- [ ] T042 [US2] `Entrée` enregistre, `Échap` annule, et le focus revient dans les deux cas sur le bouton qui a ouvert le mode
- [ ] T043 [US2] Ouvrir le mode d'une ligne ferme celui d'une autre, sans enregistrer
- [ ] T044 [US2] Refuser l'enregistrement d'un titre vide ou trop long : message, et le mode reste ouvert
- [ ] T045 [P] [US2] Tester les six scénarios d'acceptation de US2 dans `tests/unit/todo-list.spec.ts`
- [ ] T046 [P] [US2] Étendre `e2e/tests/todo-list.spec.ts` : ouvrir, modifier les deux champs, enregistrer, puis annuler — au clavier, et en vérifiant la restitution du focus

**Vérification** : les quatre commandes du paquet principal, et la planche `/_ds` ouverte si un token a bougé.

---

## Phase 5 — US3 : la même liste servie par deux sources (P3)

**But** : rendre tangible ce que la fiche prétend montrer.

**Test indépendant** : service joignable, les opérations aboutissent ; service
arrêté, l'option est refusée avec son motif.

### Ouverture : lever le seul risque du plan

- [ ] T047 Écrire une pointe de dix lignes chargeant Express 5 depuis un `.ts` exécuté par `node`, et la lancer. Si l'interopérabilité du module CommonJS échoue, poser `"type": "commonjs"` dans `api/package.json` ou passer par `createRequire`, et **consigner le résultat dans `specs/001-todo-list/research.md` D2**

### Le paquet `api/`

- [ ] T048 [US3] Créer `api/package.json` : `express` en dépendance, `vitest` et `typescript` en devDependencies, scripts `start`, `typecheck` et `test`. **Aucune dépendance croisée** avec le paquet principal
- [ ] T049 [US3] Créer `api/tsconfig.json` en mode strict, avec `erasableSyntaxOnly` — l'`enum` échoue alors à `npm run typecheck`, pas au premier lancement
- [ ] T050 [US3] Écrire `api/src/services/listes.ts` : une `Map` en mémoire, semée des exemples de `shared/todo/exemples.ts`, chaque liste portant une date de dernier accès **jamais servie au client**
- [ ] T051 [US3] Purger dans `api/src/services/listes.ts` toute liste sans accès depuis 24 h
- [ ] T052 [US3] Écrire `api/src/middlewares/debit.ts` : limitation par identifiant de liste, en mémoire, rendant `429` au-delà du seuil
- [ ] T053 [US3] Écrire `api/src/routes/taches.ts` : les cinq routes de `contracts/http.md`, cloisonnées par `/api/listes/:listeId/taches`. La couche ne porte aucune logique métier
- [ ] T054 [US3] Ignorer dans `api/src/routes/taches.ts` tout champ du corps autre que `title`, `priority` et `done` — `id`, `createdAt` et `updatedAt` appartiennent au domaine
- [ ] T055 [US3] Réappliquer les gardes de `shared/todo/validation.ts` côté service, même quand le client a déjà validé
- [ ] T056 [US3] Ajouter `GET /api/sante` dans `api/src/routes/sante.ts` : `200` et un corps minimal, **ni identité de build, ni compte de listes**
- [ ] T057 [US3] Traduire les refus en codes dans `api/src/routes/taches.ts` : `400` pour une garde, `404`, `405`, `429`, `500` — corps générique, détail au journal
- [ ] T058 [US3] Écrire `api/src/server.ts`, point d'entrée lancé par `node api/src/server.ts`, origine autorisée lue dans la configuration et jamais écrite en dur

### Tests du service

- [ ] T059 [P] [US3] Pour chaque route, le cas nominal et le refus de garde, dans `api/tests/taches.spec.ts`
- [ ] T060 [P] [US3] Les `404`, `405` et `429` dans `api/tests/taches.spec.ts`
- [ ] T061 [P] [US3] **Liste close des six champs servis** dans `api/tests/contrat.spec.ts` : énumérer les clés rendues et échouer à la septième
- [ ] T062 [P] [US3] Vérifier dans `api/tests/contrat.spec.ts` qu'aucun corps d'erreur ne porte de chemin, de pile d'appels, de nom de machine ni de version
- [ ] T063 [P] [US3] Tester la purge à 24 h dans `api/tests/listes.spec.ts`, horloge injectée
- [ ] T064 [US3] Ajouter un travail `api/` à la chaîne d'intégration : `typecheck` **et** `test` — ni Vitest ni Node ne vérifient les types

### L'adaptateur HTTP et le sélecteur

- [ ] T065 [US3] Écrire `app/adapters/http.ts` contre le port de T009, l'identifiant opaque de liste tiré côté client et gardé dans le stockage
- [ ] T066 [P] [US3] Passer la suite de scénarios de T014 à l'adaptateur HTTP dans `tests/unit/todo-port.spec.ts`, service simulé — c'est la vérification de FR-020
- [ ] T067 [US3] Implémenter `disponible()` dans `app/adapters/http.ts` par `GET /api/sante` ; il rend `false` et **ne lève jamais**
- [ ] T068 [US3] Ajouter le sélecteur de source dans `TodoList.vue`, **en tête du bloc**, en `<input type="radio">` réels d'un `<fieldset>` nommé, rendus en rectangles à filet
- [ ] T069 [US3] Désactiver l'option « API » quand `disponible()` rend `false`, et **écrire la raison en clair**. Aucun repli silencieux, dans aucun cas
- [ ] T070 [US3] Fermer sans enregistrer un mode d'édition ouvert au moment d'un changement de source
- [ ] T071 [US3] Annoncer le changement de source dans la région `aria-live` existante
- [ ] T072 [US3] Rendre l'attente visible et neutraliser les commandes concernées pendant une opération distante
- [ ] T073 [US3] En cas d'échec d'une opération distante, annoncer, et revenir à l'état confirmé par le service
- [ ] T074 [US3] Déclarer l'origine du service dans `runtimeConfig.public` de `nuxt.config.ts` — jamais une URL absolue en dur
- [ ] T075 [US3] Ajouter cette origine à `connect-src` dans `server/utils/security-headers.ts`, **avec la justification écrite dans le fichier**
- [ ] T076 [US3] Mettre à jour les listes closes de `tests/unit/security-headers.spec.ts` : sans cela la suite rouge, et c'est le garde-fou qui fonctionne
- [ ] T077 [US3] Écrire dans `server/utils/security-headers.ts` pourquoi la tolérance `'unsafe-inline'` tient malgré une entrée utilisateur — texte interpolé, pas de `v-html`, pas de renvoi serveur — et à quelle condition elle tombe
- [ ] T078 [P] [US3] Étendre `e2e/tests/todo-list.spec.ts` : option « API » désactivée et motif lisible quand le service ne répond pas

**Vérification** : les quatre commandes du paquet principal, plus `typecheck` et `test` d'`api/` et d'`e2e/`.

---

## Phase 6 — Polish : la fiche, et le site entier

- [ ] T079 Ajouter `/projets/todo-list` à `sitePages` de `e2e/tests/support/site.ts` — la liste est **écrite à la main**, et sans cette ligne la page échappe à tous les audits sans que rien ne rougisse
- [ ] T080 Ajouter l'entrée typée dans `content/projects.ts` : `slug: 'todo-list'`, problème, solution, `stack`, `links`, `featured: false`
- [ ] T081 Relever les mesures du `result` sur l'adresse publique et **jamais** sur `localhost` : nombre de tests, audit axe, Lighthouse mobile, tenue à cent tâches — chacune avec sa date
- [ ] T082 Écrire le `result` de la fiche depuis ces relevés seuls. Une fiche sans résultat mesuré ne se publie pas
- [ ] T083 [P] Composer l'image de partage par `node scripts/og-card.js --out todo-list …` et renseigner `ogImage`
- [ ] T084 [P] Vérifier que `title` et `description` sont propres à la fiche, et que la `description` ne reprend pas le titre mot pour mot
- [ ] T085 Lancer l'audit `@axe-core/playwright` sur la page **dans les deux thèmes** et exiger zéro violation critique ou sérieuse
- [ ] T086 Mesurer la tenue à cent tâches (SC-008) et consigner le relevé avec sa date
- [ ] T087 Déployer `api/` sur son hébergeur et renseigner l'origine de production
- [ ] T088 Écrire `.claude/rules/api.md` **et** l'ajouter à la liste close `documentsVivants` de `tests/unit/docs-links.spec.ts`, dans le même commit
- [ ] T089 Lancer l'agent `a11y-seo-auditor` sur la nouvelle page avant la PR
- [ ] T090 Dérouler la check-list du skill `new-project` de bout en bout

---

## Dépendances

```
Phase 1 (T001)
   └─► Phase 2 (T002…T008)         bloque tout
          ├─► Phase 3 — US1        MVP livrable seul
          │      └─► Phase 4 — US2  s'appuie sur TodoList.vue
          │             └─► Phase 5 — US3
          │                    └─► Phase 6
          └─► T047 (pointe Express)  peut partir dès la phase 2
```

- **US1 ne dépend d'aucune autre histoire.** Livrée seule, la page tient debout.
- **US2 dépend d'US1** : le mode d'édition se greffe sur la ligne de tâche.
- **US3 dépend d'US1** pour le port et l'interface, **pas** d'US2.
- **T047 est hors chemin critique** : la pointe Express peut être levée
  pendant la phase 2, et doit l'être avant T048.

## Parallélisation

| Phase | Lançables ensemble |
|---|---|
| 2 | T003 après T002 ; puis T006, T007, T008 |
| 3 | T014, T015, T016, T017 ; puis T036, T037, T038 |
| 4 | T045 et T046 |
| 5 | T059 à T063 ; T066 et T078 |
| 6 | T083 et T084 |

T074 à T077 forment un bloc indivisible : l'origine, la directive, le test et
la justification partent **dans le même commit**, sinon la suite est rouge
entre deux.

## Portée du MVP

**Phases 1 à 3.** La page se joue entière, hors réseau, et prouve le soin
d'exécution. C'est déjà une démo publiable : la fiche peut l'annoncer sans
mentionner l'API, et les phases 4 à 6 s'ajoutent sans rien défaire.

## Stratégie de livraison

Une PR par phase. Chacune passe les quatre vérifications du paquet principal,
et à partir de la phase 5 celles d'`api/` et d'`e2e/` aussi.

Trois tâches ne sont pas du code et ne doivent pas être repoussées en fin de
course :

- **T040** décide la forme du `<select>` dans `DESIGN.md` avant de l'écrire —
  le design tranche avant le code.
- **T077** écrit l'argument de sécurité avant que la page existe.
- **T081** relève les mesures avant que la fiche les cite.
