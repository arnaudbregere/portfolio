/**
 * Qui entre au chargement, qui entre au défilement.
 *
 * Une entrée au défilement n'a de sens que pour ce qui est hors de la fenêtre
 * au premier rendu : un élément déjà lu a une progression non nulle avant le
 * premier cran de molette, donc rien à jouer. La frontière dépend de la
 * hauteur de la fenêtre, pas du rang de l'élément — elle se mesure, elle ne
 * se code pas en dur.
 *
 * Fonction pure : elle reçoit des nombres et rend un plan. Le composable
 * mesure et applique.
 */

export type RevealStep =
  /** Dans la fenêtre au premier rendu : entre avec la cascade, à son tour. */
  | { mode: 'load'; delay: number }
  /** Sous la ligne de flottaison : entre quand le défilement l'amène. */
  | { mode: 'scroll' }

export const revealPlan = (
  /** Distance de chaque élément au haut de la fenêtre, au premier rendu. */
  tops: readonly number[],
  viewportHeight: number,
  /** Début de la cascade : après l'entrée du bloc de tête. */
  base = 700,
  /** Écart entre deux éléments de la cascade. */
  step = 90,
): readonly RevealStep[] => {
  let rank = 0

  return tops.map((top) =>
    top < viewportHeight ? { mode: 'load', delay: base + rank++ * step } : { mode: 'scroll' },
  )
}
