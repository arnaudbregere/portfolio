<script setup lang="ts">
import { cvFile, education, experiences, profile, skillGroups } from '~~/content/cv'
import { telHref } from '~/utils/contact'
import { pageSeoMeta } from '~/utils/page-seo'
import { formatPeriod } from '~/utils/period'

useSeoMeta(
  pageSeoMeta({
    title: 'À propos — Arnaud Brégère',
    description:
      'Parcours d’Arnaud Brégère, développeur front-end senior : six ans de Vue et Nuxt chez Figaro Classifieds, une formation en arts graphiques, et le CV en téléchargement.',
  }),
)

const [standfirst, ...rest] = profile.intro

const root = ref<HTMLElement | null>(null)

useRevealCascade(root)
</script>

<template>
  <article ref="root" class="about">
    <h1>À propos</h1>
    <p>{{ standfirst }}</p>

    <p v-for="paragraph in rest" :key="paragraph" class="about__intro">
      {{ paragraph }}
    </p>

    <p class="about__download">
      <CvLink :href="cvFile.path" :format="cvFile.format" :size-kb="cvFile.sizeKb" />
    </p>

    <section class="about__section" aria-labelledby="experiences">
      <!-- Le titre est une rubrique d'une seule ligne : il se classe sur son
           propre `top`, puisque la liste qui le suit est découpée en rubriques
           et ne peut pas l'accueillir. -->
      <!-- Le libellé reste sur la même ligne que la balise : un retour à la
           ligne ici se rend comme une espace entre le rang et le titre, et
           creuse l'écart de la largeur d'un espace du titre. -->
      <h2 id="experiences" data-reveal-section data-reveal-item>Expériences professionnelles</h2>

      <ol class="about__list">
        <!-- Une expérience = une rubrique. Prises ensemble elles feraient
             2296 px de haut, et une rubrique se classe sur son `top` seul :
             les quatre dernières joueraient leur entrée hors écran. -->
        <li
          v-for="job in experiences"
          :key="`${job.company}-${job.start}`"
          class="about__item"
          data-reveal-section
        >
          <h3 class="about__role" data-reveal-item>
            {{ job.role }}<span class="about__company">, {{ job.company }}</span>
          </h3>

          <p class="about__meta" data-reveal-item>
            <time :datetime="job.start">{{ formatPeriod(job.start, job.end) }}</time>
            <span class="about__place">{{ job.location }}</span>
          </p>

          <p class="about__summary" data-reveal-item>{{ job.summary }}</p>

          <!-- Les missions entrent en un bloc : une ligne par mission
               découperait une énumération qui se lit d'un seul tenant. -->
          <ul class="about__missions" data-reveal-item>
            <li v-for="mission in job.missions" :key="mission">{{ mission }}</li>
          </ul>

          <p class="about__stack" data-reveal-item>{{ job.stack.join(' · ') }}</p>
        </li>
      </ol>
    </section>

    <section class="about__section" aria-labelledby="competences" data-reveal-section>
      <h2 id="competences" data-reveal-item>Compétences</h2>

      <dl class="about__skills">
        <!-- Le `<div>` groupe le couple : un `dt` et son `dd` sont deux frères
             dont aucun ne contient l'autre, donc aucun ne peut porter la ligne
             à lui seul. HTML l'autorise explicitement dans un `<dl>`. -->
        <div v-for="group in skillGroups" :key="group.title" data-reveal-item>
          <dt>{{ group.title }}</dt>
          <dd>{{ group.skills.join(' · ') }}</dd>
        </div>
      </dl>
    </section>

    <section class="about__section" aria-labelledby="formation">
      <h2 id="formation" data-reveal-section data-reveal-item>Formation</h2>

      <ol class="about__list">
        <li v-for="course in education" :key="course.title" class="about__item" data-reveal-section>
          <h3 class="about__role" data-reveal-item>{{ course.title }}</h3>

          <p class="about__meta" data-reveal-item>
            <span>{{ course.school }}</span>
            <span class="about__place">{{ course.year }}</span>
          </p>

          <p v-if="course.result" class="about__summary" data-reveal-item>{{ course.result }}</p>

          <p v-if="course.url" class="about__summary" data-reveal-item>
            <SiteLink :href="course.url">Voir l’application réalisée</SiteLink>
          </p>
        </li>
      </ol>
    </section>

    <section class="about__section" aria-labelledby="contact" data-reveal-section>
      <h2 id="contact" data-reveal-item>Me joindre</h2>

      <p class="about__summary" data-reveal-item>{{ profile.availability }}</p>

      <ul class="about__contact">
        <li data-reveal-item><a :href="`mailto:${profile.email}`">{{ profile.email }}</a></li>
        <li data-reveal-item><a :href="telHref(profile.phone)">{{ profile.phone }}</a></li>
        <li data-reveal-item>{{ profile.location }}</li>
      </ul>
    </section>
  </article>
</template>

<style scoped lang="scss">
/* Tête de page : des délais fixes, hors de la cascade mesurée. Le `@keyframes`
   et les règles communes vivent dans `app/styles/_motion.scss`.

   Quatre temps à 140 ms d'écart, comme les têtes de `/`, `/projets`, `/contact`
   et de la fiche projet. Les deux paragraphes d'intro entrent **en un bloc** :
   ils poursuivent la même phrase que le chapô, et `DESIGN.md` § 7 pose qu'une
   ligne de cascade est une unité de lecture.

   Propriétés longues et non le raccourci `animation` : un `var()` dans le
   raccourci met tous ses longhands en substitution différée. */
.about h1,
.about h1 + p,
.about__intro,
.about__download {
  animation-name: page-entry;
  animation-duration: var(--dur-slow);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: backwards;
}

.about h1 + p {
  animation-delay: 140ms;
}

.about__intro {
  animation-delay: 280ms;
}

.about__download {
  animation-delay: 420ms;
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, la tête de page resterait vide le temps de la cascade.
   Les lignes marquées `data-reveal-item` sont remises à zéro par
   `_motion.scss`. */
@media (prefers-reduced-motion: reduce) {
  .about h1 + p,
  .about__intro,
  .about__download {
    animation-delay: 0ms !important;
  }
}

.about__intro,
.about__download {
  max-width: var(--measure);
  margin-top: var(--space-m);
}

.about__download {
  margin-top: var(--space-l);
}

/* Le filet sépare les sections : la page se divise par des traits, pas par des
   cartes. */
.about__section {
  margin-top: var(--space-2xl);
  padding-top: var(--space-m);
  border-top: var(--rule-strong);
  counter-increment: about-section;
}

/* Figure numérotée, décidée dans `DESIGN.md` § 5 : un chiffre en encre
   atténuée, sans zéro de tête. Il vient du compteur, donc aucun gabarit ne
   l'écrit et une rubrique déplacée se renumérote toute seule. */
.about {
  counter-reset: about-section;
}

.about__section h2::before {
  content: counter(about-section);
  margin-right: var(--space-2xs);
  color: var(--color-fg-muted);
  font-size: var(--size-label);
  font-stretch: normal;
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--tracking-label);
}

/* Les sous-blocs portent une puce : sous un titre numéroté, elle dit que ces
   blocs sont les éléments de la rubrique et non des rubriques de plus. */
.about__list {
  margin: 0;
  padding-left: var(--space-m);
  list-style-type: disc;
}

.about__item::marker {
  color: var(--color-fg-muted);
}

.about__item + .about__item {
  margin-top: var(--space-xl);
  padding-top: var(--space-m);
  border-top: var(--rule);
}

.about__item {
  max-width: var(--measure);
}

.about__role {
  margin-top: var(--space-m);
}

/* L'employeur ne porte pas le même poids que l'intitulé : le rang s'encode
   dans le texte, pas dans une mise en boîte. */
.about__company {
  color: var(--color-fg-muted);
  font-weight: 400;
}

.about__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  margin-top: var(--space-3xs);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.about__place::before {
  content: '·';
  margin-right: var(--space-2xs);
}

.about__summary {
  margin-top: var(--space-s);
}

.about__missions {
  margin-top: var(--space-s);
  padding-left: var(--space-m);
}

.about__missions li + li {
  margin-top: var(--space-2xs);
}

.about__stack {
  margin-top: var(--space-s);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.about__skills {
  max-width: var(--measure);
  margin: 0;
}

.about__skills dt {
  margin-top: var(--space-m);
  font-weight: 600;
}

.about__skills dd {
  margin: var(--space-3xs) 0 0;
  color: var(--color-fg-muted);
}

.about__contact {
  margin-top: var(--space-s);
  padding: 0;
  list-style: none;
}

.about__contact li + li {
  margin-top: var(--space-2xs);
}
</style>
