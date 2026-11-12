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
  /**
   * Ligne de compétences de l'accueil, réécrite par Arnaud le 09/11/2026.
   * Ce ne sont plus les quatre axes de l'en-tête du CV : c'est la liste des
   * domaines, séparés par des barres verticales.
   *
   * TypeScript s'y est ajouté le 12/11/2026, après JavaScript. La ligne sert
   * désormais aussi le repère « Socle » de l'accueil (issue #53) : la
   * modifier change la page à deux endroits.
   */
  tagline:
    'Développeur Front-end | FullStack Agentic | Design Systems | JavaScript | TypeScript | Vue/Nuxt | React | SSR/CSR | Performance | Accessibilité | SEO | IA Tools',
  /**
   * Le socle du repère de l'accueil, posé par Arnaud le 12/11/2026
   * (issue #53). Il reprend l'accroche en trois écarts voulus : « Front-end »
   * sans le métier, qui est déjà le premier repère de la liste ;
   * « Design System » au singulier ; « React/Next » là où l'accroche n'écrit
   * que React.
   *
   * Le repère rendait `tagline` entre le 12/11/2026 et ce commit — même
   * chaîne à deux endroits de la page. Les deux lignes se ressemblent
   * toujours : une modification de l'une se regarde depuis l'autre.
   */
  coreStack:
    'Front-end | FullStack Agentic | Design System | JavaScript | TypeScript | Vue/Nuxt | React/Next | SSR/CSR | Performance | Accessibilité | SEO | IA Tools',
  /**
   * Texte de présentation de `/a-propos`, réécrit par Arnaud le 09/11/2026.
   * Ce n'est plus la transcription du PDF : c'est la version du site, plus
   * courte, et elle fait foi ici.
   *
   * La phrase sur le parcours atypique en a été retirée le même jour : elle
   * vit dans `pitch`, sur l'accueil, et la garder ici la faisait lire deux
   * fois à un paragraphe d'intervalle.
   */
  intro: [
    'Initialement webdesigner, j’ai évolué vers le rôle d’intégrateur web et aujourd’hui développeur front-end.',
  ],
  /**
   * Texte de présentation de l'accueil, choisi par Arnaud le 09/11/2026. Il
   * est distinct de `intro`, qui sert `/a-propos` : l'accueil dit le
   * parcours, la page À propos dit le point d'arrivée.
   */
  pitch: [
    'Je me suis ensuite spécialisé en développement front-end, en consolidant mes compétences en JavaScript et sur les frameworks modernes.',
    'Mon parcours atypique me permet d’allier créativité, rigueur et adaptabilité pour concevoir des expériences web performantes.',
  ],
  location: 'Paris',
  email: 'arnaud.bregere@gmail.com',
  phone: '06 07 98 52 85',
  /**
   * Écart assumé au PDF, demandé par Arnaud le 12/11/2026 (issue #53) : le CV
   * écrit « en Île-de-France **ou** en télétravail hybride », cette ligne dit
   * « **et** ». Le « ou » laissait lire une alternative — l'un ou l'autre —
   * là où les deux sont acceptés ensemble.
   *
   * C'est le deuxième écart de ce fichier au PDF, et il est signalé sur place
   * comme le premier. Il se referme à la prochaine version du PDF.
   */
  availability:
    'À l’écoute d’opportunités en CDI, en Île-de-France et en télétravail hybride.',
}

export const experiences: readonly Experience[] = [
  {
    company: 'Figaro Classifieds',
    role: 'Développeur front-end JavaScript',
    start: '2019-10',
    end: null,
    location: 'Paris',
    product: 'immobilier.lefigaro.fr',
    sector: 'Portail Immo/Edito',
    summary:
      'Développement de fonctionnalités, maintenance et optimisation continue.',
    missions: [
      'Migration de la page d’accueil de Vue 2 vers Nuxt 3 — moteur de recherche, menu, articles éditoriaux et carte de France — pour améliorer le LCP.',
      'Refonte du cartouche d’annonce sur les pages de liste, pour réduire le CLS.',
      'Galerie photo et points d’intérêt sur la page de détail d’une annonce.',
      'Maintenance applicative : gestion des alertes et refactoring du moteur de recherche, pour améliorer l’INP.',
      'Référencement : HTML sémantique, métadonnées, JSON-LD et fil d’Ariane sur les pages de liste.',
      'Fonctionnalités : favoris en stockage local, atouts du bien, DPE et GES.',
      'Migration du suivi d’audience de TagCommander vers Google Analytics.',
      'Publicité : mise en place de Google Ads et de Hubvisor.',
      'Performances : Core Web Vitals, optimisation des requêtes et des images.',
      'Intégration continue : revues de code, git flow et processus de mise en production, en synchronisation avec les équipes business et produit.',
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
      'JSP',
      'Git',
    ],
    tools: [
      'IntelliJ',
      'VS Code',
      'Copilot',
      'Claude AI',
      'Figma',
      'Jira',
      'Jenkins',
      'Rundeck',
      'GitHub',
      'GCP',
      'Docker',
    ],
    method: 'Agile/Scrum — planification, poker planning, rétrospectives, cadrages techniques',
  },
  {
    company: 'Groupe La Poste',
    role: 'Développeur front-end',
    start: '2018-09',
    end: '2019-10',
    location: 'Paris',
    product: 'laposte.fr',
    sector: 'Marketplace',
    summary: 'Mise en place de la première marketplace du groupe.',
    missions: [
      'Pages de liste : intégration, responsive design, filtres du moteur de recherche et pose de TagCommander.',
      'Pages produit : intégration, responsive design, galerie photo et ajout au panier.',
      'Amélioration du code existant, et introduction de la convention BEM.',
      'Revues de code jusqu’à la livraison de la marketplace.',
    ],
    stack: ['JavaScript', 'jQuery', 'HTML5', 'JSP', 'CSS3', 'SCSS', 'Gulp', 'Git'],
    tools: ['WebStorm', 'Jira', 'Suite Adobe', 'GitLab'],
    method: 'Kanban',
  },
  {
    company: 'Figaro Classifieds',
    role: 'Intégrateur web',
    start: '2015-02',
    end: '2018-09',
    location: 'Paris',
    product: 'cadremploi.fr',
    sector: 'Jobboard',
    summary: 'Refontes successives et migration continue.',
    missions: [
      'Refonte du menu de l’espace personnel, mise en place du responsive et migration de CSS vers SCSS.',
      'Refonte de la page d’accueil sur une grille matricielle, pour se démarquer des jobboards concurrents.',
      'Refonte de la partie éditoriale en migration continue : nouvelles interactions et nouvelle interface.',
    ],
    stack: ['HTML5', 'JSP', 'CSS3', 'SCSS', 'jQuery', 'Gulp', 'Java', 'Kotlin', 'Scala', 'Git'],
    tools: ['IntelliJ', 'Trello', 'Suite Adobe', 'GitHub'],
    method: 'Agile/Scrum — planification, poker planning, rétrospectives',
  },
  {
    company: 'BrandAlley',
    role: 'Webdesigner et intégrateur web',
    start: '2010-12',
    end: '2015-02',
    location: 'Paris',
    product: 'brandalley.fr',
    sector: 'E-commerce',
    summary: 'Site de ventes privées : opérations marketing et animations commerciales.',
    missions: [
      'Proposition de refonte complète de la page d’accueil en flat design, validée et livrée : grille produits et menu.',
      'Création et intégration des opérations commerciales : Noël, soldes, rentrée et collections saisonnières.',
    ],
    stack: ['HTML', 'CSS3', 'jQuery'],
    tools: ['DreamWeaver', 'Suite Adobe', 'TortoiseSVN', 'Git'],
  },
  {
    company: 'RueDuCommerce',
    role: 'Webdesigner',
    start: '2009-05',
    end: '2010-12',
    location: 'Paris',
    product: 'rueducommerce.com',
    sector: 'E-commerce',
    summary:
      'Régie publicitaire du site : opérations marketing et animations commerciales.',
    missions: [
      'Kits commerciaux : bannières animées en GIF et en Flash, orientées marque.',
      'Intégration des newsletters quotidiennes.',
      'Pages d’atterrissage et mini-sites : Halo 3, domotique.',
      'Campagnes : Noël, printemps, promotions, ventes flash et soldes.',
    ],
    stack: ['HTML', 'CSS', 'ActionScript'],
    tools: ['Photoshop', 'Illustrator', 'Flash', 'DreamWeaver'],
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
