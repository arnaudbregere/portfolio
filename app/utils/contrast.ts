/**
 * Calcul de contraste WCAG 2.1. Fonctions pures, sans dépendance au DOM ni à
 * Vue : la planche `/_ds` s'en sert pour mesurer les tokens réellement appliqués
 * plutôt que de republier des ratios recopiés à la main.
 */

/** Composantes sRGB, de 0 à 255. */
export type Rgb = readonly [number, number, number]

const HEX_SHORT = /^#([\da-f])([\da-f])([\da-f])$/i
const HEX_FULL = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i
const FUNCTIONAL = /^rgba?\(([^)]+)\)$/i

/**
 * Lit une couleur CSS. Accepte la notation hexadécimale des tokens et la
 * notation fonctionnelle que renvoie `getComputedStyle`. Rend `null` pour tout
 * le reste — un token qui n'est pas une couleur n'est pas une erreur, il n'est
 * simplement pas mesurable.
 */
export const parseColor = (value: string): Rgb | null => {
  const input = value.trim()

  const full = HEX_FULL.exec(input)
  if (full) {
    return [
      Number.parseInt(full[1]!, 16),
      Number.parseInt(full[2]!, 16),
      Number.parseInt(full[3]!, 16),
    ]
  }

  const short = HEX_SHORT.exec(input)
  if (short) {
    return [
      Number.parseInt(short[1]! + short[1]!, 16),
      Number.parseInt(short[2]! + short[2]!, 16),
      Number.parseInt(short[3]! + short[3]!, 16),
    ]
  }

  const functional = FUNCTIONAL.exec(input)
  if (functional) {
    const parts = functional[1]!
      .split(/[\s,/]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(Number)

    if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
      return [parts[0]!, parts[1]!, parts[2]!]
    }
  }

  return null
}

/** Linéarisation d'une composante, selon la formule WCAG 2.1. */
const linearise = (component: number): number => {
  const ratio = component / 255

  return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4
}

export const relativeLuminance = ([red, green, blue]: Rgb): number =>
  0.2126 * linearise(red) + 0.7152 * linearise(green) + 0.0722 * linearise(blue)

/** Rapport de contraste entre deux couleurs. Toujours supérieur ou égal à 1. */
export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (first, second) => second - first,
  )

  return (lighter! + 0.05) / (darker! + 0.05)
}

/** Mise en forme française : virgule décimale, deux décimales, suffixe « :1 ». */
export const formatRatio = (ratio: number): string =>
  `${ratio.toFixed(2).replace('.', ',')}:1`
