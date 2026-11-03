# Règles frontend (`app/`)

- Vue 3, **Composition API exclusivement**, avec `<script setup lang="ts">`.
  Pas d'Options API.
- Fonctions fléchées (`const f = () => {}`), pas de `function` déclarée, dans
  les composants, composables et utilitaires.
- Pas de store global tant qu'aucun état n'est réellement partagé entre deux
  branches de l'arbre. Le thème passe par `@nuxtjs/color-mode`, le contenu par
  des imports statiques. **Ne pas introduire Pinia par réflexe.**
- Les composables (`app/composables/`) portent la logique ; les composants
  portent le rendu. Un composant qui dépasse ~120 lignes de `<script setup>`
  signale une logique à extraire.
- Accès aux données : imports depuis `content/`. Aucun appel réseau pour du
  contenu statique.
- Images via `<NuxtImg>` avec `width`, `height` et `loading` explicites, pour
  éviter tout décalage de mise en page.
- Métadonnées par page via `useSeoMeta`, jamais via un `useHead` global
  dupliqué.

## CSS — styles globaux plats et styles scopés, sans framework

**Un seul système d'organisation : Atomic Design.** ITCSS a été abandonné le
26/10/2026 : deux systèmes en parallèle dupliquaient les règles, et quatre de
ses sept couches ne contenaient qu'une ligne de commentaire.

Le SCSS global ne porte que ce qui ne peut pas être scopé dans un composant.
Un fichier, une responsabilité, composés par `app/styles/main.scss` :

```
app/styles/
├── _tokens.scss       custom properties
├── _fonts.scss        @font-face
├── _reset.scss        remise à zéro
├── _base.scss         styles d'éléments
├── _breakpoints.scss  mixin respond-up()
└── main.scss          point d'entrée
```

- Tout le reste vit dans le `<style scoped>` du composant qui en a besoin.
  N'ajouter un fichier global que si la règle est impossible à scoper.
- **Les tokens de design sont des custom properties CSS** (`--color-*`,
  `--space-*`, `--step-*`), pas des variables Sass : la thémabilité à
  l'exécution en dépend. Seuls les points de rupture restent en variables Sass
  (`_breakpoints.scss`), consommées par le mixin `respond-up()` — le CSS natif
  n'accepte pas de custom property dans une media query.
- **Mobile first** : styles de base pour petit écran, enrichis vers le haut avec
  `respond-up()`. Jamais de `max-width` en media query.
- Aucune valeur en dur pour une couleur, un espacement, une durée ou une taille
  de texte dans un composant : toujours un token.
- Pas de framework CSS externe (Tailwind, Bootstrap).
- Avant de chercher une solution JavaScript pour un effet visuel, vérifier si du
  CSS suffit (`:has()`, container queries, transitions, `view-transition`).

## Accessibilité — mise en œuvre

Les critères opposables sont dans `PRODUCT.md`, section « Accessibilité et
inclusion ». Ici, seulement leur traduction dans ce dépôt :

- `:focus-visible` est défini globalement dans `_base.scss`. Jamais
  d'`outline: none` sans remplacement visible.
- `prefers-reduced-motion` est traité dans `_reset.scss`. Toute animation
  ajoutée doit rester couverte par cette règle.
- Les icônes rendent un `<svg aria-hidden="true">` ; si l'icône porte seule le
  sens, le bouton qui la contient porte un `aria-label`.
- Tout ajout de couleur dans `_tokens.scss` documente son ratio de contraste
  dans `DESIGN.md`, dans les deux thèmes, et rejoint les couples verrouillés
  par `tests/unit/contrast.spec.ts`.

## Tests

- Vitest (`npm test`), environnement `nuxt`, specs dans `tests/unit/`.
- Tout atome et toute molécule a un test : rendu, props, état désactivé,
  attributs d'accessibilité. Le test s'écrit en même temps que le composant.
- Monter les composants avec `mountSuspended` de `@nuxt/test-utils/runtime`.
- Interroger le DOM par rôle ou par texte accessible plutôt que par classe CSS.
