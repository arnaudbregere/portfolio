import { expect, test } from '@playwright/test'

/**
 * La première vue de l'accueil sur un téléphone (issue #72).
 *
 * Relevé le 16/11/2026, avant correction : la figure du portrait dépassait le
 * bas de l'écran de 195 px sur un iPhone SE et de 219 px sur un 360 × 640. Le
 * visiteur voyait un visage coupé au menton — ce qui se lit comme un défaut
 * d'affichage, pas comme un cadrage. Arnaud l'a relevé deux fois.
 *
 * Ce qui est tenu ici n'est pas une valeur de style mais la promesse qu'elle
 * sert : **le portrait tient entier dans la première vue, légende comprise**,
 * sur le plus petit téléphone encore en circulation. La largeur de la figure,
 * la taille de la ligne de métier et l'écart sous l'en-tête concourent tous
 * les trois à cette promesse ; un test par valeur rougirait au premier
 * ajustement sans rien dire du résultat.
 *
 * Les formats sont ceux du relevé. 360 × 640 est le plancher — il ne tient
 * qu'à 1 px près, et c'est voulu : il dit qu'il n'y a plus de marge à dépenser
 * sans retoucher la composition.
 */
const PHONES = [
  { width: 360, height: 640, name: 'Android compact' },
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 390, height: 844, name: 'iPhone 12' },
] as const

test.describe('Première vue de l’accueil sur téléphone', () => {
  // L'entrée de page part d'`opacity: 0` : sans cette neutralisation, la
  // mesure porterait sur une figure encore invisible.
  test.use({ reducedMotion: 'reduce' })

  for (const phone of PHONES) {
    test(`le portrait tient entier dans l’écran — ${phone.name}`, async ({ page }) => {
      await page.setViewportSize({ width: phone.width, height: phone.height })
      await page.goto('/')

      const figure = page.getByRole('figure')
      await expect(figure).toBeVisible()

      const box = await figure.boundingBox()
      expect(box).not.toBeNull()

      // `boundingBox` est relatif à la fenêtre, et la page n'a pas défilé :
      // le bas de la figure se compare donc directement à sa hauteur.
      expect(box!.y).toBeGreaterThan(0)
      expect(box!.y + box!.height).toBeLessThanOrEqual(phone.height)
    })
  }

  /**
   * L'image elle-même, et non la seule boîte de la figure : une figure qui
   * tiendrait pendant que l'image déborde ne vaudrait rien, et c'est l'image
   * qu'Arnaud a vue coupée.
   */
  test('l’image du portrait n’est coupée par aucun bord — iPhone SE', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const image = page.getByRole('figure').getByRole('img')
    const box = await image.boundingBox()

    expect(box).not.toBeNull()
    expect(box!.y).toBeGreaterThan(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(667)
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(375)
  })
})
