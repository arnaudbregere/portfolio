import { Router } from 'express'

/**
 * La sonde de `contracts/persistance.md` : elle dit que le service est debout,
 * et rien de plus.
 *
 * **Ni identité de build, ni compte de listes.** La route est publique et sans
 * cloisonnement — `/api/health` du site porte l'identité du build parce qu'il
 * la sert sur son propre domaine ; ici, le même geste dirait à n'importe qui
 * combien de visiteurs ont joué avec la démo.
 */
export const sante = Router()

sante.get('/sante', (_requete, reponse) => {
  reponse.json({ statut: 'ok' })
})
