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
    <section class="contact__section">
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

    <section v-for="group in contactSections" :key="group.title" class="contact__section">
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

/* -- Entrée de la page ---------------------------------------------------
   Deux mouvements, décalés : les textes montent d'un pas en prenant leur
   opacité, puis le filet se tire de gauche à droite avant les coordonnées.
   `opacity` et `transform` sont les deux seules propriétés que le navigateur
   compose sans recalculer la mise en page : le mouvement tient le rythme sur
   un mobile lent. Aucune information ne repose sur lui — `DESIGN.md`,
   § Mouvement. */

.contact h1,
.contact__name,
.contact__list--lead .contact__entry {
  animation: contact-entry var(--dur-slow) var(--ease-out) backwards;
}

/* Les rubriques entrent au chargement **par défaut**, chacune à son tour.
   `useRevealCascade` mesure au premier rendu et pose `--reveal-delay` sur
   celles qui sont lisibles sans défiler ; il retire les autres de la cascade
   plus bas. Dans ce sens, rien ne clignote, et une page dont le JavaScript ne
   s'exécute jamais garde une entrée complète. */
.contact__section [data-reveal-item] {
  animation: contact-entry var(--dur-slow) var(--ease-out) backwards;
  animation-delay: var(--reveal-delay, 700ms);
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
   Ce qui est hors de la fenêtre au premier rendu entre quand le défilement
   l'amène : `animation-timeline: view()` branche l'animation sur la position
   de l'élément au lieu d'une horloge.

   Deux replis, et la page reste entière si l'un ou l'autre manque. Sans
   `animation-timeline` — Chrome et Edge le servent depuis la 115, Safari
   depuis la 26, Firefox pas encore —, `@supports` écarte la règle et
   l'élément garde la cascade de chargement. Sans JavaScript, l'attribut
   `data-reveal` n'est jamais posé et la règle ne vise rien : même résultat. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    /* Ce que `useRevealCascade` a trouvé sous la ligne de flottaison : la
       chronologie de temps cède la place à celle du défilement. La frontière
       est mesurée, jamais devinée — un rang codé en dur devient faux dès que
       la fenêtre change de hauteur.

       `cover` et non `entry` : la plage `entry` dure la hauteur de l'élément,
       soit ~60 px pour une ligne — l'entrée se jouait en moins d'un cran de
       molette. `cover` la mesure sur la hauteur de la fenêtre.

       25 % et pas davantage : la dernière ligne de la page doit finir son
       entrée avant que le défilement ne bute. Mesurée ici, elle l'atteint à
       843 px sur les 932 disponibles ; une plage plus large la laisserait
       voilée en bas de page, sans recours pour le visiteur. */
    .contact__section [data-reveal='scroll'] {
      animation-delay: 0ms;
      animation-fill-mode: both;
      animation-timeline: view();
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
