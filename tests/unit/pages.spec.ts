import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AProposPage from '~/pages/a-propos.vue'
import ContactPage from '~/pages/contact.vue'
import IndexPage from '~/pages/index.vue'
import ProjetsPage from '~/pages/projets/index.vue'

/**
 * Les quatre rubriques publiques. Le squelette ne porte pas encore son
 * contenu ; ce qui est vérifié est la structure opposable : un titre de
 * niveau 1 et un seul, par page.
 */
const pages = [
  { name: 'accueil', component: IndexPage, heading: 'Arnaud Brégère' },
  { name: 'projets', component: ProjetsPage, heading: 'Projets' },
  { name: 'à propos', component: AProposPage, heading: 'À propos' },
  { name: 'contact', component: ContactPage, heading: 'Contact' },
] as const

describe.each(pages)('page $name', ({ component, heading }) => {
  it('affiche un titre de niveau 1 unique', async () => {
    const page = await mountSuspended(component)
    const headings = page.findAll('h1')

    expect(headings).toHaveLength(1)
    expect(headings[0]!.text()).toBe(heading)
  })

  it('fait suivre le titre d’un chapeau', async () => {
    const page = await mountSuspended(component)

    expect(page.find('h1 + p').text()).not.toBe('')
  })

  /**
   * Le formulaire de contact est abandonné le 05/11/2026 (issue #5) au profit
   * des coordonnées en clair. Quatre fichiers l'affirmaient encore et ont été
   * repris ce jour-là ; `index.vue` a été manqué, et la page d'accueil
   * renvoyait encore vers quelque chose qui n'existe pas.
   *
   * Ce test porte sur le rendu et non sur la source : un commentaire qui
   * explique la décision garde le droit de nommer le formulaire, la page non.
   */
  it('ne propose aucun formulaire, et n’en annonce aucun', async () => {
    const page = await mountSuspended(component)

    expect(page.find('form').exists()).toBe(false)
    expect(page.find('input').exists()).toBe(false)
    expect(page.text()).not.toMatch(/formulaire/i)
  })
})
