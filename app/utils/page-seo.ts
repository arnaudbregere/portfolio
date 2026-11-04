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
}

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
export const pageSeoMeta = ({ title, description, type = 'website' }: PageSeo) => ({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: type,
})
