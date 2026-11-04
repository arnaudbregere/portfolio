import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { profile } from '~~/content/cv'
import { projects } from '~~/content/projects'
import IndexPage from '~/pages/index.vue'

describe('page Accueil', () => {
  it('annonce le nom et l’intitulé visé', async () => {
    const page = await mountSuspended(IndexPage)

    expect(page.get('h1').text()).toBe(profile.name)
    expect(page.text()).toContain(profile.role)
  })

  it('calcule l’ancienneté au lieu de l’écrire en dur', async () => {
    const page = await mountSuspended(IndexPage)
    const expected = new Date().getUTCFullYear() - 2019 - (new Date().getUTCMonth() < 9 ? 1 : 0)

    expect(page.text()).toContain(`${expected} ans`)
  })

  it('propose le CV et les deux voies de contact', async () => {
    const page = await mountSuspended(IndexPage)

    expect(page.get('a[download]').attributes('href')).toBe('/pdf/arnaud-bregere_cv.pdf')
    expect(page.get(`a[href="mailto:${profile.email}"]`).exists()).toBe(true)
    expect(page.find('a[href="/contact"]').exists()).toBe(true)
  })

  /**
   * Le défaut corrigé par l'issue #15 : `featured` était posé dans le contenu
   * et lu nulle part. Ces trois tests le rendent opposable — un projet marqué
   * ou démarqué change la page, ou un test tombe.
   */
  it('met en avant exactement les projets marqués `featured`', async () => {
    const page = await mountSuspended(IndexPage)
    const featured = projects.filter((project) => project.featured)

    const titles = page.findAll('.home__project-title').map((node) => node.text())

    expect(titles).toEqual(featured.map((project) => project.title))
  })

  it('lie chaque projet mis en avant à sa fiche, et renvoie à la liste', async () => {
    const page = await mountSuspended(IndexPage)

    for (const project of projects.filter((item) => item.featured)) {
      expect(page.find(`a[href="/projets/${project.slug}"]`).exists()).toBe(true)
    }
    expect(page.find('a[href="/projets"]').exists()).toBe(true)
  })

  it('tient les projets non retenus hors de l’accueil', async () => {
    const page = await mountSuspended(IndexPage)

    for (const project of projects.filter((item) => !item.featured)) {
      expect(page.find(`a[href="/projets/${project.slug}"]`).exists()).toBe(false)
    }
  })

  it('garde le téléphone hors de l’accueil', async () => {
    const page = await mountSuspended(IndexPage)

    expect(page.find('a[href^="tel:"]').exists()).toBe(false)
  })
})
