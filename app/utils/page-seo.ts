/** Ce qu'une page a d'opposable à dire d'elle-même. */
export type PageSeo = {
  title: string
  description: string
  /**
   * Nature de la page au sens Open Graph. `website` par défaut, posé une fois
   * pour tout le site par `app.vue` ; une fiche projet passe `article`, parce
   * qu'elle décrit une réalisation datée et non le site.
   */
  type?: 'website' | 'article'
  /**
   * Image de partage propre à la page, en URL absolue. Absente, la page garde
   * celle du site, posée par `app.vue`.
   */
  image?: string
  /** Texte alternatif de cette image. Obligatoire dès qu'une image est posée. */
  imageAlt?: string
}

/**
 * Une URL absolue, seule forme qu'acceptent les aperçus de lien : un chemin
 * relatif n'a pas d'origine pour le robot de LinkedIn ou d'une messagerie.
 */
export const absoluteUrl = (path: string, siteUrl: string) =>
  `${siteUrl.replace(/\/$/, '')}${path}`

/**
 * Les métadonnées d'une page, partage compris.
 *
 * `useSeoMeta` ne déduit pas `og:title` ni `og:description` du `title` et de la
 * `description` : sans ces deux balises, un lien partagé sur LinkedIn ou dans
 * une messagerie s'affiche sans titre choisi et sans accroche — alors que le
 * site est une pièce de candidature. Les dupliquer à la main sur chaque page
 * exposait la même chaîne deux fois, et une page ajoutée les aurait oubliées.
 *
 * `twitter:title` et `twitter:description` ne sont pas posées : la carte
 * retombe sur les balises Open Graph quand elles manquent.
 */
export const pageSeoMeta = ({
  title,
  description,
  type = 'website',
  image,
  imageAlt,
}: PageSeo) => ({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: type,
  // L'image et son alternative vont ensemble : une carte de projet décrite
  // comme celle du site annoncerait la mauvaise image au lecteur d'écran.
  ...(image ? { ogImage: image, ogImageAlt: imageAlt } : {}),
})
