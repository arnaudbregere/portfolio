import type { Result, RefusalCode, Todo } from '~~/shared/todo/types'
import { ok, refuse } from '~~/shared/todo/types'
import type { TodoDraft, TodoPatch } from '~~/shared/todo/domain'
import type { TodoStore, TodoStoreStatus } from './todo-store'

/**
 * La seconde source : le CRUD HTTP du paquet `api/`.
 *
 * Elle remplit le **même** port que l'adaptateur navigateur, et c'est tout
 * l'objet du projet : `useTodos` ne sait pas laquelle des deux il appelle. La
 * suite de scénarios de `tests/unit/todo-port.spec.ts` est rejouée contre cet
 * adaptateur — c'est ainsi que FR-020 devient vérifiable plutôt qu'affirmé.
 *
 * ## L'identifiant de liste est opaque, et tiré côté client
 *
 * Le service ne lui donne aucun sens : il cloisonne, et rien de plus. Aucun
 * compte, aucune adresse, aucune trace de qui joue — `PRODUCT.md`
 * § « Données personnelles ». Il est tiré une fois et gardé dans le stockage
 * du navigateur pour qu'un rechargement retrouve la même liste.
 */

export const LIST_KEY = 'portfolio-todo-list-id'

/** Ce qu'un refus du service ressemble, et rien de plus. */
type RefusCorps = { refus?: unknown }

const REFUSALS: readonly RefusalCode[] = [
  'titre-vide',
  'titre-trop-long',
  'priorite-inconnue',
  'tache-introuvable',
]

/**
 * Traduit la réponse du service en refus du domaine.
 *
 * Un code inconnu retombe sur `tache-introuvable` plutôt que de lever : le
 * client n'a aucune raison de faire confiance au corps reçu, et un refus que
 * `shared/todo` ne connaît pas n'a pas de phrase à afficher.
 */
const refusDe = (corps: unknown): RefusalCode => {
  const recu = (corps ?? {}) as RefusCorps
  const code = REFUSALS.find((connu) => connu === recu.refus)

  return code ?? 'tache-introuvable'
}

/**
 * L'identifiant de liste, tiré une fois puis gardé.
 *
 * Si le stockage refuse — navigation privée —, l'identifiant vit le temps de
 * la session : la démo reste jouable, elle ne retrouve simplement pas sa liste
 * au rechargement. Le refus d'un stockage ne doit jamais couper une source.
 */
const lireIdentifiant = (storage: Storage | null): string => {
  try {
    const garde = storage?.getItem(LIST_KEY)

    if (garde) return garde
  } catch {
    /* Navigation privée : on repart d'un identifiant neuf. */
  }

  const neuf = crypto.randomUUID()

  try {
    storage?.setItem(LIST_KEY, neuf)
  } catch {
    /* Non retenu, mais utilisable pour la session. */
  }

  return neuf
}

export type HttpStoreOptions = {
  /** L'origine du service, lue dans `runtimeConfig`, jamais écrite en dur. */
  origin: string
  storage?: Storage | null
  /** Injecté pour les tests ; `globalThis.fetch` autrement. */
  fetcher?: typeof fetch
}

export const createHttpStore = ({
  origin,
  storage = null,
  fetcher,
}: HttpStoreOptions): TodoStore => {
  const appeler = fetcher ?? globalThis.fetch.bind(globalThis)
  const listeId = lireIdentifiant(storage)
  const base = `${origin.replace(/\/$/, '')}/api/listes/${encodeURIComponent(listeId)}/taches`

  /**
   * Une panne de transport **lève** — c'est `useTodos` qui la traduit en « la
   * source n'a pas répondu » —, tandis qu'un refus du domaine est une valeur.
   * Les deux chemins restent distincts d'un bout à l'autre.
   */
  const envoyer = async <T>(
    chemin: string,
    init?: RequestInit,
  ): Promise<Result<T>> => {
    const reponse = await appeler(`${base}${chemin}`, {
      ...init,
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    })

    if (reponse.status === 204) return ok(undefined as T)

    if (!reponse.ok) {
      /* `400` et `404` sont des refus du domaine ; tout le reste est une
         panne, et une panne lève. */
      if (reponse.status === 400 || reponse.status === 404) {
        return refuse<T>(refusDe(await reponse.json().catch(() => null)))
      }

      throw new Error(`Le service a répondu ${reponse.status}.`)
    }

    return ok((await reponse.json()) as T)
  }

  const status: TodoStoreStatus = {
    persistent: true,
    notice: '',
  }

  return {
    list: async () => {
      const lu = await envoyer<Todo[]>('')

      /* `list()` ne refuse pas : le service sème une liste neuve plutôt que
         de rendre `404`. Un refus ici serait une panne déguisée. */
      if (!lu.ok) throw new Error('Le service n’a pas rendu la liste.')

      return lu.value
    },

    create: (draft: TodoDraft) =>
      envoyer<Todo>('', { method: 'POST', body: JSON.stringify(draft) }),

    read: (id: string) => envoyer<Todo>(`/${encodeURIComponent(id)}`),

    update: (id: string, patch: TodoPatch) =>
      envoyer<Todo>(`/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      }),

    remove: async (id: string) => {
      /* `null` et non `void` : `envoyer` rend une valeur, et `204` n'en porte
         aucune. Un `void` en paramètre de type est refusé par la règle
         `no-invalid-void-type`, avec raison — ce n'est pas un type de valeur. */
      const supprimee = await envoyer<null>(`/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })

      if (!supprimee.ok) return refuse<Todo[]>(supprimee.refusal)

      /* Le service rend `204` sans corps : la liste se relit, elle ne se
         devine pas. */
      return envoyer<Todo[]>('')
    },

    /**
     * `PUT` sur un identifiant absent recrée la tâche à l'identique — c'est
     * la forme HTTP de « restaurer ». Sans elle, « Annuler » tirerait un
     * identifiant neuf et la tâche remonterait en tête au lieu de revenir à
     * sa place.
     */
    restore: async (todo: Todo) => {
      const remise = await envoyer<Todo>(`/${encodeURIComponent(todo.id)}`, {
        method: 'PUT',
        body: JSON.stringify(todo),
      })

      if (!remise.ok) return refuse<Todo[]>(remise.refusal)

      return envoyer<Todo[]>('')
    },

    /**
     * La sonde, et elle **ne lève jamais** : son `false` désactive l'option
     * avec son motif écrit, il ne bascule pas la source (FR-016). Une
     * exception ici casserait le montage de la démo pour une instance
     * endormie.
     */
    available: async () => {
      try {
        const reponse = await appeler(`${origin.replace(/\/$/, '')}/api/sante`)

        return reponse.ok
      } catch {
        return false
      }
    },

    status: () => status,
  }
}
