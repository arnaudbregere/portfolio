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
@use '../styles/breakpoints' as bp;

.o-shell {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
}

/**
 * La gouttière et la largeur maximale appartiennent au gabarit : une page ne
 * repose jamais son propre cadrage, sans quoi deux pages dérivent l'une de
 * l'autre.
 *
 * L'écart sous l'en-tête suit la fenêtre, comme `--space-2xl` (issue #72) :
 * **2,5 rem en mobile, 4 rem à partir de `m`** (48 em / 768 px). Quatre rem
 * partout posaient 64 px entre le filet de l'en-tête et le titre d'une page,
 * sur un téléphone où la première vue n'a que 660 px à répartir — et où la
 * figure du portrait de l'accueil en déborde.
 *
 * La variante vit ici et non en token : c'est ce gabarit qui tient le cadrage,
 * et `--space-xl` sert aussi trois écarts intérieurs — le pied de page,
 * `/projets` et `/a-propos` — que rien n'oblige à bouger avec celui-ci.
 */
.o-main {
  flex: 1;
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding: var(--space-l) var(--page-gutter) var(--space-3xl);

  @include bp.respond-up(m) {
    padding-top: var(--space-xl);
  }
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
