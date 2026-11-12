import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { siteNav } from '~~/content/nav'
import SiteFooter from '~/components/organisms/SiteFooter.vue'
import ThemeToggle from '~/components/molecules/ThemeToggle.vue'

describe('ThemeToggle', () => {
  /**
   * Le nom du bouton est son **texte**, non un `aria-label` : un attribut
   * rendu au serveur reste figé sur le mauvais thème, puisque Vue corrige les
   * textes divergents mais pas les attributs (issue #6, puis #56). « Activer
   * le » est masqué visuellement, « Thème sombre » ne l'est pas — le texte
   * affiché est donc contenu dans le nom, ce que WCAG 2.5.3 demande.
   */
  it('se nomme par l’action, pas par l’état courant', async () => {
    const toggle = await mountSuspended(ThemeToggle)
    const button = toggle.get('button')

    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBeUndefined()

    for (const label of toggle.findAll('.m-theme-toggle__label')) {
      expect(label.text()).toMatch(/^Activer le ?Thème (clair|sombre)$/)
    }
  })

  /**
   * **Le document porte les deux libellés, toujours les mêmes.** C'est tout
   * l'objet de l'issue #56 : le serveur ignore la préférence du visiteur, donc
   * un libellé choisi au rendu divergeait de celui qu'attendait le navigateur
   * en thème sombre. Ici le HTML ne dépend plus du thème, et le CSS révèle
   * celui qui convient depuis la classe de `<html>`.
   *
   * Conséquence utile : « Thème clair » est plus court que « Thème sombre »,
   * et les deux occupant la même case de grille, le bouton ne rétrécit pas au
   * clic — la barre de l'en-tête ne se décale plus.
   */
  it('rend les deux libellés, quel que soit le thème', async () => {
    const toggle = await mountSuspended(ThemeToggle)
    const colorMode = useColorMode()

    const rendered = () =>
      toggle.findAll('.m-theme-toggle__label').map((label) => label.text())

    const before = rendered()

    expect(before).toEqual(['Activer le Thème sombre', 'Activer le Thème clair'])

    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    await nextTick()

    expect(rendered(), 'le balisage ne doit pas dépendre du thème').toEqual(before)
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
