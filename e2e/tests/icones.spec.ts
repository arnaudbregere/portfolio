import { expect, test } from '@playwright/test'

/**
 * Les icônes du site.
 *
 * Elles n'existaient pas avant l'issue #53 : le document ne déclarait aucun
 * `rel="icon"`, et Nitro répondait au chemin `/favicon.ico` par un GIF
 * transparent de 1 × 1. Une icône se vérifie servie, pas seulement déclarée
 * — un fichier absent de `public/` rend un 404 qu'aucun test unitaire ne
 * verrait.
 */
test.describe('Icônes du site', () => {
  test('le document déclare le SVG, le PNG de secours et l’icône iOS', async ({ page }) => {
    await page.goto('/')

    const declared = await page
      .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((links) =>
        links.map((link) => [link.getAttribute('rel'), link.getAttribute('href')]),
      )

    expect(declared).toEqual([
      ['icon', '/favicon.svg'],
      ['icon', '/favicon-32.png'],
      // Carré d'un multiple de 48 px : la taille que Google lit pour poser
      // une icône à côté d'un résultat de recherche sur mobile.
      ['icon', '/favicon-192.png'],
      ['apple-touch-icon', '/apple-touch-icon.png'],
    ])
  })

  test('les cinq fichiers sont servis, chacun dans son type', async ({ request }) => {
    const expected = {
      '/favicon.svg': 'image/svg+xml',
      '/favicon-32.png': 'image/png',
      '/favicon-192.png': 'image/png',
      '/apple-touch-icon.png': 'image/png',
      // Demandé par les clients qui ne lisent pas le document. Le fichier de
      // `public/` prend le pas sur la réponse par défaut de Nitro.
      '/favicon.ico': /icon|image/,
    }

    for (const [path, type] of Object.entries(expected)) {
      const response = await request.get(path)

      expect(response.status(), path).toBe(200)
      expect(response.headers()['content-type'], path).toMatch(type)
      expect((await response.body()).byteLength, path).toBeGreaterThan(256)
    }
  })

  /**
   * Le `b` du monogramme prend `currentColor` dans l'atome ; un fichier n'a
   * pas de couleur courante. Le SVG porte donc les deux thèmes lui-même, et
   * la couleur de marque ne bascule pas.
   */
  test('le SVG porte les deux thèmes et la couleur de marque', async ({ request }) => {
    const svg = await (await request.get('/favicon.svg')).text()

    expect(svg).toContain('prefers-color-scheme: dark')
    expect(svg).toContain('#ff5c72')
  })
})
