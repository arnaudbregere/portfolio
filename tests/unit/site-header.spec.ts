import { describe, expect, it, vi } from 'vitest'
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

  /**
   * La barre de l'en-tête et la surcouche portent les mêmes rubriques sous deux
   * formes. Le point de rupture est en CSS, donc hors de portée d'un test
   * unitaire : ce qui est vérifié ici est le contenu de la barre, et que les
   * rangs restent à la surcouche.
   */
  it('porte les quatre rubriques en clair, sans leur rang', async () => {
    const header = await mountSuspended(SiteHeader)
    const links = header.get('nav[aria-label="Rubriques"]').findAll('a')

    expect(links).toHaveLength(siteNav.length)
    expect(links.map((link) => link.attributes('href'))).toEqual(
      siteNav.map((item) => item.to),
    )
    expect(links.map((link) => link.text())).toEqual(
      siteNav.map((item) => item.label),
    )
  })

  /**
   * La surcouche ouverte en mobile, puis la fenêtre élargie : le déclencheur
   * passe en `display: none` et plus rien ne referme le menu sinon `Échap`.
   * `DESIGN.md` § 6.
   */
  it('ferme la surcouche quand la fenêtre franchit le point de rupture', async () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>()

    vi.stubGlobal('matchMedia', (query: string) => ({
      media: query,
      matches: false,
      addEventListener: (_: string, fn: (event: MediaQueryListEvent) => void) =>
        listeners.add(fn),
      removeEventListener: (_: string, fn: (event: MediaQueryListEvent) => void) =>
        listeners.delete(fn),
    }))

    const header = await mountSuspended(SiteHeader)

    await header.get('button').trigger('click')
    expect(header.get('button').attributes('aria-expanded')).toBe('true')

    for (const notify of listeners) notify({ matches: true } as MediaQueryListEvent)
    await header.vm.$nextTick()

    expect(header.get('button').attributes('aria-expanded')).toBe('false')

    vi.unstubAllGlobals()
  })
})
