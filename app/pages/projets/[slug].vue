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
  ogTitle: `${project.title} — Projet d’Arnaud Brégère`,
  ogDescription: project.problem,
  ogImage: {
    url: `${siteUrl.replace(/\/$/, '')}/visuels/og/og-projet.png`,
    width: 1200,
    height: 630,
  },
  twitterImage: {
    url: `${siteUrl.replace(/\/$/, '')}/visuels/og/og-projet.png`,
    width: 1200,
    height: 630,
  },
})

useProjectJsonLd(project, siteUrl)
</script>

<template>
  <ProjectDetail :project="project" />
</template>
