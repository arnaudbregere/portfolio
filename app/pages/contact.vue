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
.contact__section:nth-of-type(-n + 2) .contact__title,
.contact__section:nth-of-type(-n + 2) .contact__entry {
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

/* Les deux premières rubriques tiennent dans la fenêtre au chargement, ou
   presque : mesuré dans Chrome 157 sur 1163 px de haut, « Présence en ligne »
   est à 602 px et « Disponibilité » à 911 px. Une chronologie de défilement
   les donnerait achevées avant le premier cran de molette. Elles prolongent
   donc la cascade.

   S'y ajoute une contrainte de place : la page fait 2095 px pour 1163 px de
   fenêtre, soit 932 px de défilement en tout. Trois rubriques qui demandent
   chacune ~400 px de course n'y tiennent pas. La dernière garde le
   défilement, les autres entrent au chargement. */
.contact__section:nth-of-type(1) .contact__title {
  animation-delay: 700ms;
}

.contact__section:nth-of-type(1) .contact__entry:nth-child(1) {
  animation-delay: 790ms;
}

.contact__section:nth-of-type(1) .contact__entry:nth-child(2) {
  animation-delay: 880ms;
}

.contact__section:nth-of-type(2) .contact__title {
  animation-delay: 970ms;
}

.contact__section:nth-of-type(2) .contact__entry:nth-child(1) {
  animation-delay: 1060ms;
}

.contact__section:nth-of-type(2) .contact__entry:nth-child(2) {
  animation-delay: 1150ms;
}

.contact__section:nth-of-type(2) .contact__entry:nth-child(3) {
  animation-delay: 1240ms;
}

.contact__section:nth-of-type(2) .contact__entry:nth-child(4) {
  animation-delay: 1330ms;
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
    .contact__section:nth-of-type(n + 3) .contact__title,
    .contact__section:nth-of-type(n + 3) .contact__entry {
      animation: contact-entry var(--dur-slow) var(--ease-out) both;
      animation-timeline: view();
      /* `cover` et non `entry` : la plage `entry` dure la hauteur de
         l'élément, soit ~60 px pour une ligne — l'animation se jouait en
         moins d'un cran de molette. `cover` la mesure sur la hauteur de la
         fenêtre, et 25 % en font ~310 px de défilement.

         25 % et pas davantage : la dernière ligne de la page doit finir son
         entrée avant que le défilement ne bute. Mesuré ici, elle l'atteint à
         843 px sur les 932 px disponibles. Une plage plus large la laisserait
         voilée en bas de page. */
      animation-range: cover 0% cover 25%;
    }
  }
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, la page resterait vide le temps de la cascade. */
@media (prefers-reduced-motion: reduce) {
  .contact h1,
  .contact__name,
  .contact__title,
  .contact__entry,
  .contact__list--lead::before {
    animation-delay: 0ms !important;
  }
}
</style>
