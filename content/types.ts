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
  /** Présentation de `/a-propos`, en paragraphes. Un élément, un paragraphe. */
  intro: readonly string[]
  /** Présentation de l'accueil, en paragraphes. Un élément, un paragraphe. */
  pitch: readonly string[]
  location: string
  email: string
  /** Affiché tel quel ; `tel:` est construit par le composant. */
  phone: string
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

export type ProjectLink = {
  label: string
  url: string
}

export type ProjectImage = {
  /** Chemin servi depuis `public/`. */
  src: string
  /** Texte alternatif : une propriété du contenu, jamais improvisée en template. */
  alt: string
  /** Légende visible sous l'image. Dit ce qu'on regarde, pas ce qu'on voit. */
  caption: string
  width: number
  height: number
}

export type Project = {
  slug: string
  title: string
  /** Année ou intervalle, tel qu'il s'affiche. */
  year: string
  role: string
  /** Une phrase, du point de vue de l'utilisateur ou de l'entreprise. */
  problem: string
  solution: string
  /** Mesurable. Un projet sans résultat mesurable n'est pas prêt à paraître. */
  result: string
  stack: readonly string[]
  links: readonly ProjectLink[]
  /**
   * Captures de l'application. Vide quand l'interface appartient à un
   * employeur : `PRODUCT.md` interdit la capture d'une interface client.
   */
  images?: readonly ProjectImage[]
  /**
   * Image de partage de la fiche, 1200 × 630, servie depuis `public/og/`.
   * Absente, la fiche retombe sur l'image du site.
   *
   * Ce n'est pas une capture de `images` : les captures sont en WebP, que
   * LinkedIn ne restitue pas, et leur rapport n'est pas celui qu'attendent les
   * aperçus de lien. `scripts/og-card.js` compose l'image au bon format.
   */
  ogImage?: string
  /** Mis en avant sur l'accueil. */
  featured: boolean
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

/**
 * Un fait de la page Contact : ce qu'un recruteur vérifie avant d'écrire.
 *
 * `values` est un tableau et non une chaîne à virgules : une énumération est
 * une liste, et le séparateur qui l'affiche appartient au composant.
 */
export type ContactFact = {
  label: string
  values: readonly string[]
}

export type ContactSection = {
  title: string
  facts: readonly ContactFact[]
}
