import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import Icon from '~/components/atoms/Icon.vue'

describe('Icon', () => {
  it('dessine le combiné pour `phone` et l’enveloppe pour `mail`', async () => {
    const phone = await mountSuspended(Icon, { props: { name: 'phone' } })
    const mail = await mountSuspended(Icon, { props: { name: 'mail' } })

    expect(phone.findAll('path')).toHaveLength(1)
    expect(mail.find('rect').exists()).toBe(true)
  })

  /**
   * Les deux chevrons servent les flèches de la pellicule (issue #82). Ils se
   * distinguent par le sens de leur tracé, et un seul tracé chacun : une
   * inversion rendrait les deux boutons identiques à l'écran.
   */
  it('dessine deux chevrons opposés', async () => {
    const left = await mountSuspended(Icon, { props: { name: 'chevron-left' } })
    const right = await mountSuspended(Icon, { props: { name: 'chevron-right' } })

    const trace = (icon: typeof left) => {
      const paths = icon.findAll('path')

      expect(paths).toHaveLength(1)

      return paths[0]!.attributes('d')
    }

    expect(trace(left)).not.toBe(trace(right))
    expect(left.find('rect').exists()).toBe(false)
    expect(right.find('rect').exists()).toBe(false)
  })

  /**
   * Le libellé de la ligne porte le sens. Une icône annoncée par un lecteur
   * d'écran répéterait « Téléphone » deux fois.
   */
  it('reste hors de l’arbre d’accessibilité', async () => {
    const icon = await mountSuspended(Icon, { props: { name: 'mail' } })
    const svg = icon.get('svg')

    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('focusable')).toBe('false')
  })

  it('se dessine à l’encre courante, jamais en dur', async () => {
    const icon = await mountSuspended(Icon, { props: { name: 'phone' } })

    expect(icon.get('svg').attributes('stroke')).toBe('currentColor')
  })
})
