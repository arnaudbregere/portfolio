import { describe, expect, it } from 'vitest'
import { revealPlan } from '~/utils/reveal'

describe('revealPlan', () => {
  it('fait entrer au chargement la rubrique lisible sans défiler', () => {
    expect(revealPlan([{ top: 100, size: 3 }], 900)).toEqual([
      { mode: 'load', delays: [700, 790, 880] },
    ])
  })

  it('laisse attendre la rubrique sous la ligne de flottaison', () => {
    expect(revealPlan([{ top: 1200, size: 2 }], 900)).toEqual([
      { mode: 'scroll', delays: [0, 90] },
    ])
  })

  /**
   * Le rang court d'une rubrique à l'autre : deux rubriques de la cascade
   * forment une seule phrase, pas deux départs qui se chevauchent.
   */
  it('poursuit la cascade d’une rubrique à la suivante', () => {
    const plan = revealPlan([{ top: 100, size: 2 }, { top: 400, size: 2 }], 900)

    expect(plan[0]!.delays).toEqual([700, 790])
    expect(plan[1]!.delays).toEqual([880, 970])
  })

  /**
   * Une rubrique en attente ne consomme aucun rang : la cascade du chargement
   * ne doit pas garder un trou pour quelqu'un qui n'y participe pas.
   */
  it('ne réserve aucun rang à une rubrique qui attend', () => {
    const plan = revealPlan(
      [{ top: 100, size: 1 }, { top: 2000, size: 2 }, { top: 500, size: 1 }],
      900,
    )

    expect(plan[0]!.delays).toEqual([700])
    expect(plan[1]).toEqual({ mode: 'scroll', delays: [0, 90] })
    expect(plan[2]!.delays).toEqual([790])
  })

  it('traite la limite de la fenêtre comme hors champ', () => {
    expect(revealPlan([{ top: 900, size: 1 }], 900)[0]!.mode).toBe('scroll')
    expect(revealPlan([{ top: 899, size: 1 }], 900)[0]!.mode).toBe('load')
  })

  it('accepte un autre départ et un autre pas', () => {
    expect(revealPlan([{ top: 0, size: 2 }], 900, 200, 50)).toEqual([
      { mode: 'load', delays: [200, 250] },
    ])
  })

  it('rend une liste vide pour une page sans rubrique animée', () => {
    expect(revealPlan([], 900)).toEqual([])
  })
})
