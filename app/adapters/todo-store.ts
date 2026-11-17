import type { Result, Todo } from '~~/shared/todo/types'
import type { TodoDraft, TodoPatch } from '~~/shared/todo/domain'

/**
 * Le port de persistance : **tout ce que l'interface connaît d'une source de
 * données**.
 *
 * Deux implémentations le remplissent — le stockage du navigateur et le
 * service HTTP —, et la démo est là pour montrer qu'une même logique métier
 * les sert toutes les deux. `specs/001-todo-list/contracts/persistance.md`
 * porte le contrat.
 *
 * **Tout est asynchrone**, y compris côté navigateur, où rien ne l'est. Sans
 * cela, l'appelant devrait savoir à qui il parle — et c'est précisément ce
 * que le port existe pour lui épargner.
 *
 * **Un refus est une valeur rendue**, nommée par les codes de
 * `shared/todo/types.ts`. Une panne de transport — réseau coupé, stockage qui
 * refuse de répondre — reste une exception : elle ne vient pas du domaine, et
 * l'appelant la traite autrement.
 */
export type TodoStore = {
  /** Les tâches, déjà triées par le domaine. */
  list: () => Promise<Todo[]>

  create: (draft: TodoDraft) => Promise<Result<Todo>>

  read: (id: string) => Promise<Result<Todo>>

  update: (id: string, patch: TodoPatch) => Promise<Result<Todo>>

  /** Rend la liste après retrait. L'absence n'est pas une panne. */
  remove: (id: string) => Promise<Result<Todo[]>>

  /**
   * Remet une tâche supprimée **telle qu'elle était**, identifiant et
   * horodatages compris.
   *
   * Ce n'est pas un `create` : l'annulation défait, elle ne recrée pas. Une
   * recréation daterait la tâche de maintenant et la ferait remonter en tête
   * de liste, alors que le visiteur l'a vue disparaître d'ailleurs.
   *
   * C'est la seule opération du port qui n'a pas de verbe CRUD. Elle est née
   * de l'exigence FR-007, et la découverte a eu lieu en écrivant
   * l'adaptateur : sans elle, « Annuler » est un mensonge dès que la source
   * est distante.
   */
  restore: (todo: Todo) => Promise<Result<Todo[]>>

  /**
   * La source répond-elle ?
   *
   * **Ne lève jamais.** Son résultat commande l'activation de l'option
   * correspondante, et un `false` désactive l'option avec sa raison écrite —
   * il ne bascule jamais la source (FR-016).
   */
  available: () => Promise<boolean>
}

/** Ce qu'une source sait dire d'elle-même quand elle refuse de servir. */
export type TodoStoreStatus = {
  usable: boolean
  /** Phrase affichable, vide quand la source répond. */
  reason: string
}
