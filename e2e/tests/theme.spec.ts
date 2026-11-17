import { expect, test } from '@playwright/test'
import { appliedTheme, hydrated, themeStorageKey } from './support/site'

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
    await hydrated(page)

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

  /**
   * **Le bouton n'expose qu'un nom à la fois**, et c'est ce qui tient
   * l'accessibilité depuis le passage au pictogramme (17/11/2026) : il n'a
   * plus de libellé visible, et toujours pas d'`aria-label` — un attribut
   * rendu au serveur resterait figé sur le mauvais thème (issues #6 et #56).
   *
   * Le nom vient donc du texte masqué visuellement par `.visually-hidden`,
   * qui recourt à `clip-path` : l'élément reste rendu, donc dans l'arbre
   * d'accessibilité, donc vocalisé. L'état qui ne convient pas porte
   * `visibility: hidden`, qui l'en retire.
   *
   * Ce test rougirait si cette seconde moitié tombait — un `opacity: 0` à la
   * place, par exemple : les deux textes se cumuleraient dans le nom, et plus
   * aucun des deux libellés ne correspondrait.
   */
  test('n’expose qu’un nom à la fois, celui de l’action', async ({ page }) => {
    await page.goto('/')
    await hydrated(page)

    const vers = (theme: 'clair' | 'sombre') =>
      page.getByRole('button', { name: `Activer le thème ${theme}` })

    await expect(vers('sombre')).toHaveCount(1)
    await expect(vers('clair')).toHaveCount(0)

    await vers('sombre').click()

    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(vers('clair')).toHaveCount(1)
    await expect(vers('sombre')).toHaveCount(0)
  })

  test('le thème sombre survit à un changement de page', async ({ page }) => {
    await page.goto('/')
    await hydrated(page)
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
    await hydrated(page)

    await page.getByRole('button', { name: 'Activer le thème sombre' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await hydrated(page)

    // Le nom du bouton suit le thème restauré : en sombre, il propose le
    // clair. Il l'annonçait à l'envers jusqu'au 10/11/2026 — Vue ne corrige
    // pas un attribut divergent à l'hydratation —, et il vient du HTML du
    // serveur depuis l'issue #56 : le CSS révèle celui des deux libellés qui
    // convient, d'après la classe de `<html>`.
    await page.getByRole('button', { name: 'Activer le thème clair' }).click()
    await expect(page.locator('html')).toHaveClass(/light/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/light/)
  })
})
