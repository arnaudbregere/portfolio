import type { Todo, TodoFilter } from '~~/shared/todo/types'
import type { TodoPatch } from '~~/shared/todo/domain'
import { countRemaining, filterTodos } from '~~/shared/todo/domain'
import { refusalMessage } from '~~/shared/todo/validation'
import { exampleTodos } from '~~/shared/todo/examples'
import type { TodoStore } from '~/adapters/todo-store'

/**
 * L'état de la démo de liste de tâches.
 *
 * Il ne connaît **que le port** — jamais le `localStorage`, jamais `fetch`.
 * C'est ce qui permettra au sélecteur de source de changer d'adaptateur sans
 * qu'une ligne d'ici bouge, et c'est la seule chose que la démo est là pour
 * prouver.
 *
 * Le composant porte le rendu, ce composable porte la logique :
 * `.claude/rules/frontend.md`. `useCalculator` tient le même contrat pour la
 * calculatrice.
 */

/** Une suppression qu'on peut encore défaire. */
type Undoable = { todo: Todo; message: string }

/**
 * La source est reçue en **fonction** et non en valeur : le sélecteur en
 * change à chaud, et un port capturé une fois pour toutes obligerait à
 * remonter le composable — donc à perdre le filtre, le focus et le message en
 * cours. Chaque opération demande la source du moment.
 */
export const useTodos = (source: TodoStore | (() => TodoStore)) => {
  const store = (): TodoStore => (typeof source === 'function' ? source() : source)

  const todos = ref<Todo[]>([])
  const filter = ref<TodoFilter>('all')
  const error = ref('')
  const notice = ref('')
  const undoable = ref<Undoable | null>(null)
  const busy = ref(false)

  const visible = computed(() => filterTodos(todos.value, filter.value))
  const remaining = computed(() => countRemaining(todos.value))

  /**
   * Toute action chasse le message d'annulation.
   *
   * C'est la contrepartie de l'absence de minuteur, décidée dans
   * `DESIGN.md` § 5 : le rattrapage reste tant que le visiteur n'a rien fait
   * d'autre, et pas une seconde de plus. Un minuteur, lui, serait injoignable
   * au clavier et perdu pour un lecteur d'écran qui lit l'annonce.
   */
  const clearTransient = () => {
    error.value = ''
    undoable.value = null
  }

  const refresh = async () => {
    todos.value = await store().list()
  }

  const load = async () => {
    busy.value = true

    try {
      await refresh()
    } finally {
      busy.value = false
    }
  }

  /**
   * Exécute une opération du port et traduit son refus en message.
   *
   * Un refus est une **valeur** et s'affiche près du champ ; une panne de
   * transport est une exception et s'affiche comme telle. Les deux chemins
   * sont distincts ici, et nulle part ailleurs.
   */
  const run = async <T>(
    operation: () => Promise<{ ok: true; value: T } | { ok: false; refusal: keyof typeof refusalMessage }>,
    onSuccess: (value: T) => void | Promise<void>,
  ): Promise<boolean> => {
    busy.value = true

    try {
      const result = await operation()

      if (!result.ok) {
        error.value = refusalMessage[result.refusal]

        return false
      }

      await onSuccess(result.value)

      return true
    } catch {
      error.value = 'La source de données n’a pas répondu.'

      return false
    } finally {
      busy.value = false
    }
  }

  const add = async (title: string, priority?: string) => {
    clearTransient()

    return run(
      () => store().create({ title, priority }),
      async () => {
        await refresh()
        notice.value = 'Tâche ajoutée.'
      },
    )
  }

  const patch = async (id: string, changes: TodoPatch) => {
    clearTransient()

    return run(
      () => store().update(id, changes),
      async () => {
        await refresh()
        notice.value = 'Tâche modifiée.'
      },
    )
  }

  const toggle = async (todo: Todo) => patch(todo.id, { done: !todo.done })

  const remove = async (todo: Todo) => {
    clearTransient()

    return run(
      () => store().remove(todo.id),
      (rest) => {
        todos.value = rest
        undoable.value = { todo, message: `« ${todo.title} » a été supprimée.` }
        notice.value = undoable.value.message
      },
    )
  }

  /**
   * Défait la dernière suppression.
   *
   * La tâche revient avec son identifiant et ses horodatages d'origine, donc
   * à sa place dans le tri. Elle n'est pas recréée — c'est tout l'objet de
   * l'opération `restore` du port.
   */
  const undo = async () => {
    const pending = undoable.value

    if (!pending) return false

    undoable.value = null

    return run(
      () => store().restore(pending.todo),
      (rest) => {
        todos.value = rest
        notice.value = 'Suppression annulée.'
      },
    )
  }

  /** Ramène les trois tâches d'arrivée, et efface tout le reste. */
  const reset = async () => {
    clearTransient()
    busy.value = true

    try {
      const current = await store().list()

      for (const todo of current) await store().remove(todo.id)
      for (const todo of exampleTodos) await store().restore(todo)

      await refresh()
      notice.value = 'Démo réinitialisée.'
    } finally {
      busy.value = false
    }
  }

  const setFilter = (next: TodoFilter) => {
    filter.value = next
  }

  return {
    todos,
    visible,
    remaining,
    filter,
    error,
    notice,
    undoable,
    busy,
    load,
    add,
    patch,
    toggle,
    remove,
    undo,
    reset,
    setFilter,
  }
}
