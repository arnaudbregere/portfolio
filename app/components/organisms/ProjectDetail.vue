<script setup lang="ts">
import type { Project } from '~~/content/types'

/**
 * Corps d'une fiche projet : la même structure pour toutes, qu'elles soient
 * rendues par la route dynamique ou par une page dédiée qui ajoute une démo.
 * Le JSON-LD et les métadonnées restent à la page : ils appartiennent à la
 * route, pas au rendu.
 */
defineProps<{ project: Project }>()

/**
 * L'entrée de page vit dans l'organisme et non dans la page : la page ne rend
 * qu'un `<ProjectDetail>`, tout le DOM est ici. `/projets/calculatrice` en
 * hérite donc sans rien faire, puisqu'elle passe par le même composant.
 */
const root = ref<HTMLElement | null>(null)

useRevealCascade(root)
</script>

<template>
  <article ref="root" class="o-project">
    <p class="o-project__back">
      <SiteLink href="/projets">Retour aux projets</SiteLink>
    </p>

    <h1>{{ project.title }}</h1>
    <p>{{ project.problem }}</p>

    <p class="o-project__meta">
      <span>{{ project.year }}</span>
      <span class="o-project__role">{{ project.role }}</span>
    </p>

    <!-- Démo jouable, quand la page en fournit une. -->
    <div v-if="$slots.default" class="o-project__demo">
      <slot />
    </div>

    <section
      v-if="project.images?.length"
      class="o-project__section"
      aria-labelledby="apercu"
      data-reveal-section
    >
      <h2 id="apercu" data-reveal-item>Aperçu</h2>

      <!-- Toutes les captures sur la page : rien derrière une flèche ou un
           clic. La preuve se lit au défilement. -->
      <figure
        v-for="image in project.images"
        :key="image.src"
        class="o-project__figure"
        data-reveal-item
      >
        <!-- Pas de `sizes` : les fichiers sont déjà bornés à 1440 px et
             pèsent moins de 100 Ko. Un `srcset` ajouterait des variantes
             inutiles. `densities="1"` écarte la variante 2x, qui ne ferait
             qu'agrandir une source déjà bornée à 1440 px. -->
        <NuxtImg
          class="o-project__image"
          :src="image.src"
          :alt="image.alt"
          :width="image.width"
          :height="image.height"
          densities="1"
          loading="lazy"
        />
        <figcaption>{{ image.caption }}</figcaption>
      </figure>
    </section>

    <section class="o-project__section" aria-labelledby="solution" data-reveal-section>
      <h2 id="solution" data-reveal-item>Solution</h2>
      <p data-reveal-item>{{ project.solution }}</p>
    </section>

    <section class="o-project__section" aria-labelledby="resultat" data-reveal-section>
      <h2 id="resultat" data-reveal-item>Résultat</h2>
      <p data-reveal-item>{{ project.result }}</p>
    </section>

    <section class="o-project__section" aria-labelledby="stack" data-reveal-section>
      <h2 id="stack" data-reveal-item>Stack</h2>
      <p class="o-project__stack" data-reveal-item>{{ project.stack.join(' · ') }}</p>
    </section>

    <section
      v-if="project.links.length"
      class="o-project__section"
      aria-labelledby="liens"
      data-reveal-section
    >
      <h2 id="liens" data-reveal-item>Liens</h2>
      <ul class="o-project__links">
        <li v-for="link in project.links" :key="link.url" data-reveal-item>
          <SiteLink :href="link.url">{{ link.label }}</SiteLink>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped lang="scss">
/* -- Tête de fiche --------------------------------------------------------
   La figure partagée vit dans `app/styles/_motion.scss`. Ne restent ici que
   les délais fixes de cette tête : elle n'est pas une rubrique, donc
   `useRevealCascade` ne la classe pas et ne lui pose aucun délai.

   La démo entre comme **un bloc**, et non comme une rubrique : une
   calculatrice dont les touches apparaîtraient une à une serait du décor. Elle
   reste utilisable pendant l'entrée, `opacity` et `translate` n'interceptant
   aucun clic.

   Propriétés longues et non le raccourci `animation` : un `var()` dans le
   raccourci met tous ses longhands en substitution différée. */
.o-project__back,
.o-project h1,
.o-project h1 + p,
.o-project__meta,
.o-project__demo {
  animation-name: page-entry;
  animation-duration: var(--dur-slow);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: backwards;
}

/* 140 ms d'écart, comme les têtes de `/`, `/projets` et `/contact`. */
.o-project h1 {
  animation-delay: 140ms;
}

.o-project h1 + p {
  animation-delay: 280ms;
}

.o-project__meta {
  animation-delay: 420ms;
}

.o-project__demo {
  animation-delay: 560ms;
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, la tête de fiche resterait vide le temps de la cascade.
   Les lignes marquées `data-reveal-item` sont remises à zéro par
   `_motion.scss`. */
@media (prefers-reduced-motion: reduce) {
  .o-project h1,
  .o-project h1 + p,
  .o-project__meta,
  .o-project__demo {
    animation-delay: 0ms !important;
  }
}

.o-project__back {
  margin-bottom: var(--space-m);
  font-size: var(--step--1);
}

.o-project__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  margin-top: var(--space-s);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.o-project__role::before {
  content: '·';
  margin-right: var(--space-2xs);
}

.o-project__demo {
  margin-top: var(--space-l);
}

.o-project__section {
  max-width: var(--measure);
  margin-top: var(--space-2xl);
  padding-top: var(--space-m);
  border-top: var(--rule-strong);
}

.o-project__section p {
  margin-top: var(--space-s);
}

.o-project__figure {
  margin: var(--space-l) 0 0;
}

.o-project__image {
  display: block;
  width: 100%;
  height: auto;
  border: var(--rule);
}

.o-project__figure figcaption {
  margin-top: var(--space-2xs);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.o-project__stack {
  color: var(--color-fg-muted);
}

.o-project__links {
  margin-top: var(--space-s);
  padding: 0;
  list-style: none;
}

.o-project__links li + li {
  margin-top: var(--space-2xs);
}
</style>
