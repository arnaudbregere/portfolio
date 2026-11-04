<script setup lang="ts">
import { cvFile, experiences, profile } from '~~/content/cv'
import { siteNav } from '~~/content/nav'
import { projects } from '~~/content/projects'

const { siteUrl } = useRuntimeConfig().public

useSeoMeta({
  title: 'Arnaud Brégère — Développeur front-end senior',
  description:
    'Développeur front-end senior, Vue 3 et Nuxt, six ans chez Figaro Classifieds. Migration, performance, référencement et accessibilité. CV et contact.',
  ogTitle: 'Arnaud Brégère — Développeur front-end senior',
  ogDescription:
    'Développeur front-end senior, Vue 3 et Nuxt, six ans chez Figaro Classifieds. Migration, performance, référencement et accessibilité. CV et contact.',
  ogImage: {
    url: `${siteUrl.replace(/\/$/, '')}/visuels/og/og-accueil.png`,
    width: 1200,
    height: 630,
  },
  twitterImage: {
    url: `${siteUrl.replace(/\/$/, '')}/visuels/og/og-accueil.png`,
    width: 1200,
    height: 630,
  },
})

/**
 * L'ancienneté se calcule, elle ne se recopie pas : une année écrite en dur
 * devient fausse au premier janvier suivant.
 */
const firstFrontEndRole = '2019-10'
const yearsOfFrontEnd = computed(() => {
  const start = new Date(`${firstFrontEndRole}-01T00:00:00Z`)
  const months =
    (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25 / 12)
  return Math.floor(months / 12)
})

const currentRole = experiences[0]!
const contact = siteNav.find((item) => item.to === '/contact')!

/**
 * Les projets mis en avant, dans l'ordre d'affiche de `content/projects.ts` :
 * `DESIGN.md` pose que l'ordre est la hiérarchie. `PRODUCT.md` en fixe le
 * nombre à deux depuis le 04/11/2026.
 */
const featuredProjects = projects.filter((project) => project.featured)
</script>

<template>
  <article class="home">
    <h1 class="home__name">{{ profile.name }}</h1>
    <p class="home__tagline">{{ profile.tagline }}</p>

    <p class="home__pitch">
      {{ profile.role }}. {{ yearsOfFrontEnd }} ans de Vue et de Nuxt chez
      {{ currentRole.company }}, sur
      {{ currentRole.summary.toLocaleLowerCase('fr-FR') }}
    </p>

    <p class="home__download">
      <CvLink :href="cvFile.path" :format="cvFile.format" :size-kb="cvFile.sizeKb" />
    </p>

    <section class="home__section" aria-labelledby="projets">
      <h2 id="projets">Projets</h2>

      <!-- Une liste à filets, pas une grille de cartes égales : le rang se lit
           dans l'ordre et dans la taille du texte (`DESIGN.md`, § Formes). -->
      <ol class="home__projects">
        <li v-for="project in featuredProjects" :key="project.slug" class="home__project">
          <h3 class="home__project-title">
            <SiteLink class="home__project-link" :href="`/projets/${project.slug}`">
              {{ project.title }}
            </SiteLink>
          </h3>

          <p class="home__project-year">{{ project.year }}</p>
          <p class="home__project-problem">{{ project.problem }}</p>
        </li>
      </ol>

      <p class="home__actions">
        <NuxtLink class="home__action" to="/projets">Tous les projets</NuxtLink>
      </p>
    </section>

    <section class="home__section" aria-labelledby="reperes">
      <h2 id="reperes">Repères</h2>

      <dl class="home__facts">
        <div class="home__fact">
          <dt>Expérience front-end</dt>
          <dd>{{ yearsOfFrontEnd }} ans</dd>
        </div>
        <div class="home__fact">
          <dt>Dans le métier depuis</dt>
          <dd>2009</dd>
        </div>
        <div class="home__fact">
          <dt>Terrain</dt>
          <dd>Figaro Classifieds, Groupe La Poste, BrandAlley, RueDuCommerce</dd>
        </div>
        <div class="home__fact">
          <dt>Socle</dt>
          <dd>Vue 3, Nuxt, TypeScript, accessibilité RGAA, référencement</dd>
        </div>
      </dl>
    </section>

    <section class="home__section" aria-labelledby="joindre">
      <h2 id="joindre">{{ profile.availability }}</h2>

      <p class="home__pitch">
        Le plus simple est le formulaire ; l’e-mail direct marche aussi.
      </p>

      <p class="home__actions">
        <NuxtLink class="home__action" :to="contact.to">{{ contact.label }}</NuxtLink>
        <a class="home__action" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
      </p>
    </section>
  </article>
</template>

<style scoped lang="scss">
@use '../styles/breakpoints' as bp;

/* Le nom est le seul élément à sortir de l'échelle de texte courante : il
   ouvre la page et rien d'autre ne le concurrence. */
.home__name {
  font-size: var(--step-6);
  line-height: 1;
}

.home__tagline {
  max-width: var(--measure);
  margin-top: var(--space-m);
  color: var(--color-fg-muted);
  font-size: var(--step-2);
}

.home__pitch {
  max-width: var(--measure);
  margin-top: var(--space-m);
}

.home__download {
  margin-top: var(--space-l);
}

.home__section {
  margin-top: var(--space-2xl);
  padding-top: var(--space-m);
  border-top: var(--rule-strong);
}

.home__projects {
  margin: var(--space-m) 0 0;
  padding: 0;
  list-style: none;
}

.home__project {
  max-width: var(--measure);
  padding-top: var(--space-s);
  border-top: var(--rule);
}

.home__project + .home__project {
  margin-top: var(--space-l);
}

.home__project-title {
  margin: 0;
  font-size: var(--step-2);
}

.home__project-link {
  color: inherit;
}

.home__project-year {
  margin-top: var(--space-3xs);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.home__project-problem {
  margin-top: var(--space-s);
}

.home__facts {
  margin: 0;
}

/* Un repère par ligne, séparé par un filet : la liste se lit en diagonale
   sans devenir une grille de cartes. */
.home__fact {
  display: grid;
  gap: var(--space-3xs);
  padding: var(--space-s) 0;
  border-bottom: var(--rule);
}

.home__fact dt {
  color: var(--color-fg-muted);
  font-size: var(--step--1);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.home__fact dd {
  margin: 0;
  font-size: var(--step-1);
}

.home__fact {
  @include bp.respond-up(m) {
    grid-template-columns: 16rem 1fr;
    gap: var(--space-m);
    align-items: baseline;
  }
}

.home__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s);
  margin-top: var(--space-m);
}

.home__action {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: var(--space-2xs) var(--space-s);
  border: var(--rule-strong);
  color: var(--color-fg);
  text-decoration: none;
}

.home__action:hover {
  background-color: var(--color-fg);
  color: var(--color-bg);
}
</style>
