<script setup lang="ts">
/**
 * Une énumération de libellés courts, rendue en étiquettes cernées d'encre.
 *
 * Né le 13/11/2026 pour les technos de `/projets` et le pied de fiche de
 * `/a-propos`, qui les rendaient l'un et l'autre en un paragraphe joint par
 * ` · `. Deux pages en avaient besoin le même jour : la forme vit dans un
 * composant plutôt qu'en deux copies de style — l'ancien portfolio est mort
 * d'une duplication de styles.
 *
 * C'est un atome et non une molécule : il n'assemble aucun autre composant du
 * projet, ne connaît ni la route ni le contenu, et reçoit tout par `props`.
 *
 * Il ne pose aucune marge extérieure : l'écart avec ce qui précède appartient
 * à la page.
 */
type Props = {
  /** Les libellés, dans l'ordre d'affiche. */
  items: readonly string[]
  /**
   * Nom accessible de la liste. Sans lui, un lecteur d'écran annonce
   * « liste, 5 éléments » sans dire de quoi.
   *
   * Facultatif, pour le seul cas où la liste est déjà nommée par son
   * voisinage : dans un `<dl>`, le `<dt>` qui la précède la nomme, et un
   * `aria-label` redirait le même mot.
   */
  label?: string
}

defineProps<Props>()
</script>

<template>
  <ul class="a-tag-list" :aria-label="label">
    <li v-for="item in items" :key="item" class="a-tag-list__item">{{ item }}</li>
  </ul>
</template>

<style scoped lang="scss">
/* `ul[class]` est déjà remis à plat par `_reset.scss` : ni marge, ni retrait,
   ni marqueur à reprendre ici. */
.a-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3xs) var(--space-2xs);
}

/* L'étiquette est la seule forme arrondie du site. `DESIGN.md` § 5 réserve
   l'arrondi à la taxonomie et laisse les contrôles en rectangles à filet : une
   techno est une taxonomie, un bouton non.

   L'encre bascule avec le thème — rose `#ff5c72` sur fond sombre, carmin
   `#b3122b` sur le papier clair. Le libellé est du texte : WCAG 1.4.3 lui
   demande 4,5:1, et `--color-ink` tient 6,30:1 en clair comme 6,31:1 en
   sombre. Le filet suit la même encre, donc il tient aussi les 3:1 de
   WCAG 1.4.11 — et il n'en a pas besoin, le libellé portant seul le sens. */
.a-tag-list__item {
  padding: var(--space-3xs) var(--space-2xs);
  border: var(--rule-ink);
  border-radius: var(--radius-s);
  color: var(--color-ink);
  font-size: var(--step--1);
}
</style>
