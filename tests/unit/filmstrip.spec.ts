import { describe, expect, it } from 'vitest'
import { filmstripBounds, filmstripStep, type Scroller } from '~/composables/useFilmstrip'

/**
 * Les bornes et le pas de la pellicule (issue #82).
 *
 * Ce sont les deux seuls calculs du composable, et les seuls qu'un test
 * unitaire puisse tenir : `jsdom` ne met rien en page, donc `scrollBy` n'y
 * déplace rien. Le comportement réel — la flèche qui avance d'une capture —
 * est vérifié par `e2e/tests/apercu-pellicule.spec.ts`, dans un vrai moteur.
 */
const scroller = (mesures: {
  scrollLeft: number
  clientWidth: number
  scrollWidth: number
  slideWidth?: number | null
}): Scroller => ({
  scrollLeft: mesures.scrollLeft,
  clientWidth: mesures.clientWidth,
  scrollWidth: mesures.scrollWidth,
  scrollBy: () => {},
  firstElementChild:
    mesures.slideWidth === null || mesures.slideWidth === undefined
      ? null
      : { getBoundingClientRect: () => ({ width: mesures.slideWidth }) as DOMRect },
})

describe('bornes de la pellicule', () => {
  it('n’offre que l’avant au départ', () => {
    const bounds = filmstripBounds(
      scroller({ scrollLeft: 0, clientWidth: 400, scrollWidth: 1400 }),
    )

    expect(bounds).toEqual({ back: false, forward: true })
  })

  it('offre les deux sens au milieu', () => {
    const bounds = filmstripBounds(
      scroller({ scrollLeft: 400, clientWidth: 400, scrollWidth: 1400 }),
    )

    expect(bounds).toEqual({ back: true, forward: true })
  })

  it('n’offre que le retour au bout', () => {
    const bounds = filmstripBounds(
      scroller({ scrollLeft: 1000, clientWidth: 400, scrollWidth: 1400 }),
    )

    expect(bounds).toEqual({ back: true, forward: false })
  })

  /**
   * La position de défilement est fractionnaire dès que la largeur de la
   * fenêtre l'est : sans tolérance, la flèche de droite resterait active au
   * bout de la pellicule, et un clic de plus ne ferait rien.
   */
  it('tolère le pixel fractionnaire des deux côtés', () => {
    const fin = filmstripBounds(
      scroller({ scrollLeft: 999.6, clientWidth: 400, scrollWidth: 1400 }),
    )
    const depart = filmstripBounds(
      scroller({ scrollLeft: 0.4, clientWidth: 400, scrollWidth: 1400 }),
    )

    expect(fin.forward).toBe(false)
    expect(depart.back).toBe(false)
  })

  it('n’offre rien quand tout tient dans la vue', () => {
    const bounds = filmstripBounds(
      scroller({ scrollLeft: 0, clientWidth: 1400, scrollWidth: 1400 }),
    )

    expect(bounds).toEqual({ back: false, forward: false })
  })
})

describe('pas de la pellicule', () => {
  it('avance d’une capture, et non de la largeur visible', () => {
    const step = filmstripStep(
      scroller({ scrollLeft: 0, clientWidth: 900, scrollWidth: 1800, slideWidth: 320 }),
    )

    expect(step).toBe(320)
  })

  it('retombe sur la largeur visible sans capture à mesurer', () => {
    expect(
      filmstripStep(
        scroller({ scrollLeft: 0, clientWidth: 900, scrollWidth: 1800, slideWidth: null }),
      ),
    ).toBe(900)
  })

  /**
   * Une capture encore invisible — image différée, pellicule masquée — se
   * mesure à zéro. Un pas de zéro rendrait la flèche inerte.
   */
  it('retombe sur la largeur visible quand la capture mesure zéro', () => {
    expect(
      filmstripStep(
        scroller({ scrollLeft: 0, clientWidth: 900, scrollWidth: 1800, slideWidth: 0 }),
      ),
    ).toBe(900)
  })
})
