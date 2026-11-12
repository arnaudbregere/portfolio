import { describe, expect, it } from 'vitest'
import {
  constantSecurityHeaders,
  contentSecurityPolicy,
  securityHeaders,
} from '../../server/utils/security-headers'

/**
 * Les en-têtes de sécurité du site.
 *
 * Ce ne sont que des constantes : un test qui vérifierait qu'elles valent ce
 * qu'elles valent ne dirait rien. Les assertions ci-dessous énoncent donc des
 * **interdictions** — pas de domaine tiers, pas de joker, pas de permission
 * accordée, pas de `preload` HSTS. Un relâchement devient alors un test rouge
 * plutôt qu'une ligne de diff passée inaperçue.
 */

const directives = (policy: string) =>
  new Map(
    policy.split('; ').map((directive) => {
      const [name, ...values] = directive.split(' ')

      return [name, values] as const
    }),
  )

describe('en-têtes constants', () => {
  it('refuse le reniflage de type et l’affichage en cadre', () => {
    expect(constantSecurityHeaders['x-content-type-options']).toBe('nosniff')
    expect(constantSecurityHeaders['x-frame-options']).toBe('DENY')
  })

  it('ne laisse fuir l’adresse complète que vers sa propre origine', () => {
    expect(constantSecurityHeaders['referrer-policy']).toBe(
      'strict-origin-when-cross-origin',
    )
  })

  it('impose HTTPS deux ans, sous-domaines compris, sans préinscription', () => {
    const hsts = constantSecurityHeaders['strict-transport-security']

    expect(hsts).toContain('max-age=63072000')
    expect(hsts).toContain('includeSubDomains')

    // `preload` engage tout sous-domaine futur et se retire en plusieurs
    // mois : la décision est documentée dans l'utilitaire, le test la tient.
    expect(hsts).not.toContain('preload')
  })

  it('refuse toute permission du navigateur', () => {
    const policy = constantSecurityHeaders['permissions-policy']

    for (const feature of ['camera', 'microphone', 'geolocation', 'payment', 'usb']) {
      expect(policy).toContain(`${feature}=()`)
    }

    // Une permission accordée s'écrirait `camera=(self)` : aucune liste
    // d'origines ne doit apparaître.
    expect(policy).not.toMatch(/=\((?!\))/)
  })

  it('isole le contexte de navigation', () => {
    expect(constantSecurityHeaders['cross-origin-opener-policy']).toBe('same-origin')
  })
})

describe('politique de sécurité du contenu', () => {
  const found = directives(contentSecurityPolicy)

  it('part de la seule origine du site', () => {
    expect(found.get('default-src')).toEqual(["'self'"])
  })

  it('ne charge aucune ressource d’un autre domaine', () => {
    expect(contentSecurityPolicy).not.toMatch(/https?:\/\//)
    expect(contentSecurityPolicy).not.toContain('*')

    for (const directive of [
      'script-src',
      'style-src',
      'img-src',
      'font-src',
      'connect-src',
      'manifest-src',
    ]) {
      expect(found.get(directive)?.[0], directive).toBe("'self'")
    }
  })

  it('coupe les vecteurs que le site n’utilise pas', () => {
    expect(found.get('object-src')).toEqual(["'none'"])
    expect(found.get('base-uri')).toEqual(["'none'"])
    expect(found.get('frame-ancestors')).toEqual(["'none'"])

    // Il n'y a aucun formulaire sur le site : le formulaire de contact est
    // abandonné (issue #5). Une soumission serait donc une injection.
    expect(found.get('form-action')).toEqual(["'none'"])
  })

  /**
   * La tolérance du script en ligne est un choix, justifié dans
   * `server/utils/security-headers.ts` : Nuxt écrit trois scripts dans le
   * document, et le site n'a aucune entrée par où en injecter un quatrième.
   *
   * Elle ne doit pas s'étendre pour autant. `'unsafe-eval'` exécuterait une
   * chaîne de caractères comme du code, ce que rien ici ne demande — et c'est
   * précisément ce qu'un script injecté cherche.
   */
  it('tolère le script et le style en ligne, et rien de plus', () => {
    expect(found.get('script-src')).toEqual(["'self'", "'unsafe-inline'"])
    expect(found.get('style-src')).toEqual(["'self'", "'unsafe-inline'"])

    expect(contentSecurityPolicy).not.toContain('unsafe-eval')
    expect(contentSecurityPolicy).not.toContain('unsafe-hashes')
  })

  it('accepte les images encodées, et aucun autre schéma', () => {
    expect(found.get('img-src')).toEqual(["'self'", 'data:'])
    expect(contentSecurityPolicy).not.toContain('blob:')
  })
})

describe('en-têtes posés par le routage', () => {
  it('réunit les constantes et la politique, sans rien perdre', () => {
    expect(Object.keys(securityHeaders).sort()).toEqual([
      'content-security-policy',
      'cross-origin-opener-policy',
      'permissions-policy',
      'referrer-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
    ])

    expect(securityHeaders['content-security-policy']).toBe(contentSecurityPolicy)
  })

  it('tient en une seule ligne par en-tête', () => {
    for (const [header, value] of Object.entries(securityHeaders)) {
      expect(value, header).not.toMatch(/[\n\r]/)
    }
  })
})
