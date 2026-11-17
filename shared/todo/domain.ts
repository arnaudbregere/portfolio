import {
  type Priority,
  type Result,
  type Todo,
  type TodoFilter,
  ok,
} from './types.ts'
import { checkPriority, checkTitle, readDone } from './validation.ts'

/**
 * Les opérations de la liste de tâches : créer, modifier, basculer, trier,
 * filtrer. Rien d'autre.
 *
 * **Aucune fonction d'ici n'appelle `crypto.randomUUID()` ni `Date.now()`.**
 * L'identifiant et l'horodatage arrivent en paramètres. C'est ce qui permet à
 * un test d'affirmer une valeur plutôt que d'en vérifier la forme, et à un
 * test de purge de vieillir une liste sans attendre vingt-quatre heures.
 *
 * Le domaine ne connaît ni le rendu, ni le réseau, ni le stockage. C'est la
 * même discipline que `app/composables/useCalculator.ts`, dont la machine à
 * états ne sait rien de la calculatrice qui l'affiche.
 */

/** Ce qu'il faut au domaine pour dater et nommer une tâche. */
export type Stamp = {
  /** Identifiant opaque, tiré par l'appelant. */
  id: string
  /** Horodatage ISO 8601, lu par l'appelant. */
  now: string
}

/** Ce qu'une création accepte. Tout le reste appartient au domaine. */
export type TodoDraft = {
  title: unknown
  priority?: unknown
}

/** Ce qu'une modification accepte. Au moins un champ, sinon rien ne change. */
export type TodoPatch = {
  title?: unknown
  priority?: unknown
  done?: unknown
}

/**
 * Crée une tâche, ou refuse.
 *
 * `done` vaut toujours `false` : une tâche ne naît pas faite. `updatedAt`
 * vaut `createdAt`, et non une chaîne vide — une date absente obligerait
 * chaque lecteur à traiter le cas.
 */
export const createTodo = (draft: TodoDraft, stamp: Stamp): Result<Todo> => {
  const title = checkTitle(draft.title)

  if (!title.ok) return title

  const priority = checkPriority(draft.priority)

  if (!priority.ok) return priority

  return ok({
    id: stamp.id,
    title: title.value,
    done: false,
    priority: priority.value,
    createdAt: stamp.now,
    updatedAt: stamp.now,
  })
}

/**
 * Applique une modification, ou refuse.
 *
 * Un champ absent ne change rien ; un champ présent et invalide refuse tout.
 * `updatedAt` bouge **même quand la valeur posée est identique** : le
 * visiteur a agi, et l'horodatage dit la dernière action, pas la dernière
 * différence.
 *
 * `id` et `createdAt` ne sont jamais touchés — ils ne figurent pas dans
 * `TodoPatch`, et c'est le type qui l'interdit plutôt qu'un commentaire.
 */
export const updateTodo = (todo: Todo, patch: TodoPatch, now: string): Result<Todo> => {
  const next: Todo = { ...todo, updatedAt: now }

  if (patch.title !== undefined) {
    const title = checkTitle(patch.title)

    if (!title.ok) return title

    next.title = title.value
  }

  if (patch.priority !== undefined) {
    const priority = checkPriority(patch.priority)

    if (!priority.ok) return priority

    next.priority = priority.value
  }

  const done = readDone(patch.done)

  if (done !== undefined) next.done = done

  return ok(next)
}

/** Bascule l'état fait. Le seul axe d'état du modèle, et il va dans les deux sens. */
export const toggleTodo = (todo: Todo, now: string): Todo => ({
  ...todo,
  done: !todo.done,
  updatedAt: now,
})

/**
 * De la plus récemment créée à la plus ancienne.
 *
 * Le tri appartient au domaine et non au gabarit : les deux sources doivent
 * rendre le même ordre (FR-020), et un tri fait à l'affichage ne vaudrait que
 * pour le front.
 *
 * `createdAt` peut être identique pour deux tâches — deux créations dans la
 * même milliseconde, ce qu'un test fait sans effort. L'identifiant tranche
 * alors, pour que l'ordre soit **total** : deux appels sur la même liste
 * doivent rendre la même suite, sinon la liste tremble à chaque rendu.
 */
export const sortTodos = (todos: readonly Todo[]): Todo[] =>
  [...todos].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))

/** La vue demandée. Le filtre ne trie pas : il tamise ce que `sortTodos` a rangé. */
export const filterTodos = (todos: readonly Todo[], filter: TodoFilter): Todo[] =>
  filter === 'all' ? [...todos] : todos.filter((todo) => todo.done === (filter === 'done'))

/** Le nombre de tâches restant à faire, qui est annoncé en permanence (FR-009). */
export const countRemaining = (todos: readonly Todo[]): number =>
  todos.filter((todo) => !todo.done).length

/**
 * Remet une tâche supprimée à sa place.
 *
 * Elle reprend son `id`, son `createdAt` et son `updatedAt` : l'annulation
 * **défait** la suppression, elle ne recrée pas une tâche. Sans cela, le tri
 * par date de création la ferait réapparaître ailleurs que là où le visiteur
 * l'a vue disparaître.
 */
export const restoreTodo = (todos: readonly Todo[], todo: Todo): Todo[] =>
  sortTodos([...todos, todo])

/** Retire une tâche. L'absence n'est pas une panne : la liste rendue est la même. */
export const removeTodo = (todos: readonly Todo[], id: string): Todo[] =>
  todos.filter((todo) => todo.id !== id)

/** Remplace une tâche par sa version modifiée, à sa place. */
export const replaceTodo = (todos: readonly Todo[], todo: Todo): Todo[] =>
  todos.map((current) => (current.id === todo.id ? todo : current))

/** Les priorités d'affichage, nommées en français pour l'écran. */
export const priorityLabel: Record<Priority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
}
