import { exampleTodos } from '~~/shared/todo/examples'
import { type Result, type Todo, ok } from '~~/shared/todo/types'
import {
  type TodoDraft,
  type TodoPatch,
  createTodo,
  removeTodo,
  replaceTodo,
  restoreTodo,
  sortTodos,
  updateTodo,
} from '~~/shared/todo/domain'
import { findTodo } from '~~/shared/todo/validation'
import type { TodoStore, TodoStoreStatus } from './todo-store'

/**
 * L'adaptateur par défaut : le `localStorage` du visiteur.
 *
 * Il tient FR-014 — la démo se joue **entièrement sans réseau** — et c'est ce
 * qui permet à la page d'être prérendue comme les sept autres, de ne demander
 * aucune route au site, et de rester jouable quand le service dort.
 *
 * Rien n'en sort. `PRODUCT.md` § « Données personnelles » : les tâches saisies
 * n'atteignent ni le site, ni un journal, ni l'API tant que le visiteur ne l'a
 * pas demandé.
 */

/** Une seule clé, portant son numéro de format. */
export const STORAGE_KEY = 'portfolio-todo-list'

/**
 * Le numéro de format.
 *
 * Il monte le jour où la forme stockée change. Un contenu d'une version
 * inconnue est **écarté sans erreur** plutôt que migré : trois tâches
 * d'exemple ne valent pas un code de migration, et un code de migration qui
 * ne sert jamais est du code mort.
 */
export const STORAGE_VERSION = 1

type Stored = { version: number; todos: Todo[] }

/**
 * Ce que l'adaptateur sait de son stockage.
 *
 * Trois états, et non deux : le stockage répond ; il lève — navigation
 * privée, stockage bloqué par la configuration — ; il répond mais ne portait
 * rien de lisible. Le troisième n'est pas une panne, c'est une première
 * visite.
 */
export type BrowserStoreState = {
  status: TodoStoreStatus
  /** Vrai quand un contenu a été écarté, pour que l'interface puisse le dire. */
  discarded: boolean
}

const isTodo = (value: unknown): value is Todo => {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.done === 'boolean' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    (candidate.priority === 'low' ||
      candidate.priority === 'medium' ||
      candidate.priority === 'high')
  )
}

/**
 * L'adaptateur, construit autour d'un stockage **injecté**.
 *
 * Le paramètre existe pour les tests, qui lui passent un stockage qui lève ou
 * qui rend n'importe quoi. En production, l'appelant lui donne
 * `window.localStorage`.
 */
export const createBrowserStore = (
  storage: Storage | null,
): TodoStore & { state: () => BrowserStoreState } => {
  const state: BrowserStoreState = {
    status: { usable: true, reason: '' },
    discarded: false,
  }

  const unusable = (reason: string) => {
    state.status = { usable: false, reason }
  }

  /** Mémoire de repli : sans stockage, la session reste jouable. */
  let memory: Todo[] = sortTodos(exampleTodos)
  let loaded = false

  const persist = () => {
    if (!storage || !state.status.usable) return

    try {
      const payload: Stored = { version: STORAGE_VERSION, todos: memory }

      storage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Un stockage qui accepte la lecture peut refuser l'écriture — quota
      // atteint, mode restreint. La session continue, et le visiteur est
      // prévenu une fois.
      unusable('Votre navigateur n’autorise pas l’enregistrement : cette liste ne sera pas retenue.')
    }
  }

  const load = () => {
    if (loaded) return

    loaded = true

    if (!storage) {
      unusable('Votre navigateur n’autorise pas l’enregistrement : cette liste ne sera pas retenue.')

      return
    }

    let raw: string | null

    try {
      raw = storage.getItem(STORAGE_KEY)
    } catch {
      // En navigation privée, l'accès lui-même lève : ce n'est pas une
      // absence de donnée, c'est un refus d'accès.
      unusable('Votre navigateur n’autorise pas l’enregistrement : cette liste ne sera pas retenue.')

      return
    }

    if (raw === null) {
      persist()

      return
    }

    try {
      const parsed = JSON.parse(raw) as Partial<Stored>

      if (parsed?.version !== STORAGE_VERSION || !Array.isArray(parsed.todos)) {
        throw new Error('format inconnu')
      }

      if (!parsed.todos.every(isTodo)) throw new Error('tâche mal formée')

      memory = sortTodos(parsed.todos)
    } catch {
      // Contenu illisible, version inconnue, tâche mal formée : on repart des
      // exemples plutôt que d'échouer, et l'interface le dit. Une démo qui
      // refuse de s'ouvrir vaut moins qu'une démo qui recommence.
      state.discarded = true
      memory = sortTodos(exampleTodos)
      persist()
    }
  }

  const commit = (todos: Todo[]): Todo[] => {
    memory = todos
    persist()

    return memory
  }

  return {
    state: () => state,

    available: async () => {
      load()

      return true
    },

    list: async () => {
      load()

      return memory
    },

    create: async (draft: TodoDraft) => {
      load()

      const created = createTodo(draft, { id: crypto.randomUUID(), now: new Date().toISOString() })

      if (!created.ok) return created

      commit(sortTodos([...memory, created.value]))

      return created
    },

    read: async (id: string) => {
      load()

      return findTodo(memory, id)
    },

    update: async (id: string, patch: TodoPatch) => {
      load()

      const found = findTodo(memory, id)

      if (!found.ok) return found

      const updated = updateTodo(found.value, patch, new Date().toISOString())

      if (!updated.ok) return updated

      commit(replaceTodo(memory, updated.value))

      return updated
    },

    remove: async (id: string): Promise<Result<Todo[]>> => {
      load()

      return ok(commit(removeTodo(memory, id)))
    },

    restore: async (todo: Todo): Promise<Result<Todo[]>> => {
      load()

      return ok(commit(restoreTodo(memory, todo)))
    },
  }
}
