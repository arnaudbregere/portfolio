<script setup lang="ts">
import { projects } from '~~/content/projects'

/**
 * Fiche de la calculatrice, démo comprise. La route statique l'emporte sur
 * `[slug].vue` : c'est ce qui permet d'ajouter la démo sans dérouter le reste.
 */
const { siteUrl } = useRuntimeConfig().public

const project = projects.find((item) => item.slug === 'calculatrice')!

useSeoMeta({
  title: `${project.title} — Projet d’Arnaud Brégère`,
  description: project.problem,
})

useProjectJsonLd(project, siteUrl)
</script>

<template>
  <ProjectDetail :project="project">
    <Calculator />
  </ProjectDetail>
</template>
