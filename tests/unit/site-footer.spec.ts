import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { siteNav } from '~~/content/nav'
import SiteFooter from '~/components/organisms/SiteFooter.vue'
import ThemeToggle from '~/components/molecules/ThemeToggle.vue'

describe('ThemeToggle', () => {
  it('se nomme par l’action, pas par l’état courant', async () => {
    const toggle = await mountSuspended(ThemeToggle)
    const button = toggle.get('button')

    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toMatch(/^Activer le thème (clair|sombre)$/)
    expect(button.text()).toContain(button.attributes('aria-label')!.split(' ').pop())
  })

  /**
   * « Thème clair » est plus court que « Thème sombre » : sans réserve, le
   * bouton rétrécit au clic et toute la barre de l'en-tête se décale. Le
   * libellé de l'autre thème occupe la même case de grille, invisible.
   */
  it('réserve la largeur de l’autre libellé, hors de l’arbre d’accessibilité', async () => {
    const toggle = await mountSuspended(ThemeToggle)
    const ghost = toggle.get('[aria-hidden="true"]')
    const label = toggle.get('.m-theme-toggle__label')

    expect(label.text()).toMatch(/^Thème (clair|sombre)$/)
    expect(ghost.text()).toMatch(/^Thème (clair|sombre)$/)
    expect(ghost.text()).not.toBe(label.text())
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

  /**
   * Les profils publics et la bascule ont quitté le pied de page le
   * 09/11/2026 : la bascule est dans l'en-tête, et GitHub et LinkedIn ne
   * vivent plus qu'à un endroit, `/contact`. Le pied de page est un chemin de
   * repli, pas un deuxième sommaire.
   */
  it('ne porte plus ni profils ni bascule', async () => {
    const footer = await mountSuspended(SiteFooter)

    expect(footer.findComponent(ThemeToggle).exists()).toBe(false)
    expect(footer.findAll('a[rel~="me"]')).toHaveLength(0)
  })
})
