# Règles API (`api/`)

Le service CRUD de la démo de liste de tâches. **Paquet npm indépendant**, à la
racine du dépôt, comme `e2e/` : aucune dépendance croisée avec le package
principal, et `package.json` ne connaît pas l'autre.

Né le 17/11/2026 avec la démo de `/projets/todo-list`. Il n'existe que pour
elle, et il n'accueillera rien d'autre : une seconde raison d'exister se
discute dans `PRODUCT.md` avant de s'écrire ici.

## Pourquoi un paquet, et pas une route Nitro

`.claude/rules/backend.md` tient `server/` à trois routes, sans base, sans
secret, sans donnée d'utilisateur, et le site est prérendu. Un CRUD avec état
n'y entre pas.

Vercel, qui sert le site, exécute chaque route en **fonction sans état** :
deux requêtes peuvent tomber sur deux instances, et la `Map` du service
disparaîtrait entre deux clics. Le service vit donc sur un hébergeur à
processus durable, et le site reste statique.

## Exécution

- **Node 22, sans étape de build** : `node api/src/server.ts`. Node retire les
  types à la volée. `tsc --noEmit` ne sert qu'à juger.
- Conséquences, vérifiées par exécution le 17/11/2026 : un import porte son
  extension `.ts` ; ni `enum`, ni `namespace`, ni décorateur.
  `erasableSyntaxOnly` dans `api/tsconfig.json` fait tomber l'erreur à
  `npm run typecheck` plutôt qu'au premier lancement.
- Express 5 est un module CommonJS chargé depuis un module ECMAScript :
  l'interopérabilité par défaut fonctionne, sans `createRequire` ni
  `"type": "commonjs"`. Le relevé est dans
  `specs/001-todo-list/research.md` D2.

## Le domaine ne se réécrit pas

`shared/todo/` porte les types, les gardes et les opérations. Le service les
**lit**, il n'en recopie aucune : c'est la seule chose que la démo est là pour
prouver, et `tests/unit/todo-port.spec.ts` le vérifie en rejouant la même suite
de scénarios contre les deux sources.

Une règle métier écrite dans `api/src/` et nulle part ailleurs est un défaut,
pas une optimisation.

## Trois couches, comme `server/`

- `api/src/routes/*` — transport : lit la requête, appelle le service, traduit le
  résultat en réponse HTTP. Aucune logique métier.
- `api/src/services/*` — l'état et les règles d'accès. Seul endroit qui connaît la
  `Map`.
- `api/src/middlewares/*` — ce qui s'applique avant la route, débit compris.

## Ce que le service ne fait pas

- **Pas de base de données.** L'état tient dans une `Map`, semée des exemples
  de `shared/todo/examples.ts`. Redémarrer remet tout à zéro, et c'est voulu —
  une base demanderait un schéma, une migration, une sauvegarde et un secret
  pour des données qui n'intéressent personne.
- **Aucune donnée de visiteur.** Le cloisonnement passe par un identifiant
  opaque tiré côté client ; le service ne lui donne aucun sens. Ni compte, ni
  adresse, ni journal nominatif — `PRODUCT.md` § « Données personnelles ».
- **Aucune liste ne survit 24 h sans accès.** La purge se fait à l'accès et
  non par minuterie : un `setInterval` tiendrait le processus éveillé et
  survivrait aux tests.
- La date de dernier accès commande la purge et **n'est jamais servie**.

## Contrat

`specs/001-todo-list/contracts/http.md` fait foi : six routes, et aucune autre.
Deux points s'y sont corrigés le 17/11/2026, parce que la suite de scénarios
du port a refusé la divergence avec l'adaptateur navigateur :

- **`DELETE` est idempotent** — une tâche absente rend `204`, pas `404` ;
- **`PUT` n'est un `upsert` que pour une restauration**, reconnue à son corps
  complet. Une modification partielle sur un identifiant absent rend `404`,
  sans quoi `modifier()` créerait la tâche qu'il prétend modifier.

Un contrat qui diverge d'une source à l'autre fait mentir la fiche. La suite
partagée est le juge, pas la relecture.

## Réponses

- `id`, `createdAt` et `updatedAt` appartiennent au domaine : un corps reçu
  qui les porte est ignoré, sauf sur la restauration décrite ci-dessus.
- **La liste des six champs servis est close.** `api/tests/contrat.spec.ts`
  les énumère et échoue à la septième — même garde-fou que `/api/health` dans
  `.claude/rules/backend.md`.
- Un corps d'erreur ne divulgue **rien** de l'infrastructure : ni chemin, ni
  pile d'appels, ni nom de machine, ni version. Le détail va au journal.
- Une seule origine autorisée, lue dans `API_ORIGINE`. Jamais `*`, jamais une
  URL écrite en dur. Le site nomme de son côté l'origine du service dans
  `connect-src` — `server/utils/security-headers.ts`.

## Tests

- Vitest et `supertest`, dans `api/tests/`. Le serveur ne s'ouvre pas sur un
  port : `creerApp()` rend l'application, `api/src/server.ts` l'écoute. Un test qui
  ouvrirait un port se battrait avec le suivant.
- L'horloge et l'identifiant sont **injectés** : une purge à 24 h se vérifie en
  avançant une horloge, pas en attendant.
- Chaque route a son cas nominal et son refus de garde. `404`, `405` et `429`
  sont tenus nommément.
- `npm run typecheck` **et** `npm test` dans la chaîne d'intégration : Vitest
  transforme par esbuild et Node se contente de retirer les types — ni l'un ni
  l'autre ne les vérifie.
