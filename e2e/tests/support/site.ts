import type { Page } from '@playwright/test'

/**
 * Les pages du site en production, telles que le routage les sert.
 *
 * `/_ds`, la planche de spécimen, n'y est pas : `nuxt.config.ts` la retire du
 * routage en production, et c'est ce build-là que ces tests servent.
 *
 * La liste est écrite à la main plutôt que dérivée de `content/projects.ts` :
 * le paquet `e2e/` n'a aucune dépendance vers le package principal, et un test
 * qui importe la donnée qu'il vérifie ne vérifie plus rien.
 */
export const sitePages = [
  { path: '/', name: 'accueil' },
  { path: '/projets', name: 'liste des projets' },
  { path: '/projets/japan-manga-explorer', name: 'fiche Japan Manga Explorer' },
  { path: '/projets/agenda-app-event', name: 'fiche Agenda App Event' },
  { path: '/projets/calculatrice', name: 'fiche Calculatrice' },
  { path: '/a-propos', name: 'à propos' },
  { path: '/contact', name: 'contact' },
] as const

/** Les deux thèmes, et la clé sous laquelle `@nuxtjs/color-mode` les retient. */
export const themeStorageKey = 'portfolio-theme'

export const themes = ['light', 'dark'] as const

export type Theme = (typeof themes)[number]

/**
 * Impose un thème avant le premier rendu.
 *
 * Le script est injecté par `addInitScript`, donc exécuté avant le code de la
 * page : `@nuxtjs/color-mode` lit la préférence déjà posée et aucune bascule
 * n'est visible. Passer par le bouton forcerait chaque spec d'audit à cliquer,
 * et ferait dépendre l'audit du thème sombre du bon fonctionnement du bouton.
 *
 * **À n'utiliser que dans une spec qui ne recharge pas la page.**
 * `addInitScript` s'exécute à *chaque* navigation du contexte, rechargement
 * compris : il réécrirait la préférence et masquerait précisément ce qu'une
 * spec de persistance cherche à voir.
 */
export const forceTheme = async (page: Page, theme: Theme) => {
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, value),
    { key: themeStorageKey, value: theme },
  )
}

/** Le thème réellement appliqué, lu sur `<html>` (`classSuffix: ''`). */
export const appliedTheme = (page: Page) =>
  page.evaluate(() => document.documentElement.className)

/**
 * Attend l'extinction de toutes les animations de la page.
 *
 * La figure d'entrée de `_motion.scss` fait monter l'opacité des blocs. Toute
 * mesure prise pendant la montée — un contraste, une capture — porte sur une
 * valeur interpolée, pas sur le dessin. `getAnimations()` couvre les
 * transitions CSS comme les `@keyframes`.
 */
export const settle = async (page: Page) => {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(({ playState }) => playState === 'finished' || playState === 'idle'),
  )
}
