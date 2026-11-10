import { expect, test } from '@playwright/test'

/**
 * `GET /api/health` — le contrôle de déploiement.
 *
 * Il répond à une seule question : quelle version du code est en ligne. Les
 * tests portent donc sur la forme du contrat, pas sur les valeurs : en local
 * et en CI, aucune variable d'hébergeur n'est posée et tout vaut « inconnu ».
 * C'est précisément le cas qui doit continuer de répondre.
 */
test.describe('Contrôle de santé', () => {
  test('répond 200 en JSON, sans cache', async ({ request }) => {
    const response = await request.get('/api/health')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/json')

    // Une réponse gardée en cache dirait la version précédente après un
    // déploiement, soit l'inverse de ce qu'on lui demande.
    expect(response.headers()['cache-control']).toContain('no-store')
  })

  test('porte les six champs du contrat, et rien d’autre', async ({ request }) => {
    const body = await (await request.get('/api/health')).json()

    expect(Object.keys(body).sort()).toEqual([
      'branch',
      'builtAt',
      'commit',
      'commitShort',
      'environment',
      'status',
    ])

    expect(body.status).toBe('ok')
    for (const value of Object.values(body)) expect(typeof value).toBe('string')
  })

  test('la forme courte du commit s’accorde avec l’empreinte', async ({ request }) => {
    const { commit, commitShort } = await (await request.get('/api/health')).json()

    if (commit === 'inconnu') {
      expect(commitShort).toBe('inconnu')
      return
    }

    expect(commit).toMatch(/^[0-9a-f]{40}$/)
    expect(commitShort).toBe(commit.slice(0, 7))
  })

  /**
   * La route ne doit rien dire de l'infrastructure : ni chemin de fichier, ni
   * variable d'environnement, ni version de dépendance.
   * `.claude/rules/backend.md` l'exige, et une réponse publique est le pire
   * endroit pour l'oublier.
   */
  test('ne divulgue rien de l’infrastructure', async ({ request }) => {
    const raw = await (await request.get('/api/health')).text()

    for (const leak of ['/home/', '/var/', 'node_modules', 'NUXT_', 'VERCEL_', 'nitro']) {
      expect(raw, `« ${leak} » ne doit pas figurer dans la réponse`).not.toContain(leak)
    }
  })

  test('n’est pas déclarée aux moteurs de recherche', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()

    expect(sitemap).not.toContain('/api/')
  })
})
