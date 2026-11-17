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
 *
 * `img-src` portait `data:` jusqu'au 12/11/2026, pour « les images encodées
 * que `@nuxt/image` produit en remplacement de chargement ». La
 * justification était fausse : le seul `<NuxtImg>` du dépôt ne passe aucun
 * `placeholder`, et aucune URL `data:` n'existe dans `app/`, `content/` ni
 * les feuilles de style. `manifest-src 'self'` est tombé pour la même raison
 * — il n'y a pas de manifeste web, et la directive retombe de toute façon sur
 * `default-src`.
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
 *
 * ### La tolérance tient malgré l'arrivée d'une saisie, le 17/11/2026
 *
 * La démo de liste de tâches amène au site ce qu'il n'avait jamais eu : un
 * champ où un visiteur tape. La condition écrite plus haut — « une entrée
 * utilisateur » — semble donc tombée, et elle ne l'est pas. Ce qui rendait le
 * jeton nécessaire est qu'une entrée **atteigne le document en tant que
 * balisage**. Ici, trois choses l'en empêchent, et chacune est vérifiée :
 *
 * - le titre saisi est **interpolé** par Vue, `{{ todo.title }}`, donc échappé
 *   et posé en texte. Aucun `v-html` n'existe dans le dépôt, et les règles
 *   l'interdisent ;
 * - rien de cette saisie **ne revient du serveur** : la page est prérendue, et
 *   la démo s'exécute après le montage ;
 * - le service d'`api/` ne rend **que du JSON**, jamais de HTML, et ce JSON
 *   est lu par `fetch` puis interpolé comme le reste.
 *
 * Un jeton ne fermerait donc toujours aucune porte percée. La condition
 * reformulée, et opposable : `'unsafe-inline'` tombe le jour où une saisie
 * atteint le document en tant que balisage — `v-html`, rendu serveur d'une
 * valeur reçue, ou gabarit construit par concaténation.
 *
 * ## Pourquoi `connect-src` nomme une seconde origine
 *
 * La démo appelle le service d'`api/` en `fetch`. `'self'` seul ferait
 * échouer chaque requête, et le sélecteur de source désactiverait l'API sans
 * autre motif que le navigateur refusant la connexion — une panne que
 * personne ne saurait lire.
 *
 * L'origine vient de `runtimeConfig.public.apiOrigin` de `nuxt.config.ts`,
 * jamais d'une URL écrite deux fois : une politique qui nommerait une autre
 * adresse que celle appelée serait verte au test et muette au bon moment.
 * `connect-src` reste par ailleurs fermé — aucune autre origine, aucun joker,
 * aucun schéma.
 */
/**
 * L'origine du service de la démo, lue une fois.
 *
 * Elle est lue ici plutôt que reçue en paramètre parce que `routeRules` pose
 * ces en-têtes au build : il n'y a pas de requête à ce moment-là, donc pas de
 * `useRuntimeConfig()` à interroger. `NUXT_PUBLIC_API_ORIGIN` surcharge les
 * deux côtés d'un seul geste.
 */
const apiOrigin = process.env.NUXT_PUBLIC_API_ORIGIN ?? 'http://localhost:4330'

export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin}`,
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
