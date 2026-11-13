import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import TagList from '~/components/atoms/TagList.vue'

describe('TagList', () => {
  it('rend une étiquette par libellé, dans l’ordre reçu', async () => {
    const list = await mountSuspended(TagList, {
      props: { items: ['Vue', 'Nuxt', 'TypeScript'] },
    })

    expect(list.findAll('li').map((node) => node.text())).toEqual([
      'Vue',
      'Nuxt',
      'TypeScript',
    ])
  })

  /**
   * L'énumération est une liste et non une phrase : c'est tout l'objet de
   * l'atome. Un `<p>` joint par ` · ` ne se lit pas comme une énumération, ni
   * à l'œil ni au lecteur d'écran.
   */
  it('s’annonce comme une liste', async () => {
    const list = await mountSuspended(TagList, {
      props: { items: ['Vue'] },
    })

    expect(list.get('ul').exists()).toBe(true)
  })

  it('porte le nom accessible qu’on lui donne', async () => {
    const list = await mountSuspended(TagList, {
      props: { items: ['Vue'], label: 'Technologies' },
    })

    expect(list.get('ul').attributes('aria-label')).toBe('Technologies')
  })

  /**
   * Sans `label`, **aucun** `aria-label` : dans un `<dl>`, le `<dt>` voisin
   * nomme déjà la liste, et un attribut vide ou répétant le libellé la
   * nommerait deux fois.
   */
  it('n’invente pas de nom accessible quand on ne lui en donne pas', async () => {
    const list = await mountSuspended(TagList, {
      props: { items: ['Vue'] },
    })

    expect(list.get('ul').attributes('aria-label')).toBeUndefined()
  })

  it('ne rend aucune étiquette pour une liste vide', async () => {
    const list = await mountSuspended(TagList, { props: { items: [] } })

    expect(list.findAll('li')).toHaveLength(0)
  })
})
