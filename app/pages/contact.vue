<script setup lang="ts">
const { siteUrl } = useRuntimeConfig().public

useSeoMeta({
  title: 'Contact — Arnaud Brégère',
  description:
    'Écrire à Arnaud Brégère, développeur front-end Vue 3 / Nuxt, pour un poste de lead ou de senior front-end.',
  ogTitle: 'Contact — Arnaud Brégère',
  ogDescription:
    'Écrire à Arnaud Brégère, développeur front-end Vue 3 / Nuxt, pour un poste de lead ou de senior front-end.',
  ogImage: {
    url: `${siteUrl.replace(/\/$/, '')}/visuels/og/og-contact.png`,
    width: 1200,
    height: 630,
  },
  twitterImage: {
    url: `${siteUrl.replace(/\/$/, '')}/visuels/og/og-contact.png`,
    width: 1200,
    height: 630,
  },
})
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
