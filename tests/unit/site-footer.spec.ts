import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { siteNav } from '~~/content/nav'
import SiteFooter from '~/components/organisms/SiteFooter.vue'
import ThemeToggle from '~/components/molecules/ThemeToggle.vue'
import Icon from '~/components/atoms/Icon.vue'

describe('ThemeToggle', () => {
  /**
   * Le nom du bouton est du **texte**, non un `aria-label` : un attribut rendu
   * au serveur reste figé sur le mauvais thème, puisque Vue corrige les textes
   * divergents mais pas les attributs (issue #6, puis #56). Depuis le passage
   * au pictogramme (17/11/2026), ce texte est masqué visuellement en entier —
   * WCAG 2.5.3 ne s'applique plus, le bouton n'ayant plus de libellé visible
   * que son nom devrait contenir.
   */
  it('se nomme par l’action, pas par l’état courant', async () => {
    const toggle = await mountSuspended(ThemeToggle)
    const button = toggle.get('button')

    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBeUndefined()

    for (const state of toggle.findAll('.m-theme-toggle__state')) {
      expect(state.get('.visually-hidden').text()).toMatch(
        /^Activer le Thème (clair|sombre)$/,
      )
    }
  })

  /**
   * **Le document porte les deux états, toujours les mêmes.** C'est tout
   * l'objet de l'issue #56 : le serveur ignore la préférence du visiteur, donc
   * un libellé choisi au rendu divergeait de celui qu'attendait le navigateur
   * en thème sombre. Ici le HTML ne dépend plus du thème, et le CSS révèle
   * celui qui convient depuis la classe de `<html>`.
   */
  it('rend les deux états, quel que soit le thème', async () => {
    const toggle = await mountSuspended(ThemeToggle)
    const colorMode = useColorMode()

    const rendered = () =>
      toggle.findAll('.m-theme-toggle__state').map((state) => state.text())

    const before = rendered()

    expect(before).toEqual(['Activer le Thème sombre', 'Activer le Thème clair'])

    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    await nextTick()

    expect(rendered(), 'le balisage ne doit pas dépendre du thème').toEqual(before)
  })

  /**
   * **Le pictogramme dit la destination, pas l'état courant** : la lune est
   * dans l'état qui propose le sombre, le soleil dans celui qui propose le
   * clair. Les deux inversés, le bouton annoncerait le thème qu'on quitte.
   *
   * Les icônes sont `aria-hidden` (atome `Icon`) : le sens reste porté par le
   * texte masqué du même état, et jamais par le dessin seul.
   */
  it('montre la lune pour aller au sombre, le soleil pour aller au clair', async () => {
    const toggle = await mountSuspended(ThemeToggle)

    const icone = (modificateur: 'dark' | 'light') =>
      toggle
        .get(`.m-theme-toggle__state--to-${modificateur}`)
        .getComponent(Icon)

    expect(icone('dark').props('name')).toBe('moon')
    expect(icone('light').props('name')).toBe('sun')

    for (const svg of toggle.findAll('svg')) {
      expect(svg.attributes('aria-hidden')).toBe('true')
    }
  })

  /**
   * Le bouton est carré : `--control-min-width` réserve la place du plus long
   * libellé du site, et un pictogramme n'a rien à aligner. C'est ce que la
   * prop `icon` de l'atome retire — sans elle, la bascule reprendrait les
   * 149px que la décision du 17/11/2026 lui enlève (`DESIGN.md` § 6).
   */
  it('demande à l’atome un bouton d’icône, pas un bouton de libellé', async () => {
    const toggle = await mountSuspended(ThemeToggle)

    expect(toggle.get('button').classes()).toContain('a-button--icon')
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
