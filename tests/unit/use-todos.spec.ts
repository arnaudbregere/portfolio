import { describe, expect, it, vi } from 'vitest'
import { useTodos } from '~/composables/useTodos'
import { createBrowserStore } from '~/adapters/browser-store'
import type { TodoStore } from '~/adapters/todo-store'
import { refuse } from '~~/shared/todo/types'

/**
 * L'état de la démo, éprouvé **sans monter un composant**.
 *
 * `useTodos` ne connaît que le port : les tests lui passent donc un
 * adaptateur en mémoire, ou un port simulé quand il s'agit de provoquer une
 * panne. C'est la même discipline que `tests/unit/use-calculator.spec.ts`.
 */

const storage = (): Storage => {
  const map = new Map<string, string>()

  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => void map.delete(key),
    setItem: (key: string, value: string) => void map.set(key, value),
  }
}

const monter = async () => {
  const todos = useTodos(createBrowserStore(storage()))

  await todos.load()

  return todos
}

describe('useTodos', () => {
  it('charge les trois tâches d’exemple et compte celles qui restent', async () => {
    const todos = await monter()

    expect(todos.todos.value).toHaveLength(3)
    expect(todos.remaining.value).toBe(2)
  })

  it('ajoute une tâche et l’annonce', async () => {
    const todos = await monter()

    expect(await todos.add('Acheter du pain')).toBe(true)
    expect(todos.todos.value).toHaveLength(4)
    expect(todos.notice.value).toBe('Tâche ajoutée.')
    expect(todos.error.value).toBe('')
  })

  it('traduit un refus en message, sans rien ajouter', async () => {
    const todos = await monter()

    expect(await todos.add('   ')).toBe(false)
    expect(todos.todos.value).toHaveLength(3)
    expect(todos.error.value).toBe('Le titre est vide.')
  })

  it('cite la limite réelle quand le titre est trop long', async () => {
    const todos = await monter()

    await todos.add('a'.repeat(121))

    expect(todos.error.value).toContain('120')
  })

  it('bascule l’état fait et met le compte à jour', async () => {
    const todos = await monter()
    const cible = todos.todos.value[0]!

    await todos.toggle(cible)

    expect(todos.todos.value.find(({ id }) => id === cible.id)?.done).toBe(true)
    expect(todos.remaining.value).toBe(1)
  })

  it('filtre sans toucher à la liste', async () => {
    const todos = await monter()

    todos.setFilter('done')

    expect(todos.visible.value).toHaveLength(1)
    expect(todos.todos.value).toHaveLength(3)

    todos.setFilter('active')

    expect(todos.visible.value).toHaveLength(2)
  })

  /**
   * Le filtre qui ne laisse rien est un cas limite nommé par la
   * spécification : il doit se distinguer d'une liste réellement vide. Ici la
   * distinction est lisible — `visible` est vide, `todos` ne l'est pas — et
   * c'est ce qui permettra au gabarit de dire lequel des deux.
   */
  it('laisse la distinction entre « rien pour ce filtre » et « rien du tout »', async () => {
    const todos = await monter()

    // `patch` et non `toggle` : l'un des exemples est déjà fait, et le
    // basculer le rendrait à faire. Ce qu'on veut ici, c'est « tout fait ».
    for (const todo of [...todos.todos.value]) await todos.patch(todo.id, { done: true })

    todos.setFilter('active')

    expect(todos.visible.value).toHaveLength(0)
    expect(todos.todos.value).toHaveLength(3)
  })

  it('supprime, puis annule, et la tâche revient à sa place', async () => {
    const todos = await monter()
    const avant = todos.todos.value.map(({ id }) => id)
    const cible = todos.todos.value[2]!

    await todos.remove(cible)

    expect(todos.todos.value).toHaveLength(2)
    expect(todos.undoable.value?.todo.id).toBe(cible.id)
    expect(todos.notice.value).toContain(cible.title)

    await todos.undo()

    expect(todos.todos.value.map(({ id }) => id)).toEqual(avant)
    expect(todos.undoable.value).toBeNull()
  })

  /**
   * Pas de minuteur : le rattrapage reste tant que le visiteur n'a rien fait
   * d'autre, et disparaît à l'action suivante. `DESIGN.md` § 5. Un minuteur
   * serait injoignable au clavier et perdu pour un lecteur d'écran qui lit
   * l'annonce.
   */
  it('chasse l’annulation à l’action suivante, et non après un délai', async () => {
    const todos = await monter()

    await todos.remove(todos.todos.value[0]!)

    expect(todos.undoable.value).not.toBeNull()

    await todos.add('Acheter du pain')

    expect(todos.undoable.value).toBeNull()
    expect(await todos.undo()).toBe(false)
  })

  it('réinitialise à l’état d’arrivée', async () => {
    const todos = await monter()

    await todos.add('Acheter du pain')
    await todos.remove(todos.todos.value[1]!)
    await todos.reset()

    expect(todos.todos.value).toHaveLength(3)
    expect(todos.todos.value.map(({ title }) => title)).not.toContain('Acheter du pain')
    expect(todos.remaining.value).toBe(2)
  })

  /**
   * **Un refus et une panne ne se traitent pas pareil.** Le premier est une
   * valeur du domaine et nomme un champ ; la seconde vient du transport et
   * n'a rien à dire d'un champ. Les deux chemins existent dans `useTodos`, et
   * nulle part ailleurs.
   */
  it('distingue une panne de transport d’un refus du domaine', async () => {
    const enPanne: TodoStore = {
      list: async () => [],
      create: async () => {
        throw new Error('réseau coupé')
      },
      read: async () => refuse('tache-introuvable'),
      update: async () => refuse('tache-introuvable'),
      remove: async () => refuse('tache-introuvable'),
      restore: async () => refuse('tache-introuvable'),
      available: async () => false,
      status: () => ({ persistent: true, notice: '' }),
    }

    const todos = useTodos(enPanne)

    await todos.load()

    expect(await todos.add('Acheter du pain')).toBe(false)
    expect(todos.error.value).toBe('La source de données n’a pas répondu.')
  })

  it('n’appelle jamais le stockage directement', async () => {
    const espion = vi.fn(async () => [])
    const port: TodoStore = {
      list: espion,
      create: async () => refuse('titre-vide'),
      read: async () => refuse('tache-introuvable'),
      update: async () => refuse('tache-introuvable'),
      remove: async () => refuse('tache-introuvable'),
      restore: async () => refuse('tache-introuvable'),
      available: async () => true,
      status: () => ({ persistent: true, notice: '' }),
    }

    await useTodos(port).load()

    expect(espion).toHaveBeenCalledTimes(1)
  })
})
