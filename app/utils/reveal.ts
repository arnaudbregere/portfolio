/**
 * Qui entre au chargement, qui attend son arrivée dans la fenêtre.
 *
 * Une entrée au défilement n'a de sens que pour ce qui est hors de la fenêtre
 * au premier rendu : une rubrique déjà lue n'a plus d'arrivée à attendre. La
 * frontière dépend de la hauteur de la fenêtre et de la longueur de la page,
 * jamais du rang de la rubrique — elle se mesure, elle ne se code pas en dur.
 *
 * **Le classement porte sur la rubrique entière, pas sur ses lignes.** Une
 * rubrique à cheval sur la ligne de flottaison aurait sinon ses premières
 * lignes dans la cascade et les suivantes en attente ; l'observateur
 * libérerait ces dernières aussitôt, avec leur propre compte à rebours, et
 * elles apparaîtraient **avant** celles du dessus.
 *
 * Fonction pure : elle reçoit des nombres et rend un plan. Le composable
 * mesure et applique.
 */

/** Une rubrique : sa distance au haut de la fenêtre, et son nombre de lignes. */
export type RevealGroup = {
  top: number
  size: number
}

export type RevealStep = {
  /** `load` entre tout de suite ; `scroll` attend d'arriver dans la fenêtre. */
  mode: 'load' | 'scroll'
  /** Un délai par ligne, dans l'ordre. */
  delays: readonly number[]
}

export const revealPlan = (
  groups: readonly RevealGroup[],
  viewportHeight: number,
  /** Début de la cascade : après l'entrée du bloc de tête. */
  base = 700,
  /** Écart entre deux lignes. */
  step = 90,
): readonly RevealStep[] => {
  // Le rang court d'une rubrique à l'autre : la cascade est une seule phrase,
  // pas une suite de départs qui se chevauchent.
  let rank = 0

  return groups.map(({ top, size }) =>
    top < viewportHeight
      ? { mode: 'load', delays: Array.from({ length: size }, () => base + rank++ * step) }
      : { mode: 'scroll', delays: Array.from({ length: size }, (_, line) => line * step) },
  )
}
