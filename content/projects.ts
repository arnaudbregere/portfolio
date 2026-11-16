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
    ogImage: '/og/japan-manga-explorer.png',
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
    /**
     * Cinq vues de l'application sur téléphone, et non deux vues desktop :
     * `japan-react` est une application mobile first, et une capture de 1440 px
     * ne dit rien de ce que le visiteur verra. Reprises le 16/11/2026
     * (issue #82) depuis `https://japan-react.vercel.app`, à une densité de 2
     * sur une fenêtre de 383 × 675 — d'où les 766 × 1350.
     *
     * L'ordre est celui d'un parcours, pas celui d'un catalogue : on arrive,
     * on voit la liste, on cherche, on bascule sur les lieux, on pagine.
     */
    images: [
      {
        src: '/visuels/japan-manga-explorer/accueil.webp',
        alt: 'Accueil sur fond noir : le titre « Explorez mangas et lieux incontournables du Japon » en rouge, une accroche, et deux boutons « Explorer les mangas » et « Découvrir le Japon ».',
        caption: 'L’accueil : deux entrées, une par source de données.',
        width: 766,
        height: 1350,
      },
      {
        src: '/visuels/japan-manga-explorer/mangas-populaires.webp',
        alt: 'Section « Mangas populaires » : grille de deux colonnes de couvertures, chacune suivie du titre, d’une note sur dix et de ses genres.',
        caption: 'Les mangas populaires : couverture, note et genres.',
        width: 766,
        height: 1350,
      },
      {
        src: '/visuels/japan-manga-explorer/recherche-mangas.webp',
        alt: 'Page « Explorez les mangas » : un champ « Rechercher un manga », un bouton rouge « Rechercher », et les premiers résultats en grille.',
        caption: 'La recherche : un champ, un bouton, des résultats.',
        width: 766,
        height: 1350,
      },
      {
        src: '/visuels/japan-manga-explorer/lieux.webp',
        alt: 'Page « Lieux incontournables du Japon » : grille de deux colonnes, tour de Tokyo, Tokyo Skytree, Sensō-ji et Meiji-jingū, chacun avec sa photo et un début de description.',
        caption: 'Les lieux : même grille, autre source de données.',
        width: 766,
        height: 1350,
      },
      {
        src: '/visuels/japan-manga-explorer/lieux-pagination.webp',
        alt: 'Bas de la liste des lieux : Arashiyama, château d’Osaka, Dōtonbori et Itsukushima-jinja, puis la pagination « Page précédente », « Page 1 », « Page suivante ».',
        caption: 'La pagination, au bas de la liste des lieux.',
        width: 766,
        height: 1350,
      },
    ],
    featured: true,
  },
  {
    slug: 'agenda-app-event',
    ogImage: '/og/agenda-app-event.png',
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
    /**
     * Six vues sur téléphone, et non deux captures desktop : l'application
     * est mobile first, et sa fiche annonce quatre vues — mois, semaine,
     * jour, liste. Une pellicule qui en montrerait deux contredirait le
     * texte posé au-dessus d'elle.
     *
     * Reprises le 16/11/2026 (issue #84) depuis
     * `https://agenda-app-event.onrender.com`, à une densité de 2 sur une
     * fenêtre de 383 × 675 — d'où les 766 × 1350, mêmes dimensions que la
     * pellicule de Japan Manga Explorer.
     *
     * L'ordre va du général au particulier : les quatre vues, puis ce qui
     * les commande — les filtres de catégorie, et la fiche d'un événement.
     */
    images: [
      {
        src: '/visuels/agenda-app-event/vue-mois.webp',
        alt: 'Vue mois de novembre 2026 sur téléphone : sept colonnes, événements en pastilles colorées par catégorie, et un lien « + 2 de plus » sur les journées chargées.',
        caption: 'Vue mois : une pastille par événement, la couleur dit la catégorie.',
        width: 766,
        height: 1350,
      },
      {
        src: '/visuels/agenda-app-event/vue-semaine.webp',
        alt: 'Vue semaine du 16 au 22 novembre 2026 : bandeau des journées entières en haut, grille horaire en dessous, et deux événements simultanés placés côte à côte le mercredi.',
        caption: 'Vue semaine : sept colonnes et la grille horaire tiennent sur un téléphone.',
        width: 766,
        height: 1350,
      },
      {
        src: '/visuels/agenda-app-event/vue-jour.webp',
        alt: 'Vue jour du lundi 16 novembre 2026 : cinq événements sur la grille horaire, chacun avec son titre et ses horaires en clair.',
        caption: 'Vue jour : la colonne unique rend les titres et les horaires lisibles.',
        width: 766,
        height: 1350,
      },
      {
        src: '/visuels/agenda-app-event/vue-liste.webp',
        alt: 'Vue liste de novembre 2026 : les événements groupés par date, horaires à gauche, pastille de catégorie avant chaque titre.',
        caption: 'Vue liste : les événements groupés par date, sans grille.',
        width: 766,
        height: 1350,
      },
      {
        src: '/visuels/agenda-app-event/categories.webp',
        alt: 'Panneau latéral ouvert : mini-calendrier du mois, les six filtres de catégorie cochés — personnel, travail, important, famille, loisirs, autre — et les liens d’export et d’import de calendrier ICS.',
        caption: 'Le panneau latéral : filtres de catégorie, export et import ICS.',
        width: 766,
        height: 1350,
      },
      {
        src: '/visuels/agenda-app-event/modale-evenement.webp',
        alt: 'Fiche d’un événement en modale : titre, case « toute la journée », dates et heures de début et de fin, lieu, description, puis les actions supprimer, annuler et enregistrer.',
        caption: 'La fiche d’un événement : création, modification et suppression au même endroit.',
        width: 766,
        height: 1350,
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
