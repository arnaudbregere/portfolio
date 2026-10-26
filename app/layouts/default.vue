<template>
  <div class="o-shell">
    <a class="o-skip-link" href="#contenu">Aller au contenu</a>
    <main id="contenu" tabindex="-1">
      <slot />
    </main>
  </div>
</template>

<style lang="scss">
.o-shell {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
}

.o-skip-link {
  position: absolute;
  left: var(--space-s);
  top: var(--space-s);
  z-index: 100;
  padding: var(--space-2xs) var(--space-s);
  background-color: var(--color-fg);
  color: var(--color-bg);
  transform: translateY(-200%);

  &:focus-visible {
    transform: translateY(0);
  }
}
</style>
