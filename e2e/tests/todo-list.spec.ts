import { expect, test } from '@playwright/test'
import { settle } from './support/site'

/**
 * La démo de liste de tâches, **au clavier seul**.
 *
 * C'est le critère SC-002 de la spécification : les six gestes — ajouter,
 * cocher, filtrer, supprimer, annuler, réinitialiser — s'enchaînent sans
 * souris, du début à la fin. Aucune assertion de ce fichier n'utilise de
 * clic : ce qui est vérifié, c'est le chemin au clavier.
 *
 * Les sélecteurs passent par le rôle et le nom accessible, jamais par une
 * classe — `.claude/rules/e2e.md`.
 */

const demo = '/projets/todo-list'

/**
 * Les étiquettes de priorité, et elles seules. `getByText('Élevée')`
 * attraperait aussi l'`<option>` du `<select>`, toujours dans le document —
 * mesuré le 17/11/2026, trois éléments là où deux tâches portent l'encre.
 */
const etiquettes = (page: import('@playwright/test').Page, valeur: string) =>
  page.getByRole('list', { name: 'Priorité' }).filter({ hasText: valeur })

/** La démo n'est pilotable qu'après le montage : le port est lu dans `onMounted`. */
const pret = async (page: import('@playwright/test').Page) => {
  await expect(page.getByRole('checkbox', { name: 'Relire le cadrage du projet' })).toBeVisible()
}

test.describe('Démo de liste de tâches', () => {
  test('sert les trois tâches d’exemple, dont une faite', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    await expect(page.getByRole('checkbox')).toHaveCount(3)
    await expect(page.getByRole('checkbox', { name: 'Mettre à jour le CV' })).toBeChecked()
    await expect(page.getByText('3 tâches, 2 à faire')).toBeVisible()
  })

  test('ajoute une tâche au clavier, par la touche Entrée', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    await page.getByLabel('Ajouter une tâche').fill('Acheter du pain')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('checkbox', { name: 'Acheter du pain' })).toBeVisible()
    await expect(page.getByText('4 tâches, 3 à faire')).toBeVisible()

    // Le champ garde la main : on ajoute souvent plusieurs tâches de suite.
    await expect(page.getByLabel('Ajouter une tâche')).toBeFocused()
    await expect(page.getByLabel('Ajouter une tâche')).toHaveValue('')
  })

  test('refuse un titre vide sans rien ajouter', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    await page.getByLabel('Ajouter une tâche').fill('   ')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Le titre est vide.')).toBeVisible()
    await expect(page.getByRole('checkbox')).toHaveCount(3)
    await expect(page.getByLabel('Ajouter une tâche')).toHaveAttribute('aria-invalid', 'true')
  })

  test('coche une tâche par la barre d’espace', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    const tache = page.getByRole('checkbox', { name: 'Préparer l’entretien' })

    await tache.focus()
    await page.keyboard.press('Space')

    await expect(tache).toBeChecked()
    await expect(page.getByText('3 tâches, 1 à faire')).toBeVisible()
  })

  test('filtre au clavier, et distingue les deux absences', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    // Au clavier, et non par un clic : la commande est masquée visuellement —
    // c'est son libellé qui est visible et qui porte la cible. `check()`
    // viserait le champ de 1 px posé en haut de page.
    await page.getByRole('radio', { name: 'Faites' }).focus()
    await page.keyboard.press('Space')

    await expect(page.getByRole('checkbox')).toHaveCount(1)
    await expect(page.getByRole('checkbox', { name: 'Mettre à jour le CV' })).toBeVisible()

    // Décocher la seule tâche faite vide la vue, sans vider la liste.
    //
    // Par le clavier et non par `uncheck()` : l'en-tête du site est collant,
    // et la ligne ramenée dans la fenêtre par Playwright peut tomber dessous.
    // Le clic est alors intercepté, et l'action attend jusqu'au délai — vu le
    // 17/11/2026. `focus()` puis `Space` ne passe par aucun test de
    // survol, et c'est le chemin que cette spec vérifie de toute façon.
    await page.getByRole('checkbox', { name: 'Mettre à jour le CV' }).focus()
    await page.keyboard.press('Space')

    await expect(page.getByText('Aucune tâche ne correspond à ce filtre.')).toBeVisible()
    await expect(page.getByText('Plus rien à faire')).toHaveCount(0)
  })

  /**
   * Le parcours qui compte : après la suppression, le focus doit tomber sur
   * « Annuler ». La ligne qui portait le focus vient de disparaître, et sans
   * cette reprise il retombe sur le document — FR-024.
   */
  test('supprime, rend le focus à « Annuler », et remet la tâche à sa place', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    const avant = await page.getByRole('checkbox').evaluateAll((cases) =>
      cases.map((entree) => (entree as HTMLInputElement).closest('label')?.textContent?.trim()),
    )

    await page.getByRole('button', { name: 'Supprimer « Préparer l’entretien »' }).press('Enter')

    const annuler = page.getByRole('button', { name: 'Annuler' })

    await expect(annuler).toBeFocused()
    await expect(page.getByRole('checkbox')).toHaveCount(2)

    await page.keyboard.press('Enter')

    const apres = await page.getByRole('checkbox').evaluateAll((cases) =>
      cases.map((entree) => (entree as HTMLInputElement).closest('label')?.textContent?.trim()),
    )

    expect(apres, 'la tâche revient à sa place, elle n’est pas recréée').toEqual(avant)
    await expect(page.getByLabel('Ajouter une tâche')).toBeFocused()
  })

  /** Pas de minuteur : le rattrapage tombe à l'action suivante, pas après un délai. */
  test('chasse l’annulation à l’action suivante', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    await page.getByRole('button', { name: 'Supprimer « Préparer l’entretien »' }).press('Enter')

    await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible()

    await page.getByLabel('Ajouter une tâche').fill('Acheter du pain')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('button', { name: 'Annuler' })).toHaveCount(0)
  })

  test('retient la liste après un rechargement, et la réinitialisation la rend', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    await page.getByLabel('Ajouter une tâche').fill('Acheter du pain')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('checkbox', { name: 'Acheter du pain' })).toBeVisible()

    await page.reload()
    await pret(page)

    await expect(page.getByRole('checkbox', { name: 'Acheter du pain' })).toBeVisible()

    await page.getByRole('button', { name: 'Réinitialiser' }).press('Enter')

    await expect(page.getByRole('checkbox')).toHaveCount(3)
    await expect(page.getByRole('checkbox', { name: 'Acheter du pain' })).toHaveCount(0)
  })

  /**
   * Le parcours d'édition, au clavier seul (FR-016 à FR-019). Ce qui compte
   * autant que l'enregistrement : le focus revient sur le bouton qui a ouvert
   * le mode, et non sur `<body>` — la ligne a été démontée entre-temps.
   */
  test('modifie titre et priorité, puis rend le focus au bouton d’édition', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    const ouvrir = page.getByRole('button', { name: 'Modifier « Préparer l’entretien »' })

    await ouvrir.press('Enter')

    const titre = page.getByLabel('Titre')

    await expect(titre).toBeFocused()

    await titre.fill('Préparer la soutenance')

    // La priorité se choisit au clavier : `ArrowDown` descend d'un cran dans
    // la liste fermée, de « Moyenne » à « Élevée ». Aucun clic, donc aucun
    // test de survol sous l'en-tête collant.
    const priorite = page.getByRole('combobox', { name: 'Priorité' }).last()

    await priorite.focus()
    await page.keyboard.press('ArrowDown')

    await expect(priorite).toHaveValue('high')

    // `Entrée` enregistre depuis le champ de titre : c'est la soumission
    // implicite du formulaire, et non la touche du `<select>`, qui ouvre sa
    // liste sur certaines plateformes.
    await titre.focus()
    await page.keyboard.press('Enter')

    await expect(page.getByRole('checkbox', { name: 'Préparer la soutenance' })).toBeVisible()
    await expect(etiquettes(page, 'Élevée')).toHaveCount(2)
    await expect(
      page.getByRole('button', { name: 'Modifier « Préparer la soutenance »' }),
    ).toBeFocused()
  })

  test('annule une édition par Échap, sans rien enregistrer', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    await page.getByRole('button', { name: 'Modifier « Préparer l’entretien »' }).press('Enter')
    await page.getByLabel('Titre').fill('Autre chose')
    await page.keyboard.press('Escape')

    await expect(page.getByRole('checkbox', { name: 'Préparer l’entretien' })).toBeVisible()
    await expect(page.getByText('Autre chose')).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Modifier « Préparer l’entretien »' }),
    ).toBeFocused()
  })

  /** La priorité se choisit à la création : pas de détour par l'édition. */
  test('crée une tâche avec sa priorité', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    await page.getByLabel('Ajouter une tâche').fill('Acheter du pain')
    await page.getByRole('combobox', { name: 'Priorité' }).first().focus()
    await page.keyboard.press('ArrowDown')
    await page.getByLabel('Ajouter une tâche').focus()
    await page.keyboard.press('Enter')

    await expect(page.getByRole('checkbox', { name: 'Acheter du pain' })).toBeVisible()
    await expect(etiquettes(page, 'Élevée')).toHaveCount(2)
  })

  /**
   * Deux boutons du même nom dans une page sont deux boutons qu'un lecteur
   * d'écran ne distingue pas : le rattrapage de suppression porte « Annuler ».
   */
  test('nomme « Annuler la modification » le bouton du mode d’édition', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    await page.getByRole('button', { name: 'Modifier « Préparer l’entretien »' }).press('Enter')

    await expect(
      page.getByRole('button', { name: 'Annuler la modification', exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Annuler', exact: true })).toHaveCount(0)
  })

  /**
   * Le sélecteur de source, service éteint.
   *
   * La suite tourne contre la build de production servie par `webServer` :
   * rien n'écoute sur l'origine du service, et c'est exactement le cas que ce
   * test veut. Jamais de repli silencieux — l'option est refusée, et la raison
   * se lit (FR-016).
   */
  test('désactive l’option « API » quand le service ne répond pas, motif à l’appui', async ({ page }) => {
    await page.goto(demo)
    await pret(page)

    const api = page.getByRole('radio', { name: 'API' })
    const navigateur = page.getByRole('radio', { name: 'Navigateur' })

    await expect(api).toBeDisabled()
    await expect(navigateur).toBeChecked()
    await expect(page.getByText('Le service ne répond pas')).toBeVisible()

    // La démo reste entière : une source indisponible ne coupe rien.
    await expect(page.getByRole('checkbox')).toHaveCount(3)
  })

  /**
   * La fiche doit rester lisible sans exécution de JavaScript (FR-027) : le
   * texte du projet est prérendu, et seule la démo attend le montage.
   */
  test('sert la fiche prérendue, démo montée ensuite', async ({ page }) => {
    await page.goto(demo)
    await settle(page)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Todo List')
    await expect(page.getByRole('heading', { name: 'Solution' })).toBeVisible()
  })
})
