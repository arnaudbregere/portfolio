# Contrat — service HTTP

**Feature**: liste de tâches — démo jouable et CRUD
**Paquet**: `api/`

Toutes les routes sont cloisonnées par l'identifiant opaque de liste (D4). Il
vient du client, et le service ne lui donne aucun sens.

## Routes

| Méthode | Chemin | Rend |
|---|---|---|
| `GET` | `/api/sante` | l'état du service |
| `GET` | `/api/listes/:listeId/taches` | les tâches, triées |
| `POST` | `/api/listes/:listeId/taches` | la tâche créée, `201` |
| `GET` | `/api/listes/:listeId/taches/:id` | une tâche |
| `PUT` | `/api/listes/:listeId/taches/:id` | la tâche modifiée |
| `DELETE` | `/api/listes/:listeId/taches/:id` | `204`, sans corps |

Aucune autre route. Toute méthode non prévue sur un chemin connu rend `405`.

**`DELETE` est idempotent** : supprimer une tâche absente rend `204`, et non
`404`. C'est la sémantique HTTP, et c'est ce que le port exige — l'adaptateur
navigateur traite ce cas comme ordinaire. Corrigé le 17/11/2026 pour la même
raison que le `PUT` ci-dessous.

**`PUT` sur un identifiant absent crée la tâche à l'identique** — identifiant
du chemin, `createdAt` et `updatedAt` du corps — et rend `201`, **à la seule
condition que le corps soit complet**, c'est-à-dire qu'il porte `createdAt`.
Une modification partielle sur un identifiant absent rend `404`. Précisé le
17/11/2026, la suite de scénarios du port ayant refusé la divergence :
sans cette limite, `modifier()` créerait la tâche qu'il prétend modifier dès
que la source est distante. C'est la forme
HTTP de l'opération `restaurer` du port, née en écrivant l'adaptateur le
17/11/2026 : sans elle, « Annuler » tire un nouvel identifiant dès que la
source est distante, et la tâche remonte en tête au lieu de revenir à sa
place.

Le prix est connu et borné : sur cette route, et sur elle seule, le client
choisit un horodatage de création. Il ne peut le faire que dans **sa propre
liste**, cloisonnée par l'identifiant opaque, et l'effet se borne à l'ordre
d'affichage. Un `POST` ordinaire reste intraitable sur ce point : il ignore
tout `createdAt` reçu.

## Corps acceptés

`POST` : `title` requis, `priority` facultative. Tout autre champ est
**ignoré**, jamais recopié — `id`, `createdAt`, `updatedAt` et `done` sont du
ressort du domaine (FR-012).

`PUT` : `title`, `priority` et `done`, tous facultatifs, au moins un présent.
Mêmes champs ignorés.

## Codes d'erreur

| Code | Cas | Corps |
|---|---|---|
| `400` | refus de garde | le code de refus, et rien d'autre |
| `404` | liste ou tâche absente | message générique |
| `405` | méthode non prévue | message générique |
| `429` | débit dépassé | message générique |
| `500` | toute autre panne | message générique |

**Un corps d'erreur ne porte jamais de détail d'infrastructure** — ni chemin,
ni pile d'appels, ni nom de machine, ni version. C'est FR-019, et c'est la
règle de `.claude/rules/backend.md` pour les réponses du site, appliquée ici.
Le détail va au journal du serveur.

## Liste close des champs servis

Une tâche servie porte exactement les six champs de `data-model.md` :
`id`, `title`, `done`, `priority`, `createdAt`, `updatedAt`.

Un test énumère ces clés et échoue si une septième paraît. `backend.md`
l'impose pour `/api/health` et la raison vaut ici : un champ ajouté par
mégarde — chemin, version, variable d'environnement — doit échouer avant
d'atteindre la production.

## `/api/sante`

Sert la sonde de `contracts/persistance.md`. Rend `200` et un corps minimal
quand le service est debout. Ne porte **ni** identité de build, **ni** compte
de listes : la route est publique et sans cloisonnement.

## Limitation de débit

Par identifiant de liste, en mémoire. Le seuil et la fenêtre sont écrits dans
le code, pas devinés par l'appelant : dépasser rend `429`.

Elle est due dès la première mise en ligne publique, pas après —
`PRODUCT.md` § « Données personnelles ».

## Purge

Une liste sans accès depuis 24 h est effacée. Conséquence directe de l'état en
mémoire (D3), et non un mécanisme ajouté par-dessus.

## Origine autorisée

Le service répond aux requêtes du site, et à lui seul. L'origine vient de la
configuration, jamais d'une valeur écrite en dur, et le site doit de son côté
nommer celle du service dans `connect-src` (D7).
