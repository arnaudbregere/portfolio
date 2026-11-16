<script setup lang="ts">
import type { NuxtError } from '#app'
import { siteNav } from '~~/content/nav'
import { pageSeoMeta } from '~/utils/page-seo'

/**
 * La page d'erreur du site (issue #71).
 *
 * Avant elle, Nitro répondait au chemin inconnu par son objet JSON par
 * défaut : un recruteur qui suivait un lien périmé recevait
 * `{"error":true,"statusCode":404,…}` en pleine page. Le code HTTP était
 * juste, la réponse rendue ne l'était pas.
 *
 * `error.vue` remplace `app.vue` et non une page : il pose donc lui-même son
 * `NuxtLayout`, sans quoi il s'afficherait sans en-tête ni pied de page. Le
 * revers est qu'il n'hérite d'aucune des balises d'`app.vue` — canonique,
 * JSON-LD `Person`, image de partage. C'est sans conséquence : la page ne
 * doit pas être indexée, et elle le dit.
 */
const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

/**
 * Le titre en deux parties : la seconde porte l'encre, comme le prénom du
 * titre de l'accueil. Couper plutôt que colorer une portion de chaîne en
 * template — le texte reste lisible dans le fichier, et le nom accessible du
 * titre reste la phrase entière.
 */
const heading = computed(() =>
  isNotFound.value
    ? { lead: 'Cette page', accent: 'n’existe pas' }
    : { lead: 'Le site a rencontré', accent: 'une erreur' },
)

/**
 * Le message ne reprend **rien** de l'erreur reçue : ni son `message`, ni son
 * `statusMessage`, ni le chemin demandé. `.claude/rules/backend.md` l'impose
 * pour les réponses d'erreur du serveur, et la raison vaut autant ici —
 * `statusMessage` vient de Nitro et porte le chemin tel qu'il a été reçu.
 *
 * Il ne redit pas non plus le libellé du contrôle qui suit. Une page
 * d'erreur a deux phrases à dire : ce qui s'est passé, qui est dans le
 * titre, et que ce n'est pas grave, qui est ici. L'invitation à repartir
 * appartient au contrôle, pas au texte.
 */
const message = computed(() =>
  isNotFound.value
    ? 'Elle a peut-être été déplacée ou supprimée.'
    : 'Les autres pages du site restent accessibles.',
)

/**
 * Le titre suit le code reçu : `pageSeoMeta` prend des chaînes, et le calcul
 * se fait donc avant l'appel, dans un `computed`.
 */
const pageTitle = computed(
  () => `${heading.value.lead} ${heading.value.accent} — Arnaud Brégère`,
)

useSeoMeta({
  ...pageSeoMeta({
    title: pageTitle.value,
    description:
      'Page d’erreur du portfolio d’Arnaud Brégère, développeur front-end senior. Les quatre rubriques du site y restent accessibles.',
  }),
  // Une page d'erreur n'a rien à faire dans un index : elle n'a pas de
  // contenu propre, et elle répond à autant d'adresses qu'il existe de
  // fautes de frappe.
  robots: 'noindex, follow',
})

/**
 * `clearError` et non un `NuxtLink` nu : l'état d'erreur survit à une
 * navigation côté client, et la page suivante s'afficherait sous lui.
 *
 * Le lien reste un lien — `href` présent, clic du milieu et « ouvrir dans un
 * nouvel onglet » intacts. Seul le clic principal est intercepté, pour
 * vider l'erreur avant de naviguer.
 */
const leaveError = (to: string) => clearError({ redirect: to })

/** L'accueil, tel que `content/nav.ts` le déclare — jamais un `'/'` recopié. */
const home = siteNav[0]!
</script>

<template>
  <NuxtLayout>
    <article class="error">
      <p class="error__code">Erreur {{ error.statusCode }}</p>

      <h1 class="error__heading">
        {{ heading.lead }} <span class="error__accent">{{ heading.accent }}</span>
      </h1>

      <p class="error__message">{{ message }}</p>

      <!-- Une seule sortie, et c'est l'accueil. Les quatre rubriques étaient
           listées ici jusqu'au 16/11/2026 : l'en-tête et le pied de page les
           portent déjà, des deux côtés de cette page. Les redonner au milieu
           les disait trois fois. -->
      <p class="error__actions">
        <NuxtLink class="error__home" :to="home.to" @click.prevent="leaveError(home.to)">
          Retour à l’accueil
        </NuxtLink>
      </p>
    </article>
  </NuxtLayout>
</template>

<style scoped lang="scss">
/* La figure d'entrée partagée, à la cadence des autres têtes de page : le
   code, le titre, le message, puis les rubriques, à 140 ms d'écart
   (`DESIGN.md` § 7).

   Propriétés longues et non le raccourci `animation` : un `var()` dans le
   raccourci met tous ses longhands en substitution différée. */
.error__code,
.error__heading,
.error__message,
.error__actions {
  animation-name: page-entry;
  animation-duration: var(--dur-slow);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: backwards;
}

.error__heading {
  animation-delay: 140ms;
}

.error__message {
  animation-delay: 280ms;
}

.error__actions {
  animation-delay: 420ms;
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, la page resterait vide le temps de la cascade. */
@media (prefers-reduced-motion: reduce) {
  .error__code,
  .error__heading,
  .error__message,
  .error__actions {
    animation-delay: 0ms !important;
  }
}

/* Le code en libellé, au-dessus du titre : la forme des `dt` de l'accueil et
   des légendes de figure. Il nomme ce qui s'est passé sans le crier, et le
   titre porte la phrase. */
.error__code {
  color: var(--color-fg-muted);
  font-size: var(--step--1);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.error__heading {
  margin-top: var(--space-2xs);
  max-width: var(--measure);
}

/* L'encre d'annotation, et non le rose fixe du prénom de l'accueil
   (`--color-logo-ink`). Les deux se confondent en thème sombre — `#ff5c72`
   de part et d'autre —, et le papier clair les sépare : le rose fixe n'y
   tient que 2,72:1 quand `--color-ink` tient ses 4,5:1 (`DESIGN.md` § 2).
   L'écart du prénom est assumé et nominatif ; l'étendre à une seconde page
   ferait de l'exception une règle. */
.error__accent {
  color: var(--color-ink);
}

.error__message {
  margin-top: var(--space-m);
  max-width: var(--measure);
  font-size: var(--step-1);
}

/* Le retour à l'accueil en contrôle à filet, comme les appels de fin de page
   de l'accueil : rectangle, jamais de pilule (`DESIGN.md` § 5).

   Un lien et non un `<button>` : il mène quelque part. Le clic principal est
   intercepté pour vider l'erreur, le reste du comportement d'un lien est
   intact — `href` posé, clic du milieu, « ouvrir dans un nouvel onglet ». */
.error__actions {
  margin-top: var(--space-l);
}

.error__home {
  display: inline-flex;
  align-items: center;
  min-height: var(--control-min-height);
  padding: var(--space-2xs) var(--space-s);
  border: var(--rule-strong);
  color: var(--color-fg);
  text-decoration: none;
}

.error__home:hover {
  background-color: var(--color-fg);
  color: var(--color-bg);
}
</style>
