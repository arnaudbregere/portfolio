<script setup lang="ts">
/**
 * Le bouton de libellé du site. « Menu », « Fermer » et la bascule de thème
 * passent par lui.
 *
 * Il naît le 09/11/2026 de trois copies du même bloc de style, dans
 * `SiteHeader`, `NavOverlay` et `ThemeToggle` : elles avaient déjà divergé —
 * l'une sans transition, l'autre sans `font-stretch` — et le libellé le plus
 * long passait sur deux lignes, ce qui faisait sauter la hauteur de l'en-tête
 * d'un bouton à l'autre.
 *
 * Il ne déclare ni gestionnaire ni `aria-*` : `type="button"` est posé ici une
 * fois pour toutes, et tout le reste passe par les attributs hérités.
 */
</script>

<template>
  <button type="button" class="a-button">
    <slot />
  </button>
</template>

<style scoped lang="scss">
/* Une largeur minimale commune : « Menu » et « Fermer » occupent alors la même
   place, et la surcouche ne décale pas le bouton qui l'a ouverte.
   `white-space: nowrap` tient la hauteur : un libellé qui passe sur deux lignes
   grandit le bouton et désaligne ses voisins. */
.a-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--control-min-width);
  min-height: var(--control-min-height);
  padding: var(--space-2xs) var(--space-s);
  border: var(--rule-strong);
  background-color: transparent;
  color: inherit;
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  font-stretch: var(--label-stretch);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-out);

  &:hover {
    background-color: var(--color-bg-subtle);
  }
}

@media (prefers-reduced-motion: reduce) {
  .a-button {
    transition: none;
  }
}
</style>
