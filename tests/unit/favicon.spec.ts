import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Les icônes livrées dans `public/` et le monogramme de l'atome.
 *
 * `scripts/favicon.js` les compose depuis `app/components/atoms/Logo.vue`,
 * mais il se lance **à la main** : rien dans `package.json` ni dans la CI ne
 * le rejoue. Un monogramme redessiné laisserait donc cinq fichiers périmés,
 * en silence — le test de bout en bout ne vérifie que le thème et la couleur
 * de marque, pas le dessin.
 *
 * Ce test ferme cet écart : si l'atome change sans que les icônes soient
 * régénérées, il tombe. Le remède est alors `node scripts/favicon.js`.
 */
// Depuis la racine du dépôt : Vitest y pose son `cwd`, et le test lit des
// fichiers livrés, pas un module importable.
const read = (path: string) => readFileSync(`${process.cwd()}/${path}`, 'utf8')

const atom = read('app/components/atoms/Logo.vue')
const favicon = read('public/favicon.svg')

const atomPaths = [...atom.matchAll(/class="a-logo__([ab])"\s+d="([^"]+)"/g)]

describe('icônes du site', () => {
  it('lit deux tracés dans l’atome, comme le script', () => {
    expect(atomPaths.map(([, name]) => name)).toEqual(['b', 'a'])
  })

  it('livre le dessin d’aujourd’hui, pas celui d’hier', () => {
    for (const [, name, d] of atomPaths) {
      expect(favicon, `tracé ${name} périmé — relancer node scripts/favicon.js`)
        .toContain(d)
    }
  })

  /**
   * Le carré se calcule depuis le `viewBox` de l'atome : côté = plus grande
   * dimension + deux marges. Le vérifier ici évite qu'un redessin sorte le
   * monogramme décentré sans qu'aucune erreur ne soit levée.
   */
  it('cadre le monogramme dans un carré centré sur la boîte des tracés', () => {
    const box = (source: string) =>
      source.match(/viewBox="([-\d. ]+)"/)![1].trim().split(/\s+/).map(Number)

    const [x, y, width, height] = box(atom)
    const [iconX, iconY, side, sideY] = box(favicon)

    expect(side).toBe(sideY)
    expect(side).toBeGreaterThan(Math.max(width, height))

    // Centres confondus, à l'arrondi du script près.
    expect(iconX + side / 2).toBeCloseTo(x + width / 2, 2)
    expect(iconY + side / 2).toBeCloseTo(y + height / 2, 2)
  })

  /**
   * Le `b` prend `currentColor` dans l'atome ; un fichier n'en a pas. La
   * couleur de marque, elle, ne bascule jamais — ni par thème, ni par
   * système.
   */
  it('porte les deux thèmes, et la marque dans les deux', () => {
    expect(favicon).toContain('prefers-color-scheme: dark')
    expect(favicon).toContain('#ff5c72')
    expect(favicon).not.toContain('currentColor')
  })
})
