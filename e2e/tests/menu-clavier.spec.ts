import { expect, test } from '@playwright/test'

/**
 * Menu en surcouche, au clavier seul.
 *
 * `PRODUCT.md` exige trois choses d'un composant qui s'ouvre en surcouche :
 * il piège le focus, il se ferme par `Échap`, et il restitue le focus à
 * l'élément déclencheur. Les trois sont vérifiées ici.
 *
 * Le déclencheur n'existe qu'en dessous de `48em` : au-delà, la barre de
 * l'en-tête remplace la surcouche et le bouton est retiré de l'affichage.
 * D'où la fenêtre étroite imposée à toute la spec.
 */
test.use({ viewport: { width: 390, height: 844 } })

test.describe('Menu en surcouche au clavier', () => {
  test('s’ouvre au clavier et annonce son état', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: 'Menu' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.focus()
    await page.keyboard.press('Enter')

    const menu = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  /**
   * Le piège à focus se mesure sur ce qui compte : aucun élément interactif de
   * la page sous la surcouche ne doit jamais recevoir le focus, et le cycle
   * doit revenir dans la surcouche.
   *
   * L'assertion n'est pas « le focus reste dans le `<dialog>` à chaque
   * tabulation ». Mesuré le 10/11/2026 : au bout du dernier élément, Chromium
   * fait passer le focus par `<body>` avant de replier sur le premier. Le
   * document n'est pas un élément interactif de la page, et la surcouche reste
   * modale — les autres éléments sont `inert`. Exiger le contraire ferait
   * échouer un comportement natif correct.
   */
  test('piège le focus dans la surcouche', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(menu).toBeVisible()

    const visited: string[] = []

    // Huit tabulations pour cinq éléments focalisables (« Fermer » et les
    // quatre rubriques) : le cycle se referme au moins une fois.
    for (let step = 0; step < 8; step += 1) {
      await page.keyboard.press('Tab')

      const where = await page.evaluate(() => {
        const active = document.activeElement
        const dialog = document.getElementById('menu-principal')

        if (!active || active === document.body) return 'document'
        if (dialog?.contains(active)) return `surcouche:${active.textContent?.trim()}`

        return `dehors:${active.tagName}.${active.className}`
      })

      visited.push(where)
    }

    expect(
      visited.filter((where) => where.startsWith('dehors:')),
      `le focus est sorti de la surcouche : ${visited.join(' → ')}`,
    ).toEqual([])

    // Le cycle revient bien dans la surcouche : un focus parti au document et
    // n'y revenant jamais ne serait pas un piège.
    expect(
      visited.filter((where) => where.startsWith('surcouche:')).length,
    ).toBeGreaterThan(5)
  })

  test('se ferme par Échap et restitue le focus au déclencheur', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: 'Menu' })
    await trigger.click()

    const menu = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(menu).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(menu).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
  })

  test('se ferme par le bouton « Fermer », focus restitué', async ({ page }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: 'Menu' })
    await trigger.click()

    const menu = page.getByRole('dialog', { name: 'Menu principal' })
    await menu.getByRole('button', { name: 'Fermer' }).click()

    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('naviguer depuis la surcouche la referme', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Menu' }).click()

    const menu = page.getByRole('dialog', { name: 'Menu principal' })
    await menu.getByRole('link', { name: /Projets/ }).click()

    await expect(page).toHaveURL('/projets')
    await expect(menu).toBeHidden()
  })
})
