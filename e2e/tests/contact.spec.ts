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

/**
 * Les mêmes coordonnées sur l'accueil, depuis l'issue #53. Elles y sont en
 * clair pour un recruteur, et elles sortent du même contenu que `/contact` :
 * si un numéro diverge entre les deux pages, c'est qu'il a été recopié dans
 * un gabarit.
 */
test.describe('Coordonnées de l’accueil', () => {
  test('le téléphone et l’adresse e-mail y portent les mêmes href que /contact', async ({ page }) => {
    await page.goto('/contact')

    const expectedPhone = await page.locator('a[href^="tel:"]').first().getAttribute('href')
    const expectedMail = await page.locator('a[href^="mailto:"]').first().getAttribute('href')

    await page.goto('/')

    // Aucun clic : ces liens passent la main à une application du système.
    await expect(page.locator(`a[href="${expectedPhone}"]`)).toBeVisible()
    await expect(page.locator(`a[href="${expectedMail}"]`)).toBeVisible()
  })

  test('la section « Me joindre » renvoie à la page Contact', async ({ page }) => {
    await page.goto('/')

    // Scopé à la région : `getByRole('link', { name: 'Contact' })` seul
    // tombait sur le lien de l'en-tête, présent sur toutes les pages et
    // avant `<main>` — le test passait même sans lien dans la section.
    const section = page.getByRole('region', { name: 'Me joindre' })

    await expect(section.getByRole('link', { name: 'Contact' })).toBeVisible()
  })

  /**
   * L'intitulé de la section, et non la phrase de disponibilité qui en tenait
   * lieu jusqu'au 12/11/2026 : 77 signes en capitales, qui servaient de nom
   * accessible à la région sans décrire ce qu'elle contient (WCAG 2.4.6).
   * Axe ne voit pas ce critère.
   */
  test('la dernière section de l’accueil porte un intitulé, pas une phrase', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Me joindre', level: 2 })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Me joindre' })).toBeVisible()
  })

  /**
   * Les deux liens tenaient 29 px de haut à 8 px l'un de l'autre, quand
   * `--control-min-height` pose 44 px pour toute la page — et ce sont les
   * deux cibles que `PRODUCT.md` met sur le chemin d'un recruteur. Aucune
   * suite ne mesurait de cible avant le 12/11/2026.
   */
  test('les coordonnées de l’accueil tiennent une cible de 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const section = page.getByRole('region', { name: 'Me joindre' })

    for (const name of [/^Téléphone/, /^Adresse e-mail/]) {
      const box = await section.getByRole('link', { name }).boundingBox()

      expect(box, String(name)).toBeTruthy()
      expect(box!.height, String(name)).toBeGreaterThanOrEqual(44)
    }
  })
})
