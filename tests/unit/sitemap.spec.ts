import { describe, expect, it } from 'vitest'
import { siteNav } from '~~/content/nav'
import { absoluteUrl, buildRobots, buildSitemap } from '~~/server/utils/sitemap'

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

describe('buildSitemap', () => {
  it('reprend toutes les routes du menu, et seulement elles', () => {
    const xml = buildSitemap('https://exemple.fr', siteNav)

    for (const item of siteNav) {
      expect(xml).toContain(absoluteUrl('https://exemple.fr', item.to))
    }
    expect(xml.match(/<loc>/g)).toHaveLength(siteNav.length)
  })

  it('n’expose pas la planche de spécimen', () => {
    expect(buildSitemap('https://exemple.fr', siteNav)).not.toContain('_ds')
  })

  it('produit un document XML valide dans sa forme', () => {
    const xml = buildSitemap('https://exemple.fr', siteNav)

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true)
  })
})

describe('buildRobots', () => {
  it('autorise tout et annonce le plan du site', () => {
    const robots = buildRobots('https://exemple.fr')

    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
    expect(robots).toContain('Sitemap: https://exemple.fr/sitemap.xml')
  })
})
