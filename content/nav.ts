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
