import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Rien d'écrit ici n'est spéculatif, et ce test le tient.
 *
 * `.claude/rules/design-system.md` l'exige depuis le 26/10/2026, après la
 * suppression de six atomes écrits « pour cocher une case de phase » : un
 * composant naît de la page qui en a besoin, et cette page se nomme **dans le
 * même commit**. La règle était tenue par la relecture seule — un composant,
 * un export ou une fonction oubliés en chemin ne faisaient rougir aucune
 * suite, et Vitest ne voit pas ce que personne n'importe.
 *
 * Ce que ce test vérifie est volontairement grossier : un nom cité **nulle
 * part ailleurs** que dans le fichier qui le déclare. Il ne dit pas qu'un
 * export est utile, seulement que quelqu'un le nomme. Une citation suffit donc
 * à le faire passer, y compris depuis un test — c'est le prix d'un garde-fou
 * qui ne doit jamais rougir à tort et bloquer une mise en production pour une
 * fausse alerte.
 */

const root = resolve(__dirname, '../..')

/** Les dossiers où un nom peut être cité : tout ce que ce dépôt écrit. */
const sources = ['app/', 'content/', 'server/', 'scripts/', 'tests/', 'e2e/tests/']

const extensions = ['.vue', '.ts', '.js', '.mjs', '.scss']

/**
 * Les fichiers **suivis par git**, et non ceux présents sur le disque : un
 * brouillon non versionné citerait un composant que personne d'autre n'emploie,
 * et la suite passerait au vert en local pour tomber dans la CI.
 */
const suivis = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)

const fichiersSources = () =>
  suivis.filter(
    (chemin) =>
      (chemin === 'nuxt.config.ts' ||
        sources.some((dossier) => chemin.startsWith(dossier))) &&
      extensions.some((suffixe) => chemin.endsWith(suffixe)),
  )

const lus = new Map<string, string>()

const contenu = (chemin: string) => {
  if (!lus.has(chemin)) lus.set(chemin, readFileSync(join(root, chemin), 'utf8'))

  return lus.get(chemin)!
}

/** Les fichiers, autres que le sien, où un nom est cité. */
const citePar = (nom: string, declarePar: string) =>
  fichiersSources().filter(
    (fichier) => fichier !== declarePar && new RegExp(`\\b${nom}\\b`).test(contenu(fichier)),
  )

const composants = () =>
  suivis.filter((chemin) => chemin.startsWith('app/components/') && chemin.endsWith('.vue'))

/** Les `export const` d'un module, dans l'ordre du fichier. */
const exports = (fichier: string) =>
  [...contenu(fichier).matchAll(/export const (\w+)/g)].map(([, nom]) => nom!)

const modules = () =>
  suivis.filter(
    (chemin) =>
      chemin.endsWith('.ts') &&
      ['app/utils/', 'app/composables/', 'content/', 'server/utils/'].some((dossier) =>
        chemin.startsWith(dossier),
      ),
  )

describe('aucun fichier mort, aucun export mort', () => {
  it('cite chaque composant depuis une page, un organisme ou un test', () => {
    const orphelins = composants().filter((fichier) => {
      const nom = fichier.split('/').pop()!.replace('.vue', '')

      return citePar(nom, fichier).length === 0
    })

    expect(orphelins).toEqual([])
  })

  it('consomme chaque export des utilitaires, composables et contenus', () => {
    const orphelins: string[] = []

    for (const fichier of modules()) {
      for (const nom of exports(fichier)) {
        if (citePar(nom, fichier).length === 0) orphelins.push(`${fichier} :: ${nom}`)
      }
    }

    expect(orphelins).toEqual([])
  })

  /**
   * Un token défini et jamais consommé est une décision de design qui ne
   * s'applique à rien : `DESIGN.md` la documenterait, et la page ne la
   * porterait pas.
   */
  it('consomme chaque token de `_tokens.scss`', () => {
    const source = contenu('app/styles/_tokens.scss')
    const tokens = [...source.matchAll(/^\s{2}(--[\w-]+):/gm)].map(([, nom]) => nom!)

    expect(tokens.length).toBeGreaterThan(30)

    const orphelins = tokens.filter(
      (token) =>
        !fichiersSources().some((fichier) =>
          contenu(fichier).includes(`var(${token})`),
        ),
    )

    expect(orphelins).toEqual([])
  })
})
