import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { profile } from '~~/content/cv'
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

  it('garde le téléphone hors de l’accueil', async () => {
    const page = await mountSuspended(IndexPage)

    expect(page.find('a[href^="tel:"]').exists()).toBe(false)
  })
})
