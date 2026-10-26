export default defineNuxtConfig({
  compatibilityDate: '2026-10-26',
  devtools: { enabled: true },

  modules: ['@nuxt/eslint', '@nuxtjs/color-mode'],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
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
