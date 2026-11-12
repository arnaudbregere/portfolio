/**
 * Les en-têtes de sécurité du site.
 *
 * **Des constantes, et rien d'autre.** Elles sont posées sur toutes les
 * réponses par les `routeRules` de `nuxt.config.ts` : aucun greffon, aucun
 * accrochage au rendu, rien à revérifier à chaque montée de Nuxt. Le fichier
 * existe pour que `tests/unit/security-headers.spec.ts` puisse énoncer ce que
 * ces valeurs interdisent — une règle de sécurité qui n'est pas testée se
 * relâche sans que personne le voie.
 */

/**
 * `strict-transport-security` : Vercel pose déjà `max-age=63072000`, sans
 * `includeSubDomains`. On le reprend en ajoutant les sous-domaines —
 * `www.arnaud-bregere.fr` est le seul, et il est servi en HTTPS. `preload`
 * reste absent volontairement : l'inscription dans la liste des navigateurs
 * se retire en plusieurs mois, et engage tout sous-domaine futur avant qu'il
 * existe.
 *
 * `x-frame-options` double `frame-ancestors 'none'` de la politique de
 * sécurité du contenu, pour les navigateurs qui ne lisent que lui.
 *
 * `x-powered-by: Nuxt`, qu'ajoute le rendu, n'est pas retiré : le retirer
 * demanderait un greffon à lui seul, et ne cacherait rien — les chemins
 * `/_nuxt/` et `__NUXT_DATA__` annoncent le cadre dans chaque page.
 */
export const constantSecurityHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'cross-origin-opener-policy': 'same-origin',
  'strict-transport-security': 'max-age=63072000; includeSubDomains',

  /**
   * Le site ne demande aucune permission au navigateur : ni appareil, ni
   * position, ni paiement. La liste les refuse toutes nommément, pour que
   * l'ajout d'un script tiers ne puisse pas en réclamer une en silence.
   */
  'permissions-policy': [
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
  ].join(', '),
} as const satisfies Record<string, string>

/**
 * La politique de sécurité du contenu.
 *
 * Le site ne charge **rien d'un autre domaine** : police, styles, images et
 * modules JavaScript viennent tous de son origine. `default-src 'self'` est
 * donc la règle, et chaque directive ne fait que la resserrer :
 *
 * - `object-src 'none'` : ni `<object>`, ni `<embed>`.
 * - `base-uri 'none'` : la base des URL relatives n'est pas réécrivable.
 * - `form-action 'none'` : il n'y a aucun formulaire sur le site, celui de
 *   contact est abandonné (issue #5). Une soumission serait donc une
 *   injection.
 * - `frame-ancestors 'none'` : personne n'affiche le site dans un cadre.
 * - `img-src` accepte `data:` pour les images encodées que `@nuxt/image`
 *   produit en remplacement de chargement.
 *
 * ## Pourquoi `'unsafe-inline'` sur les scripts
 *
 * Nuxt écrit trois scripts dans le document : la carte d'import, le script de
 * thème de `@nuxtjs/color-mode` — qui doit s'exécuter avant le premier
 * affichage, sinon le thème clignote — et la configuration publique. Les
 * autoriser nommément demande un jeton tiré par réponse, donc un greffon
 * accroché au rendu de Nuxt, à revérifier à chaque montée de version.
 *
 * Ce jeton ne protégerait que d'un script injecté dans la page. **Il n'y a
 * aucune entrée par où en injecter un** : le contenu est du TypeScript typé
 * (`content/`), il n'y a ni formulaire, ni `v-html` — les règles du dépôt
 * l'interdisent —, ni paramètre d'URL rendu, ni script tiers. La tolérance
 * est donc un choix, pas un oubli : elle évite une pièce de mécanique qui
 * fermerait une porte qui n'est pas percée.
 *
 * Le jour où une de ces conditions tombe — une entrée utilisateur, un script
 * tiers, une mesure d'audience —, `'unsafe-inline'` doit céder la place au
 * jeton. C'est ce fichier et lui seul qui changerait.
 *
 * `style-src` garde la même tolérance pour une autre raison : le rendu
 * serveur place le CSS des composants dans des `<style>` en ligne, et Vue
 * écrit des attributs `style`. Un jeton ne couvre pas les attributs.
 */
export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ')

/** Tous les en-têtes, tels que `routeRules` les pose. */
export const securityHeaders = {
  ...constantSecurityHeaders,
  'content-security-policy': contentSecurityPolicy,
} as const satisfies Record<string, string>
