<script setup lang="ts">
/**
 * Bascule clair / sombre. Un seul bouton, qui dit ce qu'il va faire et non
 * l'état courant : un bouton nommé « Clair » quand le thème est clair ne dit
 * pas s'il décrit ou s'il propose.
 *
 * Molécule et non atome depuis le 09/11/2026 : elle assemble les atomes
 * `Button` et `Icon`, et un atome ne dépend d'aucun autre composant du projet.
 *
 * ## Un pictogramme depuis le 17/11/2026
 *
 * Le bouton portait son libellé en clair, « Thème sombre » ou « Thème
 * clair » : 149px dans la barre en desktop, 126px à 393px, et le filet fort de
 * `Button` lui donnait plus de poids qu'aux quatre rubriques, qui sont du
 * texte nu. Il pesait plus que la navigation qu'un visiteur vient lire. Le
 * carré de 44px rend 105px à la barre et 82px au déclencheur « Menu ».
 * `DESIGN.md` § 6 porte la décision et le relevé.
 *
 * L'icône dit la **destination**, comme le libellé qu'elle remplace : un
 * croissant de lune sur fond clair, un soleil sur fond sombre.
 *
 * ## Les deux états sont rendus, le CSS montre le bon
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
 * D'où cette forme, que le passage au pictogramme ne change pas : **les deux
 * états sont dans le document**, icône et nom, et c'est le CSS qui révèle
 * celui qui convient, à partir de la classe que `@nuxtjs/color-mode` pose sur
 * `<html>` par un script en ligne, avant le premier affichage. Le HTML du
 * serveur est donc le même dans les deux thèmes : il n'y a plus rien à
 * réconcilier, et plus d'attribut à rattraper.
 *
 * Le nom accessible du bouton reste du texte, masqué visuellement et inchangé
 * d'un mot : « Activer le Thème sombre ». L'état qui ne convient pas sort de
 * l'arbre d'accessibilité avec `visibility: hidden`, donc le bouton n'a jamais
 * qu'un nom. WCAG 2.5.3 cesse de s'appliquer — il n'y a plus de libellé
 * visible que ce nom doive contenir —, mais la règle qui l'a fait naître
 * tient toujours : le nom ne vient pas d'un attribut.
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
  <Button icon :data-hydrated="ready || undefined" @click="toggle">
    <!-- Les deux états occupent la même case de grille. Ils ne se mesurent
         plus l'un contre l'autre — le bouton est carré —, mais superposés ils
         gardent le pictogramme au centre sans que le nom masqué pousse quoi
         que ce soit. -->
    <span class="m-theme-toggle">
      <span class="m-theme-toggle__state m-theme-toggle__state--to-dark">
        <Icon name="moon" />
        <span class="visually-hidden">Activer le Thème sombre</span>
      </span>

      <span class="m-theme-toggle__state m-theme-toggle__state--to-light">
        <Icon name="sun" />
        <span class="visually-hidden">Activer le Thème clair</span>
      </span>
    </span>
  </Button>
</template>

<style scoped lang="scss">
.m-theme-toggle {
  display: grid;
  place-items: center;

  /* Le pictogramme se mesure en `em` : sa taille se donne ici, et non en
     pixels dans l'atome. Un cran au-dessus du libellé d'un bouton, pour que
     le dessin reste lisible à 44px de cible. */
  font-size: var(--step-1);
}

.m-theme-toggle__state {
  display: inline-flex;
  grid-area: 1 / 1;
}

/* L'encre du bouton, et non l'encre atténuée que `Icon` se donne pour les
   lignes de coordonnées de `/contact` : trop pâle sur un contrôle cerné. */
.m-theme-toggle__state :deep(.a-icon) {
  color: inherit;
}

/* Thème clair : le bouton propose le sombre, donc il montre la lune.
   `visibility` et non `display` — un élément invisible sort de l'arbre
   d'accessibilité, donc le nom du bouton reste celui du seul état visible. */
.m-theme-toggle__state--to-light {
  visibility: hidden;
}

/* Thème sombre : le bouton propose le clair, donc il montre le soleil.
   `@nuxtjs/color-mode` pose la classe sur `<html>` par un script en ligne,
   avant le premier affichage, donc le bon pictogramme paraît sans attendre
   l'hydratation.

   Le `scoped` n'ajoute son attribut qu'au **dernier** élément du sélecteur :
   `html.dark .m-theme-toggle__state--to-dark[data-v-…]` cible donc bien l'état
   de ce composant, sous un ancêtre qui lui est extérieur. Ne pas passer par
   `:global()` ici : `:global(html.dark) { … }` compile en `html.dark` fusionné
   à la règle voisine, soit `visibility: hidden` sur tout le document en thème
   sombre. Mesuré dans la sortie de build le 12/11/2026. */
html.dark .m-theme-toggle__state--to-dark {
  visibility: hidden;
}

html.dark .m-theme-toggle__state--to-light {
  visibility: visible;
}
</style>
