import express from 'express'
import type { Express, NextFunction, Request, Response } from 'express'
import { creerListes, horlogeSysteme } from './services/listes.ts'
import type { Horloge, Listes } from './services/listes.ts'
import { creerTaches } from './routes/taches.ts'
import { sante } from './routes/sante.ts'

/**
 * L'application, sans écoute : `server.ts` l'ouvre sur un port, les tests la
 * montent en mémoire. Les séparer évite un port occupé dans la suite et une
 * minuterie qui survit au test.
 *
 * L'origine autorisée vient de la configuration (`API_ORIGINE`), jamais d'une
 * URL écrite en dur — le site de production, une préversion Vercel et le
 * développement n'ont pas la même, et une valeur en dur obligerait à publier
 * une version pour en changer.
 */
export type Options = {
  origine?: string
  horloge?: Horloge
  listes?: Listes
}

const ORIGINE_PAR_DEFAUT = 'http://localhost:3000'

export const creerApp = (options: Options = {}): Express => {
  const horloge = options.horloge ?? horlogeSysteme
  const listes = options.listes ?? creerListes(horloge)
  const origine = options.origine ?? process.env.API_ORIGINE ?? ORIGINE_PAR_DEFAUT

  const app = express()

  app.disable('x-powered-by')
  app.use(express.json({ limit: '32kb' }))

  /* Une seule origine autorisée, nommée. `*` ouvrirait la démo à n'importe
     quelle page, et le cloisonnement par identifiant opaque ne serait plus
     qu'un décor. */
  app.use((requete: Request, reponse: Response, suite: NextFunction) => {
    reponse.setHeader('Access-Control-Allow-Origin', origine)
    reponse.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    reponse.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    reponse.setHeader('Vary', 'Origin')

    if (requete.method === 'OPTIONS') return void reponse.status(204).end()

    suite()
  })

  app.use('/api', sante)
  app.use('/api/listes/:listeId/taches', creerTaches(listes, horloge.maintenant))

  /* Tout le reste est absent, et le dit sans décrire l'arborescence. */
  app.use((_requete: Request, reponse: Response) => {
    reponse.status(404).json({ erreur: 'Introuvable.' })
  })

  /**
   * Le dernier filet. Le détail part au journal du serveur, le client reçoit
   * une phrase — FR-019 : ni chemin, ni pile d'appels, ni nom de machine, ni
   * version.
   */
  app.use((erreur: unknown, _requete: Request, reponse: Response, _suite: NextFunction) => {
    console.error('[api]', erreur)

    reponse.status(500).json({ erreur: 'Erreur du service.' })
  })

  return app
}
