import { expect, test } from '@playwright/test'

/**
 * La pellicule de la rubrique « Aperçu » d'une fiche projet (issue #82).
 *
 * Ce qui se vérifie ici et nulle part ailleurs : qu'elle **défile vraiment**.
 * Le test unitaire de `tests/unit/projets.spec.ts` tient le balisage, mais
 * `jsdom` ne met rien en page — il rendrait vert un conteneur dont le
 * `overflow-x` aurait disparu, donc dont les quatre captures suivantes
 * seraient inatteignables.
 *
 * La page retenue est la seule à porter des captures aujourd'hui. Si une
 * autre fiche en reçoit, elle hérite du même composant et du même contrat.
 */
const FICHE = '/projets/japan-manga-explorer'

test.describe('Pellicule des captures', () => {
  test('déborde de son conteneur, donc elle défile', async ({ page }) => {
    await page.goto(FICHE)

    const strip = page.getByRole('list', { name: /Captures de Japan Manga Explorer/ })

    await expect(strip).toBeVisible()

    const { scrollWidth, clientWidth, overflowX } = await strip.evaluate((node) => ({
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      overflowX: getComputedStyle(node).overflowX,
    }))

    expect(overflowX).toBe('auto')
    expect(scrollWidth).toBeGreaterThan(clientWidth)
  })

  test('s’atteint au clavier, et les flèches la font défiler', async ({ page }) => {
    await page.goto(FICHE)

    const strip = page.getByRole('list', { name: /Captures de Japan Manga Explorer/ })

    // Le focus par programme vaut le focus par tabulation pour ce qui est
    // vérifié ici — que le conteneur soit focalisable, et que la touche
    // agisse. Tabuler depuis le haut de la page traverserait l'en-tête et le
    // fil de liens, qui ont leurs propres tests.
    await strip.focus()
    await expect(strip).toBeFocused()

    const depart = await strip.evaluate((node) => node.scrollLeft)

    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect
      .poll(async () => strip.evaluate((node) => node.scrollLeft))
      .toBeGreaterThan(depart)
  })

  /**
   * Les flèches sont la seule commande d'un visiteur à la souris : sans
   * elles, il lui reste la barre de défilement. Elles doublent le doigt, la
   * molette et le clavier, elles ne les remplacent pas.
   */
  test('la flèche avant fait défiler, puis s’éteint au bout', async ({ page }) => {
    await page.goto(FICHE)

    const strip = page.getByRole('list', { name: /Captures de Japan Manga Explorer/ })
    const avant = page.getByRole('button', { name: 'Capture suivante' })
    const arriere = page.getByRole('button', { name: 'Capture précédente' })

    // Au premier rendu, le serveur sert les deux flèches désactivées : le
    // client mesure la pellicule au montage, et n'allume que l'avant.
    await expect(arriere).toBeDisabled()
    await expect(avant).toBeEnabled()

    await avant.click()
    await expect.poll(async () => strip.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0)
    await expect(arriere).toBeEnabled()

    // Le bout se rejoint par un défilement, et non par une série de clics :
    // une flèche qui s'éteint entre le moment où le test la lit et celui où
    // il la clique ferait échouer le clic, sans que rien ne soit cassé.
    await strip.evaluate((node) => node.scrollTo({ left: node.scrollWidth, behavior: 'auto' }))

    await expect(avant).toBeDisabled()
    await expect(arriere).toBeEnabled()
  })

  test('la flèche arrière ramène au départ', async ({ page }) => {
    await page.goto(FICHE)

    const strip = page.getByRole('list', { name: /Captures de Japan Manga Explorer/ })
    const avant = page.getByRole('button', { name: 'Capture suivante' })
    const arriere = page.getByRole('button', { name: 'Capture précédente' })

    await avant.click()
    await expect(arriere).toBeEnabled()

    await arriere.click()
    await expect.poll(async () => strip.evaluate((node) => node.scrollLeft)).toBeLessThan(2)
    await expect(arriere).toBeDisabled()
  })

  test('porte une légende et un texte alternatif par capture', async ({ page }) => {
    await page.goto(FICHE)

    const strip = page.getByRole('list', { name: /Captures de Japan Manga Explorer/ })
    const images = strip.locator('img')

    const total = await images.count()

    expect(total).toBeGreaterThan(1)

    for (let rang = 0; rang < total; rang += 1) {
      await expect(images.nth(rang)).toHaveAttribute('alt', /.{20,}/)
    }

    await expect(strip.locator('figcaption')).toHaveCount(total)
  })
})
