import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { education, experiences, profile, skillGroups } from '~~/content/cv'
import AProposPage from '~/pages/a-propos.vue'

describe('page À propos', () => {
  it('liste chaque expérience du contenu, dans l’ordre', async () => {
    const page = await mountSuspended(AProposPage)
    const roles = page.findAll('.about__role').map((node) => node.text())

    expect(roles).toHaveLength(experiences.length + education.length)
    expect(roles[0]).toContain(experiences[0]!.role)
    expect(roles[0]).toContain(experiences[0]!.company)
  })

  it('rend chaque mission et chaque formation', async () => {
    const page = await mountSuspended(AProposPage)
    const text = page.text()

    for (const mission of experiences.flatMap((job) => job.missions)) {
      expect(text).toContain(mission)
    }
    for (const course of education) {
      expect(text).toContain(course.school)
    }
  })

  it('nomme chaque groupe de compétences', async () => {
    const page = await mountSuspended(AProposPage)
    const titles = page.findAll('dt').map((node) => node.text())

    expect(titles).toEqual(skillGroups.map((group) => group.title))
  })

  it('propose le CV en téléchargement', async () => {
    const page = await mountSuspended(AProposPage)
    const link = page.get('a[download]')

    expect(link.attributes('href')).toBe('/pdf/arnaud-bregere_cv.pdf')
  })

  it('donne l’e-mail et le téléphone en liens activables', async () => {
    const page = await mountSuspended(AProposPage)

    expect(page.get(`a[href="mailto:${profile.email}"]`).text()).toBe(profile.email)
    expect(page.get('a[href^="tel:"]').attributes('href')).toBe('tel:+33607985285')
  })

  it('n’expose aucune adresse postale', async () => {
    const page = await mountSuspended(AProposPage)

    expect(page.text()).not.toMatch(/\d{1,3},?\s+rue\s/i)
  })
})
