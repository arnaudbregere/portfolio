import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { profileLinks, siteNav } from '~~/content/nav'
import SiteFooter from '~/components/organisms/SiteFooter.vue'
import ThemeToggle from '~/components/atoms/ThemeToggle.vue'

describe('ThemeToggle', () => {
  it('se nomme par l’action, pas par l’état courant', async () => {
    const toggle = await mountSuspended(ThemeToggle)
    const button = toggle.get('button')

    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toMatch(/^Activer le thème (clair|sombre)$/)
    expect(button.text()).toContain(button.attributes('aria-label')!.split(' ').pop())
  })

  it('bascule la préférence au clic', async () => {
    const toggle = await mountSuspended(ThemeToggle)
    const colorMode = useColorMode()
    const before = colorMode.value

    await toggle.get('button').trigger('click')

    expect(colorMode.preference).toBe(before === 'dark' ? 'light' : 'dark')
  })
})

describe('SiteFooter', () => {
  it('porte la navigation en clair, sans dépendre de JavaScript', async () => {
    const footer = await mountSuspended(SiteFooter)
    const nav = footer.get('nav[aria-label="Pied de page"]')
    const links = nav.findAll('a')

    expect(links).toHaveLength(siteNav.length)
    expect(links.map((link) => link.text())).toEqual(
      siteNav.map((item) => item.label),
    )
    expect(links.map((link) => link.attributes('href'))).toEqual(
      siteNav.map((item) => item.to),
    )
  })

  it('expose les profils publics et la bascule de thème', async () => {
    const footer = await mountSuspended(SiteFooter)
    const links = footer.findAll('a[rel~="me"]')

    expect(links.map((link) => link.attributes('href'))).toEqual(
      profileLinks.map((link) => link.to),
    )
    // Le libellé est suivi de la mention masquée et de la flèche posées par
    // `SiteLink` : on vérifie qu'il est là, pas que le texte s'y réduit.
    for (const [index, link] of links.entries()) {
      expect(link.text()).toContain(profileLinks[index]!.label)
    }

    // Les profils sortent du site : nouvel onglet, et `rel="me"` conservé.
    expect(links.map((link) => link.attributes('target'))).toEqual(
      profileLinks.map(() => '_blank'),
    )
    expect(links.map((link) => link.attributes('rel'))).toEqual(
      profileLinks.map(() => 'me noopener'),
    )
    expect(footer.findComponent(ThemeToggle).exists()).toBe(true)
  })
})
