import type { Todo, Result } from '../../../shared/todo/types.ts'
import { ok, refuse } from '../../../shared/todo/types.ts'
import type { TodoDraft, TodoPatch } from '../../../shared/todo/domain.ts'
import {
  createTodo,
  removeTodo,
  replaceTodo,
  restoreTodo,
  sortTodos,
  updateTodo,
} from '../../../shared/todo/domain.ts'
import { findTodo } from '../../../shared/todo/validation.ts'
import { exampleTodos } from '../../../shared/todo/examples.ts'

/**
 * L'état du service : une `Map` en mémoire, une entrée par liste.
 *
 * Pas de base de données — décision D3 de `specs/001-todo-list/research.md`.
 * Une démo de portfolio n'a rien à retenir entre deux redémarrages, et une
 * base ajouterait un schéma, une migration, une sauvegarde et un secret à
 * tenir, pour des données qui n'intéressent personne.
 *
 * **Le domaine n'est pas réécrit ici.** Les mêmes fonctions servent le
 * navigateur et le service : c'est tout l'objet du projet, et c'est ce que la
 * suite de scénarios du port vérifie des deux côtés.
 */

/** La durée au-delà de laquelle une liste sans accès disparaît. */
export const TTL_MS = 24 * 60 * 60 * 1000

type Liste = {
  todos: Todo[]
  /**
   * Le dernier accès, **jamais servi au client** : il ne sert qu'à la purge.
   * Le rendre reviendrait à dire à qui le demande quand une autre liste a été
   * touchée — `PRODUCT.md` § « Données personnelles ».
   */
  vuA: number
}

/** Ce dont le service a besoin du monde extérieur, et rien de plus. */
export type Horloge = {
  maintenant: () => number
  /** L'identifiant d'une tâche neuve. Injecté pour que les tests soient stables. */
  identifiant: () => string
}

export const horlogeSysteme: Horloge = {
  maintenant: () => Date.now(),
  identifiant: () => crypto.randomUUID(),
}

export const creerListes = (horloge: Horloge = horlogeSysteme) => {
  const listes = new Map<string, Liste>()

  /**
   * Purge à chaque accès plutôt que par minuterie : un `setInterval` tiendrait
   * le processus éveillé et survivrait aux tests. Le coût est celui d'un
   * parcours de la `Map`, qui ne compte que des listes vivantes.
   */
  const purger = () => {
    const limite = horloge.maintenant() - TTL_MS

    for (const [id, liste] of listes) {
      if (liste.vuA < limite) listes.delete(id)
    }
  }

  const ouvrir = (id: string): Liste => {
    purger()

    const existante = listes.get(id)

    if (existante) {
      existante.vuA = horloge.maintenant()

      return existante
    }

    /* Une liste neuve part des mêmes trois exemples que le navigateur : sans
       cela, changer de source changerait le contenu, et la démonstration ne
       vaudrait rien. */
    const neuve: Liste = { todos: [...exampleTodos], vuA: horloge.maintenant() }

    listes.set(id, neuve)

    return neuve
  }

  const estampe = () => ({
    id: horloge.identifiant(),
    now: new Date(horloge.maintenant()).toISOString(),
  })

  return {
    lister: (id: string): Todo[] => sortTodos(ouvrir(id).todos),

    creer: (id: string, brouillon: TodoDraft): Result<Todo> => {
      const liste = ouvrir(id)
      const cree = createTodo(brouillon, estampe())

      if (!cree.ok) return cree

      liste.todos = [cree.value, ...liste.todos]

      return cree
    },

    lire: (id: string, tacheId: string): Result<Todo> => findTodo(ouvrir(id).todos, tacheId),

    modifier: (id: string, tacheId: string, patch: TodoPatch): Result<Todo> => {
      const liste = ouvrir(id)
      const trouvee = findTodo(liste.todos, tacheId)

      if (!trouvee.ok) return trouvee

      const modifiee = updateTodo(trouvee.value, patch, estampe().now)

      if (!modifiee.ok) return modifiee

      liste.todos = replaceTodo(liste.todos, modifiee.value)

      return modifiee
    },

    /** Le `PUT` du contrat est un `upsert` : il crée la tâche absente. */
    remplacer: (id: string, tache: Todo): Result<Todo[]> => {
      const liste = ouvrir(id)

      liste.todos = restoreTodo(liste.todos, tache)

      return ok(sortTodos(liste.todos))
    },

    supprimer: (id: string, tacheId: string): Result<Todo[]> => {
      const liste = ouvrir(id)
      const trouvee = findTodo(liste.todos, tacheId)

      if (!trouvee.ok) return refuse<Todo[]>(trouvee.refusal)

      liste.todos = removeTodo(liste.todos, tacheId)

      return ok(sortTodos(liste.todos))
    },

    /** Pour les tests de purge seulement : jamais exposé par une route. */
    taille: () => {
      purger()

      return listes.size
    },
  }
}

export type Listes = ReturnType<typeof creerListes>
