<script setup lang="ts">
/**
 * Bascule clair / sombre. Un seul bouton, libellé par ce qu'il va faire et non
 * par l'état courant : un bouton nommé « Clair » quand le thème est clair ne
 * dit pas s'il décrit ou s'il propose.
 *
 * Molécule et non atome depuis le 09/11/2026 : elle assemble l'atome `Button`,
 * et un atome ne dépend d'aucun autre composant du projet.
 *
 * ## Les deux libellés sont rendus, le CSS montre le bon
 *
 * Le rendu serveur ne connaît pas la préférence du visiteur : il applique le
 * repli clair de `nuxt.config.ts`. Tant que le libellé dépendait de
 * `useColorMode()`, le serveur écrivait « Thème sombre » pendant que le
 * navigateur, qui avait déjà restauré `dark` du stockage, attendait « Thème
 * clair ». Vue corrigeait le texte et prévenait — deux
 * `Hydration text content mismatch` par chargement en thème sombre
 * (issue #56, 12/11/2026).
 *
 * Ce n'était pas qu'un bruit de console. **Vue corrige les textes divergents,
 * pas les attributs.** En production, un `aria-label` rendu au serveur restait
 * figé sur « Activer le thème sombre » alors que le bouton activait déjà le
 * thème clair : le nom accessible annonçait l'inverse de l'action, et axe le
 * relevait en `label-content-name-mismatch` sur les sept pages en thème sombre
 * (issue #6, 10/11/2026). Le correctif d'alors ne posait l'`aria-label`
 * qu'après le montage — il traitait l'attribut, pas la cause.
 *
 * D'où cette forme : **les deux libellés sont dans le document**, et c'est le
 * CSS qui révèle celui qui convient, à partir de la classe que
 * `@nuxtjs/color-mode` pose sur `<html>` par un script en ligne, avant le
 * premier affichage. Le HTML du serveur est donc le même dans les deux
 * thèmes : il n'y a plus rien à réconcilier, et plus d'attribut à rattraper.
 *
 * Le nom accessible du bouton est le texte du libellé visible — « Activer le »
 * est masqué visuellement, « Thème sombre » ne l'est pas. Le texte affiché est
 * contenu dans le nom, ce que WCAG 2.5.3 demande pour la commande vocale, et
 * le libellé caché sort de l'arbre d'accessibilité avec `visibility: hidden`.
 */
const colorMode = useColorMode()

/**
 * Marque le bouton comme monté, pour les tests de bout en bout et pour eux
 * seuls — aucun style, aucune sémantique, aucun nom accessible n'en dépend.
 *
 * Avant l'hydratation, le bouton est servi, lisible et correctement nommé,
 * mais inerte : aucun gestionnaire n'est attaché. Son nom tenait ce rôle de
 * marqueur sans le dire — il n'apparaissait qu'après le montage, puisqu'il
 * venait d'un `aria-label` posé par un `ref`. Le nom vient maintenant du HTML
 * du serveur, et les specs qui cliquaient dessus se sont mises à cliquer trop
 * tôt (issue #56).
 *
 * L'attribut est **absent** du rendu serveur et ajouté au montage : ce n'est
 * pas une divergence d'hydratation, c'est une mise à jour réactive ordinaire.
 */
const ready = ref(false)

onMounted(() => {
  ready.value = true
})

const toggle = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Button :data-hydrated="ready || undefined" @click="toggle">
    <!-- Les deux libellés occupent la même case de grille : la largeur rendue
         est celle du plus long, à toute taille de police. Sans cette réserve,
         « Thème clair » étant plus court que « Thème sombre », toute la barre
         de l'en-tête se décalerait au clic. Une largeur minimale en dur ferait
         le même travail, mais deviendrait fausse au premier changement de
         libellé. -->
    <span class="m-theme-toggle">
      <span class="m-theme-toggle__label m-theme-toggle__label--to-dark">
        <span class="visually-hidden">Activer le </span>Thème sombre
      </span>

      <span class="m-theme-toggle__label m-theme-toggle__label--to-light">
        <span class="visually-hidden">Activer le </span>Thème clair
      </span>
    </span>
  </Button>
</template>

<style scoped lang="scss">
.m-theme-toggle {
  display: grid;
  place-items: center;
}

.m-theme-toggle__label {
  grid-area: 1 / 1;
}

/* Thème clair : le bouton propose le sombre. `visibility` et non `display` —
   la case garde la largeur du plus long des deux libellés, et un élément
   invisible sort de l'arbre d'accessibilité, donc le nom du bouton reste celui
   du seul libellé visible. */
.m-theme-toggle__label--to-light {
  visibility: hidden;
}

/* Thème sombre : le bouton propose le clair. `@nuxtjs/color-mode` pose la
   classe sur `<html>` par un script en ligne, avant le premier affichage,
   donc le bon libellé paraît sans attendre l'hydratation.

   Le `scoped` n'ajoute son attribut qu'au **dernier** élément du sélecteur :
   `html.dark .m-theme-toggle__label--to-dark[data-v-…]` cible donc bien le
   libellé de ce composant, sous un ancêtre qui lui est extérieur. Ne pas
   passer par `:global()` ici : `:global(html.dark) { … }` compile en
   `html.dark` fusionné à la règle voisine, soit `visibility: hidden` sur tout
   le document en thème sombre. Mesuré dans la sortie de build le
   12/11/2026. */
html.dark .m-theme-toggle__label--to-dark {
  visibility: hidden;
}

html.dark .m-theme-toggle__label--to-light {
  visibility: visible;
}
</style>
