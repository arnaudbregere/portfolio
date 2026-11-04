/**
 * Un lien sort-il du site ?
 *
 * Le critère n'est pas « l'URL commence par `http` » : `content/projects.ts`
 * donne à la calculatrice un lien absolu vers le site lui-même. Seule
 * l'origine compte, comparée à `runtimeConfig.public.siteUrl` — source unique
 * de l'origine du site depuis P3.
 */
export const isExternalUrl = (url: string, siteUrl: string): boolean => {
  let target: URL
  let site: URL

  try {
    // Une URL relative se résout contre l'origine du site : elle n'en sort pas.
    target = new URL(url, siteUrl)
    site = new URL(siteUrl)
  } catch {
    // Une URL que le navigateur ne sait pas lire n'ouvre pas d'onglet.
    return false
  }

  // `mailto:` et `tel:` ne naviguent pas : ils passent la main à une
  // application. Un onglet neuf resterait vide.
  if (target.protocol !== 'http:' && target.protocol !== 'https:') return false

  return target.origin !== site.origin
}
