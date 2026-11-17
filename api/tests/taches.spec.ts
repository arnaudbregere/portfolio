import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { creerApp } from '../src/app.ts'
import { creerListes } from '../src/services/listes.ts'
import { SEUIL } from '../src/middlewares/debit.ts'

/**
 * Le contrat HTTP, route par route — `specs/001-todo-list/contracts/http.md`.
 *
 * Chaque test monte une application neuve : les listes vivent en mémoire, et
 * deux tests qui les partageraient dépendraient de leur ordre d'exécution.
 */
const app = () => creerApp({ listes: creerListes() })

const liste = '/api/listes/essai/taches'

describe('GET /api/sante', () => {
  it('rend 200 et un corps minimal', async () => {
    const reponse = await request(app()).get('/api/sante')

    expect(reponse.status).toBe(200)
    // Ni identité de build, ni compte de listes : la route est publique.
    expect(Object.keys(reponse.body)).toEqual(['statut'])
  })
})

describe('GET /api/listes/:listeId/taches', () => {
  it('sème une liste neuve avec les trois exemples, triés', async () => {
    const reponse = await request(app()).get(liste)

    expect(reponse.status).toBe(200)
    expect(reponse.body).toHaveLength(3)
    expect(reponse.body[0].id).toBe('exemple-1')
  })

  it('cloisonne deux listes', async () => {
    const service = app()

    await request(service).post(liste).send({ title: 'Acheter du pain' })

    const autre = await request(service).get('/api/listes/autre/taches')

    expect(autre.body).toHaveLength(3)
  })
})

describe('POST /api/listes/:listeId/taches', () => {
  it('crée et rend 201', async () => {
    const reponse = await request(app()).post(liste).send({ title: 'Acheter du pain' })

    expect(reponse.status).toBe(201)
    expect(reponse.body.title).toBe('Acheter du pain')
    expect(reponse.body.priority).toBe('medium')
  })

  /** FR-012 : l'identifiant et les horodatages appartiennent au domaine. */
  it('ignore tout champ qui ne lui appartient pas', async () => {
    const reponse = await request(app())
      .post(liste)
      .send({
        title: 'Acheter du pain',
        id: 'triche',
        done: true,
        createdAt: '1999-01-01T00:00:00.000Z',
      })

    expect(reponse.body.id).not.toBe('triche')
    expect(reponse.body.done).toBe(false)
    expect(reponse.body.createdAt).not.toBe('1999-01-01T00:00:00.000Z')
  })

  it('refuse un titre vide avec 400 et le seul code de refus', async () => {
    const reponse = await request(app()).post(liste).send({ title: '   ' })

    expect(reponse.status).toBe(400)
    expect(reponse.body).toEqual({ refus: 'titre-vide' })
  })

  it('refuse une priorité inconnue', async () => {
    const reponse = await request(app())
      .post(liste)
      .send({ title: 'Acheter du pain', priority: 'urgente' })

    expect(reponse.status).toBe(400)
    expect(reponse.body).toEqual({ refus: 'priorite-inconnue' })
  })
})

describe('PUT /api/listes/:listeId/taches/:id', () => {
  it('modifie une tâche existante', async () => {
    const reponse = await request(app())
      .put(`${liste}/exemple-2`)
      .send({ title: 'Préparer la soutenance', priority: 'high' })

    expect(reponse.status).toBe(200)
    expect(reponse.body.title).toBe('Préparer la soutenance')
    expect(reponse.body.priority).toBe('high')
  })

  /**
   * L'`upsert` du contrat : sans lui, « Annuler » tire un identifiant neuf dès
   * que la source est distante, et la tâche remonte en tête au lieu de revenir
   * à sa place.
   */
  it('recrée à l’identique une tâche absente, et rend 201', async () => {
    const service = app()

    await request(service).delete(`${liste}/exemple-2`)

    const reponse = await request(service).put(`${liste}/exemple-2`).send({
      title: 'Préparer l’entretien',
      priority: 'medium',
      done: false,
      createdAt: '2026-11-17T08:30:00.000Z',
      updatedAt: '2026-11-17T08:30:00.000Z',
    })

    expect(reponse.status).toBe(201)
    expect(reponse.body.id).toBe('exemple-2')
    expect(reponse.body.createdAt).toBe('2026-11-17T08:30:00.000Z')

    const relue = await request(service).get(liste)

    expect(relue.body.map((tache: { id: string }) => tache.id)).toEqual([
      'exemple-1',
      'exemple-2',
      'exemple-3',
    ])
  })

  it('refuse un titre trop long', async () => {
    const reponse = await request(app())
      .put(`${liste}/exemple-1`)
      .send({ title: 'x'.repeat(121) })

    expect(reponse.status).toBe(400)
    expect(reponse.body).toEqual({ refus: 'titre-trop-long' })
  })
})

describe('DELETE /api/listes/:listeId/taches/:id', () => {
  it('rend 204 sans corps', async () => {
    const reponse = await request(app()).delete(`${liste}/exemple-1`)

    expect(reponse.status).toBe(204)
    expect(reponse.text).toBe('')
  })

  it('rend 404 sur une tâche absente, sans dire si la liste existe', async () => {
    const reponse = await request(app()).delete(`${liste}/inconnue`)

    expect(reponse.status).toBe(404)
    expect(reponse.body).toEqual({ erreur: 'Introuvable.' })
  })
})

describe('méthodes et chemins non prévus', () => {
  it('rend 405 sur un verbe inattendu d’un chemin connu', async () => {
    const reponse = await request(app()).patch(liste)

    expect(reponse.status).toBe(405)
  })

  it('rend 404 sur un chemin inconnu', async () => {
    const reponse = await request(app()).get('/api/inconnu')

    expect(reponse.status).toBe(404)
  })
})

describe('limitation de débit', () => {
  it('rend 429 au-delà du seuil, et seulement pour la liste fautive', async () => {
    const service = app()

    for (let coup = 0; coup < SEUIL; coup += 1) {
      await request(service).get(liste)
    }

    expect((await request(service).get(liste)).status).toBe(429)
    expect((await request(service).get('/api/listes/autre/taches')).status).toBe(200)
  })
})
