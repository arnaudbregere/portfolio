/**
 * Rapport de santé du déploiement.
 *
 * Il répond à une seule question, en une requête : **quelle version du code
 * est en ligne en ce moment ?** Sans lui, vérifier qu'un déploiement est
 * bien passé oblige à ouvrir le tableau de bord de l'hébergeur et à comparer
 * un identifiant à l'œil.
 *
 * Rien de secret n'y transite. Le dépôt est public : l'empreinte d'un commit
 * n'apprend à personne ce que `git log` ne dit pas déjà. Aucune variable
 * d'environnement, aucun chemin de fichier, aucune version de dépendance —
 * ceux-là renseigneraient un attaquant sans servir à Arnaud.
 */

export type HealthReport = {
  status: 'ok'
  /** Le commit déployé. `inconnu` hors d'un build d'hébergeur. */
  commit: string
  /** Les sept premiers caractères, la forme qu'affiche `git log --oneline`. */
  commitShort: string
  /** La branche d'où vient le build. */
  branch: string
  /** `production`, `preview`, ou `developpement` en local. */
  environment: string
  /** Date du build, au format ISO 8601. */
  builtAt: string
}

export type HealthInput = {
  commit?: string
  branch?: string
  environment?: string
  builtAt?: string
}

/** Ce qui remplace une valeur que le build n'a pas su renseigner. */
export const UNKNOWN = 'inconnu'

const orUnknown = (value: string | undefined): string => {
  const trimmed = value?.trim()

  return trimmed ? trimmed : UNKNOWN
}

/**
 * La forme courte ne se calcule pas quand l'empreinte est inconnue : sept
 * caractères de « inconnu » donneraient « inconnu », qui se lirait comme une
 * empreinte tronquée.
 */
export const shortenCommit = (commit: string): string =>
  commit === UNKNOWN ? UNKNOWN : commit.slice(0, 7)

export const buildHealth = (input: HealthInput): HealthReport => {
  const commit = orUnknown(input.commit)

  return {
    status: 'ok',
    commit,
    commitShort: shortenCommit(commit),
    branch: orUnknown(input.branch),
    environment: orUnknown(input.environment),
    builtAt: orUnknown(input.builtAt),
  }
}
