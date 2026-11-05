<script setup lang="ts">
/**
 * Pictogramme de 1 em, dessiné à l'encre courante.
 *
 * Les tracés sont écrits ici plutôt que chargés en fichier : deux icônes de
 * 200 octets coûtent moins qu'une requête, et `currentColor` suit le thème
 * sans qu'un fichier doive exister en deux versions.
 *
 * L'icône ne porte jamais le sens : elle est `aria-hidden`, et le libellé de
 * la ligne reste la seule source d'information — `.claude/rules/frontend.md`.
 */
withDefaults(
  defineProps<{
    name: 'phone' | 'mail'
    /** Épaisseur du trait, en unités du `viewBox`. */
    stroke?: number
  }>(),
  { stroke: 1.5 },
)
</script>

<template>
  <svg
    class="a-icon"
    viewBox="0 0 20 20"
    fill="none"
    :stroke-width="stroke"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-if="name === 'phone'"
      d="M6.3 2.8h2.9l1.4 3.4-1.9 1.2a9.2 9.2 0 0 0 4 4l1.2-1.9 3.4 1.4v2.9a1.5 1.5 0 0 1-1.7 1.5A13.6 13.6 0 0 1 4.5 4.5a1.5 1.5 0 0 1 1.5-1.7Z"
    />
    <template v-else>
      <rect x="2.4" y="4.4" width="15.2" height="11.2" rx="1.4" />
      <path d="m3 5.4 7 5.2 7-5.2" />
    </template>
  </svg>
</template>

<style scoped lang="scss">
/* L'icône suit la ligne de base du texte qu'elle accompagne : elle se mesure
   en `em`, jamais en pixels, pour suivre la taille de la ligne. */
.a-icon {
  flex: none;
  width: 1em;
  height: 1em;
  color: var(--color-fg-muted);
}
</style>
