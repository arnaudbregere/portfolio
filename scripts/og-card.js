/**
 * Compose une image de partage 1200 × 630 et l'écrit dans `public/og/`.
 *
 * Les aperçus de lien veulent une image à eux : les captures de `content/` sont
 * en WebP, que LinkedIn ne restitue pas, et leur rapport n'est pas celui d'une
 * grande carte. Le rendu passe par Chrome sans interface — la page composée est
 * du HTML, elle reprend donc la police et les couleurs du site plutôt qu'une
 * approximation redessinée.
 *
 * Image du site :
 *   node scripts/og-card.js --out arnaud-bregere --title "Arnaud|Brégère" \
 *     --note "Développeur front-end senior — Vue 3, Nuxt et design system"
 *
 * Fiche projet, avec sa capture :
 *   node scripts/og-card.js --out agenda-app-event --figure 02 \
 *     --title "Agenda" --note "Vitest · Playwright · CI à quatre travaux" \
 *     --shot public/visuels/agenda-app-event/vue-mois.webp
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const FONT = 'public/fonts/archivo-variable-latin.woff2'
const CHROME = process.env.CHROME_BIN ?? 'google-chrome'

const readFlag = (name) => {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
}

const out = readFlag('out')
const title = readFlag('title')
const note = readFlag('note') ?? ''
const figure = readFlag('figure') ?? '01'
const shot = readFlag('shot')

if (!out || !title) {
  console.error('Usage : --out <nom-de-fichier> --title <titre> [--note <ligne>] [--shot <image>] [--figure 02]')
  process.exit(1)
}

const base64 = (path, type) => `data:${type};base64,${readFileSync(path).toString('base64')}`

const escape = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** `--title "Arnaud|Brégère"` casse la ligne : un titre long déborde sinon. */
const titleHtml = (text) => text.split('|').map(escape).join('<br>')

/** Deux compositions : le site occupe toute la largeur, une fiche réserve sa capture à droite. */
const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Archivo Variable';
    font-weight: 100 900;
    font-stretch: 62% 125%;
    src: url(${base64(FONT, 'font/woff2')}) format('woff2');
  }
  :root { --bg: #f7f4ef; --fg: #14120f; --muted: #6b655c; --line: #d6cfc4; --ink: #b3122b; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    background: var(--bg);
    color: var(--fg);
    font-family: 'Archivo Variable', sans-serif;
    font-variant-numeric: tabular-nums;
    display: grid;
    grid-template-columns: ${shot ? '1fr 520px' : '1fr'};
    gap: 56px;
    padding: 64px 72px;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .ink { color: var(--ink); }
  .left { display: flex; flex-direction: column; }
  .rule { border: 0; border-top: 1px solid var(--line); margin: 18px 0; }
  h1 {
    font-size: ${shot ? '72px' : '116px'};
    font-weight: 800;
    font-stretch: 112%;
    line-height: 1.02;
    letter-spacing: -0.015em;
    text-transform: uppercase;
  }
  .note { margin-top: auto; font-size: ${shot ? '24px' : '34px'}; font-weight: 600; line-height: 1.3; }
  .byline { margin-top: 14px; }
  .shot {
    align-self: center;
    width: 520px;
    border: 1px solid var(--line);
    background: #fff;
    overflow: hidden;
    line-height: 0;
  }
  .shot img { width: 100%; display: block; }
</style>
</head>
<body>
  <div class="left">
    <span class="label ink">${escape(figure)} — ${shot ? 'Projet' : 'Portfolio'}</span>
    <hr class="rule">
    <h1>${titleHtml(title)}</h1>
    <p class="note">${escape(note)}</p>
    <hr class="rule">
    <span class="label byline">${shot ? 'Arnaud Brégère · ' : ''}arnaud-bregere.fr</span>
  </div>
  ${shot ? `<figure class="shot"><img src="${base64(shot, 'image/webp')}" alt=""></figure>` : ''}
</body>
</html>
`

const page = join(mkdtempSync(join(tmpdir(), 'og-card-')), 'card.html')
writeFileSync(page, html)

execFileSync(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  `--screenshot=public/og/${out}.png`,
  `file://${page}`,
], { stdio: 'inherit' })

console.log(`public/og/${out}.png écrite`)
