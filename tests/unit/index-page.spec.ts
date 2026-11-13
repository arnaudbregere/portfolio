import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { profile } from '~~/content/cv'
import { projects } from '~~/content/projects'
import { telHref } from '~/utils/contact'
import IndexPage from '~/pages/index.vue'

describe('page Accueil', () => {
  it('annonce le nom et l’intitulé visé', async () => {
    const page = await mountSuspended(IndexPage)

    expect(page.get('h1').text()).toBe(profile.name)
    expect(page.text()).toContain(profile.role)
  })

  /**
   * L'ancienneté était calculée depuis octobre 2019, et ce test vérifiait le
   * calcul. Arnaud l'a fixée à 10 le 12/11/2026 (issue #53) : aucune date de
   * `content/cv.ts` ne donne 10, c'est une valeur déclarée.
   *
   * Ce test a porté un temps `expect(getUTCFullYear()).toBe(2026)`, pour
   * rappeler l'échéance. Retiré à la relecture : une suite qui rougit au
   * changement d'année bloque le déploiement d'un correctif sans rapport, et
   * une échéance se porte dans une issue datée — pas dans chaque mise en
   * production.
   */
  it('affiche les dix années d’expérience front-end déclarées', async () => {
    const page = await mountSuspended(IndexPage)

    expect(page.text()).toContain('10 ans')
  })

  /**
   * Le repère vient du contenu, paragraphe par paragraphe, et rien ne s'y
   * perd en chemin. Ce test est né le 13/11/2026 avec la réécriture du
   * repère : la page n'en rendait aucun avant, et un paragraphe oublié dans
   * le gabarit serait passé inaperçu.
   */
  it('rend chaque paragraphe du repère, tel que le contenu le porte', async () => {
    const page = await mountSuspended(IndexPage)
    const paragraphs = page.findAll('.home__pitch').map((node) => node.text())

    expect(paragraphs).toEqual([...profile.pitch])
  })

  it('propose le CV et les deux voies de contact', async () => {
    const page = await mountSuspended(IndexPage)

    expect(page.get('a[download]').attributes('href')).toBe('/pdf/arnaud-bregere_cv.pdf')
    expect(page.get(`a[href="mailto:${profile.email}"]`).exists()).toBe(true)
    expect(page.find('a[href="/contact"]').exists()).toBe(true)
  })

  /**
   * Le défaut corrigé par l'issue #15 : `featured` était posé dans le contenu
   * et lu nulle part. Ces trois tests le rendent opposable — un projet marqué
   * ou démarqué change la page, ou un test tombe.
   */
  it('met en avant exactement les projets marqués `featured`', async () => {
    const page = await mountSuspended(IndexPage)
    const featured = projects.filter((project) => project.featured)

    const titles = page.findAll('.home__project-title').map((node) => node.text())

    expect(titles).toEqual(featured.map((project) => project.title))
  })

  it('lie chaque projet mis en avant à sa fiche, et renvoie à la liste', async () => {
    const page = await mountSuspended(IndexPage)

    for (const project of projects.filter((item) => item.featured)) {
      expect(page.find(`a[href="/projets/${project.slug}"]`).exists()).toBe(true)
    }
    expect(page.find('a[href="/projets"]').exists()).toBe(true)
  })

  it('tient les projets non retenus hors de l’accueil', async () => {
    const page = await mountSuspended(IndexPage)

    for (const project of projects.filter((item) => !item.featured)) {
      expect(page.find(`a[href="/projets/${project.slug}"]`).exists()).toBe(false)
    }
  })

  /**
   * Le téléphone était tenu hors de l'accueil jusqu'au 12/11/2026, et ce test
   * tenait son absence. L'issue #53 l'y ramène : `PRODUCT.md` inscrit les
   * coordonnées en clair comme attente du public « Recruteur / RH », et le
   * détour par `/contact` leur coûtait un clic.
   *
   * Les deux `href` viennent de `content/cv.ts` — ils ne sont pas recopiés
   * dans le gabarit, et un numéro changé dans le contenu change la page.
   */
  it('porte le téléphone et l’adresse e-mail, tirés du contenu', async () => {
    const page = await mountSuspended(IndexPage)

    const phone = page.get(`a[href="${telHref(profile.phone)}"]`)

    expect(phone.text()).toContain(profile.phone)
    expect(phone.attributes('href')).toMatch(/^tel:\+33\d{9}$/)

    const mail = page.get(`a[href="mailto:${profile.email}"]`)

    expect(mail.text()).toContain(profile.email)
  })

  /**
   * Le nom accessible dit lequel des deux liens appelle. Sans ce libellé, les
   * deux se nommaient « 06 07 98 52 85 » et « arnaud.bregere@gmail.com », et
   * seul le pictogramme — `aria-hidden` — faisait la différence : donné à
   * l'œil, retiré au lecteur d'écran. Relevé le 12/11/2026.
   */
  it('nomme chaque coordonnée par un libellé masqué visuellement', async () => {
    const page = await mountSuspended(IndexPage)

    const phone = page.get(`a[href="${telHref(profile.phone)}"]`)
    const mail = page.get(`a[href="mailto:${profile.email}"]`)

    // Le nom accessible d'un lien est son texte : le libellé doit y être,
    // et le texte affiché aussi — un `aria-label` aurait remplacé l'un par
    // l'autre et fait perdre le numéro à la commande vocale (WCAG 2.5.3).
    expect(phone.text()).toBe(`Téléphone : ${profile.phone}`)
    expect(mail.text()).toBe(`Adresse e-mail : ${profile.email}`)
  })

  /**
   * Un pictogramme ne porte jamais le sens : le libellé du lien reste la
   * seule source d'information — `.claude/rules/frontend.md`. Les deux
   * pictogrammes de la page sont ceux des coordonnées.
   */
  it('laisse les pictogrammes hors de l’arbre d’accessibilité', async () => {
    const page = await mountSuspended(IndexPage)

    const icons = page.findAll('svg[aria-hidden="true"]')

    expect(icons.length).toBeGreaterThanOrEqual(2)
    for (const icon of icons) expect(icon.attributes('focusable')).toBe('false')
  })

  /**
   * Le repère « Socle » a rendu `tagline` pendant un commit, soit la même
   * chaîne deux fois sur la page. `coreStack` lui est propre depuis — et rien
   * ne le tenait : `coreStack` pourrait redevenir inutilisé sans que le
   * typage s'en aperçoive.
   */
  it('rend le socle du contenu, et non l’accroche', async () => {
    const page = await mountSuspended(IndexPage)

    expect(page.text()).toContain(profile.coreStack)
    expect(profile.coreStack).not.toBe(profile.tagline)
  })

  /**
   * Le titre de la dernière section est un intitulé, pas la phrase de
   * disponibilité : celle-ci servait de nom accessible à la région, et ne
   * décrivait pas une section portant des coordonnées (WCAG 2.4.6).
   */
  it('intitule la dernière section, et met la disponibilité en paragraphe', async () => {
    const page = await mountSuspended(IndexPage)

    const headings = page.findAll('h2').map((node) => node.text())

    expect(headings).toContain('Me joindre')
    expect(headings).not.toContain(profile.availability)
    expect(page.text()).toContain(profile.availability)
  })
})
