import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, posix, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Les fichiers de contexte se citent les uns les autres, et c'est leur
 * principe : `CLAUDE.md` pose que la source est unique et qu'on pointe vers
 * elle au lieu de la recopier. Un chemin qui ne mène plus nulle part vide donc
 * la règle sans rien casser de visible — aucun des cinq jobs de la CI ne lit
 * un lien Markdown.
 *
 * Trois formes de renvoi sont vérifiées, de la plus mécanique à la plus
 * fragile :
 *
 * 1. les imports `@chemin` de `CLAUDE.md`, que le harnais résout et colle dans
 *    le contexte à chaque session — un chemin faux y perd une règle entière ;
 * 2. les liens Markdown relatifs, `](./2026-11-12_16-34-07.md)` ;
 * 3. les chemins de dépôt cités entre accents graves, `` `app/styles/_tokens.scss` ``,
 *    de loin les plus nombreux et les seuls que personne ne clique.
 *
 * Ce que ce test **ne** peut pas tenir : un renvoi en prose — « `DESIGN.md`
 * § 5 » — reste juste tant que le fichier existe, même si la section a changé
 * de numéro. Les chemins deviennent opposables ; les sections ne le sont pas.
 */

const root = resolve(__dirname, '../..')

/**
 * Les documents vivants du dépôt : ceux qu'un agent lit pour décider, et dont
 * un renvoi mort coûte une règle.
 *
 * Liste **close**, et le test qui suit la tient complète : un fichier de
 * contexte ajouté sans rejoindre cette liste fait rougir la suite.
 */
const documentsVivants = [
  'AGENTS.md',
  'CLAUDE.md',
  'DESIGN.md',
  'PRODUCT.md',
  'README.md',
  '.claude/rules/backend.md',
  '.claude/rules/content.md',
  '.claude/rules/design-system.md',
  '.claude/rules/e2e.md',
  '.claude/rules/frontend.md',
  '.claude/agents/a11y-seo-auditor.md',
  '.claude/agents/reviewer.md',
  '.claude/agents/tester.md',
  '.claude/skills/deploy/SKILL.md',
  '.claude/skills/new-project/SKILL.md',
  '.claude/skills/rapport-session/SKILL.md',
  '.impeccable/surfaces/app-pages-ds-vue.md',
  'docs/sessions/README.md',
  'e2e/README.md',
] as const

/**
 * Deux familles sortent de la vérification, et pour deux raisons opposées.
 *
 * **L'outillage tiers** — `impeccable`, `speckit-*`, `.specify/` — n'est pas
 * écrit ici. Ses renvois pointent vers ses propres fichiers de travail, créés
 * à l'exécution : les vérifier ferait rougir la suite sur du code que ce dépôt
 * ne maintient pas.
 *
 * **Les rapports de session** sont des instantanés, « jamais retouchés après »
 * (`docs/sessions/README.md`). Le rapport du 26/10/2026 cite
 * `utils/cv_content.ts`, qui n'existe plus — et c'est précisément ce qu'il
 * devait dire. Un instantané juste est un instantané daté.
 */
const horsPerimetre = [
  '.claude/skills/impeccable/',
  '.claude/skills/speckit-',
  '.claude/agents/impeccable-',
  '.specify/',
]

/**
 * Ce que le build produit n'est pas un fichier du dépôt. `e2e/README.md` cite
 * `.output/server/index.mjs` pour dire comment la suite sert l'application :
 * le chemin est juste, et il n'existe qu'après `npm run build`.
 *
 * La distinction n'est pas théorique. La première version de ce test lisait le
 * disque, et elle est passée au vert en local — où `.output/` traînait d'un
 * build précédent — pour tomber dans la CI, qui part d'un dépôt propre. Un
 * test qui dépend de ce qui traîne ne vérifie pas ce qu'il annonce.
 */
const produitsParLeBuild = ['.output/', '.nuxt/', 'node_modules/', 'dist/', 'playwright-report/']

/** Les rapports horodatés ; leur README, lui, est un document vivant. */
const estInstantane = (chemin: string) =>
  /^docs\/sessions\/\d{4}-\d{2}-\d{2}_/.test(chemin)

/**
 * Chemins cités **parce qu'ils n'existent pas**. Liste close : chaque entrée
 * nomme le fichier qui l'énonce, pour qu'une exception orpheline se voie.
 */
const absencesVoulues: Record<string, string> = {
  // « `server/plugins/` n'existe pas, et c'est une décision. »
  'server/plugins/': '.claude/rules/backend.md',
  // Collision avec la route `/projets` : les visuels vivent dans `public/visuels/`.
  'public/projets/': '.claude/skills/new-project/SKILL.md',
}

/**
 * Le document sans ses blocs de code.
 *
 * Un bloc de code est un **exemple**, pas un renvoi : le gabarit de
 * `.claude/skills/rapport-session/SKILL.md` y montre un lien
 * `./AAAA-MM-JJ_HH-MM-SS.md`, qui n'a jamais désigné un fichier et ne doit pas
 * en désigner un. Les commandes des check-lists sont dans le même cas.
 */
const lire = (chemin: string) =>
  readFileSync(join(root, chemin), 'utf8').replace(/^```[\s\S]*?^```/gm, '')

/**
 * Les fichiers **suivis par git**, et non ceux présents sur le disque.
 *
 * Un fichier non versionné n'existe pas pour les autres : un renvoi vers lui
 * mène quelque part sur une machine et nulle part ailleurs. C'est ce qui a
 * fait diverger ce test entre une machine de développement et la CI.
 */
const suivis = new Set(
  execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean),
)

/** Les dossiers suivis se déduisent des fichiers : git n'en suit aucun. */
const dossiersSuivis = new Set(
  [...suivis].flatMap((fichier) => {
    const segments = fichier.split('/')

    return segments.slice(0, -1).map((_, index) => segments.slice(0, index + 1).join('/'))
  }),
)

const existe = (cible: string) => {
  const chemin = posix.normalize(cible).replace(/\/$/, '')

  return suivis.has(chemin) || dossiersSuivis.has(chemin)
}

/** Tous les `.md` suivis, outillage tiers et instantanés exclus. */
const tousLesDocuments = () =>
  [...suivis].filter(
    (chemin) =>
      chemin.endsWith('.md') &&
      !horsPerimetre.some((prefixe) => chemin.startsWith(prefixe)) &&
      !estInstantane(chemin),
  )

describe('les documents de contexte se citent sans renvoi mort', () => {
  /**
   * Sans cette assertion, la liste close ci-dessus se viderait d'elle-même :
   * une règle ajoutée dans `.claude/rules/` ne serait jamais vérifiée, et la
   * suite resterait verte.
   */
  it('vérifie tous les documents vivants du dépôt, et pas une poignée', () => {
    expect([...tousLesDocuments()].sort()).toEqual([...documentsVivants].sort())
  })

  it('résout chaque import `@chemin` de `CLAUDE.md`', () => {
    const imports = [...lire('CLAUDE.md').matchAll(/(?:^|\s)@([\w./-]+\.md)/gm)].map(
      ([, cible]) => cible!,
    )

    // Les cinq règles de domaine sont importées : une de moins, et un domaine
    // entier sort du contexte sans que rien ne le dise.
    expect(imports.length).toBeGreaterThanOrEqual(5)

    for (const cible of imports) expect(existe(cible), cible).toBe(true)
  })

  it.each(documentsVivants)('%s : chaque lien Markdown relatif mène quelque part', (document) => {
    const source = lire(document)

    for (const [, lien] of source.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(https?:|mailto:|tel:|#)/.test(lien!)) continue

      const cible = lien!.split('#')[0]!
      const resolu = cible.startsWith('/')
        ? cible.slice(1)
        : posix.join(posix.dirname(document), cible)

      expect(existe(resolu), `${document} → ${cible}`).toBe(true)
    }
  })

  it.each(documentsVivants)('%s : chaque chemin cité entre accents graves existe', (document) => {
    const source = lire(document)

    for (const [, chemin] of source.matchAll(/`([\w.-]+(?:\/[\w.-]+)+\/?)`/g)) {
      const cite = chemin!

      // Une route HTTP (`/api/health`), un nom de branche (`fix/dette-p3`) ou
      // un identifiant quelconque ne sont pas des chemins de fichier : seuls
      // une extension ou une barre finale les distinguent.
      if (cite.startsWith('/')) continue
      if (!/\.[a-z]{2,5}$/.test(cite) && !cite.endsWith('/')) continue
      if (cite in absencesVoulues) continue
      if (produitsParLeBuild.some((prefixe) => cite.startsWith(prefixe))) continue

      expect(existe(cite), `${document} → ${cite}`).toBe(true)
    }
  })

  /**
   * Une exception qui survit à ce qu'elle excuse est un mensonge tranquille :
   * elle laisserait passer un chemin devenu faux pour une autre raison.
   */
  it('n’autorise une absence que là où un document l’énonce', () => {
    for (const [chemin, document] of Object.entries(absencesVoulues)) {
      expect(existe(chemin), `${chemin} existe désormais : retirer l’exception`).toBe(false)
      expect(lire(document), document).toContain(chemin)
    }
  })
})
