<script setup lang="ts">
import { isExternalUrl } from '~/utils/external-url'

/**
 * Le lien de texte du site. Tout lien de libellé passe par lui.
 *
 * Il décide de sa nature à partir de son `href` : une adresse de même origine
 * que le site rend un `NuxtLink`, qui navigue sans recharger la page ; une
 * adresse d'une autre origine rend un `<a>` qui ouvre un nouvel onglet, porte
 * la flèche `↗` et annonce l'onglet au lecteur d'écran.
 *
 * Le soulignement vit ici et nulle part ailleurs : c'est une propriété du lien,
 * pas de la page qui l'affiche. `DESIGN.md`, § Mouvement, porte la décision.
 *
 * Restent hors de ce composant les adresses qui ne naviguent pas — `mailto:`,
 * `tel:` — et le téléchargement du CV, que `CvLink` traite avec son poids et
 * son format.
 */
const props = withDefaults(
  defineProps<{
    href: string
    /** Valeurs de `rel` à ajouter à `noopener` sur un lien sortant. */
    rel?: string
  }>(),
  { rel: '' },
)

const { siteUrl } = useRuntimeConfig().public

const isExternal = computed(() => isExternalUrl(props.href, siteUrl))

/**
 * `noopener` est toujours posé. Les navigateurs l'appliquent d'office sur une
 * cible `_blank` depuis 2021, mais l'écrire protège les versions anciennes et
 * documente l'intention.
 */
const relAttribute = computed(() => [props.rel, 'noopener'].filter(Boolean).join(' '))
</script>

<template>
  <NuxtLink v-if="!isExternal" class="m-site-link" :to="href">
    <slot />
  </NuxtLink>

  <a v-else class="m-site-link" :href="href" :rel="relAttribute" target="_blank">
    <slot />
    <span class="visually-hidden"> — nouvel onglet</span>
    <span class="m-site-link__marker" aria-hidden="true">↗</span>
  </a>
</template>

<style scoped lang="scss">
/* Le trait est toujours posé, en transparent ; le survol et le focus le
   ramènent à l'encre courante. La transition porte sur une couleur et non sur
   l'apparition d'un trait : rien ne se décale, la hauteur de ligne ne bouge
   pas, et `_reset.scss` la neutralise déjà sous `prefers-reduced-motion`. */
.m-site-link {
  text-decoration-color: transparent;
  transition: text-decoration-color var(--dur-fast) var(--ease-out);

  &:hover,
  &:focus-visible {
    text-decoration-color: currentColor;
  }
}

/* La flèche suit le libellé sur la même ligne de base, un cran plus petite :
   elle signale sans concurrencer le texte. */
.m-site-link__marker {
  margin-left: var(--space-3xs);
  font-size: var(--step--1);
}
</style>
