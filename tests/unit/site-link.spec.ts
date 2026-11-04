import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SiteLink from '~/components/molecules/SiteLink.vue'

const mount = (props: { href: string, rel?: string }) =>
  mountSuspended(SiteLink, { props, slots: { default: () => 'Code source' } })

describe('SiteLink', () => {
  it('ouvre un lien sortant dans un nouvel onglet', async () => {
    const link = await mount({ href: 'https://github.com/arnaudbregere' })

    expect(link.get('a').attributes('target')).toBe('_blank')
    expect(link.get('a').attributes('rel')).toBe('noopener')
  })

  it('annonce le nouvel onglet au lecteur d’écran, et la flèche à l’œil seul', async () => {
    const link = await mount({ href: 'https://github.com/arnaudbregere' })

    expect(link.get('.visually-hidden').text()).toBe('— nouvel onglet')
    expect(link.get('[aria-hidden="true"]').text()).toBe('↗')
  })

  it('laisse un lien de même origine dans l’onglet courant, sans flèche', async () => {
    const link = await mount({ href: 'https://arnaud-bregere.fr/projets/calculatrice' })

    expect(link.get('a').attributes('target')).toBeUndefined()
    expect(link.find('.visually-hidden').exists()).toBe(false)
    expect(link.find('[aria-hidden="true"]').exists()).toBe(false)
  })

  /**
   * Un lien interne doit rester une navigation `vue-router` : rendre un `<a>`
   * nu rechargerait la page entière et perdrait l'état du thème.
   */
  it('rend un lien de routeur pour un chemin interne', async () => {
    const link = await mount({ href: '/projets' })

    expect(link.get('a').attributes('href')).toBe('/projets')
    expect(link.get('a').attributes('target')).toBeUndefined()
    expect(link.findComponent({ name: 'NuxtLink' }).exists()).toBe(true)
  })

  it('ajoute `rel` à `noopener` au lieu de le remplacer', async () => {
    const link = await mount({ href: 'https://github.com/arnaudbregere', rel: 'me' })

    expect(link.get('a').attributes('rel')).toBe('me noopener')
  })

  it('garde le libellé lisible et le texte masqué hors de lui', async () => {
    const link = await mount({ href: 'https://github.com/arnaudbregere' })

    expect(link.text()).toContain('Code source')
  })
})
