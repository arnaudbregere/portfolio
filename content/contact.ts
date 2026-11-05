/**
 * Ce que `/contact` annonce en plus des coordonnées : disponibilité et
 * recherche. Ajouté le 05/11/2026 (issue #5).
 *
 * Ces faits ne sont pas dans le PDF du CV — ils n'ont donc rien à faire dans
 * `cv.ts`, qui en est la transcription et rien d'autre.
 *
 * Trois choix tranchés par Arnaud le 05/11/2026 :
 *
 * - **CDI seul.** Annoncer « CDI, mission, freelance » sur le même plan
 *   brouille le signal auprès d'un recruteur RH, et le CV ne dit que CDI.
 * - **Aucun délai de réponse promis.** « Réponse sous 24 h », « disponible
 *   9h-18h » et « entretien sous 48 h » ont été retirés : ce sont des
 *   engagements vérifiables, tenus par une seule personne, sur la page même
 *   qui doit prouver sa rigueur.
 * - **Pas de lien vers le portfolio** : c'est l'adresse de cette page.
 *
 * LinkedIn et GitHub ne sont pas ici : `content/nav.ts` les porte déjà pour le
 * pied de page, et une URL ne se recopie pas.
 */

import type { ContactSection } from './types'

export const contactSections: readonly ContactSection[] = [
  {
    title: 'Disponibilité',
    facts: [
      { label: 'Statut', values: ['Ouvert aux opportunités'] },
      { label: 'Contrat', values: ['CDI'] },
      { label: 'Localisation', values: ['Paris et région parisienne'] },
      { label: 'Télétravail', values: ['Hybride accepté'] },
    ],
  },
  {
    title: 'Ce que je cherche',
    facts: [
      { label: 'Poste', values: ['Développeur front-end senior', 'Lead developer'] },
      { label: 'Technologies', values: ['Vue.js', 'TypeScript', 'Node.js'] },
      { label: 'Secteurs', values: ['Tech', 'E-commerce', 'Média', 'Fintech'] },
      { label: 'Taille d’équipe', values: ['5 à 15 développeurs'] },
    ],
  },
]
