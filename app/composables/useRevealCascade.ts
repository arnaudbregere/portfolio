import { revealPlan } from '~/utils/reveal'

/**
 * Mesure, au premier rendu, ce qui est lisible sans défiler, et répartit les
 * entrées en conséquence.
 *
 * Le défaut du CSS est l'entrée au chargement : ce composable ne fait que
 * **retirer** de la cascade ce qu'il trouve sous la ligne de flottaison, en
 * posant `data-reveal="scroll"`. Dans ce sens, rien ne clignote — un élément
 * retiré est encore à l'opacité 0 quand on le retire — et une page dont le
 * JavaScript ne s'exécute jamais garde une entrée complète.
 *
 * **La mesure attend `document.fonts.ready`.** Prise plus tôt, elle lit une
 * mise en page qui n'a pas encore sa police : mesuré sur cette page, une ligne
 * à 1040 px d'une fenêtre de 1163 px était classée hors champ parce que tout
 * descendait encore de quelques dizaines de pixels. Le retard est sans danger
 * — le délai par défaut de la cascade est de 700 ms, et un élément retiré
 * avant son tour est encore à l'opacité 0.
 *
 * La mesure est prise une fois. Un redimensionnement ne la rejoue pas : la
 * cascade d'entrée appartient à l'arrivée sur la page, pas à sa vie.
 */
export const useRevealCascade = (root: Ref<HTMLElement | null>) => {
  onMounted(async () => {
    // `document.fonts` manque à quelques environnements de test : son absence
    // ne doit pas empêcher la mesure, seulement la retarder moins.
    await document.fonts?.ready

    const items = [...(root.value?.querySelectorAll<HTMLElement>('[data-reveal-item]') ?? [])]
    const plan = revealPlan(
      items.map((item) => item.getBoundingClientRect().top),
      window.innerHeight,
    )

    items.forEach((item, index) => {
      const step = plan[index]!

      if (step.mode === 'scroll') item.dataset.reveal = 'scroll'
      else item.style.setProperty('--reveal-delay', `${step.delay}ms`)
    })
  })
}
