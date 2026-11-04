<script setup lang="ts">
import { projects } from '~~/content/projects'

useSeoMeta({
  title: 'Projets — Arnaud Brégère',
  description:
    'Projets d’Arnaud Brégère, développeur front-end senior : problème, solution et résultat mesuré pour chacun.',
})
</script>

<template>
  <article class="projects">
    <h1>Projets</h1>
    <p>
      Chaque fiche dit le problème traité, la solution retenue et le résultat
      mesuré. Pas de capture d’interface sous accord de confidentialité.
    </p>

    <ol class="projects__list">
      <li v-for="project in projects" :key="project.slug" class="projects__item">
        <h2 class="projects__title">
          <NuxtLink class="projects__link" :to="`/projets/${project.slug}`">
            {{ project.title }}
          </NuxtLink>
        </h2>

        <p class="projects__meta">
          <span>{{ project.year }}</span>
          <span class="projects__role">{{ project.role }}</span>
        </p>

        <p class="projects__problem">{{ project.problem }}</p>
        <p class="projects__stack">{{ project.stack.join(' · ') }}</p>
      </li>
    </ol>
  </article>
</template>

<style scoped lang="scss">
.projects__list {
  margin: var(--space-2xl) 0 0;
  padding: 0;
  list-style: none;
}

/* La grille reste une liste : le rang se lit dans l'ordre et la taille du
   texte, pas dans des cartes de même poids. */
.projects__item {
  max-width: var(--measure);
  padding-top: var(--space-m);
  border-top: var(--rule-strong);
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
  text-decoration: none;
}

.projects__link:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
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
