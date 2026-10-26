import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Skills et agents vendorisés : pas notre code, pas notre style.
  ignores: ['.claude/**', '.specify/**'],
}).append({
  rules: {
    'vue/multi-word-component-names': 'off',
  },
})
