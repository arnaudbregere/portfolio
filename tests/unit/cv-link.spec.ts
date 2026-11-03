import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CvLink from '~/components/atoms/CvLink.vue'

const props = { href: '/pdf/arnaud-bregere_cv.pdf', format: 'PDF', sizeKb: 449 }

describe('CvLink', () => {
  it('rend un lien de téléchargement vers le fichier donné', async () => {
    const page = await mountSuspended(CvLink, { props })
    const link = page.find('a')

    expect(link.attributes('href')).toBe('/pdf/arnaud-bregere_cv.pdf')
    expect(link.attributes('download')).toBeDefined()
  })

  it('annonce le format et le poids avant le clic', async () => {
    const page = await mountSuspended(CvLink, { props })

    expect(page.text()).toContain('PDF, 449 Ko')
  })

  it('reprend le format et le poids qu’on lui passe', async () => {
    const page = await mountSuspended(CvLink, {
      props: { ...props, format: 'PDF/A', sizeKb: 80 },
    })

    expect(page.text()).toContain('PDF/A, 80 Ko')
  })
})
