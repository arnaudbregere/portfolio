# Contrat — port de persistance

**Feature**: liste de tâches — démo jouable et CRUD

Le port est l'unique chose que l'interface connaît d'une source de données.
Deux implémentations le remplissent : le stockage du navigateur et le service
HTTP. C'est ce que la démo est là pour montrer.

## Opérations

Cinq, toutes asynchrones — le navigateur est synchrone, le réseau ne l'est
pas, et l'appelant ne doit pas s'en apercevoir.

| Opération | Entrée | Sortie |
|---|---|---|
| `lister` | — | les tâches, déjà triées |
| `creer` | un titre, une priorité | la tâche créée |
| `lire` | un identifiant | la tâche, ou un refus `tache-introuvable` |
| `modifier` | un identifiant, un titre et/ou une priorité et/ou `done` | la tâche modifiée, ou un refus |
| `supprimer` | un identifiant | rien, ou un refus `tache-introuvable` |

Un refus est une **valeur rendue**, nommée par les codes de `data-model.md`,
jamais une exception. Une panne de transport — réseau coupé, service muet —
est en revanche une exception : elle ne vient pas du domaine.

## Ce que le port ne fait pas

- Il ne trie pas : le domaine trie, les deux implémentations rendent l'ordre
  du domaine (FR-020).
- Il ne valide pas seul : chaque implémentation applique les gardes de
  `shared/todo/validation.ts`, et le service les réapplique par-dessus celles
  du client (FR-018).
- Il ne pose ni `id`, ni `createdAt`, ni `updatedAt` : le domaine les pose
  (FR-012).
- Il n'a pas de notion de filtre : filtrer est un geste d'interface sur une
  liste déjà obtenue.

## Sonde de disponibilité

Une sixième opération, hors CRUD : `disponible()`. Elle rend un booléen et ne
lève jamais.

L'implémentation « navigateur » rend `true` si le stockage répond, `false`
s'il lève — et dans ce second cas la démo reste jouable pour la session, sans
rien retenir.

L'implémentation HTTP interroge le service. Son résultat commande l'activation
de l'option « API » (FR-016). **Un `false` désactive l'option avec sa raison
écrite ; il ne bascule jamais la source.**

## Contrat d'échec

| Situation | Comportement attendu |
|---|---|
| Refus du domaine | valeur de refus, traduite en message près du champ concerné |
| Service injoignable au chargement | option « API » désactivée, raison écrite, source « navigateur » active |
| Service qui tombe pendant l'usage | message, et l'affichage revient à l'état confirmé par le service |
| Stockage du navigateur qui lève | message, session jouable, rien n'est retenu |
| Stockage illisible ou d'une version inconnue | repart des trois tâches d'exemple, et le dit |

**Aucun repli silencieux d'une source sur l'autre**, dans aucun de ces cas.
C'est FR-016, et c'est la seule chose que la démo prétend prouver.
