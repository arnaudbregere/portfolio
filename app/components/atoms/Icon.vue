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
    name: 'phone' | 'mail' | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'sun' | 'moon'
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
    <path v-else-if="name === 'chevron-left'" d="M12.5 3.8 6.3 10l6.2 6.2" />
    <path v-else-if="name === 'chevron-right'" d="M7.5 3.8 13.7 10l-6.2 6.2" />

    <!-- Le chevron descendant est le latéral tourné d'un quart de tour : même
         `viewBox`, même longueur de branche, même trait. Il ouvre le `<select>`
         de la démo de liste de tâches, à la place de la flèche du système, qui
         ne suit ni la police ni le thème. `DESIGN.md` § 5. -->
    <path v-else-if="name === 'chevron-down'" d="M3.8 7.5 10 13.7l6.2-6.2" />

    <!-- Le soleil : un disque et huit rayons, tous de même longueur. Les
         diagonales tombent à `r / √2` du centre, sinon la couronne paraît
         carrée. -->
    <template v-else-if="name === 'sun'">
      <circle cx="10" cy="10" r="3.6" />
      <path
        d="M10 2v2.4M10 15.6V18M2 10h2.4M15.6 10H18M4.3 4.3 6 6M14 14l1.7 1.7M15.7 4.3 14 6M6 14l-1.7 1.7"
      />
    </template>

    <!-- Le croissant : un arc de disque de rayon 7, refermé par un arc de
         rayon 5,5 qui le creuse. Deux arcs et non un disque percé — un tracé
         à `fill: none` ne peut pas se soustraire à lui-même. -->
    <path
      v-else-if="name === 'moon'"
      d="M10 3a7 7 0 1 0 7 7 5.5 5.5 0 0 1-7-7Z"
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
