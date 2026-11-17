import { describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  createBrowserStore,
} from '~/adapters/browser-store'
import { exampleTodos } from '~~/shared/todo/examples'

/**
 * Ce que l'adaptateur navigateur fait **quand le stockage ne coopère pas**.
 *
 * Trois situations, et aucune n'est hypothétique : la navigation privée fait
 * lever l'accès, un quota atteint fait lever l'écriture, et une clé écrite par
 * une version antérieure du format traîne dans le navigateur d'un visiteur
 * qui revient.
 *
 * La suite de scénarios du port (`todo-port.spec.ts`) ne les voit pas : elle
 * vérifie ce que **deux** implémentations ont en commun, et une panne de
 * stockage n'appartient qu'à celle-ci.
 */

const memoryStorage = (initial?: string): Storage => {
  const map = new Map<string, string>()

  if (initial !== undefined) map.set(STORAGE_KEY, initial)

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

const throwingStorage = (surLecture: boolean): Storage =>
  ({
    ...memoryStorage(),
    getItem: () => {
      if (surLecture) throw new DOMException('accès refusé', 'SecurityError')

      return null
    },
    setItem: () => {
      throw new DOMException('quota atteint', 'QuotaExceededError')
    },
  }) as Storage

describe('adaptateur navigateur — stockage indisponible', () => {
  /**
   * En navigation privée, `getItem` **lève** : ce n'est pas une absence de
   * donnée, c'est un refus d'accès. La démo doit rester jouable pour la
   * session — FR-014 ne souffre aucune exception — et le dire.
   */
  it('reste jouable quand la lecture lève, et annonce que rien ne sera retenu', async () => {
    const store = createBrowserStore(throwingStorage(true))

    expect(await store.list()).toHaveLength(3)
    expect(store.state().status.usable).toBe(false)
    expect(store.state().status.reason).toContain('ne sera pas retenue')

    const created = await store.create({ title: 'Acheter du pain' })

    expect(created.ok).toBe(true)
    expect(await store.list()).toHaveLength(4)
  })

  it('reste jouable quand l’écriture lève', async () => {
    const store = createBrowserStore(throwingStorage(false))

    expect((await store.create({ title: 'Acheter du pain' })).ok).toBe(true)
    expect(await store.list()).toHaveLength(4)
    expect(store.state().status.usable).toBe(false)
  })

  /** Aucun stockage du tout — rendu serveur, ou navigateur très ancien. */
  it('reste jouable sans stockage', async () => {
    const store = createBrowserStore(null)

    expect(await store.list()).toHaveLength(3)
    expect(store.state().status.usable).toBe(false)
  })

  it('répond `true` à la sonde malgré un stockage muet', async () => {
    const store = createBrowserStore(throwingStorage(true))

    // La source **est** utilisable : elle ne retiendra simplement rien. Un
    // `false` désactiverait l'unique source hors ligne de la démo.
    await expect(store.available()).resolves.toBe(true)
  })
})

describe('adaptateur navigateur — contenu écarté', () => {
  const casLimites: Array<[string, string]> = [
    ['illisible', '{ ceci n’est pas du JSON'],
    ['version inconnue', JSON.stringify({ version: 999, todos: [] })],
    ['version absente', JSON.stringify({ todos: [] })],
    ['tâches qui ne sont pas un tableau', JSON.stringify({ version: STORAGE_VERSION, todos: {} })],
    [
      'tâche mal formée',
      JSON.stringify({ version: STORAGE_VERSION, todos: [{ id: 'a', title: 'x' }] }),
    ],
    [
      'priorité inventée',
      JSON.stringify({
        version: STORAGE_VERSION,
        todos: [{ ...exampleTodos[0], priority: 'urgent' }],
      }),
    ],
  ]

  /**
   * Repartir des exemples plutôt qu'échouer : une démo qui refuse de s'ouvrir
   * vaut moins qu'une démo qui recommence. Le visiteur est prévenu, par
   * `discarded`.
   */
  it.each(casLimites)('repart des exemples quand le contenu est %s', async (_, brut) => {
    const store = createBrowserStore(memoryStorage(brut))

    expect(await store.list()).toHaveLength(3)
    expect(store.state().discarded).toBe(true)
  })

  it('réécrit un contenu sain après avoir écarté l’ancien', async () => {
    const storage = memoryStorage('{ cassé')
    const store = createBrowserStore(storage)

    await store.list()

    const relu = JSON.parse(storage.getItem(STORAGE_KEY)!) as { version: number }

    expect(relu.version).toBe(STORAGE_VERSION)
  })

  it('n’écarte rien quand le contenu est valide', async () => {
    const storage = memoryStorage(
      JSON.stringify({ version: STORAGE_VERSION, todos: [exampleTodos[0]] }),
    )
    const store = createBrowserStore(storage)

    expect(await store.list()).toHaveLength(1)
    expect(store.state().discarded).toBe(false)
  })

  it('retrouve l’état laissé par une visite précédente', async () => {
    const storage = memoryStorage()

    await createBrowserStore(storage).create({ title: 'Acheter du pain' })

    const seconde = createBrowserStore(storage)

    expect((await seconde.list()).map(({ title }) => title)).toContain('Acheter du pain')
  })
})
