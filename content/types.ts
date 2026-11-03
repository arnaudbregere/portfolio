/**
 * Types du contenu éditorial. Une famille de contenu, un type.
 *
 * Les dates sont stockées en ISO partiel (`YYYY-MM`) et jamais en français :
 * le format d'affichage appartient au composant, et le JSON-LD du référencement
 * a besoin de la date lisible par machine.
 */

export type Profile = {
  name: string
  /** Intitulé de poste visé, pas l'intitulé du poste actuel. */
  role: string
  /** Phrase d'accroche de l'accueil, une seule. */
  tagline: string
  /** Présentation en paragraphes. Un élément du tableau, un paragraphe. */
  intro: readonly string[]
  location: string
  email: string
  availability: string
}

export type Experience = {
  company: string
  role: string
  /** `YYYY-MM`. */
  start: string
  /** `YYYY-MM`, ou `null` quand le poste est en cours. */
  end: string | null
  location: string
  /** Ce que le poste consiste à faire, en une phrase. */
  summary: string
  missions: readonly string[]
  stack: readonly string[]
}

export type Education = {
  title: string
  school: string
  /** Année seule (`2007`) ou intervalle (`2005-2007`). */
  year: string
  /** Mention ou note obtenue, quand elle est vérifiable. */
  result?: string
  /** Site de l'organisme, quand il en a un. */
  url?: string
}

export type SkillGroup = {
  title: string
  skills: readonly string[]
}

/**
 * Le CV n'existe qu'en téléchargement : décision du 26/10/2026. Il n'y a pas
 * de route `/cv` en HTML — le parcours lisible est sur `/a-propos`.
 */
export type CvFile = {
  /** Chemin servi depuis `public/`. */
  path: string
  /** Format du document, annoncé au lecteur avant le clic. */
  format: string
  /** Poids du fichier en kilo-octets, tenu à jour avec le fichier. */
  sizeKb: number
  /** Date de la version servie, en ISO. */
  updated: string
}
