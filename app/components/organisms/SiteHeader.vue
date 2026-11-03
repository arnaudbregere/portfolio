<script setup lang="ts">
const isMenuOpen = ref(false)
</script>

<template>
  <header class="o-header">
    <div class="o-header__inner">
      <NuxtLink to="/" class="o-header__wordmark">Arnaud Brégère</NuxtLink>

      <button
        type="button"
        class="o-header__trigger"
        aria-controls="menu-principal"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = true"
      >
        Menu
      </button>
    </div>

    <NavOverlay v-model:open="isMenuOpen" />
  </header>
</template>

<style scoped lang="scss">
/* L'en-tête suit le défilement : le menu doit rester atteignable sur une page
   longue, sans remonter. */
.o-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-bg);
  border-bottom: var(--rule);
}

.o-header__inner {
  display: flex;
  gap: var(--space-s);
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding: var(--space-s) var(--page-gutter);
}

.o-header__wordmark {
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  font-stretch: var(--label-stretch);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  text-decoration: none;
}

.o-header__trigger {
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
  .o-header__trigger {
    transition: none;
  }
}
</style>
