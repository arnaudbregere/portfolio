# Règles e2e (`e2e/`)

- **Playwright**, dans un package npm indépendant à la racine du dépôt : pas de
  dépendance croisée avec le package principal dans `package.json`. Il lance
  l'application en sous-processus via `webServer` dans `playwright.config.ts`.
- `webServer` build puis sert l'application comme en production
  (`npm run build` puis `node .output/server/index.mjs`). Jamais `nuxt dev` :
  cela masquerait les écarts de rendu entre développement et production.
- Port dédié (`E2E_PORT`, 4320 par défaut), jamais le port de développement.
- **Sélecteurs par rôle ARIA ou libellé accessible** (`getByRole`,
  `getByLabel`), jamais par classe CSS. Un test qui ne trouve pas d'élément par
  son rôle révèle presque toujours un défaut d'accessibilité : corriger le
  composant plutôt que le sélecteur.
- Parcours couverts au minimum : navigation entre les quatre rubriques, menu
  en surcouche au clavier (ouverture, `Échap`, restitution du focus), bascule
  de thème persistée après rechargement, téléchargement du CV, et les liens
  `tel:` et `mailto:` de `/contact` présents avec le bon `href`.
- **Aucun clic sur un lien `tel:` ni `mailto:`** : il passe la main à une
  application du système, que Playwright ne contrôle pas. Seul l'attribut
  `href` se vérifie.
- Audit `@axe-core/playwright` sur chaque page, dans les deux thèmes. Aucune
  violation critique ou sérieuse tolérée.
- Comme tout package du dépôt : `typescript` en devDependency, script
  `typecheck`, étape correspondante dans la CI. Playwright exécute les specs
  via esbuild et ne vérifie pas les types.

## Ce que cette suite ne couvre pas

**Aucune divergence d'hydratation n'y est visible.** `webServer` sert la build
de production, et la build de production de Vue retire les
`[Vue warn]: Hydration … mismatch`. Un composant dont le rendu serveur
diverge du rendu client passerait donc au vert ici — c'est ce qui est arrivé
jusqu'au 12/11/2026 (issue #56) : deux avertissements par chargement en thème
sombre, soixante-douze tests verts.

Faire tourner la suite contre `nuxt dev` pour les voir n'est pas une option :
la règle ci-dessus l'interdit, et pour une raison qui tient toujours — ce sont
les écarts entre développement et production qu'elle masquerait.

La vérification est donc **manuelle**, au même titre que `npm run dev` après
une montée de Nuxt (`CLAUDE.md`) : console du serveur de développement, dans
les deux thèmes, rechargement compris. Ce qui est automatisable l'est un cran
plus tôt, en test unitaire — l'invariant « le balisage ne dépend pas du
thème », décrit dans `.claude/rules/frontend.md`.

Une suite qui ne voit pas un défaut doit le dire. Prétendre le contraire
coûterait plus cher que l'angle mort lui-même.

## Attendre le montage avant de cliquer

Le document servi est complet, lisible et correctement nommé **avant** que Vue
n'attache quoi que ce soit : un clic lancé dans cet intervalle ne fait rien, et
le test échoue par intermittence. `ThemeToggle` pose `data-hydrated` sur son
bouton au montage, et `hydrated(page)` de `tests/support/site.ts` attend cet
attribut.

Jusqu'au 12/11/2026, le nom du bouton de thème tenait ce rôle sans que
personne l'ait voulu : il n'existait qu'après le montage, puisqu'il venait d'un
`aria-label` posé par un `ref`. Le jour où ce libellé est venu du serveur,
trois specs se sont mises à cliquer trop tôt. Un marqueur implicite n'est pas
un marqueur.
