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

    <!-- Une liste de définitions : chaque valeur est nommée par son libellé,
         et le lecteur d'écran annonce le couple. `mailto:` et `tel:` ne
         naviguent pas, donc ne passent pas par `SiteLink`, qui ouvrirait un
         onglet vide. Le trait reste posé en permanence, comme sur la liste
         « Me joindre » de `/a-propos`. -->
    <dl class="contact__list">
      <div class="contact__entry">
        <dt class="contact__label">Téléphone</dt>
        <dd class="contact__value">
          <a :href="telHref(profile.phone)">{{ profile.phone }}</a>
        </dd>
      </div>

      <div class="contact__entry">
        <dt class="contact__label">E-mail</dt>
        <dd class="contact__value">
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </dd>
      </div>
    </dl>
  </article>
</template>

<style scoped lang="scss">
/* Le nom n'est pas un libellé : il porte un cran de plus que les libellés
   « Téléphone » et « E-mail », sans quoi les trois se confondraient. */
.contact__name {
  margin-top: var(--space-s);
  max-width: var(--measure);
  font-size: var(--step-1);
}

/* Le filet est le bord haut de la liste : il lui faut de l'air sous le nom,
   sans quoi les deux se touchent. */
.contact__list {
  position: relative;
  margin: var(--space-m) 0 0;
  padding: var(--space-l) 0 0;
}

.contact__entry + .contact__entry {
  margin-top: var(--space-l);
}

.contact__label {
  color: var(--color-fg-muted);
  font-size: var(--size-label);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.contact__value {
  margin: var(--space-3xs) 0 0;
  font-size: var(--step-2);
}

/* -- Entrée de la page ---------------------------------------------------
   Deux mouvements, décalés : les textes montent d'un pas en prenant leur
   opacité, puis le filet se tire de gauche à droite avant les coordonnées.
   `opacity` et `transform` sont les deux seules propriétés que le navigateur
   compose sans recalculer la mise en page : le mouvement tient le rythme sur
   un mobile lent. Aucune information ne repose sur lui — `DESIGN.md`,
   § Mouvement. */

.contact h1,
.contact__name,
.contact__entry {
  animation: contact-entry var(--dur-slow) var(--ease-out) backwards;
}

.contact__name {
  animation-delay: 140ms;
}

.contact__entry:nth-child(1) {
  animation-delay: 420ms;
}

.contact__entry:nth-child(2) {
  animation-delay: 560ms;
}

@keyframes contact-entry {
  from {
    opacity: 0;
    translate: 0 var(--space-s);
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
  animation: contact-rule var(--dur-slow) var(--ease-out) 280ms forwards;
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
  .contact__entry,
  .contact__list::before {
    animation-delay: 0ms !important;
  }
}
</style>
