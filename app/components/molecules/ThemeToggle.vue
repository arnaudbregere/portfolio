<script setup lang="ts">
/**
 * Bascule clair / sombre. Un seul bouton, libellé par ce qu'il va faire et non
 * par l'état courant : un bouton nommé « Clair » quand le thème est clair ne
 * dit pas s'il décrit ou s'il propose.
 *
 * Molécule et non atome depuis le 09/11/2026 : elle assemble l'atome `Button`,
 * et un atome ne dépend d'aucun autre composant du projet.
 */
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')
const target = computed(() => (isDark.value ? 'clair' : 'sombre'))
const other = computed(() => (isDark.value ? 'sombre' : 'clair'))

/**
 * L'`aria-label` n'est posé qu'après l'hydratation.
 *
 * Le rendu serveur ne connaît pas la préférence du navigateur : il applique le
 * repli clair, quelle que soit celle en vigueur. Vue corrige le texte divergent
 * à l'hydratation, mais **pas un attribut** : en production, un `aria-label`
 * rendu côté serveur restait figé sur « Activer le thème sombre » alors que le
 * thème sombre était déjà restauré du stockage, et que le bouton activait donc
 * le thème clair. Le nom accessible annonçait l'inverse de l'action — axe le
 * relevait en `label-content-name-mismatch` sur les sept pages en thème sombre.
 * Défaut trouvé le 10/11/2026 par l'audit de l'issue #6.
 *
 * Le drapeau est local et non `colorMode.unknown` : ce dernier passe bien à
 * `false` au montage, mais la mutation ne déclenche aucun rendu — l'objet rendu
 * par `useState` est restitué de la charge utile, et cette écriture-là n'est pas
 * suivie. Mesuré le même jour : l'attribut restait absent. Un `ref` du composant
 * est suivi, lui, et son passage à `true` écrit l'attribut.
 *
 * Avant ce passage, le nom accessible est le texte visible du bouton — lui-même
 * corrigé à l'hydratation. Le bouton est donc nommé dans les deux cas, et
 * jamais nommé à faux.
 */
const hydrated = ref(false)

onMounted(() => {
  hydrated.value = true
})

const label = computed(() =>
  hydrated.value ? `Activer le thème ${target.value}` : undefined,
)

const toggle = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <Button :aria-label="label" @click="toggle">
    <span class="m-theme-toggle__stack">
      <span class="m-theme-toggle__label">Thème {{ target }}</span>

      <!-- Le libellé de l'autre thème, invisible et hors de l'arbre
           d'accessibilité, occupe la même case de grille et réserve donc sa
           largeur. Sans lui, « Thème clair » est plus court que « Thème
           sombre » et toute la barre se décale au clic. Une largeur minimale en
           dur ferait le même travail, mais deviendrait fausse au premier
           changement de libellé. -->
      <span class="m-theme-toggle__ghost" aria-hidden="true">Thème {{ other }}</span>
    </span>
  </Button>
</template>

<style scoped lang="scss">
/* Les deux libellés se superposent dans la même case : la largeur rendue est
   celle du plus long des deux, à toute taille de police. */
.m-theme-toggle__stack {
  display: grid;
  place-items: center;
}

.m-theme-toggle__label,
.m-theme-toggle__ghost {
  grid-area: 1 / 1;
}

.m-theme-toggle__ghost {
  visibility: hidden;
}
</style>
