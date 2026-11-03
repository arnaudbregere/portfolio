<script setup lang="ts">
/**
 * Bascule clair / sombre. Un seul bouton, libellé par ce qu'il va faire et non
 * par l'état courant : un bouton nommé « Clair » quand le thème est clair ne
 * dit pas s'il décrit ou s'il propose.
 */
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')
const target = computed(() => (isDark.value ? 'clair' : 'sombre'))

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
    Thème {{ target }}
  </button>
</template>

<style scoped lang="scss">
.a-theme-toggle {
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

@media (prefers-reduced-motion: reduce) {
  .a-theme-toggle {
    transition: none;
  }
}
</style>
