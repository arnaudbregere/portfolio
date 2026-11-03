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
 * Profils publics. `rel="me"` les relie à l'identité du site ; ils s'ouvrent
 * dans le même onglet, la décision d'en ouvrir un nouveau appartenant au
 * visiteur.
 */
export const profileLinks: readonly NavItem[] = [
  { to: 'https://github.com/arnaudbregere', label: 'GitHub' },
  { to: 'https://www.linkedin.com/in/arnaudbregere/', label: 'LinkedIn' },
]
