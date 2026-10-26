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
- Aucun envoi réel : les routes serveur coûteuses sont interceptées via
  `page.route()`.
- Parcours couverts au minimum : navigation entre les cinq rubriques, menu en
  surcouche au clavier (ouverture, `Échap`, restitution du focus), bascule de
  thème persistée après rechargement, téléchargement du CV, formulaire de
  contact en succès et en erreur de validation.
- Audit `@axe-core/playwright` sur chaque page, dans les deux thèmes. Aucune
  violation critique ou sérieuse tolérée.
- Comme tout package du dépôt : `typescript` en devDependency, script
  `typecheck`, étape correspondante dans la CI. Playwright exécute les specs
  via esbuild et ne vérifie pas les types.
