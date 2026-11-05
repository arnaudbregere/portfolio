<script setup lang="ts">
import { projects } from '~~/content/projects'
import { absoluteUrl, pageSeoMeta } from '~/utils/page-seo'

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

useSeoMeta(
  pageSeoMeta({
    title: `${project.title} — Projet d’Arnaud Brégère`,
    description: project.problem,
    type: 'article',
    image: project.ogImage ? absoluteUrl(project.ogImage, siteUrl) : undefined,
    imageAlt: `${project.title}, projet d’Arnaud Brégère`,
  }),
)

useProjectJsonLd(project, siteUrl)
</script>

<template>
  <ProjectDetail :project="project" />
</template>
