# Phase 1 — Modèle de données

**Feature**: liste de tâches — démo jouable et CRUD
**Date**: 2026-11-17

Une seule entité porte des données. Tout le reste est de l'état d'interface.

---

## `Tache`

Déclarée une fois, dans `shared/todo/types.ts`, lue par le front et par
`api/`.

| Champ | Type | Règle |
|---|---|---|
| `id` | `string` | opaque, posé par le domaine, jamais par le client. Stable pour la vie de la tâche. |
| `title` | `string` | 1 à 120 caractères après retrait des espaces de bord. |
| `done` | `boolean` | `false` à la création. |
| `priority` | `'low' \| 'medium' \| 'high'` | `'medium'` par défaut. Union de chaînes, **jamais un `enum`** — D2. |
| `createdAt` | `string` | horodatage ISO 8601, posé par le domaine. Immuable. |
| `updatedAt` | `string` | horodatage ISO 8601, posé par le domaine à chaque modification. Égal à `createdAt` à la création. |

**Pas de `description`.** Le champ existait dans l'ancien `types/todo.ts` et
était vide dans toutes les tâches de `todos.json`. Il revient le jour où une
page l'affiche — principe II de la constitution.

**Pas d'échéance, pas de catégorie, pas de propriétaire** : anti-objectifs de
`DESIGN.md` § 5.

### Règles de validation

Elles vivent dans `shared/todo/validation.ts` et sont appliquées **des deux
côtés** — c'est FR-018. Une garde ne lève pas : elle rend un refus nommé, que
l'interface traduit en message et que le service traduit en réponse 400.

| Code de refus | Condition |
|---|---|
| `titre-vide` | titre absent, ou vide après retrait des espaces |
| `titre-trop-long` | plus de 120 caractères après retrait des espaces |
| `priorite-inconnue` | valeur hors des trois admises |
| `tache-introuvable` | identifiant absent de la liste |

### Transitions d'état

Une tâche n'a qu'un axe d'état, `done`, et il bascule dans les deux sens.
Aucune transition n'est interdite ; aucune n'est irréversible.

```
créée  ──► à faire ◄──► faite
             │            │
             └──► supprimée ◄──┘
                    │
                    └──► restaurée (annulation, tant qu'aucune autre
                         action n'a eu lieu — FR-007)
```

Une tâche supprimée puis restaurée **reprend son `id`, son `createdAt` et son
`updatedAt`** : l'annulation défait la suppression, elle ne recrée pas une
tâche. Sans cela, le tri par date de création la ferait réapparaître ailleurs
que là où le visiteur l'a vue disparaître.

---

## `Liste`

L'ensemble des tâches d'une source. Pas de nom, pas de partage, une seule par
source.

Côté service, une liste porte en plus une date de dernier accès, qui n'est
jamais servie au client : elle n'existe que pour la purge à 24 h exigée par
`PRODUCT.md` § « Données personnelles ».

### Tri

De la plus récemment créée à la plus ancienne — FR-010. Le tri appartient au
domaine, pas au gabarit : les deux sources doivent rendre le même ordre
(FR-020), et un tri fait à l'affichage ne vaudrait que pour le front.

---

## État d'interface — ce qui n'est pas une donnée

Ni persisté par le service, ni exposé par un contrat. Cité pour qu'il ne soit
pas confondu avec le modèle.

| État | Valeurs | Retenu entre deux visites ? |
|---|---|---|
| Filtre | `toutes` \| `a-faire` \| `faites` | non, repart à `toutes` |
| Source | `navigateur` \| `api` | oui, dans le `localStorage` |
| Ligne en cours d'édition | identifiant, ou aucune | non |
| Dernière suppression annulable | tâche et son rang, ou aucune | non |

L'identifiant opaque de liste (D4) est retenu dans le `localStorage`. Ce n'est
pas une donnée du modèle : c'est une adresse.

---

## Ce que le stockage du navigateur contient

Une seule clé, portant un numéro de version de format. À la lecture, un
contenu illisible, d'une version inconnue, ou qui ne passe pas les gardes est
**écarté sans erreur** : la démo repart des trois tâches d'exemple et le dit
(cas limite « stockage illisible ou corrompu »).

Lire une clé de stockage peut aussi **lever** — navigation privée, stockage
bloqué par la configuration. Toute lecture et toute écriture sont donc
protégées, et l'échec se dit au visiteur : la session reste jouable, rien ne
sera retenu.
