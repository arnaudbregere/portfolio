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

/**
 * La pellicule de la rubrique « Aperçu » (issue #82).
 *
 * Ce qui est tenu ici est son contrat d'accès, pas son allure : une zone qui
 * défile doit s'atteindre sans souris — WCAG 2.1.1 —, et seul le focus rend
 * les flèches du clavier opérantes sur un conteneur qui n'est pas un
 * contrôle. Un `tabindex` retiré par mégarde rendrait les quatre captures
 * suivantes inatteignables au clavier, sans que rien d'autre ne change à
 * l'écran.
 *
 * Le reste — `scroll-snap`, la largeur de 72 % — est du style, et aucun test
 * unitaire ne le mesure : `jsdom` ne mettant rien en page, il rendrait vert
 * un conteneur qui ne défile pas.
 */
describe('pellicule des captures', () => {
  const avecCaptures = projects.find((project) => project.images?.length)!

  it('rend une figure par capture, légende comprise', async () => {
    const detail = await mountSuspended(ProjectDetail, {
      props: { project: avecCaptures },
    })
    const captions = detail.findAll('.o-project__figure figcaption').map((n) => n.text())

    expect(captions).toEqual(avecCaptures.images!.map((image) => image.caption))
  })

  it('porte chaque texte alternatif sur son image', async () => {
    const detail = await mountSuspended(ProjectDetail, {
      props: { project: avecCaptures },
    })
    const alts = detail.findAll('.o-project__image').map((n) => n.attributes('alt'))

    expect(alts).toEqual(avecCaptures.images!.map((image) => image.alt))
  })

  it('s’atteint au clavier et se nomme au lecteur d’écran', async () => {
    const detail = await mountSuspended(ProjectDetail, {
      props: { project: avecCaptures },
    })
    const strip = detail.get('.o-project__strip')

    expect(strip.attributes('tabindex')).toBe('0')
    expect(strip.attributes('aria-label')).toContain(avecCaptures.title)
    // Le rôle `list` de l'`<ol>` ne se remplace pas : `role="group"` l'écrase
    // et laisse les `<li>` orphelins — cinq violations `serious` par fiche,
    // relevées par axe le 16/11/2026.
    expect(strip.attributes('role')).toBeUndefined()
    expect(strip.element.tagName).toBe('OL')
  })

  /**
   * Les deux flèches sont rendues au serveur, désactivées, et non posées au
   * montage : l'état de départ est le même des deux côtés, donc il n'y a rien
   * à réconcilier à l'hydratation, et la ligne ne saute pas sous les captures.
   * `.claude/rules/frontend.md` § « Rendu serveur » dit pourquoi.
   */
  it('rend deux flèches nommées, désactivées au premier rendu', async () => {
    const detail = await mountSuspended(ProjectDetail, {
      props: { project: avecCaptures },
    })
    const arrows = detail.findAll('.o-project__arrow')

    expect(arrows).toHaveLength(2)
    expect(arrows.map((node) => node.text())).toEqual([
      'Capture précédente',
      'Capture suivante',
    ])

    for (const arrow of arrows) {
      expect(arrow.attributes('type')).toBe('button')
      expect(arrow.attributes('disabled')).toBeDefined()
    }
  })

  /**
   * Le pictogramme ne porte pas le sens — `.claude/rules/frontend.md`. Le
   * texte du bouton est masqué visuellement, pas retiré de l'arbre.
   */
  it('laisse le texte du bouton porter le sens, pas le pictogramme', async () => {
    const detail = await mountSuspended(ProjectDetail, {
      props: { project: avecCaptures },
    })
    const first = detail.findAll('.o-project__arrow')[0]!

    expect(first.get('svg').attributes('aria-hidden')).toBe('true')
    expect(first.get('.visually-hidden').text()).toBe('Capture précédente')
    expect(first.attributes('aria-label')).toBeUndefined()
  })

  /**
   * Une fiche sans capture ne rend ni la rubrique ni la pellicule : un
   * conteneur vide dans l'ordre de tabulation serait une étape pour rien.
   */
  it('ne rend rien quand la fiche n’a pas de capture', async () => {
    const sansCaptures = projects.find((project) => !project.images?.length)

    if (!sansCaptures) return

    const detail = await mountSuspended(ProjectDetail, {
      props: { project: sansCaptures },
    })

    expect(detail.find('.o-project__strip').exists()).toBe(false)
    expect(detail.find('.o-project__arrow').exists()).toBe(false)
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
