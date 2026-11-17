# Phase 0 — Recherche et décisions techniques

**Feature**: liste de tâches — démo jouable et CRUD
**Date**: 2026-11-17

Sept décisions. Les trois premières ont été vérifiées par exécution, pas
déduites ; les autres sont des arbitrages, avec leur alternative écartée.

---

## D1 — Où vit le domaine : `shared/todo/`

**Décision** : un dossier `shared/todo/` à la racine du dépôt, appartenant ni à
`app/` ni à `api/`. Le front le lit par l'alias `~~/shared/todo/…` que Nuxt
pose sur la racine — celui qui sert déjà à `~~/content/projects`. Le paquet
`api/` le lit par un chemin relatif.

**Raison** : la règle de création d'une tâche, la limite de 120 caractères et
le tri sont les mêmes des deux côtés. Les écrire deux fois, c'est accepter
qu'ils divergent — c'est exactement la panne dont l'ancien portfolio est mort,
et que `Button` a corrigée le 09/11/2026.

Ce n'est pas une dépendance croisée au sens de `.claude/rules/e2e.md` : aucun
`package.json` ne cite l'autre. C'est un fichier lu par chemin, et les deux
unités de déploiement contiennent le dépôt.

**Alternatives écartées** :

| Alternative | Pourquoi non |
|---|---|
| Domaine dans `app/utils/todo.ts` | `api/` devrait importer depuis `app/`, où les auto-imports de Nuxt rôdent. Un fichier pur aujourd'hui, pas demain. |
| Domaine dans `api/domain/`, lu par le front | Le front dépendrait d'un paquet déployé ailleurs ; `nuxt build` tirerait du code serveur dans le bundle. |
| Duplication assumée des deux côtés | Vingt lignes au départ, deux comportements au premier correctif. |
| Paquet npm partagé (workspaces) | Des espaces de travail npm dans un projet Vercel, pour trois fichiers. Le remède coûte plus que le mal. |

**Conséquence à traiter** : `tests/unit/no-dead-code.spec.ts` énumère les
dossiers où un nom peut être cité — `app/`, `content/`, `server/`, `scripts/`,
`tests/`, `e2e/tests/`. `shared/` doit rejoindre cette liste **dans le commit
qui crée le dossier**, sinon tout export du domaine est déclaré mort.

---

## D2 — `api/` s'exécute en TypeScript sans étape de build

**Décision** : `node api/src/server.ts`. Pas de sortie `tsc`, pas de
`ts-node`, pas de `tsx`. `tsc --noEmit` ne sert qu'à juger.

**Vérifié par exécution** le 17/11/2026 sur le `v22.23.4` de `.nvmrc` :

```
$ node strip.ts                      → s'exécute
$ node app.ts  (import './domaine.ts')  → s'exécute
$ node enum.ts                       → SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]
```

**Conséquences** : un import porte son extension `.ts` ; pas d'`enum`, pas de
`namespace`, pas de décorateur. `erasableSyntaxOnly` dans le `tsconfig` fait
tomber l'erreur à `npm run typecheck` plutôt qu'au premier lancement.

**Risque levé le 17/11/2026, par la pointe de T047.** Express 5 est un module
CommonJS, chargé depuis un fichier `.ts` traité en module ECMAScript.
L'interopérabilité par défaut fonctionne : ni `createRequire`, ni
`"type": "commonjs"`.

```
$ node --version                     → v22.23.4
$ node src/pointe.ts                 → pointe sur 4321
$ curl -i http://127.0.0.1:4321/api/sante
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
```

`express@5.3.0`, `api/package.json` en `"type": "module"`, et
`import express from 'express'` écrit tel quel. Le serveur écoute, la route
répond, le corps est du JSON. Le remède de repli n'a pas servi, et reste écrit
ci-dessus au cas où une montée d'Express le rendrait nécessaire.

---

## D3 — Pas de base de données : un état en mémoire

**Décision** : le service garde les listes dans une `Map` en mémoire, semée
des trois tâches d'exemple. Redémarrer le service remet cet état.

**Raison** : `.claude/rules/backend.md` écarte la base de données, et le
visiteur n'a rien à retrouver — la source qui doit survivre, c'est le
`localStorage`, et il est côté navigateur. Une mémoire vive satisfait les
scénarios de l'histoire P3, qui ne demandent que de survivre à un
**rechargement de page**, jamais à un redémarrage du service.

**Alternative écartée** : le fichier JSON de l'ancien projet
(`server/data/todos.json`). Il échoue sur tout hébergeur à système de fichiers
éphémère ou en lecture seule, ce qui est le cas de ceux visés.

**Bénéfice de bord** : la purge exigée par `PRODUCT.md` § « Données
personnelles » devient structurelle. Une entrée de la `Map` porte sa date de
dernier accès, et un balayage retire ce qui dépasse 24 h.

---

## D4 — Cloisonnement par identifiant opaque, dans le chemin

**Décision** : chaque liste porte un identifiant opaque tiré par le client,
posé dans le chemin : `/api/listes/:listeId/taches`. Le client le garde dans
son `localStorage`.

**Raison** : `PRODUCT.md` le rend dû **avant** toute instance publique. Sans
lui, le premier venu écrit dans la démo de tout le monde. Un segment de chemin
plutôt qu'un en-tête : il se lit dans un journal d'accès, se teste sans
outillage, et se voit dans une capture de la console réseau — ce qui sert une
page qui veut montrer son architecture.

**Ce que l'identifiant n'est pas** : il ne désigne personne, ne s'inscrit
nulle part ailleurs, et ne vaut pas authentification. Qui le connaît voit la
liste. C'est acceptable pour trois tâches d'exemple, et seulement pour cela.

---

## D5 — Validation par gardes écrites à la main

**Décision** : des fonctions de garde dans `shared/todo/`, sans dépendance.
Elles rendent un résultat typé — valeur acceptée, ou liste de refus — que les
deux côtés consomment.

**Raison** : le principe II de la constitution demande de vérifier qu'une
dépendance est due avant de l'ajouter. Six champs, trois règles : une
quarantaine de lignes, testables une par une, et la même règle appliquée par
l'interface et par le service, ce qu'exige **FR-018**.

**Alternative écartée** : Zod. `z.infer` donne le type depuis le schéma, une
seule source — c'est réel, et c'est ce qui le rendra justifié le jour où le
modèle grossira ou qu'un schéma devra être partagé avec un tiers. Pas
aujourd'hui.

---

## D6 — Vitest dans `api/`, pas le lanceur de tests de Node

**Décision** : `vitest` en devDependency d'`api/`, comme dans le paquet
principal.

**Raison** : le dépôt connaît déjà deux lanceurs, Vitest et Playwright. Un
troisième modèle mental — `node:test`, ses assertions et son rapport — coûte
plus qu'il ne rend, alors même qu'il n'ajouterait aucune dépendance.

**Alternative écartée** : `node:test`, qui exécute le TypeScript nativement et
pèse zéro. Il reprendra l'avantage le jour où `api/` devra s'exécuter sans
installer quoi que ce soit.

---

## D7 — La politique de sécurité du contenu doit nommer l'origine du service

**Décision** : `connect-src` d'`server/utils/security-headers.ts` gagne
l'origine du service, lue dans `runtimeConfig.public`, jamais écrite en dur.
Le changement se justifie par écrit dans l'utilitaire et met à jour
`tests/unit/security-headers.spec.ts`, dont les trois listes sont **closes**.

**Raison** : sans cela, l'adaptateur HTTP est bloqué par le navigateur, et la
suite unitaire rougit de toute façon — c'est le garde-fou qui fonctionne.

**Ce qui ne change pas, et pourquoi** : `form-action 'none'` reste. Le
formulaire d'ajout ne soumet rien — il empêche la soumission par défaut et
traite la saisie en JavaScript —, donc la directive n'est jamais sollicitée.

**Ce qui reste à trancher dans l'utilitaire, par écrit** : `backend.md` fait
tomber la tolérance `'unsafe-inline'` dès qu'il y a « entrée utilisateur ». Un
champ de texte interpolé par `{{ }}`, sans `v-html` et sans renvoi par le
serveur, n'est pas une surface d'injection. L'argument doit être écrit dans
`security-headers.ts` avant que la page n'existe — et il tombe le jour où une
tâche serait rendue en HTML.
