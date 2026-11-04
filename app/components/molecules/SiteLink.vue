<script setup lang="ts">
import { isExternalUrl } from '~/utils/external-url'

/**
 * Lien de texte qui décide lui-même s'il sort du site.
 *
 * Un lien sortant s'ouvre dans un nouvel onglet, porte la flèche `↗` et la
 * mention « nouvel onglet » en texte masqué visuellement. La décision et ses
 * raisons sont dans `DESIGN.md`, § Formes.
 *
 * Un lien de même origine que le site reste un lien ordinaire : la fiche de la
 * calculatrice pointe vers le site lui-même, et un onglet neuf n'y servirait
 * à rien.
 */
const props = withDefaults(
  defineProps<{
    href: string
    /** Valeurs de `rel` à ajouter à `noopener`, séparées par une espace. */
    rel?: string
  }>(),
  { rel: '' },
)

const { siteUrl } = useRuntimeConfig().public

const isExternal = computed(() => isExternalUrl(props.href, siteUrl))

/**
 * `noopener` est toujours posé. Les navigateurs l'appliquent d'office sur une
 * cible `_blank` depuis 2021, mais l'écrire protège les navigateurs anciens et
 * documente l'intention.
 */
const relAttribute = computed(() => [props.rel, 'noopener'].filter(Boolean).join(' '))
</script>

<template>
  <a
    class="m-site-link"
    :href="href"
    :rel="relAttribute"
    :target="isExternal ? '_blank' : undefined"
  >
    <slot />

    <template v-if="isExternal">
      <span class="visually-hidden"> — nouvel onglet</span>
      <span class="m-site-link__marker" aria-hidden="true">↗</span>
    </template>
  </a>
</template>

<style scoped lang="scss">
/* La flèche suit le libellé sur la même ligne de base, un cran plus petite :
   elle signale sans concurrencer le texte. */
.m-site-link__marker {
  margin-left: var(--space-3xs);
  font-size: var(--step--1);
}
</style>
