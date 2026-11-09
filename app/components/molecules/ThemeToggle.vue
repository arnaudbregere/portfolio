<script setup lang="ts">
/**
 * Bascule clair / sombre. Un seul bouton, libellé par ce qu'il va faire et non
 * par l'état courant : un bouton nommé « Clair » quand le thème est clair ne
 * dit pas s'il décrit ou s'il propose.
 *
 * Molécule et non atome depuis le 09/11/2026 : elle assemble l'atome `Button`,
 * et un atome ne dépend d'aucun autre composant du projet.
 */
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')
const target = computed(() => (isDark.value ? 'clair' : 'sombre'))
const other = computed(() => (isDark.value ? 'sombre' : 'clair'))

const toggle = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <Button :aria-label="`Activer le thème ${target}`" @click="toggle">
    <span class="m-theme-toggle__stack">
      <span class="m-theme-toggle__label">Thème {{ target }}</span>

      <!-- Le libellé de l'autre thème, invisible et hors de l'arbre
           d'accessibilité, occupe la même case de grille et réserve donc sa
           largeur. Sans lui, « Thème clair » est plus court que « Thème
           sombre » et toute la barre se décale au clic. Une largeur minimale en
           dur ferait le même travail, mais deviendrait fausse au premier
           changement de libellé. -->
      <span class="m-theme-toggle__ghost" aria-hidden="true">Thème {{ other }}</span>
    </span>
  </Button>
</template>

<style scoped lang="scss">
/* Les deux libellés se superposent dans la même case : la largeur rendue est
   celle du plus long des deux, à toute taille de police. */
.m-theme-toggle__stack {
  display: grid;
  place-items: center;
}

.m-theme-toggle__label,
.m-theme-toggle__ghost {
  grid-area: 1 / 1;
}

.m-theme-toggle__ghost {
  visibility: hidden;
}
</style>
