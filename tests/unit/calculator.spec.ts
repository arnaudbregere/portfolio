import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import Calculator from '~/components/organisms/Calculator.vue'

const press = async (page: Awaited<ReturnType<typeof mountSuspended>>, labels: string[]) => {
  for (const label of labels) {
    const key = page.findAll('button').find((button) => button.text() === label)

    expect(key, `touche ${label} absente`).toBeDefined()
    await key!.trigger('click')
  }
}

describe('Calculator', () => {
  it('rend vingt touches et un afficheur', async () => {
    const page = await mountSuspended(Calculator)

    expect(page.findAll('button')).toHaveLength(20)
    expect(page.get('output').text()).toContain('0')
  })

  it('nomme les touches dont le symbole ne se prononce pas', async () => {
    const page = await mountSuspended(Calculator)
    const divide = page.findAll('button').find((button) => button.text() === '÷')

    expect(divide!.attributes('aria-label')).toBe('Diviser')
  })

  it('annonce le résultat dans une région vivante', async () => {
    const page = await mountSuspended(Calculator)

    expect(page.get('output').attributes('aria-live')).toBe('polite')
  })

  it('calcule depuis les touches', async () => {
    const page = await mountSuspended(Calculator)
    await press(page, ['7', '×', '6', '='])

    expect(page.get('output').text()).toContain('42')
  })

  it('accepte le clavier physique', async () => {
    const page = await mountSuspended(Calculator)

    for (const key of ['9', '-', '4']) {
      await page.trigger('keydown', { key })
    }
    await page.trigger('keydown', { key: 'Enter' })

    expect(page.get('output').text()).toContain('5')
  })

  it('n’applique pas Entrée deux fois quand une touche a le focus', async () => {
    const page = await mountSuspended(Calculator)
    await press(page, ['2', '+', '3'])

    const equals = page.findAll('button').find((button) => button.text() === '=')!
    await equals.trigger('keydown', { key: 'Enter' })

    // La touche n'a pas été activée par le test : l'afficheur garde la saisie.
    expect(page.get('output').text()).toContain('3')
  })

  it('tout effacer remet l’afficheur à zéro', async () => {
    const page = await mountSuspended(Calculator)
    await press(page, ['5', '5', 'C'])

    expect(page.get('output').text()).toContain('0')
  })
})
