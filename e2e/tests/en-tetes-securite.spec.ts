import { expect, test } from '@playwright/test'
import { sitePages } from './support/site'

/**
 * Les en-têtes de sécurité, tels que le serveur de production les sert.
 *
 * Les valeurs et ce qu'elles interdisent sont vérifiés par Vitest
 * (`tests/unit/security-headers.spec.ts`). Ici, deux questions seulement :
 * l'en-tête **arrive-t-il** sur chaque réponse, et la page **fonctionne-t-elle
 * sous la politique** ? Une politique de sécurité du contenu trop serrée
 * serait verte en unitaire et casserait l'hydratation chez le visiteur.
 */

const expected = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'cross-origin-opener-policy': 'same-origin',
} as const

test.describe('En-têtes de sécurité', () => {
  for (const { path, name } of sitePages) {
    test(`${name} les porte tous`, async ({ request }) => {
      const headers = (await request.get(path)).headers()

      for (const [header, value] of Object.entries(expected)) {
        expect(headers[header], `${header} sur ${path}`).toBe(value)
      }

      expect(headers['strict-transport-security']).toContain('includeSubDomains')
      expect(headers['permissions-policy']).toContain('camera=()')

      const policy = headers['content-security-policy']

      expect(policy).toContain("default-src 'self'")
      expect(policy).toContain("frame-ancestors 'none'")
      expect(policy).not.toMatch(/https?:\/\//)
    })
  }

  /**
   * Les réponses qui ne sont pas des documents passent par les mêmes
   * `routeRules` ; elles sont le cas qu'un oubli de couverture laisserait nu.
   *
   * `/fonts/…woff2` est un fichier de `public/`, servi par le gestionnaire
   * d'actifs statiques — en production, par le CDN de Vercel sans passer par
   * Node. C'est exactement la couverture que `nuxt.config.ts` revendique, et
   * elle n'était pas testée avant le 12/11/2026.
   */
  for (const path of [
    '/robots.txt',
    '/sitemap.xml',
    '/api/health',
    '/fonts/archivo-variable-latin.woff2',
    '/og/arnaud-bregere.png',
  ]) {
    test(`${path} porte les en-têtes de sécurité`, async ({ request }) => {
      const response = await request.get(path)

      expect(response.status(), `${path} doit exister`).toBe(200)

      const headers = response.headers()

      for (const [header, value] of Object.entries(expected)) {
        expect(headers[header], `${header} sur ${path}`).toBe(value)
      }

      expect(headers['content-security-policy']).toContain("default-src 'self'")
    })
  }

  /**
   * Les modules bâtis portent une empreinte dans leur nom : leur adresse est
   * relevée dans le document plutôt qu'écrite ici, qui serait fausse au build
   * suivant.
   */
  test('les modules de /_nuxt/ portent les en-têtes de sécurité', async ({ request }) => {
    const document = await (await request.get('/')).text()
    const asset = document.match(/\/_nuxt\/[\w.-]+\.js/)?.[0]

    expect(asset, 'aucun module trouvé dans le document').toBeTruthy()

    const headers = (await request.get(asset!)).headers()

    for (const [header, value] of Object.entries(expected)) {
      expect(headers[header], `${header} sur ${asset}`).toBe(value)
    }
  })
})

test.describe('Politique de sécurité du contenu', () => {
  for (const { path, name } of sitePages) {
    test(`${name} se charge sans violation de la politique`, async ({ page }) => {
      const violations: string[] = []

      // Le navigateur signale une ressource bloquée par un message de
      // console ; `securitypolicyviolation` donne en plus la directive, ce
      // qui évite de deviner la cause depuis un symptôme d'hydratation.
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (event) => {
          console.error(
            `CSP: ${event.violatedDirective} a bloqué ${event.blockedURI || 'un contenu en ligne'}`,
          )
        })
      })

      page.on('console', (message) => {
        if (message.type() === 'error' && /CSP:|Content Security Policy/i.test(message.text())) {
          violations.push(message.text())
        }
      })

      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      // L'hydratation est la preuve que les scripts ont bien été exécutés : le
      // bouton de thème ne bascule la classe de `<html>` qu'une fois
      // l'application montée. Un script bloqué le laisserait inerte, sans
      // autre symptôme visible.
      const before = await page.locator('html').getAttribute('class')

      await page.getByRole('button', { name: /^Activer le thème/ }).click()

      await expect(page.locator('html')).not.toHaveClass(String(before))

      expect(violations, violations.join('\n')).toEqual([])
    })
  }
})
