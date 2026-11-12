/**
 * Compose les icônes du site depuis le monogramme « ab » et les écrit dans
 * `public/`.
 *
 *   node scripts/favicon.js
 *
 * Quatre fichiers en sortie :
 *
 * | Fichier | Rôle |
 * |---|---|
 * | `favicon.svg` | l'icône, vectorielle, les deux thèmes dans un fichier |
 * | `favicon-32.png` | secours des navigateurs qui ignorent le SVG |
 * | `favicon.ico` | secours du chemin `/favicon.ico`, demandé sans `link` |
 * | `apple-touch-icon.png` | 180 × 180, écran d'accueil iOS |
 *
 * **Les tracés ne sont pas recopiés** : ils sont lus dans
 * `app/components/atoms/Logo.vue`, qui reste la source du dessin. Redessiner
 * le monogramme là-bas et relancer ce script suffit à refaire les icônes.
 *
 * Trois écarts à l'atome, imposés par le fait qu'une icône est un fichier :
 *
 * - **La couleur ne suit plus le thème du site.** Dans `Logo.vue`, le `b`
 *   prend `currentColor` ; un fichier n'a pas de couleur courante. Le SVG
 *   porte donc un `prefers-color-scheme`, qui suit le réglage du **système**
 *   et non la bascule de la page. Un visiteur qui force le thème clair sur un
 *   système sombre verra l'icône sombre. L'onglet appartient au navigateur.
 * - **Les rasters sont posés sur une tuile pleine**, couleur papier. Le `b` en
 *   encre sombre disparaîtrait sur la barre d'onglets sombre de Chrome, et
 *   iOS ne respecte pas la transparence — il poserait un fond noir.
 * - **Le cadrage est refait.** La boîte des tracés fait 51,05 × 36,85, un
 *   rapport large ; une icône est carrée. Le `viewBox` se recentre sur un
 *   carré de 56 autour du centre des tracés.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = process.env.CHROME_BIN ?? 'google-chrome'

/** Couleurs de `app/styles/_tokens.scss`, seules valeurs recopiées ici. */
const BRAND = '#ff5c72' // --color-logo-ink, fixe dans les deux thèmes
const INK_LIGHT = '#14120f' // --color-fg, thème clair
const INK_DARK = '#f2efe9' // --color-fg, thème sombre
const PAPER = '#f7f4ef' // --color-bg, thème clair

/**
 * Le carré du `viewBox`, centré sur la boîte des tracés relevée au navigateur
 * par `getBBox` : x 1,5 à 52,55, y 7,75 à 44,6, donc un centre à
 * (27,025 ; 26,175). Un côté de 56 laisse ~2,5 de marge latérale.
 */
const VIEW_BOX = '-0.975 -1.825 56 56'

/** Les deux tracés de l'atome, dans son ordre : le `b`, puis le `a` dessus. */
const paths = () => {
  const source = readFileSync('app/components/atoms/Logo.vue', 'utf8')
  const found = [...source.matchAll(/class="a-logo__([ab])"\s+d="([^"]+)"/g)]

  if (found.length !== 2) {
    console.error(
      `Logo.vue : ${found.length} tracé(s) trouvé(s) au lieu de 2. Le gabarit a changé — relire la regex avant de régénérer les icônes.`,
    )
    process.exit(1)
  }

  return Object.fromEntries(found.map(([, name, d]) => [name, d]))
}

const { a, b } = paths()

/** L'icône vectorielle : un seul fichier pour les deux thèmes. */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}">
  <title>ab</title>
  <style>
    .b { fill: ${INK_LIGHT} }
    @media (prefers-color-scheme: dark) { .b { fill: ${INK_DARK} } }
  </style>
  <path class="b" d="${b}"/>
  <path fill="${BRAND}" d="${a}"/>
</svg>
`

writeFileSync('public/favicon.svg', svg)
console.log('public/favicon.svg écrite')

/**
 * Les rasters, rendus par Chrome sans interface comme les images de partage.
 * `scale` resserre le monogramme dans la tuile : l'icône d'onglet la remplit,
 * celle d'iOS garde une marge, les coins y étant arrondis par le système.
 */
const raster = (file, size, scale) => {
  const html = `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; width: ${size}px; height: ${size}px; }
  body { background: ${PAPER}; display: grid; place-items: center; }
  svg { width: ${Math.round(size * scale)}px; }
</style>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}">
  <path fill="${INK_LIGHT}" d="${b}"/>
  <path fill="${BRAND}" d="${a}"/>
</svg>
`
  const page = join(mkdtempSync(join(tmpdir(), 'favicon-')), 'icon.html')
  writeFileSync(page, html)

  execFileSync(CHROME, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${size},${size}`,
    `--screenshot=public/${file}`,
    `file://${page}`,
  ], { stdio: 'inherit' })

  console.log(`public/${file} écrite`)
}

raster('favicon-32.png', 32, 1)
raster('apple-touch-icon.png', 180, 0.72)

/**
 * Le `.ico`, pour le seul cas où un client demande `/favicon.ico` sans lire le
 * document — sinon Nitro y répond par son GIF transparent de 1 × 1.
 *
 * Un conteneur ICO accepte une charge PNG telle quelle depuis Vista : six
 * octets d'en-tête, seize de répertoire, puis le fichier. Rien à réencoder,
 * donc rien à installer.
 */
const png = readFileSync('public/favicon-32.png')
const header = Buffer.alloc(22)

header.writeUInt16LE(0, 0) // réservé
header.writeUInt16LE(1, 2) // type : 1 = icône
header.writeUInt16LE(1, 4) // une seule image
header.writeUInt8(32, 6) // largeur
header.writeUInt8(32, 7) // hauteur
header.writeUInt8(0, 8) // palette : aucune
header.writeUInt8(0, 9) // réservé
header.writeUInt16LE(1, 10) // plans
header.writeUInt16LE(32, 12) // bits par pixel
header.writeUInt32LE(png.length, 14) // taille de la charge
header.writeUInt32LE(22, 18) // décalage de la charge

writeFileSync('public/favicon.ico', Buffer.concat([header, png]))
console.log('public/favicon.ico écrite')
