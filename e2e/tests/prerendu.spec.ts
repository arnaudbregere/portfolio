import { expect, test } from '@playwright/test'
import { sitePages } from './support/site'

/**
 * Le prérendu des pages.
 *
 * `CLAUDE.md` et `PRODUCT.md` annonçaient des pages prérendues depuis
 * l'origine ; seuls `/sitemap.xml` et `/robots.txt` l'étaient, et les sept
 * pages sortaient en rendu à la requête (issue #17, livrée le 12/11/2026).
 *
 * Une page prérendue ne se reconnaît pas à sa réponse : même HTML, même
 * en-têtes. Elle se reconnaît à la **charge utile** que le build écrit à côté
 * d'elle — `_payload.json`. Son absence dit que la page est rendue à la
 * requête, ce qu'aucune autre assertion ne verrait.
 */
test.describe('Prérendu', () => {
  for (const { path, name } of sitePages) {
    test(`${name} est prérendue`, async ({ request }) => {
      const payload = `${path.replace(/\/$/, '')}/_payload.json`
      const response = await request.get(payload)

      expect(response.status(), payload).toBe(200)
    })
  }

  /**
   * L'exception, et elle est voulue : `/api/health` rend l'identité du build
   * et doit répondre à la requête. Prérendue, la route servirait un
   * horodatage figé au build — et `.claude/skills/deploy/SKILL.md` s'en sert
   * pour vérifier qu'un déploiement est bien celui qu'on croit.
   */
  test('le contrôle de santé reste rendu à la requête', async ({ request }) => {
    const payload = await request.get('/api/_payload.json')
    expect(payload.status()).toBe(404)

    const health = await request.get('/api/health')
    expect(health.status()).toBe(200)

    const body = await health.json()
    expect(body.status).toBe('ok')
    expect(body.builtAt).toBeTruthy()
  })
})
