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

  /**
   * La liste est **close**, et chaque entrée vaut exactement `=()`.
   *
   * Elle ne nommait que cinq fonctionnalités jusqu'au 12/11/2026 : en retirer
   * une des onze autres était silencieux, et `camera=*` passait le garde-fou
   * — pas de parenthèse ouvrante, donc rien à faire correspondre.
   */
  it('refuse toute permission du navigateur, et les refuse toutes', () => {
    const entries = constantSecurityHeaders['permissions-policy'].split(', ')

    expect(entries).toEqual([
      'accelerometer=()',
      'autoplay=()',
      'camera=()',
      'display-capture=()',
      'encrypted-media=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'usb=()',
      'xr-spatial-tracking=()',
    ])

    // Une permission accordée s'écrirait `camera=(self)`, `camera=*` ou
    // `camera=(https://…)`. Aucune valeur autre que la liste vide n'est
    // tolérée.
    for (const entry of entries) expect(entry).toMatch(/^[a-z-]+=\(\)$/)
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

  /**
   * **La liste des directives est close.**
   *
   * Elle ne l'était pas jusqu'au 12/11/2026, et c'était le trou le plus grave
   * de ce fichier : ajouter `frame-src youtube.com` ne cassait rien, et
   * surtout `script-src-elem 'self' cdn.jsdelivr.net` non plus — alors que
   * cette directive **l'emporte** sur `script-src` pour les balises
   * `<script>`. Une origine tierce pouvait donc entrer par une directive que
   * le test ne regardait pas.
   *
   * `.claude/rules/backend.md` impose déjà une liste close aux clés d'une
   * réponse publique ; la même discipline s'applique ici.
   */
  it('n’énonce que les dix directives attendues', () => {
    expect([...found.keys()]).toEqual([
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'font-src',
      'connect-src',
      'base-uri',
      'object-src',
      'form-action',
      'frame-ancestors',
    ])
  })

  /**
   * Chaque directive est vérifiée **en entier**, pas par sa première valeur.
   * Le test ne lisait que `found.get(directive)?.[0]` jusqu'au 12/11/2026 :
   * `font-src 'self' fonts.gstatic.com` passait au vert, et le garde-fou sur
   * `https?://` ne voit pas une origine écrite sans schéma.
   */
  it('ne charge aucune ressource d’un autre domaine', () => {
    expect(contentSecurityPolicy).not.toMatch(/https?:\/\//)
    expect(contentSecurityPolicy).not.toContain('*')

    for (const directive of ['img-src', 'font-src', 'connect-src']) {
      expect(found.get(directive), directive).toEqual(["'self'"])
    }

    // Les deux seules directives à porter plus d'une valeur. Leur tolérance
    // est justifiée dans l'utilitaire, et vérifiée nommément plus bas.
    for (const directive of ['script-src', 'style-src']) {
      expect(found.get(directive), directive).toEqual(["'self'", "'unsafe-inline'"])
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

  /**
   * Aucun schéma d'URL n'est autorisé : les images du site sont des fichiers
   * de `public/`. `data:` y figurait sur une justification fausse, retirée le
   * 12/11/2026.
   */
  it('n’autorise aucun schéma d’URL', () => {
    for (const scheme of ['data:', 'blob:', 'filesystem:']) {
      expect(contentSecurityPolicy, scheme).not.toContain(scheme)
    }
  })
})

describe('en-têtes posés par le routage', () => {
  it('réunit les constantes et la politique, et rien d’autre', () => {
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
