import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { siteNav } from '~~/content/nav'
import SiteHeader from '~/components/organisms/SiteHeader.vue'

describe('SiteHeader', () => {
  it('ramène à l’accueil par le nom', async () => {
    const header = await mountSuspended(SiteHeader)
    const wordmark = header.get('header a')

    expect(wordmark.attributes('href')).toBe('/')
    expect(wordmark.text()).toBe('Arnaud Brégère')
  })

  it('annonce le menu fermé et l’élément qu’il commande', async () => {
    const header = await mountSuspended(SiteHeader)
    const trigger = header.get('button')

    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-controls')).toBe('menu-principal')
    expect(header.get('#menu-principal').element.tagName).toBe('DIALOG')
  })

  it('passe aria-expanded à true à l’ouverture', async () => {
    const header = await mountSuspended(SiteHeader)

    await header.get('button').trigger('click')

    expect(header.get('button').attributes('aria-expanded')).toBe('true')
  })

  it('liste les rubriques dans l’ordre d’affiche, chacune numérotée', async () => {
    const header = await mountSuspended(SiteHeader)
    const links = header.findAll('#menu-principal nav a')

    expect(links).toHaveLength(siteNav.length)
    expect(links.map((link) => link.attributes('href'))).toEqual(
      siteNav.map((item) => item.to),
    )
    expect(links[0]!.text()).toContain('01')
    expect(links[0]!.text()).toContain(siteNav[0]!.label)
  })
})
