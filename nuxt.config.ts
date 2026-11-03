export default defineNuxtConfig({
  compatibilityDate: '2026-10-26',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxtjs/color-mode'],

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

  typescript: {
    strict: true,
    typeCheck: false, // lancé séparément par `npm run typecheck`
  },

  future: { compatibilityVersion: 4 },
})
