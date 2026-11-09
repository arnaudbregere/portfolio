<script setup lang="ts">
import { contactSections } from '~~/content/contact'
import { profile } from '~~/content/cv'
import { profileLinks } from '~~/content/nav'
import { shortUrl, telHref } from '~/utils/contact'
import { pageSeoMeta } from '~/utils/page-seo'

const root = ref<HTMLElement | null>(null)

useRevealCascade(root)

useSeoMeta(
  pageSeoMeta({
    title: 'Contact — Arnaud Brégère',
    description:
      'Joindre Arnaud Brégère, développeur front-end senior Vue 3 et Nuxt : téléphone, adresse e-mail, disponibilité et poste recherché.',
  }),
)
</script>

<template>
  <article ref="root" class="contact">
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
    <section class="contact__section" data-reveal-section>
      <h2 class="contact__title" data-reveal-item>Présence en ligne</h2>

      <dl class="contact__list">
        <div v-for="link in profileLinks" :key="link.to" class="contact__entry" data-reveal-item>
          <dt class="contact__label">{{ link.label }}</dt>
          <dd class="contact__value">
            <SiteLink :href="link.to" rel="me">{{ shortUrl(link.to) }}</SiteLink>
          </dd>
        </div>
      </dl>
    </section>

    <section
      v-for="group in contactSections"
      :key="group.title"
      class="contact__section"
      data-reveal-section
    >
      <h2 class="contact__title" data-reveal-item>{{ group.title }}</h2>

      <dl class="contact__list">
        <div v-for="fact in group.facts" :key="fact.label" class="contact__entry" data-reveal-item>
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

/* -- Tête de page ---------------------------------------------------------
   La figure partagée vit dans `app/styles/_motion.scss` : le `@keyframes`
   `page-entry` et les règles de `[data-reveal-item]`. Ne restent ici que les
   délais fixes de cette tête de page, qui dépendent de ce qu'elle porte, et le
   filet tiré de son bloc d'ouverture.

   Propriétés longues et non le raccourci `animation` : un `var()` dans le
   raccourci met tous ses longhands en substitution différée — ils ressortent
   vides de `cssRules`, que le raccourci remet à sa valeur initiale. */
.contact h1,
.contact__name,
.contact__list--lead .contact__entry {
  animation-name: page-entry;
  animation-duration: var(--dur-slow);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: backwards;
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

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, la tête de page resterait vide le temps de la cascade.
   Les lignes marquées `data-reveal-item` sont remises à zéro par
   `_motion.scss`. */
@media (prefers-reduced-motion: reduce) {
  .contact h1,
  .contact__name,
  .contact__list--lead .contact__entry,
  .contact__list--lead::before {
    animation-delay: 0ms !important;
  }
}
</style>
