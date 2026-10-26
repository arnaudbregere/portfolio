import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'

describe('page accueil', () => {
  it('affiche un titre de niveau 1 unique', async () => {
    const page = await mountSuspended(IndexPage)
    const headings = page.findAll('h1')

    expect(headings).toHaveLength(1)
    expect(headings[0]!.text()).toBe('Arnaud Brégère')
  })
})
