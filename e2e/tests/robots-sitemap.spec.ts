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

  /**
   * La donnée structurée `Person`, posée une fois pour tout le site. Elle dit
   * à un moteur qui est l'auteur et où le joindre — le téléphone s'y est
   * ajouté le 12/11/2026 (issue #53), quand le numéro est passé sur
   * l'accueil. Une donnée structurée qui annonce moins que la page visible
   * n'a pas d'intérêt ; une qui annonce autre chose est une faute.
   */
  test('le JSON-LD Person annonce les coordonnées de la page', async ({ page }) => {
    await page.goto('/')

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')))

    const person = blocks.find((block) => block['@type'] === 'Person')

    expect(person, 'aucun bloc Person').toBeTruthy()
    expect(person.telephone).toMatch(/^\+33\d{9}$/)
    expect(person.email).toMatch(/^mailto:/)

    // Les mêmes coordonnées que celles rendues dans la page, sans recopie.
    const phone = await page.locator('a[href^="tel:"]').first().getAttribute('href')
    const mail = await page.locator('a[href^="mailto:"]').first().getAttribute('href')

    expect(`tel:${person.telephone}`).toBe(phone)
    expect(person.email).toBe(mail)
  })

  /**
   * Les descriptions portent des durées — « dix ans d'expérience », « sept ans
   * chez Figaro ». Elles disaient « six ans » jusqu'au 12/11/2026, ce qui
   * était déjà faux : l'entrée chez Figaro date d'octobre 2019. Une méta
   * fausse se voit dans un résultat de recherche, pas dans la page.
   */
  test('chaque page porte une description non vide et unique', async ({ page }) => {
    const seen = new Map<string, string>()

    /**
     * Deux plafonds, et le second n'est pas une complaisance.
     *
     * Les pages du site portent une description **écrite pour elle** : elle
     * tient donc dans les ~160 signes qu'un résultat de recherche affiche sur
     * mobile. Une fiche de projet, elle, rend le `problem` de
     * `content/projects.ts` — un texte de page, pas une accroche — et la
     * calculatrice en fait 214. Lui imposer 160 reviendrait à écrire un
     * deuxième texte, ou à couper celui-ci au milieu d'une phrase.
     *
     * La première version de ce test, le 12/11/2026, annonçait 160 dans son
     * message et laissait passer 230 — le plafond avait été choisi pour que
     * la description de l'accueil entre. `.claude/rules/backend.md` nomme ce
     * défaut : une règle qui promet plus que son test ne tient est pire que
     * pas de règle. Les deux plafonds sont donc écrits, et dits.
     */
    const limit = (path: string) =>
      path.startsWith('/projets/')
        ? { max: 230, why: 'fiche de projet : la description est le `problem` du contenu' }
        : { max: 160, why: 'au-delà de ~160 signes, le résultat de recherche tronque' }

    for (const { path, name } of sitePages) {
      await page.goto(path)

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content')

      const { max, why } = limit(path)

      expect(description, name).toBeTruthy()
      expect(description!.length, name).toBeGreaterThan(50)
      expect(description!.length, `${name} — ${why}`).toBeLessThanOrEqual(max)
      expect(seen.has(description!), `${name} partage sa description avec ${seen.get(description!)}`)
        .toBe(false)

      seen.set(description!, name)
    }
  })
})
