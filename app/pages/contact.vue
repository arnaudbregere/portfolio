<script setup lang="ts">
import { profile } from '~~/content/cv'
import { telHref } from '~/utils/contact'
import { pageSeoMeta } from '~/utils/page-seo'

useSeoMeta(
  pageSeoMeta({
    title: 'Contact — Arnaud Brégère',
    description:
      'Joindre Arnaud Brégère, développeur front-end senior Vue 3 et Nuxt : téléphone et adresse e-mail.',
  }),
)
</script>

<template>
  <article class="contact">
    <h1>Contact</h1>

    <p class="contact__name">{{ profile.name }}</p>

    <!-- `mailto:` et `tel:` ne naviguent pas : ils ne passent pas par
         `SiteLink`, qui ouvrirait un onglet vide. Le trait reste donc posé en
         permanence, comme sur la liste « Me joindre » de `/a-propos`. -->
    <ul class="contact__list">
      <li class="contact__item">
        <a :href="telHref(profile.phone)">{{ profile.phone }}</a>
      </li>
      <li class="contact__item">
        <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
      </li>
    </ul>
  </article>
</template>

<style scoped lang="scss">
.contact__name {
  margin-top: var(--space-m);
  color: var(--color-fg-muted);
  font-size: var(--size-label);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Le filet divise la page, et le téléphone passe avant l'e-mail : il est le
   plus direct des deux. */
.contact__list {
  position: relative;
  margin: 0;
  padding: var(--space-l) 0 0;
  list-style: none;
}

.contact__item {
  font-size: var(--step-2);
}

.contact__item + .contact__item {
  margin-top: var(--space-xs);
}

/* -- Entrée de la page ---------------------------------------------------
   Deux mouvements, décalés : les textes montent d'un demi-pas, puis le filet
   se tire de gauche à droite avant les deux liens. `opacity` et `transform`
   sont les deux seules propriétés que le navigateur compose sans recalculer
   la mise en page : le mouvement tient le rythme sur un mobile lent.
   Aucune information ne repose sur lui — `DESIGN.md`, § Mouvement. */

.contact h1,
.contact__name,
.contact__item {
  animation: contact-entry var(--dur-base) var(--ease-out) backwards;
}

.contact__name {
  animation-delay: 60ms;
}

.contact__item:nth-child(1) {
  animation-delay: 180ms;
}

.contact__item:nth-child(2) {
  animation-delay: 240ms;
}

@keyframes contact-entry {
  from {
    opacity: 0;
    translate: 0 0.5rem;
  }
}

/* Le filet est un pseudo-élément et non une bordure : une bordure ne se met
   pas à l'échelle. `scaleX` part de la gauche, dans le sens de lecture. */
.contact__list::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: var(--color-line-strong);
  transform: scaleX(0);
  transform-origin: left;
  animation: contact-rule var(--dur-slow) var(--ease-out) 120ms forwards;
}

@keyframes contact-rule {
  to {
    transform: scaleX(1);
  }
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, la page resterait vide le temps de la cascade. */
@media (prefers-reduced-motion: reduce) {
  .contact h1,
  .contact__name,
  .contact__item,
  .contact__list::before {
    animation-delay: 0ms !important;
  }
}
</style>
