import { describe, expect, it } from 'vitest'
import { isExternalUrl } from '~/utils/external-url'

const SITE = 'https://arnaud-bregere.fr'

describe('isExternalUrl', () => {
  it('reconnaît un autre domaine', () => {
    expect(isExternalUrl('https://github.com/arnaudbregere', SITE)).toBe(true)
    expect(isExternalUrl('https://www.linkedin.com/in/arnaudbregere/', SITE)).toBe(true)
    expect(isExternalUrl('https://japan-react.vercel.app', SITE)).toBe(true)
  })

  /**
   * Le cas limite de l'issue #22 : `content/projects.ts` donne à la
   * calculatrice un lien absolu vers le site lui-même. Un critère fondé sur
   * « commence par http » lui ouvrirait un onglet pour rien.
   */
  it('ne sort pas du site pour une URL absolue de même origine', () => {
    expect(isExternalUrl(`${SITE}/projets/calculatrice`, SITE)).toBe(false)
    expect(isExternalUrl(`${SITE}/`, SITE)).toBe(false)
  })

  it('ne sort pas du site pour un chemin relatif', () => {
    expect(isExternalUrl('/projets', SITE)).toBe(false)
    expect(isExternalUrl('/pdf/arnaud-bregere_cv.pdf', SITE)).toBe(false)
  })

  it('laisse `mailto:` et `tel:` tranquilles', () => {
    expect(isExternalUrl('mailto:arnaud.bregere@gmail.com', SITE)).toBe(false)
    expect(isExternalUrl('tel:+33600000000', SITE)).toBe(false)
  })

  it('distingue le sous-domaine et le protocole', () => {
    expect(isExternalUrl('https://blog.arnaud-bregere.fr', SITE)).toBe(true)
    expect(isExternalUrl('http://arnaud-bregere.fr/projets', SITE)).toBe(true)
  })

  it('n’ouvre pas d’onglet pour une URL illisible', () => {
    expect(isExternalUrl('://cassé', SITE)).toBe(false)
    expect(isExternalUrl('https://github.com', 'pas une URL')).toBe(false)
  })
})
