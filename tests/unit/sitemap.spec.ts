import { describe, expect, it } from 'vitest'
import { siteNav } from '~~/content/nav'
import { projects } from '~~/content/projects'
import { absoluteUrl, buildRobots, buildSitemap, sitemapPaths } from '~~/server/utils/sitemap'

const SITE = 'https://exemple.fr'

describe('absoluteUrl', () => {
  it('ne double jamais la barre oblique', () => {
    expect(absoluteUrl('https://exemple.fr/', '/projets')).toBe('https://exemple.fr/projets')
    expect(absoluteUrl('https://exemple.fr', '/projets')).toBe('https://exemple.fr/projets')
  })

  it('garde la barre oblique de la racine et la retire ailleurs', () => {
    expect(absoluteUrl('https://exemple.fr', '/')).toBe('https://exemple.fr/')
    expect(absoluteUrl('https://exemple.fr', '/projets/')).toBe('https://exemple.fr/projets')
  })
})

describe('sitemapPaths', () => {
  it('reprend toutes les rubriques du menu', () => {
    for (const item of siteNav) {
      expect(sitemapPaths).toContain(item.to)
    }
  })

  /**
   * Le défaut corrigé par l'issue #14 : les trois fiches livrées en P4
   * répondaient 200 sans être déclarées nulle part. Ce test interdit qu'un
   * projet publié plus tard soit oublié à son tour.
   */
  it('déclare une fiche par projet publié', () => {
    for (const project of projects) {
      expect(sitemapPaths).toContain(`/projets/${project.slug}`)
    }
  })

  it('ne compte ni doublon ni route de trop', () => {
    expect(sitemapPaths).toHaveLength(siteNav.length + projects.length)
    expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length)
  })
})

describe('buildSitemap', () => {
  it('reprend tous les chemins reçus, et seulement eux', () => {
    const xml = buildSitemap(SITE, sitemapPaths)

    for (const path of sitemapPaths) {
      expect(xml).toContain(`<loc>${absoluteUrl(SITE, path)}</loc>`)
    }
    expect(xml.match(/<loc>/g)).toHaveLength(sitemapPaths.length)
  })

  it('n’expose pas la planche de spécimen', () => {
    expect(buildSitemap(SITE, sitemapPaths)).not.toContain('_ds')
  })

  it('produit un document XML valide dans sa forme', () => {
    const xml = buildSitemap(SITE, sitemapPaths)

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true)
  })
})

describe('buildRobots', () => {
  it('autorise tout et annonce le plan du site', () => {
    const robots = buildRobots(SITE)

    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
    expect(robots).toContain('Sitemap: https://exemple.fr/sitemap.xml')
  })
})
