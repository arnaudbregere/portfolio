<script setup lang="ts">
/**
 * Bascule clair / sombre. Un seul bouton, libellé par ce qu'il va faire et non
 * par l'état courant : un bouton nommé « Clair » quand le thème est clair ne
 * dit pas s'il décrit ou s'il propose.
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
  <button
    type="button"
    class="a-theme-toggle"
    :aria-label="`Activer le thème ${target}`"
    @click="toggle"
  >
    <span class="a-theme-toggle__label">Thème {{ target }}</span>

    <!-- Le libellé de l'autre thème, invisible et hors de l'arbre
         d'accessibilité, occupe la même case de grille et réserve donc sa
         largeur. Sans lui, « Thème clair » est plus court que « Thème sombre »
         et toute la barre se décale au clic. Une largeur minimale en dur
         ferait le même travail, mais deviendrait fausse au premier changement
         de police ou de libellé. -->
    <span class="a-theme-toggle__ghost" aria-hidden="true">Thème {{ other }}</span>
  </button>
</template>

<style scoped lang="scss">
.a-theme-toggle {
  display: inline-grid;
  place-items: center;
  min-height: 2.75rem; // 44px : cible tactile RGAA 4.1
  padding: var(--space-2xs) var(--space-s);
  border: var(--rule-strong);
  background-color: transparent;
  color: inherit;
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-out);

  &:hover {
    background-color: var(--color-bg-subtle);
  }
}

/* Les deux libellés se superposent dans la même case : la largeur du bouton
   est celle du plus long des deux, à toute taille de police. */
.a-theme-toggle__label,
.a-theme-toggle__ghost {
  grid-area: 1 / 1;
}

.a-theme-toggle__ghost {
  visibility: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .a-theme-toggle {
    transition: none;
  }
}
</style>
