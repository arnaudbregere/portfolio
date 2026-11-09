<script setup lang="ts">
import { projects } from '~~/content/projects'
import { pageSeoMeta } from '~/utils/page-seo'

const root = ref<HTMLElement | null>(null)

useRevealCascade(root)

useSeoMeta(
  pageSeoMeta({
    title: 'Projets — Arnaud Brégère',
    description:
      'Projets d’Arnaud Brégère, développeur front-end senior : problème, solution et résultat mesuré pour chacun.',
  }),
)
</script>

<template>
  <article ref="root" class="projects">
    <h1>Projets</h1>
    <p>
      Chaque fiche dit le problème traité, la solution retenue et le résultat
      mesuré. Pas de capture d’interface sous accord de confidentialité.
    </p>

    <ol class="projects__list">
      <!-- Un projet est une rubrique, et non la liste entière : la cascade
           d'une liste qui s'allonge ferait attendre son dernier élément
           plusieurs secondes après un déclenchement décidé en haut de page.
           Ce découpage tient quel que soit le nombre de projets. -->
      <li
        v-for="project in projects"
        :key="project.slug"
        class="projects__item"
        data-reveal-section
      >
        <h2 class="projects__title" data-reveal-item>
          <SiteLink class="projects__link" :href="`/projets/${project.slug}`">
            {{ project.title }}
          </SiteLink>
        </h2>

        <p class="projects__meta" data-reveal-item>
          <span>{{ project.year }}</span>
          <span class="projects__role">{{ project.role }}</span>
        </p>

        <p class="projects__problem" data-reveal-item>{{ project.problem }}</p>
        <p class="projects__stack" data-reveal-item>{{ project.stack.join(' · ') }}</p>
      </li>
    </ol>
  </article>
</template>

<style scoped lang="scss">
/* -- Tête de page ---------------------------------------------------------
   La figure partagée vit dans `app/styles/_motion.scss`. Ne restent ici que
   les délais fixes de cette tête : elle n'est pas une rubrique, donc
   `useRevealCascade` ne la classe pas et ne lui pose aucun délai.

   Propriétés longues et non le raccourci `animation` : un `var()` dans le
   raccourci met tous ses longhands en substitution différée. */
.projects h1,
.projects h1 + p {
  animation-name: page-entry;
  animation-duration: var(--dur-slow);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: backwards;
}

/* 140 ms d'écart, comme les têtes de `/` et de `/contact`. */
.projects h1 + p {
  animation-delay: 140ms;
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, le chapô resterait vide le temps de la cascade. Les
   lignes marquées `data-reveal-item` sont remises à zéro par `_motion.scss`. */
@media (prefers-reduced-motion: reduce) {
  .projects h1 + p {
    animation-delay: 0ms !important;
  }
}

.projects__list {
  margin: var(--space-2xl) 0 0;
  padding: 0;
  list-style: none;
  counter-reset: project;
}

/* La grille reste une liste : le rang se lit dans l'ordre et la taille du
   texte, pas dans des cartes de même poids. */
.projects__item {
  max-width: var(--measure);
  padding-top: var(--space-m);
  border-top: var(--rule-strong);
  counter-increment: project;
}

/* Figure numérotée, décidée dans `DESIGN.md` § 5 : deux chiffres en encre
   atténuée, chiffres tabulaires. Le rang vient du compteur, donc aucun
   gabarit ne l'écrit et un projet inséré ne renumérote rien à la main.

   La règle est recopiée depuis `/a-propos` plutôt que mise en commun : elle
   est scopable, et `frontend.md` ne sort du scope que ce qui ne peut pas y
   tenir. `DESIGN.md` reste la source de la décision. */
.projects__title::before {
  content: counter(project, decimal-leading-zero);
  margin-right: var(--space-2xs);
  color: var(--color-fg-muted);
  font-size: var(--size-label);
  font-stretch: normal;
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--tracking-label);
}

.projects__item + .projects__item {
  margin-top: var(--space-xl);
}

.projects__title {
  margin: 0;
  font-size: var(--step-3);
}

.projects__link {
  color: inherit;
}

.projects__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  margin-top: var(--space-3xs);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.projects__role::before {
  content: '·';
  margin-right: var(--space-2xs);
}

.projects__problem {
  margin-top: var(--space-s);
}

.projects__stack {
  margin-top: var(--space-s);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}
</style>
