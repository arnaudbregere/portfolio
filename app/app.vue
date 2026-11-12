<script setup lang="ts">
import { profile } from '~~/content/cv'
import { profileLinks } from '~~/content/nav'
import { telHref } from '~/utils/contact'
import { jsonLdScript } from '~/utils/json-ld'
import { absoluteUrl } from '~/utils/page-seo'

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
  jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    // Au format international, celui qu'attend schema.org — le même que
    // l'attribut `href` des liens `tel:`, dont il réutilise la fabrique.
    // Posé le 12/11/2026 (issue #53) : le numéro paraît désormais sur
    // l'accueil comme sur `/contact`, la donnée structurée doit le dire.
    telephone: telHref(profile.phone).replace('tel:', ''),
    url: siteUrl,
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
    sameAs: profileLinks.map((link) => link.to),
  }),
)

useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [{ type: 'application/ld+json', innerHTML: personJsonLd }],
})

/**
 * Image de partage du site, reprise par toute page qui n'en pose pas une.
 * Une fiche projet la remplace par la sienne (`content/projects.ts`).
 */
const shareImage = computed(() => absoluteUrl('/og/arnaud-bregere.png', siteUrl))

useSeoMeta({
  ogType: 'website',
  ogUrl: canonical,
  ogLocale: 'fr_FR',
  ogSiteName: profile.name,
  ogImage: shareImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/png',
  ogImageAlt: `${profile.name}, ${profile.role.toLowerCase()}`,
  // Toutes les images de partage font 1200 × 630 : la grande carte est leur
  // format, la vignette carrée les rognerait.
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
