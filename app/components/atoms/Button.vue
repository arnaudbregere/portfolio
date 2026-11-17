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
 *
 * ## `icon` : la largeur minimale tombe, le carré reste
 *
 * `--control-min-width` réserve la place du plus long libellé du site, pour
 * que « Menu » et « Fermer » occupent la même case. Un bouton qui ne porte
 * qu'un pictogramme n'a rien à aligner : la réserve ne ferait qu'un rectangle
 * étiré autour d'une icône de 20px. La prop lui rend un carré de
 * `--control-min-height`, soit la cible tactile de 44px que RGAA 4.1 exige.
 *
 * Une prop et non une classe posée par le parent : la règle du parent et celle
 * de cet atome viseraient le même élément avec la même spécificité, et l'ordre
 * d'injection trancherait — c'est pour cette raison que `SiteHeader` enveloppe
 * déjà ses contrôles dans un `div`.
 */
withDefaults(defineProps<{ icon?: boolean }>(), { icon: false })
</script>

<template>
  <button type="button" class="a-button" :class="{ 'a-button--icon': icon }">
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

/* Le carré : même hauteur qu'un bouton de libellé, donc même ligne dans la
   barre, et l'intérieur se resserre autour du pictogramme. */
.a-button--icon {
  min-width: var(--control-min-height);
  padding-inline: var(--space-2xs);
}

@media (prefers-reduced-motion: reduce) {
  .a-button {
    transition: none;
  }
}
</style>
