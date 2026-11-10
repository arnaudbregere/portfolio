import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { forceTheme, settle, sitePages, themes } from './support/site'

/**
 * Audit `@axe-core/playwright` sur chaque page, dans les deux thèmes.
 *
 * Seules les violations `critical` et `serious` font échouer : ce sont les deux
 * degrés que `.claude/rules/e2e.md` refuse. Les degrés `moderate` et `minor`
 * sont joints au rapport sans verdict.
 *
 * Les règles retenues sont celles de WCAG 2.1 niveau AA, référence de
 * `PRODUCT.md` (RGAA 4.1 en transpose les critères).
 *
 * **L'audit tourne en `prefers-reduced-motion: reduce`.** La figure d'entrée de
 * `_motion.scss` fait monter l'opacité des blocs : auditer pendant la montée
 * fait mesurer à axe une couleur interpolée, et non celle du dessin. Mesuré le
 * 10/11/2026 : `.o-project__role` sortait à 1,72:1 en pleine animation contre
 * un rapport conforme à l'arrêt, et l'audit rendait treize échecs dont onze
 * n'existaient pas. Le mouvement n'est pas pour autant hors contrôle : il est
 * couvert par `tests/unit/reveal.spec.ts` et par la règle
 * `prefers-reduced-motion` de `_reset.scss`.
 */
test.use({ reducedMotion: 'reduce' })

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/** Degrés refusés. `null` est possible : axe n'impose pas l'étiquette. */
const BLOCKING = new Set(['critical', 'serious'])

/**
 * Le seul écart toléré, et il est assumé par écrit.
 *
 * Le prénom « arnaud » du `h1` d'accueil est à 2,72:1 sur le papier clair quand
 * WCAG 1.4.3 demande 3:1 à cette taille. Arnaud l'a tranché en connaissance du
 * chiffre ; `DESIGN.md` § 5 consigne l'arbitrage et ce que `--color-ink`
 * donnerait à la place.
 *
 * La tolérance est nominative, pas globale : elle ne vise qu'un sélecteur, sur
 * une page, dans un thème. Toute autre violation de contraste échoue, et si
 * celle-ci disparaît, le test le signale au lieu de se taire — une exception
 * qui survit à ce qu'elle excusait finit par couvrir autre chose.
 */
const KNOWN_EXCEPTION = {
  path: '/',
  theme: 'light',
  rule: 'color-contrast',
  target: '.home__given',
} as const

test.describe('Audit d’accessibilité', () => {
  for (const theme of themes) {
    for (const { path, name } of sitePages) {
      test(`${name} — thème ${theme === 'dark' ? 'sombre' : 'clair'}`, async ({ page }, info) => {
        await forceTheme(page, theme)
        await page.goto(path)

        // Le thème doit être celui demandé avant la mesure : auditer la page
        // claire en croyant auditer la sombre ne mesurerait rien.
        await expect(page.locator('html')).toHaveClass(new RegExp(theme))
        await settle(page)

        const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze()

        // Le rapport complet est joint : un échec doit se lire sans relancer
        // l'audit.
        await info.attach(`axe-${theme}${path.replace(/\//g, '_')}.json`, {
          body: JSON.stringify(results.violations, null, 2),
          contentType: 'application/json',
        })

        const isKnown = (rule: string, target: string) =>
          path === KNOWN_EXCEPTION.path
          && theme === KNOWN_EXCEPTION.theme
          && rule === KNOWN_EXCEPTION.rule
          && target === KNOWN_EXCEPTION.target

        const blocking = results.violations
          .filter((violation) => BLOCKING.has(violation.impact ?? ''))
          .flatMap((violation) =>
            violation.nodes.map((node) => ({
              rule: violation.id,
              impact: violation.impact,
              help: violation.help,
              target: node.target.join(' '),
              detail: (node.failureSummary ?? '').replace(/\s+/g, ' ').trim(),
            })),
          )

        const unexpected = blocking.filter((found) => !isKnown(found.rule, found.target))

        const summary = unexpected
          .map(
            (found) =>
              `[${found.impact}] ${found.rule} — ${found.help}\n`
              + `    ${found.target}\n`
              + `    ${found.detail}`,
          )
          .join('\n')

        expect(summary, `${path} (${theme})\n${summary}`).toBe('')

        // L'écart assumé doit être encore là où il est consigné. S'il a été
        // corrigé, la tolérance n'a plus d'objet et doit quitter cette spec,
        // `DESIGN.md` § 5 avec elle.
        if (path === KNOWN_EXCEPTION.path && theme === KNOWN_EXCEPTION.theme) {
          const known = blocking.find((found) =>
            isKnown(found.rule, found.target),
          )

          expect(
            known,
            'Le contraste de `.home__given` est devenu conforme : retirer la '
            + 'tolérance de cette spec et reprendre DESIGN.md § 5.',
          ).toBeDefined()
        }
      })
    }
  }
})
