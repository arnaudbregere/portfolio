import { describe, expect, it } from 'vitest'
import { TTL_MS, creerListes } from '../src/services/listes.ts'

/**
 * La purge à 24 h, avec une horloge injectée : l'attendre réellement rendrait
 * le test inexécutable, et `vi.useFakeTimers()` ne ferait que déplacer la même
 * injection dans un outil.
 */
const horlogeFigee = (depart: number) => {
  let instant = depart

  return {
    horloge: {
      maintenant: () => instant,
      identifiant: () => `id-${instant}`,
    },
    avancer: (ms: number) => {
      instant += ms
    },
  }
}

describe('purge des listes', () => {
  it('efface une liste sans accès depuis 24 h', () => {
    const { horloge, avancer } = horlogeFigee(0)
    const listes = creerListes(horloge)

    listes.lister('abandonnee')

    expect(listes.taille()).toBe(1)

    avancer(TTL_MS + 1)

    expect(listes.taille()).toBe(0)
  })

  it('garde une liste touchée entre-temps', () => {
    const { horloge, avancer } = horlogeFigee(0)
    const listes = creerListes(horloge)

    listes.lister('vivante')

    avancer(TTL_MS - 1000)
    listes.lister('vivante')

    avancer(TTL_MS - 1000)

    expect(listes.taille()).toBe(1)
  })

  it('n’efface que la liste inactive', () => {
    const { horloge, avancer } = horlogeFigee(0)
    const listes = creerListes(horloge)

    listes.lister('abandonnee')

    avancer(TTL_MS - 1000)
    listes.lister('vivante')

    avancer(2000)

    expect(listes.taille()).toBe(1)
    expect(listes.lister('vivante')).toHaveLength(3)
  })

  /** Une liste purgée repart des exemples, elle ne revient pas vide. */
  it('resème une liste purgée', () => {
    const { horloge, avancer } = horlogeFigee(0)
    const listes = creerListes(horloge)

    listes.creer('abandonnee', { title: 'Acheter du pain' })

    expect(listes.lister('abandonnee')).toHaveLength(4)

    avancer(TTL_MS + 1)

    expect(listes.lister('abandonnee')).toHaveLength(3)
  })
})
