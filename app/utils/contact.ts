/**
 * Moyens de contact, de la forme affichée à la forme activable.
 *
 * `/contact` et `/a-propos` servent tous deux le téléphone du profil. La
 * conversion vit ici plutôt que dans chaque page : un numéro ne se réécrit pas
 * deux fois.
 */

/**
 * `06 07 98 52 85` donne `tel:+33607985285`.
 *
 * La forme affichée garde ses espaces, lisibles à l'œil ; `tel:` veut une
 * forme internationale sans séparateur, seule reconnue hors de France. Le `0`
 * de tête tombe : il est le préfixe national que `+33` remplace.
 */
export const telHref = (phone: string): string =>
  `tel:+33${phone.replace(/\s/g, '').replace(/^0/, '')}`

/**
 * `https://www.linkedin.com/in/arnaudbregere/` donne
 * `linkedin.com/in/arnaudbregere`.
 *
 * L'adresse reste entière dans `content/nav.ts`, seule forme qu'un navigateur
 * sait suivre ; ce qui s'affiche perd le protocole, le `www.` et la barre
 * finale, qui n'apprennent rien au lecteur et allongent la ligne sur mobile.
 */
export const shortUrl = (url: string): string =>
  url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
