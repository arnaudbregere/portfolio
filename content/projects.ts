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
    images: [
      {
        src: '/visuels/japan-manga-explorer/liste-mangas.webp',
        alt: 'Liste de mangas en grille de quatre colonnes, avec champ de recherche, note sur dix et genres sous chaque couverture.',
        caption: 'Liste des mangas : recherche, note et genres, paginée.',
        width: 1440,
        height: 682,
      },
      {
        src: '/visuels/japan-manga-explorer/lieux.webp',
        alt: 'Liste de lieux japonais en grille de quatre colonnes : tour de Tokyo, Tokyo Skytree, Sensō-ji, Meiji-jingū, chacun avec sa photo et un début de description.',
        caption: 'Liste des lieux : même grille, autre source de données.',
        width: 1440,
        height: 723,
      },
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
    images: [
      {
        src: '/visuels/agenda-app-event/vue-mois.webp',
        alt: 'Vue mensuelle de novembre 2026, événements colorés par catégorie, panneau latéral avec mini-calendrier et filtres.',
        caption: 'Vue mois : les catégories filtrent depuis le panneau latéral.',
        width: 1440,
        height: 779,
      },
      {
        src: '/visuels/agenda-app-event/vue-semaine.webp',
        alt: 'Vue hebdomadaire du 2 au 8 novembre 2026, événements placés sur une grille horaire, journées entières en haut.',
        caption: 'Vue semaine : grille horaire, journées entières en bandeau.',
        width: 1440,
        height: 814,
      },
    ],
    featured: true,
  },
  {
    slug: 'calculatrice',
    title: 'Calculatrice',
    year: '2026',
    role: 'Conception et développement, seul',
    problem:
      'Une calculatrice web paraît triviale, et c’est ce qui la rend révélatrice : la chaîne d’opérations, la virgule, le pourcentage et la division par zéro sont des cas limites que la plupart des exercices traitent mal.',
    solution:
      'Une machine à états isolée dans un composable Vue 3, qui ne connaît rien du rendu. Le nombre en cours est tenu en chaîne et non en nombre, le pourcentage suit la convention des calculatrices de bureau — « 200 + 10 % » ajoute 20 — et le clavier physique fait tout ce que font les touches.',
    result:
      '19 tests unitaires couvrent la machine à états, cas limites compris : division par zéro, virgule unique, saisie bornée à 12 chiffres, correction d’opérateur. Aucune dépendance ajoutée, et les touches dépassent la cible tactile de 44 px exigée par le RGAA.',
    stack: ['Vue 3', 'TypeScript', 'Vitest', 'SCSS'],
    links: [{ label: 'Démo jouable', url: 'https://arnaud-bregere.fr/projets/calculatrice' }],
    featured: false,
  },
]
