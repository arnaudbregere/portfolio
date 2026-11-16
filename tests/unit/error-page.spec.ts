import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { siteNav } from '~~/content/nav'
import ErrorPage from '~/error.vue'

/**
 * La page d'erreur (issue #71). Avant elle, Nitro répondait au chemin inconnu
 * par son objet JSON par défaut, en pleine page.
 */
describe('page d’erreur', () => {
  const notFound = { statusCode: 404, statusMessage: 'Page not found: /ancienne-adresse' }

  it('annonce le code reçu et nomme ce qui s’est passé', async () => {
    const page = await mountSuspended(ErrorPage, { props: { error: notFound } })

    expect(page.get('h1').text()).toBe('Cette page n’existe pas')
    expect(page.text()).toContain('Erreur 404')
  })

  /**
   * La seconde moitié du titre porte l'encre, comme le prénom de l'accueil.
   * Le nom accessible du titre reste la phrase entière : la coupure est
   * visuelle, pas sémantique.
   */
  it('met la seconde moitié du titre en encre, sans couper la phrase', async () => {
    const page = await mountSuspended(ErrorPage, { props: { error: notFound } })

    expect(page.get('.error__accent').text()).toBe('n’existe pas')
    expect(page.get('h1').text()).toBe('Cette page n’existe pas')
  })

  /**
   * Le pendant de la règle de `.claude/rules/backend.md` : une réponse
   * d'erreur ne divulgue rien de l'infrastructure. `statusMessage` vient de
   * Nitro et porte le chemin demandé tel qu'il a été reçu — donc une adresse
   * que le visiteur n'a pas forcément tapée lui-même.
   */
  it('ne reprend ni le message de l’erreur ni le chemin demandé', async () => {
    const page = await mountSuspended(ErrorPage, { props: { error: notFound } })

    expect(page.text()).not.toContain('Page not found')
    expect(page.text()).not.toContain('/ancienne-adresse')
  })

  it('distingue une erreur serveur d’une page absente', async () => {
    const page = await mountSuspended(ErrorPage, { props: { error: { statusCode: 500 } } })

    expect(page.get('h1').text()).toBe('Le site a rencontré une erreur')
    expect(page.get('.error__accent').text()).toBe('une erreur')
    expect(page.text()).toContain('Erreur 500')
  })

  /**
   * Une seule sortie, et c'est l'accueil : l'en-tête et le pied de page
   * portent déjà les quatre rubriques, des deux côtés de cette page.
   *
   * Elle reste un lien — `href` posé, clic du milieu intact. Son adresse
   * vient de `content/nav.ts`, jamais d'un `'/'` recopié dans le gabarit.
   */
  it('offre une sortie unique vers l’accueil, en lien', async () => {
    const page = await mountSuspended(ErrorPage, { props: { error: notFound } })
    const home = page.get('.error__home')

    expect(home.text()).toBe('Retour à l’accueil')
    expect(home.attributes('href')).toBe(siteNav[0]!.to)
    expect(page.findAll('.error__home')).toHaveLength(1)
  })
})
