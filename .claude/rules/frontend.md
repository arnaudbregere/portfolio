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
- **Un texte modifié dans une page entraîne la relecture de ce qui la décrit**
  — `description`, `title`, Open Graph, JSON-LD — dans le même commit. Le
  tableau de ce qu'il faut relire est dans `.claude/rules/content.md`.

## La priorité de chargement se mesure, elle ne se suppose pas

**`fetchpriority="high"` se pose sur l'élément LCP, et sur aucun autre.** Un
second élément en priorité haute ne gagne rien et prend la place du premier.
L'élément LCP, lui, **se relève** : il change avec le format, avec le contenu
de la page, et une mesure vieille de quelques jours suffit à faire retirer un
attribut juste de bonne foi.

Ce qui s'est passé des deux côtés le 16/11/2026, sur l'accueil (issue #72) :

- l'attribut est d'abord posé sur le portrait **en le croyant** LCP, sans
  mesure. Il l'était par hasard ;
- l'issue demande ensuite de le retirer, sur un relevé périmé qui donnait la
  ligne de métier pour LCP dans les deux formats, et sur l'idée que la priorité
  haute prenait la bande passante de la police. Les deux moitiés étaient
  fausses.

Le relevé qui tranche, sur la build de production, bridé au préréglage mobile
de Lighthouse — 4x processeur, 1,6 Mbit/s, 150 ms de latence, trois
chargements par format :

| Format | LCP | Élément |
|---|---|---|
| 375 × 667 | 1404 ms | le portrait (`img`), 52 942 px² |
| 400 × 660 | 1408 ms | le portrait (`img`), 52 942 px² |
| 1440 × 900 | 1172 ms | `.home__tagline`, 127 065 px² |

Trois enseignements, qui valent au-delà de cette page :

1. **Un élément sous la ligne de flottaison peut être le LCP** s'il la
   chevauche : seule sa portion visible compte, et elle peut dépasser un
   paragraphe entier.
2. **Une police ne peint pas le LCP d'un texte.** `font-display: swap` rend le
   texte dans la fonte de repli bien avant. Ici elle arrive à 1950 ms, soit
   565 ms **après** l'image.
3. **Une entrée de page en `opacity` entre en entier dans le LCP.** Chrome ne
   compte pas un élément peint à `opacity: 0`. En desktop, le LCP n'attend
   aucune ressource : il attend la fin de la cascade. `DESIGN.md` § 7 porte le
   calcul.

Le retrait a été mesuré avant d'être écarté : 1408 ms contre 1412, image
servie à 1383 ms contre 1385. **Aucun effet** — deux ressources ne font pas
une file d'attente à réordonner. L'attribut reste pour ce qu'il déclare, pas
pour ce qu'il gagne.

`tests/unit/index-page.spec.ts` le tient désormais, et
`e2e/tests/accueil-premiere-vue.spec.ts` tient la promesse voisine : le
portrait entier dans la première vue d'un téléphone.

## Rendu serveur — rien ne dérive de ce que le serveur ignore

**Aucun texte ni attribut rendu au serveur ne dérive d'un état que le serveur
n'a pas** : thème, `localStorage`, `window`, `navigator`, `Date.now()`. Le
serveur applique le repli, le navigateur a déjà la vraie valeur, et les deux
divergent à l'hydratation.

Ce que Vue en fait est asymétrique, et c'est le piège : **il corrige le texte
en prévenant, il ne corrige pas l'attribut du tout.** Les deux cas se sont
produits sur `ThemeToggle` :

- 10/11/2026, issue #6 — un `aria-label` rendu au serveur restait figé sur
  « Activer le thème sombre » alors que le bouton activait déjà le thème
  clair. Le nom accessible annonçait l'inverse de l'action, sur les sept pages
  en thème sombre.
- 12/11/2026, issue #56 — les libellés visibles divergeaient à chaque
  chargement en thème sombre : deux `Hydration text content mismatch` par
  page.

**Le remède est le CSS**, sur la classe que `@nuxtjs/color-mode` pose sur
`<html>` avant le premier affichage : rendre les deux états et révéler celui
qui convient. Le HTML cesse alors de dépendre du thème, donc il n'y a plus
rien à réconcilier. Un `ref` posé au montage ne traite que le symptôme, et
laisse le texte diverger.

Attention à la forme du sélecteur : dans un `<style scoped>`,
`:global(html.dark) { … }` en bloc compile en `html.dark` **fusionné à la
règle voisine** — mesuré le 12/11/2026, cela posait `visibility: hidden` sur
tout le document. Écrire le descendant en clair, `html.dark .m-x`, suffit : le
`scoped` n'ajoute son attribut qu'au dernier élément du sélecteur.

**Ce qui se teste, c'est l'invariant** : un composant dont le rendu pourrait
dépendre du thème porte un test qui bascule la préférence et exige **le même
balisage**. `tests/unit/site-footer.spec.ts` le fait pour `ThemeToggle`. La
divergence d'hydratation elle-même n'est tenue par aucune suite — voir
`.claude/rules/e2e.md`.

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
├── _motion.scss       entrée de page partagée
└── main.scss          point d'entrée
```

`_motion.scss` est né le 09/11/2026 (issue #29) et reste l'unique exception à
la règle ci-dessus : un `@keyframes` partagé par plusieurs pages ne peut pas
vivre dans un `<style scoped>`, qui le renommerait pour chaque composant.
`DESIGN.md` § 7 porte la figure et ses mesures.

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
