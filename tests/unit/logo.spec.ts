import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Logo from '~/components/atoms/Logo.vue'

describe('Logo', () => {
  it('se retire de l’arbre d’accessibilité', async () => {
    const logo = await mountSuspended(Logo)

    // Deux lettres ne nomment pas le site : le libellé qui accompagne le
    // monogramme reste la seule source d'information.
    expect(logo.attributes('aria-hidden')).toBe('true')
    expect(logo.attributes('focusable')).toBe('false')
    expect(logo.text()).toBe('')
  })

  it('porte les deux tracés, chacun avec son encre', async () => {
    const logo = await mountSuspended(Logo)
    const paths = logo.findAll('path')

    expect(paths).toHaveLength(2)
    // Le `b` prend l'encre courante, le `a` l'encre d'annotation : un seul
    // tracé sert les deux thèmes.
    expect(paths[0]!.classes()).toContain('a-logo__b')
    expect(paths[1]!.classes()).toContain('a-logo__a')
  })

  it('cadre le viewBox sur la boîte des tracés', async () => {
    const logo = await mountSuspended(Logo)

    // L'export Figma rendait `0 0 62 54`, aux marges inégales : 1,5 à gauche
    // contre 9,45 à droite. Les bornes viennent de `getBBox`.
    expect(logo.attributes('viewBox')).toBe('1.5 7.75 51.05 36.85')
  })
})
