import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { projects } from '~~/content/projects'
import ProjectDetail from '~/components/organisms/ProjectDetail.vue'
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

  /**
   * La pile de chaque projet est une liste d'étiquettes depuis le 13/11/2026,
   * et non un paragraphe joint par ` · `. La liste est comparée élément par
   * élément : un séparateur revenu dans un libellé, ou une pile tronquée, fait
   * rougir ce test.
   */
  it('rend la pile de chaque projet en étiquettes, une par techno', async () => {
    const page = await mountSuspended(ProjetsPage)
    const items = page.findAll('.projects__item')

    expect(items).toHaveLength(projects.length)

    items.forEach((item, index) => {
      const project = projects[index]!
      const tags = item.findAll('.a-tag-list__item').map((node) => node.text())

      expect(tags, project.slug).toEqual([...project.stack])
    })
  })

  /**
   * Sans nom accessible, la liste s'annonce « liste, 5 éléments » sans dire de
   * quoi — le `dt` qui nomme les piles de `/a-propos` n'a pas d'équivalent
   * ici.
   */
  it('nomme chaque liste de technos pour un lecteur d’écran', async () => {
    const page = await mountSuspended(ProjetsPage)
    const lists = page.findAll('.projects__stack')

    expect(lists).toHaveLength(projects.length)
    for (const list of lists) {
      expect(list.attributes('aria-label')).toBe('Technologies')
    }
  })
})

describe('fiche projet', () => {
  /**
   * La rubrique « Stack » de la fiche porte les mêmes étiquettes que la liste
   * `/projets` et que le pied de fiche de `/a-propos` — Arnaud l'a demandé le
   * 13/11/2026, après les deux autres. Une forme de pile qui différerait
   * d'une page à l'autre se verrait.
   */
  it('rend la pile en étiquettes, comme la liste', async () => {
    const project = projects[0]!
    const detail = await mountSuspended(ProjectDetail, { props: { project } })
    const tags = detail.findAll('.a-tag-list__item').map((node) => node.text())

    expect(tags).toEqual([...project.stack])
  })

  /**
   * Le `h2` « Stack » ouvre la rubrique juste au-dessus de la liste : un
   * `aria-label` la nommerait une seconde fois.
   */
  it('laisse le titre de rubrique nommer la liste', async () => {
    const detail = await mountSuspended(ProjectDetail, {
      props: { project: projects[0]! },
    })

    expect(detail.get('.o-project__stack').attributes('aria-label')).toBeUndefined()
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
