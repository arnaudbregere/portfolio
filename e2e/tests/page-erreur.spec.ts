import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { forceTheme, settle, themes } from './support/site'

const UNKNOWN_PATH = '/page-qui-nexiste-pas'

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const BLOCKING = new Set(['critical', 'serious'])

/**
 * La page d'erreur (issue #71).
 *
 * Relevé sur la production le 16/11/2026 : le chemin inconnu rendait l'objet
 * JSON par défaut de Nitro — `{"error":true,"statusCode":404,…}` — en pleine
 * page. Le code HTTP était juste ; la réponse rendue au visiteur ne l'était
 * pas, et c'est la seule page que voit un recruteur qui suit un lien périmé.
 *
 * Les deux bouts se vérifient séparément : la réponse HTTP par `request`, qui
 * ne rend pas la page, et le document par `page`, qui ne dit pas son code.
 */
test.describe('Page d’erreur', () => {
  test('le chemin inconnu répond 404 en HTML, et non en JSON', async ({ request }) => {
    const response = await request.get(UNKNOWN_PATH)

    expect(response.status()).toBe(404)
    expect(response.headers()['content-type']).toContain('text/html')

    const body = await response.text()
    expect(body.trimStart().startsWith('{')).toBe(false)
    expect(body).toContain('<!DOCTYPE html>')
    expect(body).toContain('<h1')
  })

  /**
   * Ce que cette issue corrige, c'est la **page rendue**. La charge utile
   * d'hydratation de Nuxt, elle, continue de porter `statusMessage` et le
   * chemin demandé : `__NUXT_DATA__` sérialise l'objet d'erreur tel que le
   * serveur l'a construit, et aucun gabarit n'a prise dessus.
   *
   * La distinction est tenue ici plutôt que tue : rien de ce que Nitro dit
   * de l'erreur n'atteint le document visible, ni le nom accessible d'un
   * élément.
   */
  test('rien de l’erreur de Nitro n’atteint le contenu visible', async ({ page }) => {
    await page.goto(UNKNOWN_PATH)

    const visible = await page.getByRole('main').innerText()

    expect(visible).not.toContain('Page not found')
    expect(visible).not.toContain(UNKNOWN_PATH)
  })

  test('elle nomme l’erreur et garde l’ossature du site', async ({ page }) => {
    await page.goto(UNKNOWN_PATH)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cette page n’existe pas')
    // L'en-tête et le pied de page viennent du gabarit : la bascule de thème
    // et le menu restent accessibles depuis l'erreur.
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })

  /**
   * `clearError` et non une navigation nue : l'état d'erreur survit à une
   * navigation côté client, et la page suivante s'afficherait sous lui. Le
   * titre de l'accueil est la preuve que l'erreur a bien été vidée.
   */
  test('le retour à l’accueil ramène dans le site', async ({ page }) => {
    await page.goto(UNKNOWN_PATH)
    await page.getByRole('link', { name: 'Retour à l’accueil' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Arnaud Brégère')
  })

  /**
   * L'audit axe des sept pages vit dans `accessibilite.spec.ts`, qui itère
   * `sitePages`. La page d'erreur n'est pas une page du site — elle n'a pas
   * d'adresse propre et ne doit pas être indexée —, elle porte donc son audit
   * ici, aux mêmes règles et aux mêmes degrés refusés.
   */
  test.describe('Audit d’accessibilité', () => {
    test.use({ reducedMotion: 'reduce' })

    for (const theme of themes) {
      test(`thème ${theme === 'dark' ? 'sombre' : 'clair'}`, async ({ page }, info) => {
        await forceTheme(page, theme)
        await page.goto(UNKNOWN_PATH)

        await expect(page.locator('html')).toHaveClass(new RegExp(theme))
        await settle(page)

        const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze()

        await info.attach(`axe-erreur-${theme}.json`, {
          body: JSON.stringify(results.violations, null, 2),
          contentType: 'application/json',
        })

        const blocking = results.violations.filter(
          (violation) => BLOCKING.has(violation.impact ?? ''),
        )

        expect(blocking.map((violation) => violation.id)).toEqual([])
      })
    }
  })
})
