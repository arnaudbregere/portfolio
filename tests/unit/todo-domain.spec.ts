import { describe, expect, it } from 'vitest'
import type { Todo } from '~~/shared/todo/types'
import {
  countRemaining,
  createTodo,
  filterTodos,
  priorityLabel,
  removeTodo,
  replaceTodo,
  restoreTodo,
  sortTodos,
  toggleTodo,
  updateTodo,
} from '~~/shared/todo/domain'

/**
 * Le domaine de la liste de tâches.
 *
 * **Aucun test d'ici ne lit l'horloge ni ne tire d'identifiant** : le domaine
 * les reçoit en paramètres, ce qui permet d'affirmer une valeur plutôt que
 * d'en vérifier la forme. C'est la même discipline que
 * `tests/unit/use-calculator.spec.ts`, qui éprouve une machine à états sans
 * monter de composant.
 */

const T = (heure: string) => `2026-11-17T${heure}:00.000Z`

const tache = (sur: Partial<Todo> & Pick<Todo, 'id'>): Todo => ({
  title: 'Relire le cadrage',
  done: false,
  priority: 'medium',
  createdAt: T('09:00'),
  updatedAt: T('09:00'),
  ...sur,
})

describe('createTodo', () => {
  it('pose l’identifiant et les deux horodatages reçus', () => {
    const resultat = createTodo(
      { title: '  Préparer l’entretien  ' },
      { id: 'tache-1', now: T('10:00') },
    )

    expect(resultat).toEqual({
      ok: true,
      value: {
        id: 'tache-1',
        title: 'Préparer l’entretien',
        done: false,
        priority: 'medium',
        createdAt: T('10:00'),
        updatedAt: T('10:00'),
      },
    })
  })

  /**
   * `updatedAt` vaut `createdAt` à la création, et non une chaîne vide : une
   * date absente obligerait chaque lecteur — tri, affichage, service — à
   * traiter le cas.
   */
  it('fait partir `updatedAt` de `createdAt`', () => {
    const resultat = createTodo({ title: 'Relire' }, { id: 'a', now: T('10:00') })

    expect(resultat.ok && resultat.value.updatedAt).toBe(T('10:00'))
    expect(resultat.ok && resultat.value.createdAt).toBe(T('10:00'))
  })

  it('ne fait jamais naître une tâche déjà faite', () => {
    const resultat = createTodo({ title: 'Relire' }, { id: 'a', now: T('10:00') })

    expect(resultat.ok && resultat.value.done).toBe(false)
  })

  it('refuse un titre invalide sans rien créer', () => {
    expect(createTodo({ title: '   ' }, { id: 'a', now: T('10:00') })).toEqual({
      ok: false,
      refusal: 'titre-vide',
    })
  })

  it('refuse une priorité inconnue', () => {
    expect(
      createTodo({ title: 'Relire', priority: 'urgent' }, { id: 'a', now: T('10:00') }),
    ).toEqual({ ok: false, refusal: 'priorite-inconnue' })
  })
})

describe('updateTodo', () => {
  it('ne change que les champs présents', () => {
    const avant = tache({ id: 'a' })
    const resultat = updateTodo(avant, { priority: 'high' }, T('11:00'))

    expect(resultat).toEqual({
      ok: true,
      value: { ...avant, priority: 'high', updatedAt: T('11:00') },
    })
  })

  /**
   * `updatedAt` bouge même quand la valeur posée est identique : le visiteur
   * a agi, et l'horodatage dit la dernière action, pas la dernière
   * différence.
   */
  it('date la modification même sans différence de valeur', () => {
    const avant = tache({ id: 'a', priority: 'high' })
    const resultat = updateTodo(avant, { priority: 'high' }, T('11:00'))

    expect(resultat.ok && resultat.value.updatedAt).toBe(T('11:00'))
  })

  /**
   * `id` et `createdAt` ne figurent pas dans `TodoPatch` : c'est le type qui
   * l'interdit. Ce test tient la promesse à l'exécution, pour le service, qui
   * reçoit du JSON et non des types.
   */
  it('ne touche jamais à `id` ni à `createdAt`', () => {
    const avant = tache({ id: 'a' })
    const resultat = updateTodo(
      avant,
      { id: 'autre', createdAt: T('00:00'), title: 'Relu' } as never,
      T('11:00'),
    )

    expect(resultat.ok && resultat.value.id).toBe('a')
    expect(resultat.ok && resultat.value.createdAt).toBe(T('09:00'))
  })

  it('refuse tout quand un champ présent est invalide', () => {
    const avant = tache({ id: 'a' })

    expect(updateTodo(avant, { title: '' }, T('11:00'))).toEqual({
      ok: false,
      refusal: 'titre-vide',
    })
    expect(updateTodo(avant, { priority: null }, T('11:00'))).toEqual({
      ok: false,
      refusal: 'priorite-inconnue',
    })
  })

  it('lit `done` quand c’est un booléen, et l’ignore sinon', () => {
    const avant = tache({ id: 'a' })

    expect(updateTodo(avant, { done: true }, T('11:00'))).toEqual({
      ok: true,
      value: { ...avant, done: true, updatedAt: T('11:00') },
    })
    expect(updateTodo(avant, { done: 'oui' }, T('11:00'))).toEqual({
      ok: true,
      value: { ...avant, updatedAt: T('11:00') },
    })
  })
})

describe('toggleTodo', () => {
  it('bascule dans les deux sens et date le geste', () => {
    const avant = tache({ id: 'a' })
    const faite = toggleTodo(avant, T('11:00'))

    expect(faite.done).toBe(true)
    expect(faite.updatedAt).toBe(T('11:00'))
    expect(toggleTodo(faite, T('12:00')).done).toBe(false)
  })

  it('ne modifie pas la tâche reçue', () => {
    const avant = tache({ id: 'a' })

    toggleTodo(avant, T('11:00'))

    expect(avant.done).toBe(false)
  })
})

describe('sortTodos', () => {
  it('range de la plus récemment créée à la plus ancienne', () => {
    const range = sortTodos([
      tache({ id: 'vieille', createdAt: T('08:00') }),
      tache({ id: 'recente', createdAt: T('10:00') }),
      tache({ id: 'moyenne', createdAt: T('09:00') }),
    ])

    expect(range.map(({ id }) => id)).toEqual(['recente', 'moyenne', 'vieille'])
  })

  /**
   * Deux créations dans la même milliseconde ne sont pas théoriques : un test
   * en produit sans effort, et une boucle d'import aussi. L'identifiant
   * tranche, pour que l'ordre soit **total** — sans quoi deux rendus
   * successifs de la même liste pourraient la faire trembler.
   */
  it('rend un ordre total quand deux dates sont identiques', () => {
    const taches = [
      tache({ id: 'b', createdAt: T('09:00') }),
      tache({ id: 'a', createdAt: T('09:00') }),
    ]

    expect(sortTodos(taches).map(({ id }) => id)).toEqual(['a', 'b'])
    expect(sortTodos([...taches].reverse()).map(({ id }) => id)).toEqual(['a', 'b'])
  })

  it('ne modifie pas la liste reçue', () => {
    const taches = [
      tache({ id: 'vieille', createdAt: T('08:00') }),
      tache({ id: 'recente', createdAt: T('10:00') }),
    ]

    sortTodos(taches)

    expect(taches.map(({ id }) => id)).toEqual(['vieille', 'recente'])
  })

  it('rend une liste vide sans erreur', () => {
    expect(sortTodos([])).toEqual([])
  })
})

describe('filterTodos', () => {
  const taches = [
    tache({ id: 'a', done: false }),
    tache({ id: 'b', done: true }),
    tache({ id: 'c', done: false }),
  ]

  it('rend les trois vues', () => {
    expect(filterTodos(taches, 'all').map(({ id }) => id)).toEqual(['a', 'b', 'c'])
    expect(filterTodos(taches, 'active').map(({ id }) => id)).toEqual(['a', 'c'])
    expect(filterTodos(taches, 'done').map(({ id }) => id)).toEqual(['b'])
  })

  /**
   * Le cas limite de la spécification : « aucune tâche pour ce filtre » doit
   * se distinguer de « aucune tâche du tout ». Le domaine rend une liste
   * vide dans les deux cas — c'est l'interface qui dira lequel, et elle ne le
   * pourra que si le filtre ne lève pas ici.
   */
  it('rend une liste vide, sans erreur, quand rien ne correspond', () => {
    expect(filterTodos([tache({ id: 'a' })], 'done')).toEqual([])
    expect(filterTodos([], 'active')).toEqual([])
  })

  it('ne réordonne pas : il tamise ce que `sortTodos` a rangé', () => {
    const range = sortTodos(taches)

    expect(filterTodos(range, 'all')).toEqual(range)
  })
})

describe('countRemaining', () => {
  it('compte les tâches à faire, et elles seules', () => {
    expect(countRemaining([tache({ id: 'a' }), tache({ id: 'b', done: true })])).toBe(1)
    expect(countRemaining([])).toBe(0)
    expect(countRemaining([tache({ id: 'a', done: true })])).toBe(0)
  })
})

describe('removeTodo, restoreTodo, replaceTodo', () => {
  it('retire une tâche, et tient l’absence pour un cas ordinaire', () => {
    const taches = [tache({ id: 'a' }), tache({ id: 'b' })]

    expect(removeTodo(taches, 'a').map(({ id }) => id)).toEqual(['b'])
    expect(removeTodo(taches, 'inconnue').map(({ id }) => id)).toEqual(['a', 'b'])
  })

  /**
   * **L'annulation défait, elle ne recrée pas.** La tâche reprend son `id`,
   * son `createdAt` et son `updatedAt`, donc elle réapparaît exactement là où
   * le visiteur l'a vue disparaître. Recréer la daterait de maintenant et la
   * ferait remonter en tête.
   */
  it('remet une tâche supprimée à sa place d’origine', () => {
    const vieille = tache({ id: 'vieille', createdAt: T('08:00') })
    const restantes = [tache({ id: 'recente', createdAt: T('10:00') })]

    const apres = restoreTodo(restantes, vieille)

    expect(apres.map(({ id }) => id)).toEqual(['recente', 'vieille'])
    expect(apres[1]).toEqual(vieille)
  })

  it('remplace une tâche sans déplacer les autres', () => {
    const taches = [tache({ id: 'a' }), tache({ id: 'b' })]
    const modifiee = { ...taches[0]!, title: 'Relu' }

    expect(replaceTodo(taches, modifiee).map(({ title }) => title)).toEqual([
      'Relu',
      'Relire le cadrage',
    ])
  })
})

describe('priorityLabel', () => {
  it('nomme les trois priorités en français, et elles seules', () => {
    expect(priorityLabel).toEqual({
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
    })
  })
})
