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

  test('chaque page ne porte qu’un seul h1', async ({ page }) => {
    for (const path of ['/', '/projets', '/a-propos', '/contact']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    }
  })
})
