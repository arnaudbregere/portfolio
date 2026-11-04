import { describe, expect, it } from 'vitest'
import { pageSeoMeta } from '~/utils/page-seo'

describe('pageSeoMeta', () => {
  const page = {
    title: 'Projets — Arnaud Brégère',
    description: 'Problème, solution et résultat mesuré pour chaque projet.',
  }

  it('reprend le titre et la description de la page', () => {
    expect(pageSeoMeta(page)).toMatchObject({
      title: page.title,
      description: page.description,
    })
  })

  it('pose le titre et la description de partage', () => {
    expect(pageSeoMeta(page)).toMatchObject({
      ogTitle: page.title,
      ogDescription: page.description,
    })
  })

  it('annonce un site par défaut', () => {
    expect(pageSeoMeta(page).ogType).toBe('website')
  })

  it('annonce un article quand la page en est un', () => {
    expect(pageSeoMeta({ ...page, type: 'article' }).ogType).toBe('article')
  })
})
