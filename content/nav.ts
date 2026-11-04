/** Les rubriques publiques, dans l'ordre d'affiche. Source unique. */
export type NavItem = {
  to: string
  label: string
}

export const siteNav: readonly NavItem[] = [
  { to: '/', label: 'Accueil' },
  { to: '/projets', label: 'Projets' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
]

/**
 * Profils publics. `rel="me"` les relie à l'identité du site.
 *
 * Ils s'ouvrent dans un **nouvel onglet** : décision du 04/11/2026
 * (issue #22), qui annule celle de P2 — « la décision d'en ouvrir un nouveau
 * appartient au visiteur ». Le site est une pièce de candidature, il doit
 * rester ouvert derrière le profil que le lecteur part consulter. La cible est
 * posée par `SiteLink`, pas ici : le contenu ne porte pas de comportement.
 */
export const profileLinks: readonly NavItem[] = [
  { to: 'https://github.com/arnaudbregere', label: 'GitHub' },
  { to: 'https://www.linkedin.com/in/arnaudbregere/', label: 'LinkedIn' },
]
