# Feature Specification: Liste de tâches — démo jouable et CRUD

**Feature Branch**: `feat/todo-list`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: « Démo "liste de tâches" sur `/projets/todo-list`, et son CRUD dans un paquet `api/`. Cinq lots : domaine pur, port de persistance et ses deux adaptateurs, API Node/Express 5 en TypeScript en trois couches, front Nuxt en Atomic Design, fiche projet. Modèle : `id`, `title`, `done`, `priority`, `createdAt`, `updatedAt`. »

Le cadrage est déjà opposable et **ne se rouvre pas ici** : `PRODUCT.md`
(route, projet retenu n° 4, « Données personnelles », paquet `api/` en
TypeScript sans étape de build) et `DESIGN.md` § 5, sous-sections « La démo de
liste de tâches » et « Ce que `/impeccable shape` a tranché le 17/11/2026 ».
Cette spécification décrit ce que le visiteur obtient ; elle ne redécide ni la
forme ni la pile.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Jouer la liste sans rien installer ni attendre (Priority: P1)

Un recruteur ouvre `/projets/todo-list` et veut se faire une idée en deux
minutes. La page lui présente trois tâches d'exemple, dont une faite. Il en
ajoute une, en coche une autre, filtre sur « À faire », en supprime une, se
ravise et annule. Rien ne part sur un réseau : tout vit dans son navigateur.

**Why this priority**: c'est la démo elle-même. Livrée seule, la page tient
debout, se joue et prouve le soin d'exécution. Les deux autres histoires n'ont
d'intérêt que posées dessus.

**Independent Test**: ouvrir la page hors ligne, enchaîner ajout, bascule,
filtre, suppression, annulation, réinitialisation. La valeur est entière sans
qu'aucune API existe.

**Acceptance Scenarios**:

1. **Given** un visiteur qui n'a jamais ouvert la page, **When** elle s'affiche, **Then** trois tâches d'exemple sont listées, dont une faite, et les trois priorités sont visibles.
2. **Given** la liste affichée, **When** le visiteur saisit un titre et valide, **Then** la tâche paraît en tête de liste, le champ se vide et garde le focus.
3. **Given** une tâche à faire, **When** le visiteur coche sa case, **Then** la tâche est marquée faite, son libellé est barré, et le compte des tâches restantes diminue.
4. **Given** une liste mêlant tâches faites et à faire, **When** le visiteur choisit « À faire », **Then** seules les tâches non faites restent affichées, et le choix actif est annoncé.
5. **Given** une tâche quelconque, **When** le visiteur la supprime, **Then** elle disparaît, un message annonce la suppression et propose de l'annuler.
6. **Given** une suppression annoncée, **When** le visiteur active « Annuler », **Then** la tâche revient à sa place, avec son état et sa priorité d'avant.
7. **Given** une liste modifiée, **When** le visiteur recharge la page, **Then** il retrouve exactement l'état qu'il avait laissé.
8. **Given** une liste modifiée, **When** le visiteur active « Réinitialiser », **Then** les trois tâches d'exemple reviennent et tout le reste est effacé.

---

### User Story 2 — Corriger une tâche sans quitter la liste (Priority: P2)

Le visiteur s'est trompé de libellé, ou veut hausser la priorité d'une tâche.
Il ouvre le mode d'édition de la ligne, change le titre, la priorité, ou les
deux, puis enregistre — ou abandonne.

**Why this priority**: c'est le `U` du CRUD, et la seule façon d'exercer la
mise à jour depuis l'interface. Sans elle, l'API aurait une opération que rien
n'appelle.

**Independent Test**: ouvrir le mode d'édition d'une ligne, modifier les deux
champs, enregistrer ; recommencer et abandonner. Se teste sans l'histoire 3.

**Acceptance Scenarios**:

1. **Given** une tâche affichée, **When** le visiteur ouvre son mode d'édition, **Then** un champ porte le titre courant, une liste déroulante porte la priorité courante, et le focus est dans le champ.
2. **Given** un mode d'édition ouvert, **When** le visiteur modifie le titre et enregistre, **Then** la ligne reprend sa forme de lecture avec le nouveau titre, et le focus revient sur le déclencheur du mode.
3. **Given** un mode d'édition ouvert, **When** le visiteur change la priorité et enregistre, **Then** l'étiquette de priorité de la ligne porte la nouvelle valeur.
4. **Given** un mode d'édition ouvert avec des modifications, **When** le visiteur annule, **Then** la ligne retrouve ses valeurs d'avant, et le focus revient sur le déclencheur.
5. **Given** un mode d'édition ouvert, **When** une autre ligne ouvre le sien, **Then** le premier se ferme sans enregistrer.
6. **Given** un mode d'édition ouvert, **When** le visiteur vide le titre et enregistre, **Then** l'enregistrement est refusé, un message explique pourquoi, et le mode reste ouvert.

---

### User Story 3 — Voir la même liste servie par deux sources (Priority: P3)

Le visiteur bascule la source de données de « Navigateur » à « API ». La liste
se recharge depuis le service distant ; les mêmes gestes produisent les mêmes
résultats. Quand le service ne répond pas, l'option est désactivée et la raison
est écrite.

**Why this priority**: c'est ce que la fiche prétend démontrer — une logique
métier unique, deux adaptateurs de persistance. Mais la page reste utile et
complète sans elle, et elle dépend d'un service déployé.

**Independent Test**: avec le service joignable, basculer et vérifier que les
opérations aboutissent ; avec le service arrêté, vérifier que l'option est
refusée avec son motif.

**Acceptance Scenarios**:

1. **Given** le service joignable, **When** le visiteur choisit « API », **Then** la liste affichée provient du service, et le choix actif est annoncé.
2. **Given** la source « API » active, **When** le visiteur ajoute, coche, modifie ou supprime une tâche, **Then** l'opération est conservée par le service et survit à un rechargement de la page.
3. **Given** le service injoignable, **When** la page s'affiche, **Then** l'option « API » est désactivée et porte la raison en clair, et la source « Navigateur » reste active.
4. **Given** la source « API » active, **When** une opération échoue, **Then** un message l'annonce, l'affichage revient à l'état confirmé par le service, et aucun repli silencieux ne se produit.
5. **Given** un passage d'une source à l'autre, **When** la bascule a lieu, **Then** les données de la source quittée restent intactes.

---

### Edge Cases

- **Titre vide ou fait d'espaces** : refusé, avec un message rattaché au champ. Le focus reste dans le champ.
- **Titre plus long que la limite** : refusé, le message indique la limite et la longueur atteinte.
- **Titre en doublon** : accepté. Deux tâches peuvent porter le même libellé — une liste de tâches n'est pas un index.
- **Liste vide après suppression de tout** : la page affiche une invitation à saisir, et le champ garde le focus.
- **Filtre actif qui ne laisse rien** : l'absence est annoncée pour ce filtre-là, et se distingue d'une liste réellement vide.
- **Stockage du navigateur indisponible** (navigation privée, stockage bloqué) : la page reste jouable pour la session, et dit que rien ne sera retenu.
- **Stockage du navigateur illisible ou corrompu** : la page repart des trois tâches d'exemple plutôt que d'échouer, et le dit.
- **Grand nombre de tâches** : au-delà de cent, l'ajout reste immédiat et le défilement reste fluide.
- **Service lent** : l'attente est visible, et les commandes concernées sont neutralisées le temps de la réponse.
- **Suppression annulée après une autre action** : le message d'annulation ne survit pas à l'action suivante.
- **Mode d'édition ouvert au moment d'un changement de source** : il se ferme sans enregistrer.

## Requirements *(mandatory)*

### Functional Requirements

#### Liste et tâches

- **FR-001**: La page MUST afficher, à la première visite, trois tâches d'exemple dont une faite, couvrant les trois priorités.
- **FR-002**: Le visiteur MUST pouvoir ajouter une tâche en saisissant un titre et en validant, au clavier seul comme à la souris.
- **FR-003**: Le système MUST refuser un titre vide, fait uniquement d'espaces, ou dépassant 120 caractères, et MUST expliquer le refus à côté du champ concerné.
- **FR-004**: Le système MUST retirer les espaces de début et de fin d'un titre avant de l'enregistrer.
- **FR-005**: Le visiteur MUST pouvoir basculer une tâche entre « à faire » et « faite » en un seul geste.
- **FR-006**: Le visiteur MUST pouvoir modifier le titre et la priorité d'une tâche existante dans un même mode d'édition, et abandonner sans enregistrer.
- **FR-007**: Le visiteur MUST pouvoir supprimer une tâche, et MUST pouvoir annuler cette suppression tant qu'aucune autre action n'a eu lieu.
- **FR-008**: Le visiteur MUST pouvoir filtrer la liste sur « toutes », « à faire » ou « faites », une seule valeur à la fois.
- **FR-009**: Le système MUST afficher en permanence le nombre de tâches et le nombre de tâches restantes.
- **FR-010**: Le système MUST présenter les tâches de la plus récemment créée à la plus ancienne.
- **FR-011**: Le visiteur MUST pouvoir réinitialiser la démo à son état d'arrivée.
- **FR-012**: Le système MUST conserver l'horodatage de création et celui de dernière modification de chaque tâche, et MUST les poser lui-même — jamais depuis une valeur fournie par le client.

#### Persistance et sources

- **FR-013**: Le système MUST retenir l'état de la liste entre deux visites, sans compte ni authentification.
- **FR-014**: Le système MUST fonctionner entièrement sans réseau avec la source par défaut.
- **FR-015**: Le visiteur MUST pouvoir choisir la source de données entre le stockage du navigateur et le service distant, une seule à la fois.
- **FR-016**: Le système MUST désactiver l'option « service distant » et en écrire la raison lorsque le service ne répond pas, et MUST NOT basculer silencieusement d'une source à l'autre.
- **FR-017**: Le service distant MUST offrir les cinq opérations : lister, créer, lire, modifier, supprimer.
- **FR-018**: Le service distant MUST valider toute entrée reçue selon les mêmes règles que l'interface, sans jamais faire confiance au client.
- **FR-019**: Le service distant MUST répondre par un message générique en cas d'erreur, et MUST NOT divulguer de détail d'infrastructure.
- **FR-020**: Les deux sources MUST produire le même résultat observable pour une même suite d'opérations.

#### Accessibilité et annonce

- **FR-021**: Toute la démo MUST être utilisable au clavier seul, y compris l'ouverture et la fermeture du mode d'édition.
- **FR-022**: Le système MUST annoncer par une région vivante l'ajout, la suppression, l'annulation, le changement de source et le nombre de tâches restantes.
- **FR-023**: Aucune information MUST NOT reposer sur la seule couleur : l'état « faite » et le choix actif d'un groupe se lisent sans elle.
- **FR-024**: Après la fermeture du mode d'édition ou la suppression d'une tâche, le focus MUST se poser sur un élément vivant et prévisible, jamais sur le document.
- **FR-025**: La page MUST passer un audit automatisé d'accessibilité sans violation critique ni sérieuse, dans les deux thèmes.

#### Fiche et référencement

- **FR-026**: La fiche MUST porter les six sections imposées à tout projet, et un résultat mesuré.
- **FR-027**: La page MUST être prérendue et indexable sans exécution de JavaScript, comme les sept autres pages du site.
- **FR-028**: La page MUST porter un `title` et une `description` qui lui sont propres, et rejoindre le plan du site.

### Key Entities

- **Tâche** : une chose à faire, portée par un identifiant, un titre, un état
  fait ou non, une priorité parmi trois — faible, moyenne, élevée —, une date
  de création et une date de dernière modification. Pas de description, pas
  d'échéance, pas de catégorie, pas de propriétaire.
- **Liste** : l'ensemble des tâches d'une source donnée. Elle n'a ni nom ni
  partage ; il n'en existe qu'une par source.
- **Source de données** : l'endroit où la liste est conservée — le navigateur
  du visiteur, ou le service distant. Exactement une est active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visiteur qui n'a jamais vu la page ajoute sa première tâche en moins de 15 secondes, sans lire d'explication.
- **SC-002**: Les six gestes de la démo — ajouter, cocher, modifier, filtrer, supprimer, annuler — s'enchaînent au clavier seul, sans souris, du début à la fin.
- **SC-003**: Aucune violation critique ou sérieuse à l'audit d'accessibilité automatisé, sur la page entière, dans les deux thèmes.
- **SC-004**: Toutes les règles du domaine sont couvertes par des tests automatisés, cas limites compris — titre vide, titre d'espaces, dépassement de longueur, priorité inconnue, identifiant absent.
- **SC-005**: La page atteint le seuil de 95 sur les quatre catégories de l'audit de performance mobile, comme les sept autres pages du site.
- **SC-006**: La démo reste entièrement jouable avec le réseau coupé.
- **SC-007**: Une même suite de dix opérations donne le même état final sur les deux sources de données.
- **SC-008**: Une liste de cent tâches s'affiche et se filtre sans attente perceptible.

## Assumptions

- Le visiteur est un recruteur ou un pair technique, sur une page de
  candidature, et dispose de deux minutes. Il n'a ni compte ni intention de
  revenir gérer ses tâches.
- La démo est un bloc de la fiche projet, au même titre que celle de
  `/projets/calculatrice`, et non une application autonome.
- Les tâches saisies sont des données du visiteur qui ne quittent pas son
  navigateur tant qu'il n'a pas choisi la source distante. `PRODUCT.md`
  § « Données personnelles » le pose, et pose aussi les trois conditions dues
  avant toute instance publique du service : identifiant opaque cloisonnant
  les listes, limitation de débit, purge automatique.
- La limite de 120 caractères par titre est reprise du cadrage ; aucune limite
  n'est posée sur le nombre de tâches, mais la tenue est mesurée à cent.
- Le service distant peut être absent, arrêté ou endormi : c'est le cas
  nominal d'une instance gratuite, et l'interface doit le dire plutôt que de
  le masquer.
- L'identifiant d'une tâche est opaque pour l'interface : elle ne lui donne
  aucun sens et n'en dérive aucun affichage.

### Contraintes héritées, non rouvertes ici

Elles nomment une pile, ce qu'une spécification évite d'ordinaire. Elles sont
citées parce qu'elles sont **déjà tranchées et fusionnées**, non parce que
cette spécification les choisit.

- Route `/projets/todo-list`, démo jouable dans la fiche — `PRODUCT.md`.
- Le CRUD vit dans un paquet `api/` du dépôt, en TypeScript, sans étape de
  build, déployé à part — `PRODUCT.md`.
- Le site reste statique et prérendu ; `server/` garde ses trois routes —
  `.claude/rules/backend.md`.
- Composition, niveaux de contrôle, mode d'édition unique, `<select>` de
  priorité, état d'arrivée à trois tâches, option distante désactivée avec sa
  raison, annulation sans minuteur — `DESIGN.md` § 5.
- Anti-objectifs : pas de glisser-déposer, pas d'échéance, pas de catégorie,
  pas de compte, pas de notification à minuteur.
