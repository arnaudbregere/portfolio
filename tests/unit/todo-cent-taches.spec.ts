import { describe, expect, it } from 'vitest'
import { countRemaining, filterTodos, sortTodos } from '~~/shared/todo/domain'
import type { Todo } from '~~/shared/todo/types'
import { PRIORITIES } from '~~/shared/todo/types'

/**
 * SC-008 : « une liste de cent tâches s'affiche et se filtre sans attente
 * perceptible ».
 *
 * Ce que ce fichier mesure, et ce qu'il ne mesure pas : il chiffre le **coût
 * du domaine** — tri, filtre, décompte —, qui s'exécute à chaque frappe et à
 * chaque bascule de filtre. Il ne mesure ni le rendu, ni la peinture : un
 * banc Vitest sous jsdom en donnerait un chiffre qui ne vaut rien pour un
 * navigateur réel.
 *
 * Le seuil est volontairement lâche. Il n'est pas là pour prouver une
 * performance, mais pour **attraper une régression de complexité** : un tri
 * refait à chaque élément, un filtre en O(n²), une copie de tableau par ligne
 * rendue. Un seuil serré rougirait sur une machine chargée sans rien dire de
 * vrai.
 */

const SEUIL_MS = 50

const centTaches = (): Todo[] =>
  Array.from({ length: 100 }, (_, rang) => ({
    id: `tache-${rang}`,
    title: `Tâche numéro ${rang}`,
    done: rang % 3 === 0,
    priority: PRIORITIES[rang % 3]!,
    createdAt: new Date(2026, 10, 17, 9, 0, rang).toISOString(),
    updatedAt: new Date(2026, 10, 17, 9, 0, rang).toISOString(),
  }))

describe('cent tâches', () => {
  it('trie, filtre et décompte cent tâches cent fois sous le seuil', () => {
    const todos = centTaches()
    const depart = performance.now()

    /* Cent passages : l'ordre de grandeur d'une session où le visiteur tape,
       coche et filtre. Une seule mesure serait du bruit. */
    for (let tour = 0; tour < 100; tour += 1) {
      const triees = sortTodos(todos)

      filterTodos(triees, 'all')
      filterTodos(triees, 'active')
      filterTodos(triees, 'done')
      countRemaining(triees)
    }

    const duree = performance.now() - depart

    expect(duree).toBeLessThan(SEUIL_MS)
  })

  it('rend un ordre total, sans quoi le tri serait instable à cette taille', () => {
    const todos = centTaches()
    const premier = sortTodos(todos).map(({ id }) => id)
    const second = sortTodos([...todos].reverse()).map(({ id }) => id)

    expect(second).toEqual(premier)
  })

  it('filtre sans perdre ni dupliquer une tâche', () => {
    const todos = sortTodos(centTaches())
    const actives = filterTodos(todos, 'active')
    const faites = filterTodos(todos, 'done')

    expect(actives.length + faites.length).toBe(100)
    expect(new Set([...actives, ...faites].map(({ id }) => id)).size).toBe(100)
    expect(countRemaining(todos)).toBe(actives.length)
  })
})
