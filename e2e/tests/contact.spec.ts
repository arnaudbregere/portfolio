import { expect, test } from '@playwright/test'

/**
 * Liens `tel:` et `mailto:` de `/contact`.
 *
 * **Aucun clic.** Ces liens passent la main à une application du système, que
 * Playwright ne contrôle pas : un clic suspendrait le test sur un dialogue
 * hors du navigateur. Seul l'attribut `href` se vérifie.
 *
 * La forme attendue de `tel:` est internationale et sans séparateur, seule
 * reconnue hors de France : `06 07 98 52 85` donne `tel:+33607985285`.
 */
test.describe('Liens de contact', () => {
  test('le téléphone porte un href tel: internationalisé', async ({ page }) => {
    await page.goto('/contact')

    const phone = page.getByRole('link', { name: /^(\+33|0)[\d\s]+$/ }).first()
    const href = await phone.getAttribute('href')

    expect(href).toMatch(/^tel:\+33\d{9}$/)
    expect(href).not.toContain(' ')
  })

  test('l’adresse e-mail porte un href mailto:', async ({ page }) => {
    await page.goto('/contact')

    const mail = page.locator('a[href^="mailto:"]').first()

    await expect(mail).toBeVisible()

    const href = await mail.getAttribute('href')
    expect(href).toMatch(/^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i)
  })

  test('les deux liens sont nommés par leur libellé de liste', async ({ page }) => {
    await page.goto('/contact')

    // Une liste de définitions : chaque valeur est nommée par son libellé, et
    // le lecteur d'écran annonce le couple.
    await expect(page.getByText('Téléphone', { exact: true })).toBeVisible()
    await expect(page.getByText('E-mail', { exact: true }).or(
      page.getByText('Adresse e-mail', { exact: true }),
    ).first()).toBeVisible()
  })

  test('aucun lien tel: ou mailto: n’ouvre un onglet neuf', async ({ page }) => {
    await page.goto('/contact')

    // `isExternalUrl` écarte ces protocoles : un onglet neuf resterait vide.
    const targets = await page
      .locator('a[href^="tel:"], a[href^="mailto:"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('target')))

    expect(targets.length).toBeGreaterThan(0)
    for (const target of targets) expect(target).toBeNull()
  })

  test('les liens de profil sortent du site avec rel="me"', async ({ page }) => {
    await page.goto('/contact')

    const github = page.getByRole('link', { name: /github\.com/ }).first()

    await expect(github).toHaveAttribute('rel', /me/)
    await expect(github).toHaveAttribute('href', /^https:\/\/github\.com\//)
  })
})
