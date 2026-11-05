import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { projects } from '~~/content/projects'
import { absoluteUrl, pageSeoMeta } from '~/utils/page-seo'

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

  it('laisse l’image du site quand la page n’en pose pas', () => {
    expect(pageSeoMeta(page)).not.toHaveProperty('ogImage')
  })

  it('pose l’image de partage de la page et son alternative', () => {
    const image = 'https://arnaud-bregere.fr/og/agenda-app-event.png'
    const imageAlt = 'Agenda, projet d’Arnaud Brégère'

    expect(pageSeoMeta({ ...page, image, imageAlt })).toMatchObject({
      ogImage: image,
      ogImageAlt: imageAlt,
    })
  })
})

describe('absoluteUrl', () => {
  it('colle le chemin à l’origine du site', () => {
    expect(absoluteUrl('/og/arnaud-bregere.png', 'https://arnaud-bregere.fr')).toBe(
      'https://arnaud-bregere.fr/og/arnaud-bregere.png',
    )
  })

  it('ne double pas la barre oblique', () => {
    expect(absoluteUrl('/og/arnaud-bregere.png', 'https://arnaud-bregere.fr/')).toBe(
      'https://arnaud-bregere.fr/og/arnaud-bregere.png',
    )
  })
})

/**
 * Une image de partage annoncée mais absente du dépôt donne un aperçu vide
 * chez le destinataire, sans que rien ne casse au build : seul un test le voit.
 */
describe('images de partage servies', () => {
  it('sert l’image du site', () => {
    expect(existsSync('public/og/arnaud-bregere.png')).toBe(true)
  })

  it.each(projects.filter((project) => project.ogImage))(
    'sert l’image de la fiche $slug',
    ({ ogImage }) => {
      expect(existsSync(`public${ogImage}`)).toBe(true)
    },
  )
})
