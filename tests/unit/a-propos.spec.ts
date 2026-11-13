import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { education, experiences, profile, skillGroups } from '~~/content/cv'
import AProposPage from '~/pages/a-propos.vue'

describe('page À propos', () => {
  it('liste chaque expérience du contenu, dans l’ordre', async () => {
    const page = await mountSuspended(AProposPage)
    const roles = page.findAll('.about__role').map((node) => node.text())

    expect(roles).toHaveLength(experiences.length + education.length)
    expect(roles[0]).toContain(experiences[0]!.role)
    expect(roles[0]).toContain(experiences[0]!.company)
  })

  /**
   * Ce que le contenu porte, la page le rend — y compris les champs venus du
   * PDF le 12/11/2026 (issue #58) : le produit servi, son secteur, les outils
   * et la méthode. Sans ce test, un champ ajouté à `content/cv.ts` et oublié
   * dans le gabarit resterait invisible sans que rien ne tombe.
   */
  it('rend le produit, le secteur, les outils et la méthode de chaque poste', async () => {
    const page = await mountSuspended(AProposPage)

    /**
     * **Chaque fiche est interrogée pour elle-même.** Comparé au texte de la
     * page entière, ce test restait vert en retirant la ligne des outils du
     * gabarit : ceux de La Poste et de Cadremploi paraissent aussi dans la
     * rubrique « Compétences », plus bas. Relevé à la relecture du
     * 12/11/2026.
     */
    // Scopé à la rubrique : « Formation » rend elle aussi des
    // `.about__item`.
    const items = page.findAll('[aria-labelledby="experiences"] .about__item')

    expect(items).toHaveLength(experiences.length)

    items.forEach((item, index) => {
      const job = experiences[index]!
      const text = item.text()

      expect(text, job.company).toContain(job.product)
      expect(text, job.company).toContain(job.sector)

      /**
       * Technos et outils sont des étiquettes depuis le 13/11/2026, et non
       * plus deux chaînes jointes par ` · ` : la liste rendue est donc
       * comparée élément par élément, dans l'ordre. Un séparateur revenu dans
       * un libellé, ou une liste tronquée, fait rougir ce test.
       */
      const tags = item.findAll('.a-tag-list__item').map((node) => node.text())

      expect(tags, job.company).toEqual([...job.stack, ...job.tools])

      if (job.method) expect(text, job.company).toContain(job.method)
    })
  })

  /**
   * La liste des libellés du pied de fiche est **close** : un champ ajouté à
   * `Experience` et oublié dans le gabarit ne tomberait pas tout seul, mais
   * un libellé ajouté sans contenu, ou retiré, fait rougir la suite.
   */
  it('n’énonce que les trois libellés attendus en pied de fiche', async () => {
    const page = await mountSuspended(AProposPage)
    const first = page.findAll('[aria-labelledby="experiences"] .about__item')[0]!

    expect(first.findAll('.about__pile dt').map((node) => node.text()))
      .toEqual(['Technos', 'Outils', 'Méthode'])
  })

  /**
   * La méthode est facultative : les deux fiches les plus anciennes n'en
   * déclarent aucune au CV. Une ligne vide ou un séparateur orphelin
   * trahirait un `v-if` oublié.
   */
  it('n’affiche pas de ligne de méthode là où le CV n’en donne pas', async () => {
    const page = await mountSuspended(AProposPage)

    // Seule la page est observée : `expect(declared).toBeLessThan(…)` a été
    // retiré le 12/11/2026, c'était une assertion de contenu dans un test de
    // rendu — une version du CV donnant une méthode aux cinq postes l'aurait
    // fait rougir sans qu'aucun gabarit ait bougé.
    const declared = experiences.filter((job) => job.method).length

    expect(page.findAll('.about__method')).toHaveLength(declared)
  })

  it('rend chaque mission et chaque formation', async () => {
    const page = await mountSuspended(AProposPage)
    const text = page.text()

    for (const mission of experiences.flatMap((job) => job.missions)) {
      expect(text).toContain(mission)
    }
    for (const course of education) {
      expect(text).toContain(course.school)
    }
  })

  it('nomme chaque groupe de compétences', async () => {
    const page = await mountSuspended(AProposPage)

    // Scopé à la rubrique : le pied de chaque fiche d'expérience est lui
    // aussi une liste de définitions depuis le 12/11/2026 — « Technos »,
    // « Outils », « Méthode ».
    const titles = page.findAll('.about__skills dt').map((node) => node.text())

    expect(titles).toEqual(skillGroups.map((group) => group.title))
  })

  it('propose le CV en téléchargement', async () => {
    const page = await mountSuspended(AProposPage)
    const link = page.get('a[download]')

    expect(link.attributes('href')).toBe('/pdf/arnaud-bregere_cv.pdf')
  })

  /**
   * Le nom accessible porte le libellé **et** la valeur depuis le
   * 12/11/2026 : seul le pictogramme disait lequel des deux liens appelait,
   * et il est `aria-hidden`. Le libellé est dans le lien, non en
   * `aria-label`, pour que la commande vocale retrouve le texte affiché.
   */
  it('donne l’e-mail et le téléphone en liens activables et nommés', async () => {
    const page = await mountSuspended(AProposPage)

    const mail = page.get(`a[href="mailto:${profile.email}"]`)

    expect(mail.text()).toContain(profile.email)
    expect(mail.text()).toContain('Adresse e-mail')

    const phone = page.get('a[href^="tel:"]')

    expect(phone.attributes('href')).toBe('tel:+33607985285')
    expect(phone.text()).toContain('Téléphone')
  })

  it('n’expose aucune adresse postale', async () => {
    const page = await mountSuspended(AProposPage)

    expect(page.text()).not.toMatch(/\d{1,3},?\s+rue\s/i)
  })
})
