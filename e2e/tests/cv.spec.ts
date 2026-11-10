import { expect, test } from '@playwright/test'

/**
 * Téléchargement du CV.
 *
 * L'atome `CvLink` annonce le format et le poids avant le clic : RGAA 4.1,
 * critère 13.6. Son nom accessible porte donc les trois informations, et c'est
 * par ce nom que le test l'atteint.
 *
 * Le lien est posé sur l'accueil et sur `/a-propos`.
 */
test.describe('Téléchargement du CV', () => {
  for (const path of ['/', '/a-propos']) {
    test(`le lien de ${path} annonce le format et le poids`, async ({ page }) => {
      await page.goto(path)

      const link = page.getByRole('link', { name: /Télécharger le CV/ })

      await expect(link).toBeVisible()
      await expect(link).toContainText('PDF')
      await expect(link).toContainText('Ko')
      await expect(link).toHaveAttribute('download', '')
      await expect(link).toHaveAttribute('href', '/pdf/arnaud-bregere_cv.pdf')
    })
  }

  test('le PDF est servi et pèse moins de 500 Ko', async ({ page, request }) => {
    await page.goto('/')

    const href = await page
      .getByRole('link', { name: /Télécharger le CV/ })
      .getAttribute('href')

    expect(href).toBeTruthy()

    const response = await request.get(href!)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/pdf')

    // La check-list de déploiement borne le PDF à 500 Ko : au-delà, le
    // téléchargement se paie en données sur mobile.
    const bytes = (await response.body()).byteLength
    expect(bytes).toBeLessThan(500 * 1024)
  })

  test('le clic déclenche bien un téléchargement', async ({ page }) => {
    await page.goto('/')

    const download = page.waitForEvent('download')
    await page.getByRole('link', { name: /Télécharger le CV/ }).click()

    const file = await download
    expect(file.suggestedFilename()).toBe('arnaud-bregere_cv.pdf')
  })
})
