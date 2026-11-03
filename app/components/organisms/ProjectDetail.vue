<script setup lang="ts">
import type { Project } from '~~/content/types'

/**
 * Corps d'une fiche projet : la même structure pour toutes, qu'elles soient
 * rendues par la route dynamique ou par une page dédiée qui ajoute une démo.
 * Le JSON-LD et les métadonnées restent à la page : ils appartiennent à la
 * route, pas au rendu.
 */
defineProps<{ project: Project }>()
</script>

<template>
  <article class="o-project">
    <p class="o-project__back">
      <NuxtLink to="/projets">Retour aux projets</NuxtLink>
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

    <section class="o-project__section" aria-labelledby="solution">
      <h2 id="solution">Solution</h2>
      <p>{{ project.solution }}</p>
    </section>

    <section class="o-project__section" aria-labelledby="resultat">
      <h2 id="resultat">Résultat</h2>
      <p>{{ project.result }}</p>
    </section>

    <section class="o-project__section" aria-labelledby="stack">
      <h2 id="stack">Stack</h2>
      <p class="o-project__stack">{{ project.stack.join(' · ') }}</p>
    </section>

    <section v-if="project.links.length" class="o-project__section" aria-labelledby="liens">
      <h2 id="liens">Liens</h2>
      <ul class="o-project__links">
        <li v-for="link in project.links" :key="link.url">
          <a :href="link.url" rel="noopener">{{ link.label }}</a>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped lang="scss">
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
