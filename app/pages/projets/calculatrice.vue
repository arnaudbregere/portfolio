<script setup lang="ts">
import { projects } from '~~/content/projects'
import { pageSeoMeta } from '~/utils/page-seo'

/**
 * Fiche de la calculatrice, démo comprise. La route statique l'emporte sur
 * `[slug].vue` : c'est ce qui permet d'ajouter la démo sans dérouter le reste.
 */
const { siteUrl } = useRuntimeConfig().public

const project = projects.find((item) => item.slug === 'calculatrice')!

useSeoMeta(
  pageSeoMeta({
    title: `${project.title} — Projet d’Arnaud Brégère`,
    description: project.problem,
    type: 'article',
  }),
)

useProjectJsonLd(project, siteUrl)
</script>

<template>
  <ProjectDetail :project="project">
    <Calculator />
  </ProjectDetail>
</template>
