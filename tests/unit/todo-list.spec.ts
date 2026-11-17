import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TodoList from '~/components/organisms/TodoList.vue'
import { createBrowserStore } from '~/adapters/browser-store'
import { TITLE_MAX } from '~~/shared/todo/validation'

/**
 * Le rendu de la démo. La logique est éprouvée ailleurs — `useTodos`, le port,
 * le domaine —, ce fichier ne regarde que ce qu'un visiteur voit et ce qu'un
 * lecteur d'écran entend.
 *
 * Le DOM est interrogé **par rôle et par nom accessible**, jamais par classe :
 * `.claude/rules/frontend.md`. Un test qui ne trouve pas un élément par son
 * rôle révèle presque toujours un défaut d'accessibilité.
 */

const storage = (): Storage => {
  const map = new Map<string, string>()

  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => void map.delete(key),
    setItem: (key: string, value: string) => void map.set(key, value),
  }
}

const monter = async () => {
  const page = await mountSuspended(TodoList, {
    props: { store: createBrowserStore(storage()) },
  })

  await nextTick()
  await nextTick()

  return page
}

describe('TodoList', () => {
  it('rend les trois tâches d’exemple, dont une faite', async () => {
    const page = await monter()
    const cases = page.findAll('input[type="checkbox"]')

    expect(cases).toHaveLength(3)
    expect(cases.filter((entree) => entree.element.checked)).toHaveLength(1)
    expect(page.text()).toContain('Relire le cadrage du projet')
  })

  /**
   * La case est un **vrai** `input`, et son libellé est la tâche : un `div`
   * cliquable coûterait l'état, le clavier et l'annonce, pour un dessin que le
   * CSS donne de toute façon.
   */
  it('coche par un vrai champ, nommé par la tâche', async () => {
    const page = await monter()
    const premiere = page.find('input[type="checkbox"]')
    const libelle = premiere.element.closest('label')

    expect(premiere.element.type).toBe('checkbox')
    expect(libelle?.textContent?.trim()).toBe('Relire le cadrage du projet')
  })

  it('nomme chaque bouton de suppression par la tâche qu’il supprime', async () => {
    const page = await monter()
    const boutons = page.findAll('.o-todo__remove')

    expect(boutons[0]!.text()).toContain('Supprimer « Relire le cadrage du projet »')
  })

  /**
   * L'icône ne porte jamais le sens : elle est `aria-hidden`, et le nom du
   * bouton vient du texte masqué visuellement. Même règle que partout
   * ailleurs dans ce dépôt.
   */
  it('cache la croix à l’arbre d’accessibilité', async () => {
    const page = await monter()
    const croix = page.find('.o-todo__remove [aria-hidden="true"]')

    expect(croix.exists()).toBe(true)
    expect(croix.text()).toBe('✕')
  })

  it('groupe les filtres dans un `fieldset` nommé, en champs radio réels', async () => {
    const page = await monter()
    const groupe = page.find('fieldset')
    const radios = groupe.findAll('input[type="radio"]')

    expect(groupe.find('legend').text()).toBe('Filtrer les tâches')
    expect(radios).toHaveLength(3)
    expect(radios.filter((entree) => entree.element.checked)).toHaveLength(1)
    expect(radios.map((entree) => entree.element.name)).toEqual([
      'todo-filter',
      'todo-filter',
      'todo-filter',
    ])
  })

  it('porte une seule région vivante, et elle est masquée visuellement', async () => {
    const page = await monter()
    const regions = page.findAll('[aria-live]')

    expect(regions).toHaveLength(1)
    expect(regions[0]!.attributes('aria-live')).toBe('polite')
    expect(regions[0]!.classes()).toContain('visually-hidden')
  })

  it('soumet par un formulaire, pour que la touche Entrée valide', async () => {
    const page = await monter()

    expect(page.find('form').exists()).toBe(true)
    expect(page.find('button[type="submit"]').exists()).toBe(true)
  })

  it('lie le champ à son libellé, et borne la saisie', async () => {
    const page = await monter()
    const champ = page.find('#todo-title')

    expect(page.find('label[for="todo-title"]').text()).toBe('Ajouter une tâche')
    expect(Number(champ.attributes('maxlength'))).toBeGreaterThan(TITLE_MAX)
  })

  it('rattache le refus au champ, et le marque invalide', async () => {
    const page = await monter()

    await page.find('#todo-title').setValue('   ')
    await page.find('form').trigger('submit')
    await nextTick()

    const champ = page.find('#todo-title')

    expect(page.find('#todo-error').text()).toBe('Le titre est vide.')
    expect(champ.attributes('aria-describedby')).toBe('todo-error')
    expect(champ.attributes('aria-invalid')).toBe('true')
  })

  /**
   * Le cas limite de la spécification : « rien pour ce filtre » n'est pas
   * « rien du tout ». Un visiteur qui a filtré doit savoir laquelle des deux
   * absences il regarde — sans quoi il croit avoir tout perdu.
   */
  it('distingue les deux absences', async () => {
    const page = await monter()
    const faites = page.findAll('input[type="radio"]')[2]!

    await faites.setValue(true)
    await nextTick()

    expect(page.text()).toContain('Mettre à jour le CV')

    const toutes = page.findAll('input[type="radio"]')[0]!

    await toutes.setValue(true)
    await nextTick()

    for (const bouton of page.findAll('.o-todo__remove')) {
      await bouton.trigger('click')
      await nextTick()
    }

    expect(page.text()).toContain('Plus rien à faire')
    expect(page.text()).not.toContain('ne correspond à ce filtre')
  })

  /**
   * **Le balisage ne dépend pas du thème.** Même invariant que
   * `tests/unit/site-footer.spec.ts` : un rendu qui en dépendrait divergerait
   * à l'hydratation, et la suite de bout en bout ne le verrait pas — la build
   * de production retire les avertissements de Vue
   * (`.claude/rules/e2e.md`).
   */
  it('rend le même balisage dans les deux thèmes', async () => {
    const page = await monter()
    const colorMode = useColorMode()
    const avant = page.html()

    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    await nextTick()

    expect(page.html(), 'le balisage ne doit pas dépendre du thème').toBe(avant)
  })
})
