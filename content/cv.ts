/**
 * Parcours d'Arnaud Brégère, transcrit depuis le PDF du CV
 * (`arnaud-bregere_cv.pdf`, version du 03/11/2026) — source unique du site.
 *
 * Rien ici n'est déduit ni arrondi : une ligne absente du CV est une ligne
 * absente de ce fichier. Seule exception, signalée sur place : le texte de
 * présentation de `/a-propos`, réécrit pour le site le 09/11/2026. Les métriques chiffrées du CV terminal précédent
 * (« +40 % de Core Web Vitals », « 5+ développeurs formés ») n'ont pas été
 * reprises faute de source.
 *
 * L'adresse postale du PDF ne figure pas ici : une page publique n'a pas à
 * porter le domicile de qui que ce soit. Le téléphone y est, par décision du
 * 03/11/2026. Il paraissait alors seulement sur `/a-propos` ; depuis le
 * 05/11/2026 (issue #5) il paraît aussi sur `/contact`, qui a remplacé son
 * formulaire par les coordonnées en clair.
 */

import type { CvFile, Education, Experience, Profile, SkillGroup } from './types'

export const profile: Profile = {
  name: 'Arnaud Brégère',
  role: 'Développeur front-end senior',
  /** Les quatre axes de l'en-tête du CV, dans le même ordre. */
  tagline: 'Front-end, design system, frameworks JavaScript et outils d’IA.',
  /**
   * Texte de présentation de `/a-propos`, réécrit par Arnaud le 09/11/2026.
   * Ce n'est plus la transcription du PDF : c'est la version du site, plus
   * courte, et elle fait foi ici.
   */
  intro: [
    'Initialement webdesigner, j’ai évolué vers le rôle d’intégrateur web et aujourd’hui développeur front-end.',
    'Mon parcours atypique me permet d’allier créativité, technicité et adaptabilité.',
  ],
  location: 'Paris',
  email: 'arnaud.bregere@gmail.com',
  phone: '06 07 98 52 85',
  availability: 'À l’écoute d’opportunités en CDI, à Paris ou en télétravail hybride.',
}

export const experiences: readonly Experience[] = [
  {
    company: 'Figaro Classifieds',
    role: 'Développeur front-end JavaScript',
    start: '2019-10',
    end: null,
    location: 'Paris',
    summary:
      'Portail immobilier et éditorial immobilier.lefigaro.fr : développement de fonctionnalités, maintenance et optimisation continue.',
    missions: [
      'Migration de la page d’accueil de Vue 2 vers Nuxt 3 — moteur de recherche, menu, articles éditoriaux et carte de France — pour améliorer le LCP.',
      'Refonte du cartouche d’annonce sur les pages de liste, pour réduire le CLS.',
      'Galerie photo et points d’intérêt sur la page de détail d’une annonce.',
      'Référencement : HTML sémantique, métadonnées, JSON-LD et fil d’Ariane sur les pages de liste.',
      'Fonctionnalités : favoris en stockage local, atouts du bien, DPE et GES.',
      'Migration du suivi d’audience de TagCommander vers Google Analytics.',
      'Revues de code, git flow et processus de mise en production.',
      'Tests unitaires, tests de bout en bout et tests A/B.',
    ],
    stack: [
      'Vue 3',
      'Nuxt 3',
      'React',
      'JavaScript',
      'TypeScript',
      'SCSS',
      'API REST',
      'GraphQL',
      'ElasticSearch',
      'Vitest',
      'Cypress',
      'Golang',
      'Docker',
      'Git',
    ],
  },
  {
    company: 'Groupe La Poste',
    role: 'Développeur front-end senior',
    start: '2018-09',
    end: '2019-10',
    location: 'Paris',
    summary: 'Mise en place de la première marketplace de laposte.fr.',
    missions: [
      'Pages de liste : intégration, responsive design, filtres du moteur de recherche et pose de TagCommander.',
      'Pages produit : intégration, responsive design, galerie photo et ajout au panier.',
      'Reprise du code existant et introduction de la convention BEM.',
      'Revues de code jusqu’à la livraison de la marketplace.',
    ],
    stack: ['JavaScript', 'jQuery', 'HTML5', 'JSP', 'CSS3', 'SCSS', 'Gulp', 'Git', 'GitLab'],
  },
  {
    company: 'Figaro Classifieds',
    role: 'Intégrateur web',
    start: '2015-02',
    end: '2018-09',
    location: 'Paris',
    summary: 'Jobboard cadremploi.fr : refontes successives et migration continue.',
    missions: [
      'Refonte du menu de l’espace personnel, mise en place du responsive et migration de CSS vers SCSS.',
      'Refonte de la page d’accueil sur une grille matricielle, pour se démarquer des jobboards concurrents.',
      'Refonte de la partie éditoriale en migration continue : nouvelles interactions et nouvelle interface.',
    ],
    stack: ['HTML5', 'JSP', 'CSS3', 'SCSS', 'jQuery', 'Gulp', 'Java', 'Kotlin', 'Scala', 'Git'],
  },
  {
    company: 'BrandAlley',
    role: 'Webdesigner et intégrateur web',
    start: '2010-12',
    end: '2015-02',
    location: 'Paris',
    summary: 'Site de ventes privées brandalley.fr : opérations marketing et animations commerciales.',
    missions: [
      'Proposition de refonte complète de la page d’accueil en flat design, validée et livrée : grille produits et menu.',
      'Création et intégration des opérations commerciales saisonnières.',
    ],
    stack: ['HTML', 'CSS3', 'jQuery', 'Suite Adobe', 'SVN', 'Git'],
  },
  {
    company: 'RueDuCommerce',
    role: 'Webdesigner',
    start: '2009-05',
    end: '2010-12',
    location: 'Paris',
    summary: 'Régie publicitaire du site rueducommerce.com.',
    missions: [
      'Kits commerciaux : bannières animées orientées marque.',
      'Intégration des newsletters quotidiennes.',
      'Pages d’atterrissage et mini-sites.',
    ],
    stack: ['HTML', 'CSS', 'ActionScript', 'Suite Adobe'],
  },
]

export const education: readonly Education[] = [
  {
    title: 'Certification Développement front-end de sites et applications web',
    school: 'Webecom',
    year: '2025-2026',
    result: 'Obtenue devant jury, 81 points sur 100',
    url: 'https://arnaudbregere.github.io/my-meteo/',
  },
  {
    title: 'Licence Communication et Médias, option webdesign',
    school: 'Cergy Paris Université',
    year: '2007-2008',
    result: 'Obtenue avec mention assez bien, en alternance chez EtoComm',
  },
  {
    title: 'BTS Communication visuelle, option publicité',
    school: 'Efficom Bastille',
    year: '2005-2007',
    result: 'Obtenu',
  },
  {
    title: 'Année propédeutique',
    school: 'Beaux-Arts d’Angers',
    year: '2004-2005',
  },
  {
    title: 'Baccalauréat littéraire, option arts plastiques',
    school: 'Lycée La Bruyère, Versailles',
    year: '2004',
  },
]

export const skillGroups: readonly SkillGroup[] = [
  {
    title: 'Langages',
    skills: ['HTML5', 'CSS3', 'SCSS', 'JavaScript', 'TypeScript', 'YAML'],
  },
  {
    title: 'Frameworks et bibliothèques',
    skills: ['Vue 3', 'Nuxt 3', 'Tailwind CSS', 'Vuetify', 'jQuery'],
  },
  {
    title: 'Données',
    skills: ['API REST', 'GraphQL', 'ElasticSearch', 'AJAX', 'Postman'],
  },
  {
    title: 'Qualité',
    skills: [
      'Tests unitaires',
      'Accessibilité RGAA',
      'Normes W3C',
      'Référencement technique',
      'Design system',
      'BEM',
      'Clean code',
      'UI/UX',
    ],
  },
  {
    title: 'Outils d’IA',
    skills: [
      'Claude Code (skills, rules, agents)',
      'GitHub Copilot',
      'Spec-kit',
      'Impeccable',
      'RTK',
      'Caveman',
      'graphify',
    ],
  },
  {
    title: 'Outillage',
    skills: [
      'Git',
      'GitHub',
      'GitLab',
      'npm, Yarn, pnpm',
      'VS Code',
      'IntelliJ',
      'WebStorm',
      'Figma',
      'Suite Adobe',
      'Jira',
      'Trello',
      'Redmine',
    ],
  },
  {
    title: 'Savoir-être',
    skills: [
      'Respect des échéances',
      'Capacité à délivrer',
      'Communication',
      'Force de proposition',
    ],
  },
]

export const cvFile: CvFile = {
  path: '/pdf/arnaud-bregere_cv.pdf',
  format: 'PDF',
  sizeKb: 449,
  updated: '2026-11-03',
}
