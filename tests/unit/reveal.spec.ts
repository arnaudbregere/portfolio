import { describe, expect, it } from 'vitest'
import { revealPlan } from '~/utils/reveal'

describe('revealPlan', () => {
  it('fait entrer au chargement ce qui est dans la fenêtre, à son tour', () => {
    expect(revealPlan([100, 300, 500], 900)).toEqual([
      { mode: 'load', delay: 700 },
      { mode: 'load', delay: 790 },
      { mode: 'load', delay: 880 },
    ])
  })

  it('laisse au défilement ce qui est sous la ligne de flottaison', () => {
    expect(revealPlan([100, 1200], 900)).toEqual([
      { mode: 'load', delay: 700 },
      { mode: 'scroll' },
    ])
  })

  /**
   * Le rang de la cascade compte les éléments retenus, pas leur position dans
   * la liste : un trou laisserait un silence au milieu de l'entrée.
   */
  it('ne compte dans la cascade que les éléments qu’elle retient', () => {
    const plan = revealPlan([100, 1500, 400], 900)

    expect(plan[1]).toEqual({ mode: 'scroll' })
    expect(plan[2]).toEqual({ mode: 'load', delay: 790 })
  })

  it('traite la limite de la fenêtre comme hors champ', () => {
    expect(revealPlan([900], 900)).toEqual([{ mode: 'scroll' }])
    expect(revealPlan([899], 900)).toEqual([{ mode: 'load', delay: 700 }])
  })

  it('accepte un autre départ et un autre pas', () => {
    expect(revealPlan([0, 10], 900, 200, 50)).toEqual([
      { mode: 'load', delay: 200 },
      { mode: 'load', delay: 250 },
    ])
  })

  it('rend une liste vide pour une page sans élément animé', () => {
    expect(revealPlan([], 900)).toEqual([])
  })
})
