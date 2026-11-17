import { describe, expect, it } from 'vitest'
import { PRIORITIES, type RefusalCode } from '~~/shared/todo/types'
import {
  TITLE_MAX,
  checkPriority,
  checkTitle,
  findTodo,
  readDone,
  refusalMessage,
} from '~~/shared/todo/validation'

/**
 * Les gardes du modèle.
 *
 * Elles sont écrites à la main et non tirées d'un schéma — principe II de la
 * constitution, `research.md` D5 —, donc elles ne sont vraies que si ce
 * fichier le prouve. Une bibliothèque de validation arrive avec ses propres
 * tests ; une quarantaine de lignes écrites ici n'en a aucun.
 *
 * Elles sont appliquées **des deux côtés**, par l'interface et par le
 * service (FR-018). Un refus mal nommé se verrait donc à deux endroits.
 */

const titreDe = (longueur: number) => 'a'.repeat(longueur)

const refus = (resultat: { ok: boolean } & Record<string, unknown>): RefusalCode | null =>
  resultat.ok ? null : (resultat.refusal as RefusalCode)

describe('checkTitle', () => {
  it('accepte un titre ordinaire et lui retire ses espaces de bord', () => {
    const resultat = checkTitle('   Relire le cadrage   ')

    expect(resultat).toEqual({ ok: true, value: 'Relire le cadrage' })
  })

  it('refuse un titre absent, vide, ou qui n’est pas une chaîne', () => {
    for (const valeur of [undefined, null, '', 42, {}, []]) {
      expect(refus(checkTitle(valeur)), String(valeur)).toBe('titre-vide')
    }
  })

  /**
   * **`trim` d'abord, mesure ensuite.** Un titre de cent trente espaces est
   * vide, pas trop long : le visiteur doit lire « le titre est vide ».
   * L'ordre inverse donnerait le bon refus pour la mauvaise raison, et un
   * message qui n'aide pas.
   */
  it('refuse un titre fait d’espaces comme un titre vide', () => {
    expect(refus(checkTitle('   '))).toBe('titre-vide')
    expect(refus(checkTitle(' '.repeat(TITLE_MAX + 10)))).toBe('titre-vide')
  })

  /**
   * La limite est opposable aux deux bords : 120 passe, 121 refuse. Un test
   * qui n'essaierait que 500 laisserait passer un `>=` écrit pour un `>`.
   */
  it('tient la limite de 120 caractères à un caractère près', () => {
    expect(checkTitle(titreDe(TITLE_MAX)).ok).toBe(true)
    expect(refus(checkTitle(titreDe(TITLE_MAX + 1)))).toBe('titre-trop-long')
  })

  it('mesure la longueur après le retrait des espaces, pas avant', () => {
    const resultat = checkTitle(`  ${titreDe(TITLE_MAX)}  `)

    expect(resultat).toEqual({ ok: true, value: titreDe(TITLE_MAX) })
  })
})

describe('checkPriority', () => {
  it('accepte les trois priorités du modèle', () => {
    for (const priorite of PRIORITIES) {
      expect(checkPriority(priorite)).toEqual({ ok: true, value: priorite })
    }
  })

  /**
   * `undefined` n'est pas une erreur : c'est une priorité non exprimée, et le
   * modèle en a une par défaut. C'est ce qui permet à `POST /taches` de
   * n'exiger qu'un titre.
   */
  it('rend la priorité par défaut quand rien n’est demandé', () => {
    expect(checkPriority(undefined)).toEqual({ ok: true, value: 'medium' })
  })

  it('refuse `null`, un nombre, ou une priorité inventée', () => {
    for (const valeur of [null, 0, 'urgent', 'LOW', '']) {
      expect(refus(checkPriority(valeur)), String(valeur)).toBe('priorite-inconnue')
    }
  })
})

describe('readDone', () => {
  /**
   * `readDone` n'est pas une garde et ne rend pas de refus : la liste des
   * codes est close, et aucun n'y désigne un `done` mal formé. Une valeur
   * d'un autre type est traitée comme **absente** — le client n'a rien
   * demandé —, plutôt que d'ouvrir un cinquième code pour un champ booléen.
   */
  it('ne lit qu’un booléen, et tient tout le reste pour absent', () => {
    expect(readDone(true)).toBe(true)
    expect(readDone(false)).toBe(false)

    for (const valeur of [undefined, null, 'true', 1, 0, {}]) {
      expect(readDone(valeur), String(valeur)).toBeUndefined()
    }
  })
})

describe('findTodo', () => {
  const taches = [
    {
      id: 'a',
      title: 'Relire',
      done: false,
      priority: 'high' as const,
      createdAt: '2026-11-17T09:00:00.000Z',
      updatedAt: '2026-11-17T09:00:00.000Z',
    },
  ]

  it('trouve la tâche portant l’identifiant', () => {
    expect(findTodo(taches, 'a')).toEqual({ ok: true, value: taches[0] })
  })

  /**
   * Un identifiant inconnu est un cas **ordinaire** — une tâche supprimée
   * dans un autre onglet, une adresse recopiée —, donc un refus et jamais une
   * exception.
   */
  it('refuse sans lever sur un identifiant inconnu ou mal formé', () => {
    for (const valeur of ['b', '', undefined, null, 7]) {
      expect(refus(findTodo(taches, valeur)), String(valeur)).toBe('tache-introuvable')
    }
  })

  it('refuse sur une liste vide', () => {
    expect(refus(findTodo([], 'a'))).toBe('tache-introuvable')
  })
})

describe('refusalMessage', () => {
  /**
   * Liste **close**, et le test la tient : un cinquième code demande une
   * règle, une règle demande un test, et un message manquant laisserait
   * l'interface muette devant un refus que le service sait prononcer.
   */
  it('porte un message pour les quatre codes, et pour eux seuls', () => {
    expect(Object.keys(refusalMessage).sort()).toEqual([
      'priorite-inconnue',
      'tache-introuvable',
      'titre-trop-long',
      'titre-vide',
    ])

    for (const message of Object.values(refusalMessage)) {
      expect(message.length).toBeGreaterThan(0)
    }
  })

  it('cite la limite réelle dans le message de dépassement', () => {
    expect(refusalMessage['titre-trop-long']).toContain(String(TITLE_MAX))
  })
})
