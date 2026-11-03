/**
 * Mise en forme des périodes du parcours.
 *
 * Le contenu stocke des dates ISO partielles (`YYYY-MM`) : lisibles par
 * machine pour le JSON-LD et les attributs `datetime`. La version française
 * est calculée ici, et non écrite dans `content/`, pour qu'une date existe en
 * un seul exemplaire.
 */

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const

/** `2019-10` donne `octobre 2019`. Une entrée mal formée est renvoyée telle quelle. */
export const formatMonth = (iso: string): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(iso)
  if (!match) return iso

  const month = MONTHS[Number(match[2]) - 1]
  return month ? `${month} ${match[1]}` : iso
}

/**
 * `end` à `null` signifie « poste en cours ». Le tiret est un tiret demi-cadratin
 * entouré d'espaces insécables : la ligne ne se coupe pas entre les deux dates.
 */
export const formatPeriod = (start: string, end: string | null): string =>
  end === null
    ? `Depuis ${formatMonth(start)}`
    : `${formatMonth(start)}\u00a0– ${formatMonth(end)}`
