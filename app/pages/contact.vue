<script setup lang="ts">
import { contactSections } from '~~/content/contact'
import { profile } from '~~/content/cv'
import { profileLinks } from '~~/content/nav'
import { shortUrl, telHref } from '~/utils/contact'
import { pageSeoMeta } from '~/utils/page-seo'

useSeoMeta(
  pageSeoMeta({
    title: 'Contact — Arnaud Brégère',
    description:
      'Joindre Arnaud Brégère, développeur front-end senior Vue 3 et Nuxt : téléphone, adresse e-mail, disponibilité et poste recherché.',
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
    <dl class="contact__list contact__list--lead">
      <div class="contact__entry">
        <dt class="contact__label">Téléphone</dt>
        <dd class="contact__value">
          <Icon name="phone" />
          <a :href="telHref(profile.phone)">{{ profile.phone }}</a>
        </dd>
      </div>

      <div class="contact__entry">
        <dt class="contact__label">E-mail</dt>
        <dd class="contact__value">
          <Icon name="mail" />
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </dd>
      </div>
    </dl>

    <!-- Les profils viennent de `content/nav.ts`, qui les sert déjà au pied de
         page : une URL ne se recopie pas. `SiteLink` les ouvre dans un nouvel
         onglet et porte la flèche. -->
    <section class="contact__section">
      <h2 class="contact__title">Présence en ligne</h2>

      <dl class="contact__list">
        <div v-for="link in profileLinks" :key="link.to" class="contact__entry">
          <dt class="contact__label">{{ link.label }}</dt>
          <dd class="contact__value">
            <SiteLink :href="link.to" rel="me">{{ shortUrl(link.to) }}</SiteLink>
          </dd>
        </div>
      </dl>
    </section>

    <section v-for="group in contactSections" :key="group.title" class="contact__section">
      <h2 class="contact__title">{{ group.title }}</h2>

      <dl class="contact__list">
        <div v-for="fact in group.facts" :key="fact.label" class="contact__entry">
          <dt class="contact__label">{{ fact.label }}</dt>
          <!-- Le séparateur appartient au gabarit : le contenu porte une
               liste, pas une chaîne à virgules. -->
          <dd class="contact__value">{{ fact.values.join(' · ') }}</dd>
        </div>
      </dl>
    </section>
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
.contact__list--lead {
  position: relative;
  margin: var(--space-m) 0 0;
  padding: var(--space-l) 0 0;
}

.contact__section {
  margin-top: var(--space-2xl);
  padding-top: var(--space-m);
  border-top: var(--rule);
}

.contact__title {
  font-size: var(--step-1);
}

.contact__list {
  margin: 0;
}

.contact__section .contact__list {
  margin-top: var(--space-m);
}

.contact__entry + .contact__entry {
  margin-top: var(--space-m);
}

.contact__list--lead .contact__entry + .contact__entry {
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
  max-width: var(--measure);
  font-size: var(--step-1);
}

.contact__list--lead .contact__value {
  display: flex;
  align-items: baseline;
  gap: var(--space-2xs);
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
.contact__list--lead .contact__entry,
.contact__section:first-of-type .contact__title,
.contact__section:first-of-type .contact__entry {
  animation: contact-entry var(--dur-slow) var(--ease-out) backwards;
}

.contact__name {
  animation-delay: 140ms;
}

.contact__list--lead .contact__entry:nth-child(1) {
  animation-delay: 420ms;
}

.contact__list--lead .contact__entry:nth-child(2) {
  animation-delay: 560ms;
}

/* La première rubrique tient dans la fenêtre au chargement sur un écran de
   bureau : mesuré à 1163 px de haut, ses deux lignes sont à 647 px et 730 px.
   Une chronologie de défilement les donnerait donc achevées avant le premier
   cran de molette. Elle prolonge la cascade plutôt que d'attendre un
   défilement qui n'aura pas lieu. */
.contact__section:first-of-type .contact__title {
  animation-delay: 700ms;
}

.contact__section:first-of-type .contact__entry:nth-child(1) {
  animation-delay: 840ms;
}

.contact__section:first-of-type .contact__entry:nth-child(2) {
  animation-delay: 980ms;
}

@keyframes contact-entry {
  from {
    opacity: 0;
    translate: 0 var(--space-s);
  }
}

/* Le filet est un pseudo-élément et non une bordure : une bordure ne se met
   pas à l'échelle. `scaleX` part de la gauche, dans le sens de lecture. */
.contact__list--lead::before {
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

/* -- Entrée au défilement ------------------------------------------------
   Les rubriques suivantes entrent quand elles arrivent dans la fenêtre, sans
   une ligne de JavaScript : `animation-timeline: view()` branche l'animation
   sur la position de l'élément au lieu d'une horloge.

   Tout est sous `@supports` et le contenu est **visible par défaut** : un
   navigateur qui ignore `animation-timeline` ignore aussi la déclaration
   d'animation, et la page reste lisible. C'est la condition pour que l'effet
   soit gratuit. Chrome et Edge le servent depuis la 115, Safari depuis la 26 ;
   Firefox ne le sert pas encore à ce jour. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    /* Le titre **et chaque ligne** portent leur propre chronologie, et non la
       rubrique entière : sur un écran de bureau, une rubrique entière tient
       souvent déjà dans la fenêtre au chargement, donc sa progression vaut
       100 % et rien ne bouge. Ligne à ligne, tout ce qui est sous la ligne de
       flottaison entre au défilement. */
    .contact__section:not(:first-of-type) .contact__title,
    .contact__section:not(:first-of-type) .contact__entry {
      animation: contact-entry var(--dur-slow) var(--ease-out) both;
      animation-timeline: view();
      /* `cover` et non `entry` : la plage `entry` dure la hauteur de
         l'élément, soit ~60 px pour une ligne — l'animation se jouait en
         moins d'un cran de molette. `cover` la mesure sur la hauteur de la
         fenêtre, et 35 % en font ~380 px de défilement. */
      animation-range: cover 0% cover 35%;
    }
  }
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, la page resterait vide le temps de la cascade. */
@media (prefers-reduced-motion: reduce) {
  .contact h1,
  .contact__name,
  .contact__entry,
  .contact__list--lead::before {
    animation-delay: 0ms !important;
  }
}
</style>
