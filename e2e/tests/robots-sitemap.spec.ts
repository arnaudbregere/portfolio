import { expect, test } from '@playwright/test'
import { sitePages } from './support/site'

/**
 * `/robots.txt` et `/sitemap.xml`, les deux seules routes serveur du dépôt.
 *
 * La check-list de déploiement les vérifie après chaque mise en ligne : les
 * vérifier ici évite d'avoir à le faire à la main.
 */
test.describe('Référencement', () => {
  test('robots.txt répond et désigne le plan du site', async ({ request }) => {
    const response = await request.get('/robots.txt')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/plain')

    const body = await response.text()
    expect(body).toContain('Sitemap:')
  })

  test('sitemap.xml répond et liste les pages du site', async ({ request }) => {
    const response = await request.get('/sitemap.xml')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('xml')

    const body = await response.text()

    for (const { path } of sitePages) {
      expect(body, `${path} absent du plan du site`).toContain(
        path === '/' ? '</loc>' : `${path}</loc>`,
      )
    }

    // La planche de spécimen ne part pas en production, donc pas dans le plan.
    expect(body).not.toContain('/_ds')
  })

  test('chaque page porte une URL canonique', async ({ page }) => {
    for (const { path } of sitePages) {
      await page.goto(path)

      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveCount(1)
      await expect(canonical).toHaveAttribute('href', /^https?:\/\//)
    }
  })

  test('la planche de spécimen n’est pas servie en production', async ({ request }) => {
    const response = await request.get('/_ds')
    expect(response.status()).toBe(404)
  })
})
