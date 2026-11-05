import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Le gabarit de `scripts/og-card.js` est rendu par Chrome sans interface, hors
 * de l'application : il ne peut pas lire les custom properties du site et
 * recopie donc cinq couleurs. Ce test est le lien qui manque entre les deux
 * copies — une couleur modifiée dans `_tokens.scss` casse ici, au lieu de
 * laisser les cartes de partage sur l'ancienne palette sans rien signaler.
 */
const MAPPING: Record<string, string> = {
  '--bg': '--color-bg',
  '--fg': '--color-fg',
  '--muted': '--color-fg-muted',
  '--line': '--color-line',
  '--ink': '--color-ink',
}

/** Les couleurs littérales du premier bloc `:root` d'un fichier. */
const rootColors = (path: string) => {
  const source = readFileSync(join(process.cwd(), path), 'utf8')
  const block = /:root\s*\{([^}]*)\}/.exec(source)

  if (!block) throw new Error(`aucun bloc \`:root\` dans ${path}`)

  const colors: Record<string, string> = {}

  for (const [, name, value] of block[1]!.matchAll(
    /(--[\w-]+):\s*(#[\da-f]{3,8})/gi,
  )) {
    colors[name!] = value!.toLowerCase()
  }

  return colors
}

describe('couleurs du gabarit de carte de partage', () => {
  const card = rootColors('scripts/og-card.js')
  const tokens = rootColors('app/styles/_tokens.scss')

  it('ne recopie que les cinq couleurs connues', () => {
    expect(Object.keys(card).sort()).toEqual(Object.keys(MAPPING).sort())
  })

  for (const [local, token] of Object.entries(MAPPING)) {
    it(`${local} reprend ${token}`, () => {
      expect(tokens[token], `${token} absent de _tokens.scss`).toBeDefined()
      expect(card[local]).toBe(tokens[token])
    })
  }
})
