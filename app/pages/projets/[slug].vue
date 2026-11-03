<script setup lang="ts">
import { projects } from '~~/content/projects'

const route = useRoute()
const { siteUrl } = useRuntimeConfig().public

const project = projects.find((item) => item.slug === route.params.slug)

/** Une adresse inconnue est une 404, jamais une page vide. */
if (!project) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Projet introuvable',
    fatal: true,
  })
}

useSeoMeta({
  title: `${project.title} — Projet d’Arnaud Brégère`,
  description: project.problem,
})

/**
 * JSON-LD `CreativeWork` : dit à un moteur de recherche que la page décrit une
 * réalisation, et qui l'a faite.
 */
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        abstract: project.problem,
        dateCreated: project.year,
        creator: { '@type': 'Person', name: 'Arnaud Brégère', url: siteUrl },
        keywords: project.stack.join(', '),
        url: `${siteUrl.replace(/\/$/, '')}/projets/${project.slug}`,
      }),
    },
  ],
})
</script>

<template>
  <article class="project">
    <p class="project__back">
      <NuxtLink to="/projets">Retour aux projets</NuxtLink>
    </p>

    <h1>{{ project.title }}</h1>
    <p>{{ project.problem }}</p>

    <p class="project__meta">
      <span>{{ project.year }}</span>
      <span class="project__role">{{ project.role }}</span>
    </p>

    <section class="project__section" aria-labelledby="solution">
      <h2 id="solution">Solution</h2>
      <p>{{ project.solution }}</p>
    </section>

    <section class="project__section" aria-labelledby="resultat">
      <h2 id="resultat">Résultat</h2>
      <p>{{ project.result }}</p>
    </section>

    <section class="project__section" aria-labelledby="stack">
      <h2 id="stack">Stack</h2>
      <p class="project__stack">{{ project.stack.join(' · ') }}</p>
    </section>

    <section v-if="project.links.length" class="project__section" aria-labelledby="liens">
      <h2 id="liens">Liens</h2>
      <ul class="project__links">
        <li v-for="link in project.links" :key="link.url">
          <a :href="link.url" rel="noopener">{{ link.label }}</a>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped lang="scss">
.project__back {
  margin-bottom: var(--space-m);
  font-size: var(--step--1);
}

.project__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  margin-top: var(--space-s);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.project__role::before {
  content: '·';
  margin-right: var(--space-2xs);
}

.project__section {
  max-width: var(--measure);
  margin-top: var(--space-2xl);
  padding-top: var(--space-m);
  border-top: var(--rule-strong);
}

.project__section p {
  margin-top: var(--space-s);
}

.project__stack {
  color: var(--color-fg-muted);
}

.project__links {
  margin-top: var(--space-s);
  padding: 0;
  list-style: none;
}

.project__links li + li {
  margin-top: var(--space-2xs);
}
</style>
