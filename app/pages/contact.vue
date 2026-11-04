<script setup lang="ts">
import { pageSeoMeta } from '~/utils/page-seo'

useSeoMeta(
  pageSeoMeta({
    title: 'Contact — Arnaud Brégère',
    description:
      'Écrire à Arnaud Brégère, développeur front-end Vue 3 / Nuxt, pour un poste de lead ou de senior front-end.',
  }),
)
</script>

<template>
  <article>
    <h1>Contact</h1>
    <p>
      Pour un poste de lead ou de senior front-end, une mission, ou simplement
      une question sur la façon dont ce site est construit.
    </p>
  </article>
</template>
