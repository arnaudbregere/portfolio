import { revealPlan } from '~/utils/reveal'

const setDelay = (line: HTMLElement, delay: number) =>
  line.style.setProperty('--reveal-delay', `${delay}ms`)

/**
 * Répartit les entrées entre ce qui se lit sans défiler et ce qui s'atteint.
 *
 * Au premier rendu, la mesure classe chaque **rubrique**, jamais ses lignes
 * une à une : une rubrique à cheval sur la ligne de flottaison verrait sinon
 * ses dernières lignes libérées aussitôt, donc apparaître avant les
 * premières. Au-dessus de la ligne, la rubrique prend ses rangs dans la
 * cascade de chargement. En dessous, elle attend : son arrivée dans la
 * fenêtre **joue** la cascade au lieu de la piloter. Le rythme appartient
 * donc à la page et non à la vitesse de la molette, et remonter ne rejoue
 * rien.
 *
 * Deux états seulement, tous deux stables : `pending` ne porte aucune
 * animation, l'arrivée la pose. Rien n'est jamais interrompu en vol.
 *
 * **La mesure attend `document.fonts.ready`.** Prise plus tôt, elle lit une
 * mise en page qui n'a pas encore sa police : mesuré sur cette page, une ligne
 * à 1039 px d'une fenêtre de 1163 px était classée hors champ parce que tout
 * descendait encore de quelques dizaines de pixels.
 *
 * Sans JavaScript, aucun attribut n'est posé et tout entre au chargement : la
 * page reste entière. Sous `prefers-reduced-motion`, le composable ne fait
 * rien — masquer en attendant un défilement serait un mouvement de plus, pas
 * un de moins.
 */
export const useRevealCascade = (root: Ref<HTMLElement | null>) => {
  let observer: IntersectionObserver | undefined

  onBeforeUnmount(() => observer?.disconnect())

  onMounted(async () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // `document.fonts` manque à quelques environnements de test : son absence
    // ne doit pas empêcher la mesure, seulement la retarder moins.
    await document.fonts?.ready

    const host = root.value
    if (!host) return

    const sections = [...host.querySelectorAll<HTMLElement>('[data-reveal-section]')].map(
      (section) => ({
        section,
        lines: [...section.querySelectorAll<HTMLElement>('[data-reveal-item]')],
      }),
    )

    const plan = revealPlan(
      sections.map(({ section, lines }) => ({
        top: section.getBoundingClientRect().top,
        size: lines.length,
      })),
      window.innerHeight,
    )

    /** Les rubriques en attente, et le délai de chacune de leurs lignes. */
    const waiting = new Map<Element, { lines: HTMLElement[]; delays: readonly number[] }>()

    sections.forEach(({ section, lines }, index) => {
      const step = plan[index]!

      if (step.mode === 'load') {
        lines.forEach((line, rank) => setDelay(line, step.delays[rank]!))
        return
      }

      for (const line of lines) line.dataset.reveal = 'pending'
      waiting.set(section, { lines, delays: step.delays })
    })

    if (waiting.size === 0) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const batch = waiting.get(entry.target)

          if (!entry.isIntersecting || !batch) continue

          batch.lines.forEach((line, rank) => {
            setDelay(line, batch.delays[rank]!)
            // Retirer l'attribut pose l'animation : elle part donc de son
            // début, et non du milieu d'une animation déjà en cours.
            delete line.dataset.reveal
          })

          waiting.delete(entry.target)
          observer?.unobserve(entry.target)
        }
      },
      // La rubrique doit être franchement entrée, pas affleurante : sans cette
      // marge, la cascade se jouerait au ras du bord bas de l'écran.
      { rootMargin: '0px 0px -15% 0px' },
    )

    for (const section of waiting.keys()) observer.observe(section)
  })
}
