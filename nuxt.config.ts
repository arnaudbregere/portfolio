export default defineNuxtConfig({
  compatibilityDate: '2026-10-26',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxtjs/color-mode'],

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

  // Origine du site, seule source des URL canoniques, du plan du site et du
  // fichier robots. Surchargeable par `NUXT_PUBLIC_SITE_URL` au déploiement.
  runtimeConfig: {
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
