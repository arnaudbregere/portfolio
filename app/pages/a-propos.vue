<script setup lang="ts">
import { cvFile, education, experiences, profile, skillGroups } from '~~/content/cv'
import { formatPeriod } from '~/utils/period'

useSeoMeta({
  title: 'À propos — Arnaud Brégère',
  description:
    'Parcours d’Arnaud Brégère, développeur front-end senior : six ans de Vue et Nuxt chez Figaro Classifieds, une formation en arts graphiques, et le CV en téléchargement.',
})

const [standfirst, ...rest] = profile.intro

/** `06 07 98 52 85` donne `tel:+33607985285` : la forme affichée reste lisible. */
const telHref = `tel:+33${profile.phone.replace(/\s/g, '').slice(1)}`
</script>

<template>
  <article class="about">
    <h1>À propos</h1>
    <p>{{ standfirst }}</p>

    <p v-for="paragraph in rest" :key="paragraph" class="about__intro">
      {{ paragraph }}
    </p>

    <p class="about__download">
      <CvLink :href="cvFile.path" :format="cvFile.format" :size-kb="cvFile.sizeKb" />
    </p>

    <section class="about__section" aria-labelledby="parcours">
      <h2 id="parcours">Parcours</h2>

      <ol class="about__list">
        <li v-for="job in experiences" :key="`${job.company}-${job.start}`" class="about__item">
          <h3 class="about__role">
            {{ job.role }}<span class="about__company">, {{ job.company }}</span>
          </h3>

          <p class="about__meta">
            <time :datetime="job.start">{{ formatPeriod(job.start, job.end) }}</time>
            <span class="about__place">{{ job.location }}</span>
          </p>

          <p class="about__summary">{{ job.summary }}</p>

          <ul class="about__missions">
            <li v-for="mission in job.missions" :key="mission">{{ mission }}</li>
          </ul>

          <p class="about__stack">{{ job.stack.join(' · ') }}</p>
        </li>
      </ol>
    </section>

    <section class="about__section" aria-labelledby="competences">
      <h2 id="competences">Compétences</h2>

      <dl class="about__skills">
        <template v-for="group in skillGroups" :key="group.title">
          <dt>{{ group.title }}</dt>
          <dd>{{ group.skills.join(' · ') }}</dd>
        </template>
      </dl>
    </section>

    <section class="about__section" aria-labelledby="formation">
      <h2 id="formation">Formation</h2>

      <ol class="about__list">
        <li v-for="course in education" :key="course.title" class="about__item">
          <h3 class="about__role">{{ course.title }}</h3>

          <p class="about__meta">
            <span>{{ course.school }}</span>
            <span class="about__place">{{ course.year }}</span>
          </p>

          <p v-if="course.result" class="about__summary">{{ course.result }}</p>

          <p v-if="course.url" class="about__summary">
            <a :href="course.url" rel="noopener">Voir l’application réalisée</a>
          </p>
        </li>
      </ol>
    </section>

    <section class="about__section" aria-labelledby="contact">
      <h2 id="contact">Me joindre</h2>

      <p class="about__summary">{{ profile.availability }}</p>

      <ul class="about__contact">
        <li><a :href="`mailto:${profile.email}`">{{ profile.email }}</a></li>
        <li><a :href="telHref">{{ profile.phone }}</a></li>
        <li>{{ profile.location }}</li>
      </ul>
    </section>
  </article>
</template>

<style scoped lang="scss">
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
}

.about__list {
  margin: 0;
  padding: 0;
  list-style: none;
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
