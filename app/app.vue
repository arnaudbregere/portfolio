<script setup lang="ts">
import { profile } from '~~/content/cv'
import { profileLinks } from '~~/content/nav'

const route = useRoute()
const { siteUrl } = useRuntimeConfig().public

/** Sans barre oblique finale, sauf la racine : une seule URL par page. */
const canonical = computed(() => {
  const path = route.path === '/' ? '/' : route.path.replace(/\/$/, '')
  return `${siteUrl.replace(/\/$/, '')}${path}`
})

/**
 * JSON-LD `Person`, posé une fois pour tout le site. Il dit à un moteur de
 * recherche qui est l'auteur du site et où le retrouver ailleurs — ce qu'aucune
 * balise `meta` n'exprime.
 */
const personJsonLd = computed(() =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    url: siteUrl,
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
    sameAs: profileLinks.map((link) => link.to),
  }),
)

useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [{ type: 'application/ld+json', innerHTML: personJsonLd }],
})

useSeoMeta({
  ogType: 'website',
  ogUrl: canonical,
  ogLocale: 'fr_FR',
  ogSiteName: profile.name,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
