# Quickstart — vérifier la liste de tâches

**Feature**: liste de tâches — démo jouable et CRUD
**Date**: 2026-11-17

Comment prouver que la fonctionnalité marche, lot par lot. Aucun code ici :
les commandes et ce qu'elles doivent rendre.

## Prérequis

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use   # Node 22
```

## Lot 1 — le domaine

```bash
npm test -- shared
```

Attendu : les règles de `data-model.md` couvertes une par une, dont les quatre
codes de refus — `titre-vide`, `titre-trop-long`, `priorite-inconnue`,
`tache-introuvable`. Aucun composant monté, aucun réseau, aucune horloge
réelle : les horodatages sont injectés.

## Lot 2 — le port et ses adaptateurs

```bash
npm test -- todo
```

Attendu : la **même suite de scénarios** passée aux deux adaptateurs, celui du
navigateur et celui du service simulé. C'est la vérification de FR-020 —
dix opérations, même état final des deux côtés — et le seul test qui prouve ce
que la démo prétend montrer.

Les cas d'échec en font partie : stockage qui lève, contenu illisible, version
de format inconnue, service muet.

## Lot 3 — le service

```bash
cd api
npm run typecheck    # Node n'exécute pas les types, Vitest non plus
npm test
```

Attendu : pour chaque route, le cas nominal, le refus de garde, le `404`, le
`405`, et le `429` au-delà du seuil. Plus deux tests que le contrat impose :
la **liste close** des six champs servis, et l'absence de détail
d'infrastructure dans un corps d'erreur.

Lancer le service à la main :

```bash
node api/src/server.ts
curl -s localhost:<port>/api/sante
```

## Lot 4 — le front

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run dev          # puis ouvrir /projets/todo-list
```

À vérifier à l'écran, dans les deux thèmes, ce qu'aucune suite ne dira :

- les six gestes au **clavier seul**, sans souris (SC-002) ;
- le focus après fermeture du mode d'édition et après suppression — jamais sur
  le document (FR-024) ;
- les annonces de la région vivante, au lecteur d'écran (FR-022) ;
- la console du serveur de développement : **aucune divergence
  d'hydratation**. La suite de bout en bout ne les voit pas, la build de
  production les retire — `.claude/rules/e2e.md`.

Rappel de `CLAUDE.md` : ne jamais conclure depuis un `nuxt dev` lancé depuis
longtemps. Une instance neuve tranche.

```bash
NUXT_IGNORE_LOCK=1 npm run dev -- --port 3031
```

## Lot 5 — la fiche, et le site entier

```bash
cd e2e && npm run typecheck && npm test
```

Attendu : l'audit `@axe-core/playwright` sur `/projets/todo-list` **dans les
deux thèmes**, sans violation critique ni sérieuse (FR-025), et la page
présente dans le plan du site.

Deux listes écrites à la main doivent avoir été ouvertes, sinon la page
échappe aux audits sans que rien ne rougisse :

- `e2e/tests/support/site.ts` — les pages du site ;
- `tests/unit/no-dead-code.spec.ts` — les dossiers sources, pour `shared/`.

Enfin, le skill `new-project` de bout en bout, et l'agent `a11y-seo-auditor`
avant la PR.

## Mesures à relever pour le `result` de la fiche

`PRODUCT.md` exige un résultat **mesuré**, avec sa source et sa date. À
relever une fois le lot 5 fini, sur l'adresse publique et jamais sur
`localhost` :

| Mesure | Comment |
|---|---|
| Nombre de tests couvrant le domaine et le port | sortie de `npm test` |
| Audit d'accessibilité | `@axe-core/playwright`, les deux thèmes |
| Lighthouse mobile | sur `https://arnaud-bregere.fr/projets/todo-list` |
| Tenue à cent tâches (SC-008) | relevé manuel, à consigner avec sa date |
