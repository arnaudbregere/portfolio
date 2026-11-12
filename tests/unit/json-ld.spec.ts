import { describe, expect, it } from 'vitest'
import { jsonLdScript } from '../../app/utils/json-ld'

/**
 * La sérialisation du JSON-LD posé en ligne par `app.vue` et
 * `useProjectJsonLd`.
 *
 * L'enjeu tient en une ligne : `JSON.stringify` n'échappe pas le chevron
 * ouvrant, donc une valeur contenant `</script>` refermerait le bloc. La
 * politique de sécurité du contenu tolère le script en ligne, c'est donc la
 * seule couture de cet argument — ces tests la tiennent fermée.
 */
describe('sérialisation JSON-LD', () => {
  it('échappe le chevron ouvrant', () => {
    expect(jsonLdScript({ name: '<b>Arnaud</b>' })).toBe(
      '{"name":"\\u003cb>Arnaud\\u003c/b>"}',
    )
  })

  it('ne laisse pas une valeur refermer le bloc de script', () => {
    const data = { abstract: 'Fin du bloc : </script><script>alert(1)</script>' }

    expect(jsonLdScript(data)).not.toContain('</script>')
    expect(jsonLdScript(data)).not.toContain('<')
  })

  it('reste du JSON valide, relu à l’identique', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: 'Projet <avec chevrons>',
      keywords: 'Vue, Nuxt',
    }

    expect(JSON.parse(jsonLdScript(data))).toEqual(data)
  })

  it('laisse intact un contenu sans chevron', () => {
    const data = { name: 'Arnaud Brégère', jobTitle: 'Développeur front-end senior' }

    expect(jsonLdScript(data)).toBe(JSON.stringify(data))
  })
})
