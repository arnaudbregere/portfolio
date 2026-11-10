import { expect, test } from '@playwright/test'
import { appliedTheme, themeStorageKey } from './support/site'

/**
 * Bascule de thème, et sa persistance après rechargement.
 *
 * `@nuxtjs/color-mode` est configuré avec `classSuffix: ''` : le thème
 * s'applique en classe nue sur `<html>` (`light` ou `dark`), et se retient
 * sous la clé `portfolio-theme`.
 *
 * Le bouton est nommé par ce qu'il va faire, pas par l'état courant : « Activer
 * le thème sombre » quand le thème est clair.
 *
 * Aucun `addInitScript` ici, contrairement à la spec d'audit : il se rejouerait
 * à chaque rechargement et réécrirait la préférence, donc masquerait la
 * persistance même. Le thème de départ vient de `colorScheme`, imposé au
 * contexte, et les bascules passent par le bouton — c'est lui qui est testé.
 */
test.use({ colorScheme: 'light' })

test.describe('Bascule de thème', () => {
  test('bascule du clair au sombre, et persiste après rechargement', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveClass(/light/)

    await page.getByRole('button', { name: 'Activer le thème sombre' }).click()

    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(
      page.getByRole('button', { name: 'Activer le thème clair' }),
    ).toBeVisible()

    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      themeStorageKey,
    )
    expect(stored).toBe('dark')

    await page.reload()

    await expect(page.locator('html')).toHaveClass(/dark/)
    expect(await appliedTheme(page)).toContain('dark')
  })

  test('le thème sombre survit à un changement de page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Activer le thème sombre' }).click()

    await expect(page.locator('html')).toHaveClass(/dark/)

    await page
      .getByRole('navigation', { name: 'Rubriques' })
      .getByRole('link', { name: 'Contact', exact: true })
      .click()

    await expect(page).toHaveURL('/contact')
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('revenir au clair est retenu aussi', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Activer le thème sombre' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()

    // Le nom du bouton suit le thème restauré : en sombre, il propose le clair.
    // Il l'annonçait à l'envers jusqu'au 10/11/2026 — Vue ne corrige pas un
    // attribut divergent à l'hydratation. Voir `ThemeToggle.vue`.
    await page.getByRole('button', { name: 'Activer le thème clair' }).click()
    await expect(page.locator('html')).toHaveClass(/light/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/light/)
  })
})
