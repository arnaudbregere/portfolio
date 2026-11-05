import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { profile } from '~~/content/cv'
import ContactPage from '~/pages/contact.vue'
import { contactSections } from '~~/content/contact'
import { profileLinks } from '~~/content/nav'
import { shortUrl, telHref } from '~/utils/contact'

describe('telHref', () => {
  it('passe un numéro français en forme internationale', () => {
    expect(telHref('06 07 98 52 85')).toBe('tel:+33607985285')
  })

  it('retire les espaces d’une forme déjà groupée autrement', () => {
    expect(telHref('01 23 45 67 89')).toBe('tel:+33123456789')
  })

  it('ne retire que le zéro de tête, jamais un zéro du numéro', () => {
    expect(telHref('06 00 12 30 45')).toBe('tel:+33600123045')
  })
})

describe('shortUrl', () => {
  it('retire le protocole, le `www.` et la barre finale', () => {
    expect(shortUrl('https://www.linkedin.com/in/arnaudbregere/')).toBe(
      'linkedin.com/in/arnaudbregere',
    )
    expect(shortUrl('https://github.com/arnaudbregere')).toBe('github.com/arnaudbregere')
  })
})

describe('page Contact', () => {
  it('donne le nom et prénom', async () => {
    const page = await mountSuspended(ContactPage)

    expect(page.get('.contact__name').text()).toBe(profile.name)
  })

  it('nomme chaque coordonnée par un libellé', async () => {
    const page = await mountSuspended(ContactPage)
    const labels = page
      .findAll('.contact__list--lead .contact__label')
      .map((node) => node.text())

    expect(labels).toEqual(['Téléphone', 'E-mail'])
  })

  /**
   * Le couple libellé / valeur est porté par une liste de définitions : le
   * lecteur d'écran annonce « Téléphone, 06 07 98 52 85 » et non deux textes
   * sans lien entre eux.
   */
  it('associe chaque libellé à sa valeur dans une liste de définitions', async () => {
    const page = await mountSuspended(ContactPage)
    const entries = page.findAll('.contact__list--lead .contact__entry')

    expect(entries).toHaveLength(2)
    expect(entries[0]!.get('dt').text()).toBe('Téléphone')
    expect(entries[0]!.get('dd a').attributes('href')).toBe(telHref(profile.phone))
    expect(entries[1]!.get('dt').text()).toBe('E-mail')
    expect(entries[1]!.get('dd a').attributes('href')).toBe(`mailto:${profile.email}`)
  })

  it('rend le téléphone activable, dans sa forme lisible', async () => {
    const page = await mountSuspended(ContactPage)
    const link = page.get('a[href^="tel:"]')

    expect(link.attributes('href')).toBe(telHref(profile.phone))
    expect(link.text()).toBe(profile.phone)
  })

  it('rend l’adresse e-mail activable', async () => {
    const page = await mountSuspended(ContactPage)
    const link = page.get(`a[href="mailto:${profile.email}"]`)

    expect(link.text()).toBe(profile.email)
  })

  /**
   * `mailto:` et `tel:` passent la main à une application : un onglet neuf
   * resterait vide. Ils ne passent donc pas par `SiteLink`, qui pose
   * `target="_blank"` — la règle est écrite dans son propre en-tête. Les
   * profils publics, eux, l'ouvrent bien.
   */
  it('n’ouvre pas d’onglet sur un lien qui ne navigue pas', async () => {
    const page = await mountSuspended(ContactPage)
    const links = page.findAll('a[href^="tel:"], a[href^="mailto:"]')

    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link.attributes('target')).toBeUndefined()
    }
  })

  it('ne propose plus de formulaire', async () => {
    const page = await mountSuspended(ContactPage)

    expect(page.find('form').exists()).toBe(false)
    expect(page.find('input').exists()).toBe(false)
  })

  /**
   * Les profils viennent de `content/nav.ts`, qui les sert déjà au pied de
   * page. Une deuxième copie des URLs serait une deuxième à maintenir.
   */
  it('sert les profils publics du contenu, sans recopier leur adresse', async () => {
    const page = await mountSuspended(ContactPage)

    for (const link of profileLinks) {
      const anchor = page.get(`a[href="${link.to}"]`)

      expect(anchor.text()).toContain(shortUrl(link.to))
      expect(anchor.attributes('rel')).toContain('me')
      expect(anchor.attributes('target')).toBe('_blank')
    }
  })

  it('rend chaque rubrique du contenu avec ses faits', async () => {
    const page = await mountSuspended(ContactPage)
    const titles = page.findAll('.contact__title').map((node) => node.text())

    expect(titles).toEqual(['Présence en ligne', ...contactSections.map((s) => s.title)])

    for (const fact of contactSections.flatMap((group) => group.facts)) {
      expect(page.text()).toContain(fact.label)
      expect(page.text()).toContain(fact.values.join(' · '))
    }
  })

  it('n’annonce aucun délai de réponse', async () => {
    const page = await mountSuspended(ContactPage)

    expect(page.text()).not.toMatch(/sous \d+\s*h|\d+h\s*-\s*\d+h/i)
  })

  it('ne renvoie pas vers le portfolio lui-même', async () => {
    const page = await mountSuspended(ContactPage)

    expect(page.text()).not.toContain('arnaud-bregere.fr')
  })
})
