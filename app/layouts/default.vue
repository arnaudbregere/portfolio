<template>
  <div class="o-shell">
    <a class="o-skip-link" href="#contenu">Aller au contenu</a>

    <SiteHeader />

    <main id="contenu" class="o-main" tabindex="-1">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>

<style lang="scss">
.o-shell {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
}

/**
 * La gouttière et la largeur maximale appartiennent au gabarit : une page ne
 * repose jamais son propre cadrage, sans quoi deux pages dérivent l'une de
 * l'autre.
 */
.o-main {
  flex: 1;
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding: var(--space-xl) var(--page-gutter) var(--space-3xl);
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
