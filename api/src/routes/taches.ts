import { Router } from 'express'
import type { Request, Response } from 'express'
import type { RefusalCode, Todo } from '../../../shared/todo/types.ts'
import type { Listes } from '../services/listes.ts'
import { creerDebit } from '../middlewares/debit.ts'

/**
 * La couche de transport, et elle seule : lire la requête, appeler le service,
 * traduire le résultat en réponse. Aucune logique métier n'habite ce fichier —
 * `.claude/rules/backend.md`.
 *
 * Les gardes du domaine sont rejouées par le service même quand le client a
 * déjà validé : un client n'est jamais une garantie, et celui-ci n'est pas le
 * seul possible.
 */

/** `400` pour un refus de garde, `404` pour une absence. */
const codeDe = (refus: RefusalCode) => (refus === 'tache-introuvable' ? 404 : 400)

const refuser = (reponse: Response, refus: RefusalCode) => {
  if (refus === 'tache-introuvable') {
    /* Message générique : le client n'apprend pas si la liste existe. */
    reponse.status(404).json({ erreur: 'Introuvable.' })

    return
  }

  /* Le code de refus, et rien d'autre : c'est le client qui connaît la phrase
     à afficher, et elle est déjà écrite une fois dans `shared/todo`. */
  reponse.status(codeDe(refus)).json({ refus })
}

/**
 * Le corps est réduit aux trois champs du contrat avant d'atteindre le
 * domaine. `id`, `createdAt` et `updatedAt` appartiennent au domaine (FR-012)
 * et ne se recopient jamais depuis une requête.
 */
/**
 * Express 5 type un paramètre de chemin en `string | string[]` : un motif
 * répétable le rendrait en tableau. Aucun des nôtres ne l'est, et le réduire
 * ici une fois vaut mieux que six `as string` disséminés.
 */
const parametre = (requete: Request, nom: string) => String(requete.params[nom] ?? '')

const corpsAccepte = (corps: unknown) => {
  const recu = (corps ?? {}) as Record<string, unknown>

  return { title: recu.title, priority: recu.priority, done: recu.done }
}

export const creerTaches = (listes: Listes, maintenant?: () => number) => {
  const taches = Router({ mergeParams: true })
  const debit = creerDebit(maintenant)

  taches.use(debit)

  taches.get('/', (requete: Request, reponse: Response) => {
    reponse.json(listes.lister(parametre(requete, 'listeId')))
  })

  taches.post('/', (requete: Request, reponse: Response) => {
    const { title, priority } = corpsAccepte(requete.body)
    const cree = listes.creer(parametre(requete, 'listeId'), { title, priority })

    if (!cree.ok) return refuser(reponse, cree.refusal)

    reponse.status(201).json(cree.value)
  })

  taches.get('/:id', (requete: Request, reponse: Response) => {
    const trouvee = listes.lire(parametre(requete, 'listeId'), parametre(requete, 'id'))

    if (!trouvee.ok) return refuser(reponse, trouvee.refusal)

    reponse.json(trouvee.value)
  })

  /**
   * `PUT` est un `upsert` : sur un identifiant absent, il recrée la tâche à
   * l'identique et rend `201`. C'est la forme HTTP de « restaurer », sans
   * laquelle « Annuler » remonterait la tâche en tête de liste.
   *
   * C'est la seule route où le client choisit un horodatage de création, et
   * seulement dans sa propre liste.
   */
  taches.put('/:id', (requete: Request, reponse: Response) => {
    const listeId = parametre(requete, 'listeId')
    const id = parametre(requete, 'id')
    const existante = listes.lire(listeId, id)

    if (existante.ok) {
      const modifiee = listes.modifier(listeId, id, corpsAccepte(requete.body))

      if (!modifiee.ok) return refuser(reponse, modifiee.refusal)

      return void reponse.json(modifiee.value)
    }

    const recu = (requete.body ?? {}) as Partial<Todo>

    /* L'`upsert` ne vaut que pour une **restauration**, reconnue à son corps
       complet : `createdAt` n'est servi que par le service, donc un corps qui
       le porte vient d'une tâche qu'il a lui-même rendue. Une modification
       partielle sur un identifiant absent reste un `404` — sans quoi
       `update()` créerait la tâche qu'il prétend modifier, et le port cesserait
       de se comporter pareil des deux côtés. Relevé le 17/11/2026 par la suite
       de scénarios du port, en la rejouant contre l'adaptateur HTTP. */
    if (typeof recu.createdAt !== 'string') {
      return refuser(reponse, 'tache-introuvable')
    }
    const restauree: Todo = {
      id,
      title: String(recu.title ?? ''),
      done: recu.done === true,
      priority: recu.priority ?? 'medium',
      createdAt: recu.createdAt ?? new Date().toISOString(),
      updatedAt: recu.updatedAt ?? new Date().toISOString(),
    }

    const remise = listes.remplacer(listeId, restauree)

    if (!remise.ok) return refuser(reponse, remise.refusal)

    reponse.status(201).json(restauree)
  })

  /**
   * `DELETE` est **idempotent** : supprimer une tâche absente rend `204`, pas
   * `404`. C'est la sémantique HTTP, et c'est surtout ce que le port exige —
   * l'adaptateur navigateur traite ce cas comme ordinaire, et deux sources qui
   * en divergeraient feraient mentir FR-020.
   */
  taches.delete('/:id', (requete: Request, reponse: Response) => {
    listes.supprimer(parametre(requete, 'listeId'), parametre(requete, 'id'))

    reponse.status(204).end()
  })

  /* Toute méthode non prévue sur un chemin connu rend `405`, et non `404` :
     le chemin existe, c'est le verbe qui ne s'y applique pas. */
  taches.all('/', (_requete, reponse) => {
    reponse.status(405).json({ erreur: 'Méthode non autorisée.' })
  })

  taches.all('/:id', (_requete, reponse) => {
    reponse.status(405).json({ erreur: 'Méthode non autorisée.' })
  })

  return taches
}
