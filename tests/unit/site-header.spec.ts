import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { siteNav } from '~~/content/nav'
import SiteHeader from '~/components/organisms/SiteHeader.vue'
import ThemeToggle from '~/components/molecules/ThemeToggle.vue'

/**
 * L'en-tête porte deux boutons depuis le 09/11/2026 : la bascule de thème et le
 * déclencheur du menu. Ce dernier se désigne par ce qu'il commande, jamais par
 * son rang dans le DOM.
 */
const trigger = (header: VueWrapper) =>
  header.get('button[aria-controls="menu-principal"]')

describe('SiteHeader', () => {
  it('ramène à l’accueil par le nom, derrière le monogramme', async () => {
    const header = await mountSuspended(SiteHeader)
    const wordmark = header.get('header a')

    expect(wordmark.attributes('href')).toBe('/')
    // Le monogramme ne nomme pas le site : deux lettres ne disent rien hors
    // de l'écran. Le nom reste donc le texte accessible du lien.
    expect(wordmark.get('.visually-hidden').text()).toBe('Arnaud Brégère')

    const monogram = wordmark.get('.o-header__monogram')
    expect(monogram.element.tagName).toBe('svg')
    expect(monogram.attributes('aria-hidden')).toBe('true')
  })

  it('annonce le menu fermé et l’élément qu’il commande', async () => {
    const header = await mountSuspended(SiteHeader)

    expect(trigger(header).attributes('type')).toBe('button')
    expect(trigger(header).attributes('aria-expanded')).toBe('false')
    expect(trigger(header).attributes('aria-controls')).toBe('menu-principal')
    expect(header.get('#menu-principal').element.tagName).toBe('DIALOG')
  })

  it('passe aria-expanded à true à l’ouverture', async () => {
    const header = await mountSuspended(SiteHeader)

    await trigger(header).trigger('click')

    expect(trigger(header).attributes('aria-expanded')).toBe('true')
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

    await trigger(header).trigger('click')
    expect(trigger(header).attributes('aria-expanded')).toBe('true')

    for (const notify of listeners) notify({ matches: true } as MediaQueryListEvent)
    await header.vm.$nextTick()

    expect(trigger(header).attributes('aria-expanded')).toBe('false')

    vi.unstubAllGlobals()
  })

  /**
   * La bascule vit dans l'en-tête à partir de 768px et au pied de page en
   * dessous : deux instances, une seule dans l'arbre d'accessibilité à la fois.
   * Le point de rupture est en CSS, donc hors de portée d'un test unitaire ; ce
   * qui se vérifie ici est que l'en-tête porte bien la sienne.
   */
  it('porte la bascule de thème', async () => {
    const header = await mountSuspended(SiteHeader)

    expect(header.findComponent(ThemeToggle).exists()).toBe(true)
  })
})
