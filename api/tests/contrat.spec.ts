import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { creerApp } from '../src/app.ts'
import { creerListes } from '../src/services/listes.ts'

/**
 * Deux promesses qu'aucun test de route ne tient, et qui se cassent en
 * silence : la liste des champs servis, et ce qu'un corps d'erreur laisse
 * filtrer.
 *
 * `.claude/rules/backend.md` impose la première pour `/api/health`, et la
 * raison vaut ici : un champ ajouté par mégarde — chemin, version, variable
 * d'environnement — doit échouer avant d'atteindre la production.
 */
const app = () => creerApp({ listes: creerListes() })

const liste = '/api/listes/essai/taches'

/** La liste est **close**. Une septième clé fait rougir la suite. */
const CHAMPS = ['id', 'title', 'done', 'priority', 'createdAt', 'updatedAt']

describe('liste close des champs servis', () => {
  it('une tâche listée ne porte que les six champs du modèle', async () => {
    const reponse = await request(app()).get(liste)

    for (const tache of reponse.body) {
      expect(Object.keys(tache).sort()).toEqual([...CHAMPS].sort())
    }
  })

  it('une tâche créée ne porte que les six champs', async () => {
    const reponse = await request(app()).post(liste).send({ title: 'Acheter du pain' })

    expect(Object.keys(reponse.body).sort()).toEqual([...CHAMPS].sort())
  })

  /**
   * La date de dernier accès existe dans le service — elle commande la purge
   * — et ne doit **jamais** sortir : la servir dirait à qui le demande quand
   * une liste a été touchée.
   */
  it('ne sert jamais la date de dernier accès', async () => {
    const reponse = await request(app()).get(liste)

    expect(JSON.stringify(reponse.body)).not.toContain('vuA')
  })
})

describe('corps d’erreur', () => {
  const chemins: Array<[string, () => Promise<{ body: unknown }>]> = [
    ['404 de tâche', () => request(app()).get(`${liste}/inconnue`)],
    ['404 de chemin', () => request(app()).get('/api/inconnu')],
    ['405', () => request(app()).patch(liste)],
    ['400', () => request(app()).post(liste).send({ title: '' })],
  ]

  /* FR-019 : ni chemin, ni pile d'appels, ni nom de machine, ni version. Le
     détail va au journal du serveur. */
  const interdits = [
    '/home/',
    'node_modules',
    'at Object',
    'Error:',
    process.version,
    'express',
  ]

  it.each(chemins)('%s ne divulgue rien de l’infrastructure', async (_nom, appel) => {
    const corps = JSON.stringify((await appel()).body)

    for (const interdit of interdits) {
      expect(corps).not.toContain(interdit)
    }
  })

  it('ne pose pas l’en-tête X-Powered-By', async () => {
    const reponse = await request(app()).get('/api/sante')

    expect(reponse.headers['x-powered-by']).toBeUndefined()
  })
})

describe('origine autorisée', () => {
  it('nomme une origine, et jamais le joker', async () => {
    const reponse = await request(creerApp({ listes: creerListes(), origine: 'https://exemple.fr' }))
      .get('/api/sante')

    expect(reponse.headers['access-control-allow-origin']).toBe('https://exemple.fr')
  })
})
