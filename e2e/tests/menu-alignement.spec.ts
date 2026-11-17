import { expect, test } from '@playwright/test'
import { settle } from './support/site'

/**
 * Le bouton « Fermer » de la surcouche tombe sur le bouton « Menu » qui l'a
 * ouverte — à l'arrêt **et pendant l'ouverture**.
 *
 * Né le 17/11/2026, d'un décalage signalé à l'écran. Les deux boutons sont au
 * pixel près une fois la surcouche en place : relevé sur deux captures de la
 * même page, bords verticaux à x 269/270 et 364/365, filet de l'en-tête à
 * y 84 de part et d'autre. C'est l'entrée qui sautait. La surcouche portait
 * `translate: 0 -0.5rem`, et comme le `<dialog>` contient son propre en-tête,
 * « Fermer » naissait 8px au-dessus de la place de « Menu » puis y descendait
 * en 240 ms : `y` échantillonné image par image donnait `8, 8, 8, 16, 16…`.
 *
 * Deux tests, parce que deux défauts différents : une largeur minimale perdue
 * déplacerait le bouton au repos, une figure d'entrée rendue au conteneur le
 * ferait glisser. Le premier test ne verrait pas le second.
 *
 * Le déclencheur n'existe qu'en dessous de `48em`, d'où la fenêtre étroite.
 */
test.use({ viewport: { width: 390, height: 844 } })

test.describe('Alignement du menu en surcouche', () => {
  test('« Fermer » occupe exactement la place de « Menu »', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const place = await page.getByRole('button', { name: 'Menu' }).boundingBox()

    await page.getByRole('button', { name: 'Menu' }).click()
    await settle(page)

    const fermer = await page
      .getByRole('dialog', { name: 'Menu principal' })
      .getByRole('button', { name: 'Fermer' })
      .boundingBox()

    expect(fermer).toEqual(place)
  })

  /**
   * L'échantillonnage se fait dans la page, image par image : un relevé pris
   * depuis Playwright arriverait après les 240 ms de la transition et ne
   * verrait jamais le glissement.
   *
   * Les boutons sont retrouvés par leur libellé et non par une classe, comme
   * partout ailleurs dans cette suite — `document.querySelector` ne sait pas
   * interroger par rôle, le libellé en tient lieu.
   */
  test('et il y est dès la première image, sans glisser', async ({ page }) => {
    await page.goto('/')
    await settle(page)

    const place = await page.getByRole('button', { name: 'Menu' }).boundingBox()

    const releve = await page.evaluate(async () => {
      const parLibelle = (racine: ParentNode, libelle: string) =>
        Array.from(racine.querySelectorAll('button')).find(
          (bouton) => bouton.textContent?.trim() === libelle,
        )!

      const surcouche = document.querySelector('dialog')!
      const fermer = parLibelle(surcouche, 'Fermer')

      parLibelle(document, 'Menu').click()

      const positions: number[] = []
      const fin = performance.now() + 400

      while (performance.now() < fin) {
        const boite = fermer.getBoundingClientRect()

        // Avant `showModal()`, la surcouche est en `display: none` et son
        // bouton ne mesure rien. Ces images-là ne disent rien de l'entrée.
        if (boite.height > 0) positions.push(Math.round(boite.y))

        await new Promise((image) => requestAnimationFrame(image))
      }

      return positions
    })

    expect(releve.length, 'la surcouche doit s’ouvrir dans la fenêtre relevée')
      .toBeGreaterThan(5)
    expect(Array.from(new Set(releve))).toEqual([Math.round(place!.y)])
  })
})
