/**
 * Projets présentés sur le site.
 *
 * Chaque fiche suit la même structure : problème, solution, résultat. Le
 * résultat est mesuré — un score, un chiffre, une couverture — jamais une
 * appréciation. Les mesures citées proviennent de rapports datés, conservés
 * hors dépôt.
 */

import type { Project } from './types'

export const projects: readonly Project[] = [
  {
    slug: 'japan-manga-explorer',
    title: 'Japan Manga Explorer',
    year: '2026',
    role: 'Conception et développement, seul',
    problem:
      'Chercher un manga et préparer un voyage au Japon demande de passer d’un site à l’autre, sur des interfaces lentes et rarement accessibles au clavier.',
    solution:
      'Une application Next.js en rendu serveur, qui interroge une API externe de mangas et sert une liste de lieux. Recherche, pagination, navigation au clavier, et des styles en modules SCSS plutôt qu’un framework utilitaire.',
    result:
      'Lighthouse du 8 juillet 2026 : 100 en performances, 100 en accessibilité, 100 en référencement, 96 en bonnes pratiques. Premier affichage à 0,8 s, affichage du plus grand élément à 1,9 s. Audit RGAA 4.1.2 du même jour : 89 sur 100, un seul critère non conforme sur les 31 vérifiables automatiquement.',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'SCSS', 'CSS Modules', 'Vercel'],
    links: [
      { label: 'Application en ligne', url: 'https://japan-react.vercel.app' },
      { label: 'Code source', url: 'https://github.com/arnaudbregere/japan-react' },
    ],
    featured: true,
  },
  {
    slug: 'agenda-app-event',
    title: 'Agenda',
    year: '2026',
    role: 'Conception et développement, seul',
    problem:
      'Tenir un agenda partagé oblige à confier ses événements à un service tiers, et les calendriers maison s’arrêtent souvent à une vue mensuelle sans tests.',
    solution:
      'Un monorepo à deux paquets sans dépendance croisée : une API Express sans base de données, et une application Vue 3 à quatre vues — mois, semaine, jour, liste — avec catégories et recherche plein texte. TypeScript strict des deux côtés, code et tests compris.',
    result:
      '17 fichiers de tests Vitest sur les deux paquets, plus une suite Playwright de bout en bout qui lance le vrai serveur. La chaîne d’intégration enchaîne quatre travaux — backend, frontend, bout en bout, déploiement — et met en ligne sur Render à chaque fusion.',
    stack: [
      'Vue 3',
      'Vite',
      'Pinia',
      'TypeScript',
      'Express',
      'Vitest',
      'Playwright',
      'GitHub Actions',
      'Render',
    ],
    links: [
      { label: 'Application en ligne', url: 'https://agenda-app-event.onrender.com' },
      { label: 'Code source', url: 'https://github.com/arnaudbregere/agenda-app-event' },
    ],
    featured: true,
  },
]
