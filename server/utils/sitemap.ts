/**
 * Construction du plan du site et du fichier robots.
 *
 * Les deux fichiers dérivent de `content/nav.ts` : les routes n'existent qu'en
 * un exemplaire. Une page ajoutée au menu entre au plan du site sans geste
 * supplémentaire — et surtout, aucune ne peut être oubliée.
 */
import type { NavItem } from '~~/content/nav'

/** Une URL absolue, sans barre oblique finale en double. */
export const absoluteUrl = (siteUrl: string, path: string): string =>
  `${siteUrl.replace(/\/$/, '')}${path === '/' ? '/' : path.replace(/\/$/, '')}`

export const buildSitemap = (siteUrl: string, routes: readonly NavItem[]): string => {
  const entries = routes
    .map((route) => `  <url>\n    <loc>${absoluteUrl(siteUrl, route.to)}</loc>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

export const buildRobots = (siteUrl: string): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}\n`
