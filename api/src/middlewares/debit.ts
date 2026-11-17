import type { NextFunction, Request, Response } from 'express'

/**
 * Limitation de débit par identifiant de liste, en mémoire.
 *
 * Due dès la première mise en ligne publique et non après — `PRODUCT.md`
 * § « Données personnelles ». Sans elle, une démo ouverte sans compte est une
 * invitation à remplir la mémoire d'un service gratuit.
 *
 * En mémoire parce que l'état des listes l'est déjà (D3) : un magasin partagé
 * ajouterait une dépendance pour protéger un processus qui oublie tout à son
 * redémarrage.
 */

/** Le seuil et la fenêtre sont écrits ici, jamais devinés par l'appelant. */
export const FENETRE_MS = 60_000
export const SEUIL = 120

type Compteur = { debut: number; coups: number }

export const creerDebit = (maintenant: () => number = () => Date.now()) => {
  const compteurs = new Map<string, Compteur>()

  return (requete: Request, reponse: Response, suite: NextFunction) => {
    const cle = String(requete.params.listeId ?? 'sans-liste')
    const instant = maintenant()
    const compteur = compteurs.get(cle)

    if (!compteur || instant - compteur.debut >= FENETRE_MS) {
      compteurs.set(cle, { debut: instant, coups: 1 })

      return suite()
    }

    compteur.coups += 1

    if (compteur.coups > SEUIL) {
      /* Corps générique : le client n'apprend ni le seuil, ni la fenêtre, ni
         ce que font les autres listes. */
      reponse.status(429).json({ erreur: 'Trop de requêtes.' })

      return
    }

    suite()
  }
}
