import { beforeEach, describe, expect, it } from 'vitest'
import { createBrowserStore } from '~/adapters/browser-store'
import { createHttpStore } from '~/adapters/http'
import type { TodoStore } from '~/adapters/todo-store'
import type { Todo } from '~~/shared/todo/types'
import {
  createTodo,
  removeTodo,
  replaceTodo,
  restoreTodo,
  sortTodos,
  updateTodo,
} from '~~/shared/todo/domain'
import { findTodo } from '~~/shared/todo/validation'
import { exampleTodos } from '~~/shared/todo/examples'

/**
 * La suite de scénarios du **port**, et non d'une implémentation.
 *
 * Elle est écrite une fois et passée à chaque adaptateur. En phase 5,
 * l'adaptateur HTTP la rejouera telle quelle : c'est ainsi que FR-020 — « les
 * deux sources produisent le même résultat observable pour une même suite
 * d'opérations » — devient vérifiable plutôt qu'affirmé.
 *
 * Le jour où l'adaptateur HTTP la passe, la démo a prouvé ce qu'elle
 * prétend montrer. Avant ce jour, la fiche ne doit pas le prétendre.
 */

/** Un `localStorage` en mémoire, suffisant et sans navigateur. */
const fakeStorage = (): Storage => {
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

/**
 * Les scénarios, exprimés en opérations du port seulement.
 *
 * Aucun n'inspecte le stockage, le réseau ou le DOM : ce qui est vérifié est
 * ce qu'un appelant **observe**, et c'est la seule chose que les deux
 * implémentations se doivent d'avoir en commun.
 */
export const portScenarios = (nom: string, build: () => TodoStore) => {
  describe(`port de persistance — ${nom}`, () => {
    let store: TodoStore

    beforeEach(() => {
      store = build()
    })

    it('sert les trois tâches d’exemple à la première ouverture', async () => {
      const todos = await store.list()

      expect(todos).toHaveLength(3)
      expect(todos.map(({ title }) => title).sort()).toEqual(
        [...exampleTodos].map(({ title }) => title).sort(),
      )
    })

    it('rend la liste déjà triée, de la plus récente à la plus ancienne', async () => {
      const todos = await store.list()
      const dates = todos.map(({ createdAt }) => createdAt)

      expect([...dates].sort().reverse()).toEqual(dates)
    })

    it('ajoute une tâche en tête, avec ses valeurs par défaut', async () => {
      const created = await store.create({ title: '  Acheter du pain  ' })

      expect(created.ok).toBe(true)

      const todos = await store.list()

      expect(todos).toHaveLength(4)
      expect(todos[0]?.title).toBe('Acheter du pain')
      expect(todos[0]?.done).toBe(false)
      expect(todos[0]?.priority).toBe('medium')
    })

    it('refuse une création invalide sans toucher à la liste', async () => {
      const created = await store.create({ title: '   ' })

      expect(created).toEqual({ ok: false, refusal: 'titre-vide' })
      expect(await store.list()).toHaveLength(3)
    })

    it('refuse une priorité inconnue', async () => {
      expect(await store.create({ title: 'Relire', priority: 'urgent' })).toEqual({
        ok: false,
        refusal: 'priorite-inconnue',
      })
    })

    it('lit une tâche par son identifiant, et refuse un identifiant inconnu', async () => {
      const [first] = await store.list()

      expect(await store.read(first!.id)).toEqual({ ok: true, value: first })
      expect(await store.read('inconnue')).toEqual({
        ok: false,
        refusal: 'tache-introuvable',
      })
    })

    it('modifie le titre et la priorité, et date la modification', async () => {
      const [first] = await store.list()
      const updated = await store.update(first!.id, { title: 'Relu', priority: 'low' })

      expect(updated.ok && updated.value.title).toBe('Relu')
      expect(updated.ok && updated.value.priority).toBe('low')
      expect(updated.ok && updated.value.updatedAt >= first!.updatedAt).toBe(true)
      expect(updated.ok && updated.value.createdAt).toBe(first!.createdAt)
    })

    it('bascule l’état fait dans les deux sens', async () => {
      const [first] = await store.list()

      expect((await store.update(first!.id, { done: true })).ok).toBe(true)
      expect((await store.read(first!.id)) as { value: { done: boolean } }).toMatchObject({
        value: { done: true },
      })

      await store.update(first!.id, { done: false })

      expect((await store.read(first!.id)) as { value: { done: boolean } }).toMatchObject({
        value: { done: false },
      })
    })

    it('refuse une modification invalide sans rien changer', async () => {
      const [first] = await store.list()

      expect(await store.update(first!.id, { title: '' })).toEqual({
        ok: false,
        refusal: 'titre-vide',
      })
      expect((await store.read(first!.id)).ok && first!.title).toBe(first!.title)
    })

    it('refuse de modifier une tâche absente', async () => {
      expect(await store.update('inconnue', { done: true })).toEqual({
        ok: false,
        refusal: 'tache-introuvable',
      })
    })

    it('supprime une tâche et rend la liste restante', async () => {
      const [first] = await store.list()
      const rest = await store.remove(first!.id)

      expect(rest.ok && rest.value).toHaveLength(2)
      expect(await store.list()).toHaveLength(2)
    })

    it('tient la suppression d’une tâche absente pour un cas ordinaire', async () => {
      const rest = await store.remove('inconnue')

      expect(rest.ok && rest.value).toHaveLength(3)
    })

    /**
     * Le scénario qui justifie l'opération `restore` : la tâche revient **à sa
     * place**, avec son identifiant et ses horodatages. Recréée, elle
     * remonterait en tête, ailleurs que là où le visiteur l'a vue disparaître.
     */
    it('remet une tâche supprimée exactement où elle était', async () => {
      const avant = await store.list()
      const cible = avant[2]!

      await store.remove(cible.id)
      const apres = await store.restore(cible)

      expect(apres.ok && apres.value.map(({ id }) => id)).toEqual(
        avant.map(({ id }) => id),
      )
      expect(apres.ok && apres.value[2]).toEqual(cible)
    })

    it('répond à la sonde de disponibilité sans lever', async () => {
      await expect(store.available()).resolves.toBe(true)
    })

    /**
     * Dix opérations, un état final. C'est la forme sous laquelle FR-020 se
     * vérifie : non pas « les deux adaptateurs se ressemblent », mais « la
     * même suite donne le même observable ».
     */
    it('donne un état final déterminé après dix opérations', async () => {
      const depart = await store.list()

      await store.create({ title: 'Une', priority: 'high' })
      await store.create({ title: 'Deux' })
      await store.create({ title: 'Trois', priority: 'low' })
      await store.update(depart[0]!.id, { done: true })
      await store.update(depart[1]!.id, { title: 'Renommée' })
      await store.remove(depart[2]!.id)
      await store.restore(depart[2]!)
      await store.remove(depart[1]!.id)
      await store.create({ title: 'Quatre' })
      await store.update(depart[0]!.id, { priority: 'low' })

      const final = await store.list()

      // 3 au départ, + 4 créées, − 2 supprimées, + 1 restaurée.
      expect(final).toHaveLength(6)
      // `depart[0]`, basculée ici, et l'exemple déjà fait — supprimé puis
      // restauré, donc toujours fait : la restauration rend la tâche telle
      // qu'elle était, état compris.
      expect(final.filter(({ done }) => done)).toHaveLength(2)
      expect(final.map(({ title }) => title)).toContain('Quatre')
      expect(final.map(({ title }) => title)).not.toContain('Renommée')
      expect(final.find(({ id }) => id === depart[0]!.id)?.priority).toBe('low')
    })
  })
}

portScenarios('stockage du navigateur', () => createBrowserStore(fakeStorage()))

/**
 * Le même jeu de scénarios, rejoué contre l'adaptateur HTTP.
 *
 * **C'est la vérification de FR-020** : les deux sources produisent le même
 * résultat observable pour une même suite d'opérations. Jusqu'ici la fiche
 * l'affirmait ; à partir d'ici, la suite le prouve.
 *
 * Le service est simulé par un `fetch` de substitution et non monté : le
 * paquet `api/` est indépendant, et l'importer d'ici créerait la dépendance
 * croisée que `.claude/rules/e2e.md` et le plan écartent tous les deux. Ce que
 * cette suite vérifie est le port, pas Express — `api/tests/` tient le contrat
 * HTTP de son côté, route par route.
 */
const serviceSimule = (): typeof fetch => {
  let todos: Todo[] = [...exampleTodos]

  const json = (corps: unknown, status = 200) =>
    new Response(JSON.stringify(corps), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })

  const estampe = () => ({ id: crypto.randomUUID(), now: new Date().toISOString() })

  return (async (entree: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(entree), 'http://service.test')
    const methode = init?.method ?? 'GET'
    const corps = init?.body ? JSON.parse(String(init.body)) : {}

    if (url.pathname === '/api/sante') return json({ statut: 'ok' })

    /* Le dernier segment : vide pour la collection, l'identifiant sinon. */
    const segments = url.pathname.split('/').filter(Boolean)
    const id = segments.length > 4 ? decodeURIComponent(segments[4]!) : null

    if (!id) {
      if (methode === 'GET') return json(sortTodos(todos))

      const cree = createTodo({ title: corps.title, priority: corps.priority }, estampe())

      if (!cree.ok) return json({ refus: cree.refusal }, 400)

      todos = [cree.value, ...todos]

      return json(cree.value, 201)
    }

    const trouvee = findTodo(todos, id)

    if (methode === 'GET') {
      return trouvee.ok ? json(trouvee.value) : json({ erreur: 'Introuvable.' }, 404)
    }

    /* `DELETE` est idempotent : une tâche absente rend `204`. */
    if (methode === 'DELETE') {
      todos = removeTodo(todos, id)

      return new Response(null, { status: 204 })
    }

    /* `PUT` n'est un `upsert` que pour une restauration, reconnue à son corps
       complet. Une modification partielle sur un identifiant absent rend
       `404`. */
    if (!trouvee.ok) {
      if (typeof corps.createdAt !== 'string') {
        return json({ refus: 'tache-introuvable' }, 404)
      }

      todos = restoreTodo(todos, corps as Todo)

      return json(corps, 201)
    }

    const modifiee = updateTodo(trouvee.value, corps, new Date().toISOString())

    if (!modifiee.ok) return json({ refus: modifiee.refusal }, 400)

    todos = replaceTodo(todos, modifiee.value)

    return json(modifiee.value)
  }) as typeof fetch
}

portScenarios('service HTTP', () =>
  createHttpStore({
    origin: 'http://service.test',
    storage: fakeStorage(),
    fetcher: serviceSimule(),
  }),
)
