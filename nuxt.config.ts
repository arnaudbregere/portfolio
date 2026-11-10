export default defineNuxtConfig({
  compatibilityDate: '2026-10-26',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxtjs/color-mode', '@nuxt/image'],

  // Les captures sont déjà converties en WebP et bornées à 1440 px dans
  // `public/` : le module ne sert qu'à poser les tailles servies, pas à
  // rattraper des fichiers trop lourds.
  image: {
    format: ['webp'],
    screens: { s: 480, m: 768, l: 1024, xl: 1440 },
  },

  // Atomic Design : le niveau est un rangement, pas un préfixe de nom.
  // `ThemeToggle`, pas `AtomsThemeToggle`.
  components: [{ path: '~/components', pathPrefix: false }],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      link: [
        // Seule police chargée du site : préchargée pour écourter la fenêtre
        // de `font-display: swap` sur le titre de première vue.
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/archivo-variable-latin.woff2',
          crossorigin: '',
        },
      ],
    },
  },

  // Thème : clair par défaut, bascule persistée, pas de flash au chargement.
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'portfolio-theme',
  },

  css: ['~/styles/main.scss'],

  runtimeConfig: {
    /**
     * Identité du build, servie par `GET /api/health`.
     *
     * Les valeurs sont lues **au build**, donc figées dans la sortie : c'est
     * voulu, puisqu'elles décrivent ce build-là. Vercel renseigne ses
     * variables à la construction ; la CI GitHub donne `GITHUB_SHA` en
     * secours. En local, tout vaut `inconnu` et la route répond quand même.
     *
     * Hors `public` : rien ici n'a besoin d'atteindre le navigateur, et ce
     * qui n'y va pas n'alourdit pas la charge utile des pages.
     */
    build: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? '',
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GITHUB_REF_NAME ?? '',
      environment: process.env.VERCEL_ENV ?? 'developpement',
      builtAt: new Date().toISOString(),
    },

    // Origine du site, seule source des URL canoniques, du plan du site et du
    // fichier robots. Surchargeable par `NUXT_PUBLIC_SITE_URL` au déploiement.
    //
    // **L'apex fait foi, sans `www.`.** Aujourd'hui l'hébergement redirige
    // l'inverse — l'apex vers `www` en 307 — donc les URL canoniques
    // désignent une adresse de redirection. Le remède est un réglage chez
    // l'hébergeur, pas une ligne de code : faire de l'apex le domaine
    // principal. Tant qu'il n'est pas posé, `isExternalUrl` tient aussi un
    // lien `www.` du site pour un lien sortant.
    public: {
      siteUrl: 'https://arnaud-bregere.fr',
    },
  },

  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // lancé séparément par `npm run typecheck`
  },

  // La planche de spécimen ne part pas en production.
  $production: {
    hooks: {
      'pages:extend'(pages) {
        const index = pages.findIndex((page) => page.path === '/_ds')

        if (index !== -1) pages.splice(index, 1)
      },
    },
  },

  future: { compatibilityVersion: 4 },
})
