/**
 * État et commandes d'une pellicule à défilement horizontal.
 *
 * Le défilement lui-même reste au navigateur : `overflow-x` et `scroll-snap`
 * font le travail, au doigt comme à la molette. Ce composable n'ajoute que ce
 * que le CSS ne sait pas faire — dire si l'on peut encore aller d'un côté ou
 * de l'autre, et avancer d'une capture sur commande.
 *
 * Pourquoi un composable et non vingt lignes dans l'organisme : le calcul des
 * bornes est de la logique, et `.claude/rules/frontend.md` la veut ici. Il est
 * aussi le seul morceau testable sans mise en page — `tests/unit/filmstrip.spec.ts`
 * lui passe des mesures à la main.
 */

/** Un objet qui se mesure et se défile, c'est-à-dire un élément ou son double de test. */
export type Scroller = Pick<
  HTMLElement,
  'scrollLeft' | 'clientWidth' | 'scrollWidth' | 'scrollBy'
> & {
  readonly firstElementChild: Pick<Element, 'getBoundingClientRect'> | null
}

/**
 * Un pixel de tolérance. Une position de défilement est fractionnaire dès que
 * la largeur de la fenêtre l'est, et `scrollLeft + clientWidth` n'atteint
 * alors jamais exactement `scrollWidth` : la flèche de droite resterait
 * active au bout de la pellicule.
 */
const MARGE = 1

/** Ce que les flèches permettent encore, à une position donnée. */
export const filmstripBounds = (scroller: Scroller) => ({
  back: scroller.scrollLeft > MARGE,
  forward:
    scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - MARGE,
})

/**
 * De combien une flèche fait avancer la pellicule : la largeur d'une capture.
 *
 * Pas la largeur visible du conteneur : elle en contient deux et demie en
 * desktop, et un saut de deux captures et demie dépasserait le point
 * d'accroche suivant. Sans première capture à mesurer, on retombe sur la
 * largeur visible, qui vaut mieux que zéro.
 */
export const filmstripStep = (scroller: Scroller) => {
  const first = scroller.firstElementChild

  if (!first) return scroller.clientWidth

  const { width } = first.getBoundingClientRect()

  return width > 0 ? width : scroller.clientWidth
}

export const useFilmstrip = (strip: Ref<HTMLElement | null>) => {
  const canScrollBack = ref(false)
  const canScrollForward = ref(false)

  const mesurer = () => {
    const node = strip.value

    if (!node) return

    const { back, forward } = filmstripBounds(node)

    canScrollBack.value = back
    canScrollForward.value = forward
  }

  /**
   * Le déplacement suit la préférence du visiteur : `prefers-reduced-motion`
   * coupe le glissement, comme `_reset.scss` le fait pour les animations.
   */
  const avancer = (sens: -1 | 1) => {
    const node = strip.value

    if (!node) return

    const doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    node.scrollBy({
      left: sens * filmstripStep(node),
      behavior: doux ? 'smooth' : 'auto',
    })
  }

  onMounted(() => {
    const node = strip.value

    if (!node) return

    mesurer()
    node.addEventListener('scroll', mesurer, { passive: true })
    window.addEventListener('resize', mesurer, { passive: true })
  })

  onBeforeUnmount(() => {
    strip.value?.removeEventListener('scroll', mesurer)
    window.removeEventListener('resize', mesurer)
  })

  return {
    canScrollBack,
    canScrollForward,
    scrollBack: () => avancer(-1),
    scrollForward: () => avancer(1),
  }
}
