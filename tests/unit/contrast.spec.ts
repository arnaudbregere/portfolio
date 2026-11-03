import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  formatRatio,
  parseColor,
  relativeLuminance,
} from '~/utils/contrast'

describe('parseColor', () => {
  it('lit la notation hexadécimale des tokens', () => {
    expect(parseColor('#b3122b')).toEqual([179, 18, 43])
  })

  it('lit la notation hexadécimale courte', () => {
    expect(parseColor('#fff')).toEqual([255, 255, 255])
  })

  it('lit la notation fonctionnelle rendue par getComputedStyle', () => {
    expect(parseColor('rgb(20, 18, 15)')).toEqual([20, 18, 15])
    expect(parseColor('rgba(20, 18, 15, 0.5)')).toEqual([20, 18, 15])
    expect(parseColor('rgb(20 18 15 / 50%)')).toEqual([20, 18, 15])
  })

  it('tolère les espaces autour de la valeur', () => {
    expect(parseColor('  #F7F4EF  ')).toEqual([247, 244, 239])
  })

  it('rend null pour une valeur qui n’est pas une couleur', () => {
    expect(parseColor('1px solid var(--color-line)')).toBeNull()
    expect(parseColor('')).toBeNull()
  })
})

describe('relativeLuminance', () => {
  it('place le noir à 0 et le blanc à 1', () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0)
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 10)
  })
})

describe('contrastRatio', () => {
  it('donne 21:1 entre le noir et le blanc', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 10)
  })

  it('donne 1:1 pour une couleur avec elle-même', () => {
    expect(contrastRatio([179, 18, 43], [179, 18, 43])).toBeCloseTo(1, 10)
  })

  it('ne dépend pas de l’ordre des deux couleurs', () => {
    const ink = parseColor('#b3122b')!
    const paper = parseColor('#f7f4ef')!

    expect(contrastRatio(ink, paper)).toBeCloseTo(contrastRatio(paper, ink), 10)
  })

  it('mesure l’encre du thème clair sur son papier', () => {
    expect(contrastRatio(parseColor('#b3122b')!, parseColor('#f7f4ef')!)).toBeCloseTo(6.3, 2)
  })

  it('mesure l’encre du thème sombre sur son fond', () => {
    expect(contrastRatio(parseColor('#ff5c72')!, parseColor('#121110')!)).toBeCloseTo(6.31, 2)
  })
})

describe('formatRatio', () => {
  it('met en forme à la française', () => {
    expect(formatRatio(6.3)).toBe('6,30:1')
    expect(formatRatio(17.0351)).toBe('17,04:1')
  })
})

/**
 * Seuils WCAG des couples réellement déclarés. Les valeurs sont lues dans
 * `_tokens.scss` plutôt que recopiées ici : une couleur modifiée fait
 * re-mesurer le test au lieu de le laisser vérifier une valeur périmée.
 */
const tokensByTheme = (): Record<'light' | 'dark', Record<string, string>> => {
  const source = readFileSync(
    join(process.cwd(), 'app/styles/_tokens.scss'),
    'utf8',
  )
  const read = (selector: string) => {
    const block = new RegExp(`${selector}\\s*\\{([^}]*)\\}`).exec(source)
    const colors: Record<string, string> = {}

    for (const [, name, value] of block![1]!.matchAll(
      /(--color-[\w-]+):\s*(#[\da-f]{3,8}|var\(--color-[\w-]+\))/gi,
    )) {
      colors[name!] = value!
    }

    return colors
  }

  // Un token peut renvoyer à un autre (`--color-focus: var(--color-fg)`). Le
  // navigateur substitue au calcul de la valeur ; ici il faut le faire.
  const resolve = (colors: Record<string, string>) => {
    const reference = /^var\((--color-[\w-]+)\)$/

    for (const [name, value] of Object.entries(colors)) {
      const target = reference.exec(value)?.[1]

      if (target) colors[name] = colors[target]!
    }

    return colors
  }

  const light = read(':root')

  return {
    light: resolve({ ...light }),
    dark: resolve({ ...light, ...read('\\.dark') }),
  }
}

describe('seuils WCAG des couples de tokens', () => {
  const themes = tokensByTheme()

  const couples = [
    { fg: '--color-fg', bg: '--color-bg', min: 4.5, role: 'texte courant' },
    {
      fg: '--color-fg-muted',
      bg: '--color-bg',
      min: 4.5,
      role: 'texte secondaire',
    },
    { fg: '--color-ink', bg: '--color-bg', min: 4.5, role: 'encre' },
    { fg: '--color-ink-fg', bg: '--color-ink', min: 4.5, role: 'texte sur encre' },
    {
      fg: '--color-line-strong',
      bg: '--color-bg',
      min: 3,
      role: 'bordure de contrôle',
    },
    { fg: '--color-focus', bg: '--color-bg', min: 3, role: 'indicateur de focus' },
  ] as const

  for (const theme of ['light', 'dark'] as const) {
    for (const { fg, bg, min, role } of couples) {
      it(`thème ${theme} : ${role} tient ${min}:1`, () => {
        const colors = themes[theme]
        const ratio = contrastRatio(
          parseColor(colors[fg]!)!,
          parseColor(colors[bg]!)!,
        )

        expect(ratio).toBeGreaterThanOrEqual(min)
      })
    }
  }
})
