import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Button from '~/components/atoms/Button.vue'

describe('Button', () => {
  it('rend un bouton qui ne soumet rien par défaut', async () => {
    const button = await mountSuspended(Button, { slots: { default: 'Menu' } })

    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    expect(button.text()).toBe('Menu')
  })

  /**
   * L'atome ne déclare ni `aria-*` ni gestionnaire : ce que la page lui passe
   * doit atteindre l'élément rendu, sinon le déclencheur du menu perdrait
   * `aria-expanded` en passant par lui.
   */
  it('laisse passer les attributs que la page lui confie', async () => {
    const button = await mountSuspended(Button, {
      attrs: { 'aria-controls': 'menu-principal', 'aria-expanded': 'false' },
      slots: { default: 'Menu' },
    })

    expect(button.attributes('aria-controls')).toBe('menu-principal')
    expect(button.attributes('aria-expanded')).toBe('false')
  })

  /**
   * Le clic n'est pas réémis : l'écouteur de la page atteint directement le
   * `<button>` par héritage d'attributs. C'est ce chemin qu'il faut vérifier,
   * et non un `emits` que l'atome ne déclare pas.
   */
  it('appelle l’écouteur de clic que la page lui confie', async () => {
    const onClick = vi.fn()
    const button = await mountSuspended(Button, {
      attrs: { onClick },
      slots: { default: 'Fermer' },
    })

    await button.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
