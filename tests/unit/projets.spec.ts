import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { projects } from '~~/content/projects'
import ProjetsPage from '~/pages/projets/index.vue'

describe('page Projets', () => {
  it('liste chaque projet du contenu', async () => {
    const page = await mountSuspended(ProjetsPage)
    const titles = page.findAll('.projects__title').map((node) => node.text())

    expect(titles).toEqual(projects.map((project) => project.title))
  })

  it('mène chaque carte vers sa fiche', async () => {
    const page = await mountSuspended(ProjetsPage)

    for (const project of projects) {
      expect(page.find(`a[href="/projets/${project.slug}"]`).exists()).toBe(true)
    }
  })

  it('annonce le problème traité, pas une accroche', async () => {
    const page = await mountSuspended(ProjetsPage)

    for (const project of projects) {
      expect(page.text()).toContain(project.problem)
    }
  })
})

describe('contenu des projets', () => {
  it('donne à chaque projet un identifiant unique', () => {
    const slugs = projects.map((project) => project.slug)

    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('chiffre le résultat de chaque projet', () => {
    for (const project of projects) {
      expect(project.result).toMatch(/\d/)
    }
  })

  it('donne au moins un lien public par projet', () => {
    for (const project of projects) {
      expect(project.links.length).toBeGreaterThan(0)
      for (const link of project.links) {
        expect(link.url).toMatch(/^https:\/\//)
      }
    }
  })
})

describe('visuels des projets', () => {
  it('décrit chaque capture par un texte alternatif et une légende', () => {
    for (const project of projects) {
      for (const image of project.images ?? []) {
        expect(image.alt.length).toBeGreaterThan(20)
        expect(image.caption).not.toBe('')
        // `public/projets/` entrerait en collision avec la route `/projets` :
        // Nitro sert le dossier et redirige vers `/projets/`.
        expect(image.src.startsWith('/visuels/')).toBe(true)
      }
    }
  })

  it('donne à chaque capture ses dimensions, contre le décalage de mise en page', () => {
    for (const project of projects) {
      for (const image of project.images ?? []) {
        expect(image.width).toBeGreaterThan(0)
        expect(image.height).toBeGreaterThan(0)
      }
    }
  })
})
