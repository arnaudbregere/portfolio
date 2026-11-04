/**
 * Construction du plan du site et du fichier robots.
 *
 * Les chemins déclarés dérivent des deux sources de routes publiques du
 * dépôt : `content/nav.ts` pour les rubriques, `content/projects.ts` pour les
 * fiches projets. Une rubrique ajoutée au menu ou un projet publié entre au
 * plan du site sans geste supplémentaire.
 *
 * Une route qui ne vient d'aucune des deux en reste absente — la planche de
 * spécimen `/_ds`, par exemple. C'est voulu : seul le contenu éditorial se
 * déclare aux moteurs.
 */
import { siteNav } from '~~/content/nav'
import { projects } from '~~/content/projects'

/** Une URL absolue, sans barre oblique finale en double. */
export const absoluteUrl = (siteUrl: string, path: string): string =>
  `${siteUrl.replace(/\/$/, '')}${path === '/' ? '/' : path.replace(/\/$/, '')}`

/** Les chemins publics à déclarer : les rubriques, puis les fiches projets. */
export const sitemapPaths: readonly string[] = [
  ...siteNav.map((item) => item.to),
  ...projects.map((project) => `/projets/${project.slug}`),
]

export const buildSitemap = (siteUrl: string, paths: readonly string[]): string => {
  const entries = paths
    .map((path) => `  <url>\n    <loc>${absoluteUrl(siteUrl, path)}</loc>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

export const buildRobots = (siteUrl: string): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}\n`
