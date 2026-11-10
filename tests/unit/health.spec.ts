import { describe, expect, it } from 'vitest'
import { UNKNOWN, buildHealth, shortenCommit } from '~~/server/utils/health'

const COMMIT = '64ab9b0f3c21d8e4a7b9c05e1f2a3b4c5d6e7f80'

describe('shortenCommit', () => {
  it('garde les sept premiers caractères, comme `git log --oneline`', () => {
    expect(shortenCommit(COMMIT)).toBe('64ab9b0')
  })

  /**
   * Sept caractères de « inconnu » donnent « inconnu », qui se lirait comme
   * une empreinte tronquée au lieu d'une absence.
   */
  it('ne tronque pas une empreinte inconnue', () => {
    expect(shortenCommit(UNKNOWN)).toBe(UNKNOWN)
  })
})

describe('buildHealth', () => {
  it('rend le commit, sa forme courte, la branche et l’environnement', () => {
    const report = buildHealth({
      commit: COMMIT,
      branch: 'main',
      environment: 'production',
      builtAt: '2026-11-10T12:00:00.000Z',
    })

    expect(report).toEqual({
      status: 'ok',
      commit: COMMIT,
      commitShort: '64ab9b0',
      branch: 'main',
      environment: 'production',
      builtAt: '2026-11-10T12:00:00.000Z',
    })
  })

  /**
   * En local, aucune variable d'hébergeur n'est posée. La route doit répondre
   * quand même : un contrôle de santé qui tombe en panne faute de métadonnées
   * ne contrôle plus rien.
   */
  it('répond `ok` même sans aucune métadonnée', () => {
    const report = buildHealth({})

    expect(report.status).toBe('ok')
    expect(report.commit).toBe(UNKNOWN)
    expect(report.commitShort).toBe(UNKNOWN)
    expect(report.branch).toBe(UNKNOWN)
    expect(report.builtAt).toBe(UNKNOWN)
  })

  it('traite une valeur vide ou blanche comme absente', () => {
    const report = buildHealth({ commit: '', branch: '   ', environment: '' })

    expect(report.commit).toBe(UNKNOWN)
    expect(report.branch).toBe(UNKNOWN)
    expect(report.environment).toBe(UNKNOWN)
  })

  /**
   * Le dépôt est public, mais la liste des champs reste close : une clé
   * ajoutée par mégarde — chemin, version, variable d'environnement — doit
   * faire échouer ce test avant d'atteindre la production.
   */
  it('n’expose que les six champs prévus', () => {
    expect(Object.keys(buildHealth({})).sort()).toEqual([
      'branch',
      'builtAt',
      'commit',
      'commitShort',
      'environment',
      'status',
    ])
  })
})
