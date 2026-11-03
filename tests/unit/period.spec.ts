import { describe, expect, it } from 'vitest'
import { formatMonth, formatPeriod } from '~/utils/period'

describe('formatMonth', () => {
  it('traduit un mois ISO en français', () => {
    expect(formatMonth('2019-10')).toBe('octobre 2019')
  })

  it('traite le premier et le dernier mois sans décalage', () => {
    expect(formatMonth('2026-01')).toBe('janvier 2026')
    expect(formatMonth('2026-12')).toBe('décembre 2026')
  })

  it('renvoie la chaîne telle quelle quand elle n’est pas une date ISO', () => {
    expect(formatMonth('2026')).toBe('2026')
    expect(formatMonth('octobre 2019')).toBe('octobre 2019')
  })

  it('renvoie la chaîne telle quelle quand le mois n’existe pas', () => {
    expect(formatMonth('2026-00')).toBe('2026-00')
    expect(formatMonth('2026-13')).toBe('2026-13')
  })
})

describe('formatPeriod', () => {
  it('annonce un poste en cours quand la fin est nulle', () => {
    expect(formatPeriod('2019-10', null)).toBe('Depuis octobre 2019')
  })

  it('relie les deux bornes d’un poste terminé', () => {
    expect(formatPeriod('2018-09', '2019-10')).toBe('septembre 2018 – octobre 2019')
  })
})
