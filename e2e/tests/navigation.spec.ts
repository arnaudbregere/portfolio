import { expect, test } from '@playwright/test'

/**
 * Navigation entre les quatre rubriques de `content/nav.ts`, par la barre de
 * l'en-tête — celle qui s'affiche à partir du point de rupture `m`. Le menu en
 * surcouche a sa propre spec.
 *
 * Les rubriques sont atteintes par leur nom accessible, jamais par une classe :
 * un lien introuvable par son rôle est un défaut d'accessibilité, pas un
 * problème de sélecteur.
 */
test.describe('Navigation entre les rubriques', () => {
  test('la barre de l’en-tête mène aux quatre rubriques', async ({ page }) => {
    await page.goto('/')

    const bar = page.getByRole('navigation', { name: 'Rubriques' })

    for (const [label, path, heading] of [
      ['Projets', '/projets', 'Projets'],
      ['À propos', '/a-propos', 'À propos'],
      ['Contact', '/contact', 'Contact'],
    ] as const) {
      await bar.getByRole('link', { name: label, exact: true }).click()
      await expect(page).toHaveURL(path)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
    }

    await bar.getByRole('link', { name: 'Accueil', exact: true }).click()
    await expect(page).toHaveURL('/')
  })

  test('la rubrique courante est signalée par aria-current', async ({ page }) => {
    await page.goto('/projets')

    const current = page
      .getByRole('navigation', { name: 'Rubriques' })
      .getByRole('link', { name: 'Projets', exact: true })

    await expect(current).toHaveAttribute('aria-current', 'page')
  })

  test('le monogramme ramène à l’accueil', async ({ page }) => {
    await page.goto('/contact')

    // Le monogramme est `aria-hidden` ; le nom du site le suit en texte réel
    // masqué visuellement, et nomme donc le lien.
    await page.getByRole('link', { name: 'Arnaud Brégère' }).first().click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('une fiche de projet s’ouvre depuis la liste, et l’on en revient', async ({ page }) => {
    await page.goto('/projets')

    const first = page.getByRole('link', { name: /Japan Manga Explorer/i }).first()
    await first.click()

    await expect(page).toHaveURL(/\/projets\/[a-z0-9-]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await page.goBack()
    await expect(page).toHaveURL('/projets')
  })

  /**
   * La fiche entière mène au projet depuis le 13/11/2026 (`DESIGN.md` § 5) :
   * le lien du titre pose une couche sur le bloc. Le clic part donc du
   * résumé, qui n'est pas un lien — c'est tout l'objet de la décision.
   *
   * L'entrée de page est attendue avant le clic : le temps de la figure, le
   * `h2` porte un `translate` et la couche se réduit au titre. Le test
   * cliquerait alors à côté, par intermittence.
   */
  test('la fiche de projet s’ouvre hors du titre', async ({ page }) => {
    await page.goto('/projets')

    const fiche = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: /Japan Manga Explorer/i }) })
      .first()

    await expect(fiche).toBeVisible()

    // L'entrée de page est attendue : le temps de la figure, le `h2` porte un
    // `translate` et la couche se réduit au titre. Le clic partirait alors à
    // côté, par intermittence.
    await page.waitForTimeout(1500)

    // Le bas du bloc : la ligne des technos, qui n'est pas un lien. C'est tout
    // l'objet de la décision — la cible n'est plus le seul titre.
    const box = (await fiche.boundingBox())!

    await fiche.click({ position: { x: 24, y: box.height - 8 } })

    await expect(page).toHaveURL(/\/projets\/[a-z0-9-]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  /**
   * La cible s'étend sans que le lien se duplique : un seul arrêt de
   * tabulation par fiche, et un nom accessible qui reste le titre du projet.
   * Un bloc enveloppé dans un `<a>` l'aurait allongé de trois lignes.
   */
  test('la fiche cliquable n’ajoute ni lien ni arrêt de tabulation', async ({ page }) => {
    await page.goto('/projets')

    const fiche = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: /Japan Manga Explorer/i }) })
      .first()

    const link = fiche.getByRole('link')

    await expect(link).toHaveCount(1)
    await expect(link).toHaveAccessibleName(/^Japan Manga Explorer$/i)
  })

  test('chaque page ne porte qu’un seul h1', async ({ page }) => {
    for (const path of ['/', '/projets', '/a-propos', '/contact']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    }
  })
})
