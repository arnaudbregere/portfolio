<script setup lang="ts">
import { projects } from '~~/content/projects'
import { pageSeoMeta } from '~/utils/page-seo'

const root = ref<HTMLElement | null>(null)

useRevealCascade(root)

useSeoMeta(
  pageSeoMeta({
    title: 'Projets — Arnaud Brégère',
    description:
      'Projets d’Arnaud Brégère, développeur front-end senior : problème, solution et résultat mesuré pour chacun.',
  }),
)
</script>

<template>
  <article ref="root" class="projects">
    <h1>Projets</h1>
    <p>
      Chaque fiche dit le problème traité, la solution retenue et le résultat
      mesuré. Pas de capture d’interface sous accord de confidentialité.
    </p>

    <ol class="projects__list">
      <!-- Un projet est une rubrique, et non la liste entière : la cascade
           d'une liste qui s'allonge ferait attendre son dernier élément
           plusieurs secondes après un déclenchement décidé en haut de page.
           Ce découpage tient quel que soit le nombre de projets. -->
      <li
        v-for="project in projects"
        :key="project.slug"
        class="projects__item"
        data-reveal-section
      >
        <h2 class="projects__title" data-reveal-item>
          <SiteLink class="projects__link" :href="`/projets/${project.slug}`">
            {{ project.title }}
          </SiteLink>
        </h2>

        <p class="projects__meta" data-reveal-item>
          <span>{{ project.year }}</span>
          <span class="projects__role">{{ project.role }}</span>
        </p>

        <p class="projects__problem" data-reveal-item>{{ project.problem }}</p>

        <!-- Les technos en étiquettes depuis le 13/11/2026 : un paragraphe
             joint par ` · ` n'avait rien pour dire où finit une techno et où
             commence la suivante, et ne se lisait ni à l'œil ni au lecteur
             d'écran comme une énumération. L'`aria-label` nomme ce que la
             liste énumère — sans lui, elle s'annonce « liste, 5 éléments ». -->
        <TagList
          class="projects__stack"
          :items="project.stack"
          label="Technologies"
          data-reveal-item
        />
      </li>
    </ol>
  </article>
</template>

<style scoped lang="scss">
/* -- Tête de page ---------------------------------------------------------
   La figure partagée vit dans `app/styles/_motion.scss`. Ne restent ici que
   les délais fixes de cette tête : elle n'est pas une rubrique, donc
   `useRevealCascade` ne la classe pas et ne lui pose aucun délai.

   Propriétés longues et non le raccourci `animation` : un `var()` dans le
   raccourci met tous ses longhands en substitution différée. */
.projects h1,
.projects h1 + p {
  animation-name: page-entry;
  animation-duration: var(--dur-slow);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: backwards;
}

/* 140 ms d'écart, comme les têtes de `/` et de `/contact`. */
.projects h1 + p {
  animation-delay: 140ms;
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, le chapô resterait vide le temps de la cascade. Les
   lignes marquées `data-reveal-item` sont remises à zéro par `_motion.scss`. */
@media (prefers-reduced-motion: reduce) {
  .projects h1 + p {
    animation-delay: 0ms !important;
  }
}

.projects__list {
  margin: var(--space-2xl) 0 0;
  padding: 0;
  list-style: none;
  counter-reset: project;
}

/* La grille reste une liste : le rang se lit dans l'ordre et la taille du
   texte, pas dans des cartes de même poids.

   `position: relative` fait de la fiche le bloc de référence de la couche
   posée par le lien du titre, plus bas : c'est ce qui rend le bloc cliquable
   en entier. */
.projects__item {
  position: relative;
  max-width: var(--measure);
  padding-top: var(--space-m);
  border-top: var(--rule-strong);
  counter-increment: project;
}

/* Figure numérotée, décidée dans `DESIGN.md` § 5 : un chiffre en encre
   atténuée, sans zéro de tête. Le rang vient du compteur, donc aucun
   gabarit ne l'écrit et un projet inséré ne renumérote rien à la main.

   La règle est recopiée depuis `/a-propos` plutôt que mise en commun : elle
   est scopable, et `frontend.md` ne sort du scope que ce qui ne peut pas y
   tenir. `DESIGN.md` reste la source de la décision. */
.projects__title::before {
  content: counter(project) '.';
  margin-right: var(--space-2xs);
  color: var(--color-fg-muted);
  font-size: var(--size-label);
  font-stretch: normal;
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--tracking-label);
}

.projects__item + .projects__item {
  margin-top: var(--space-xl);
}

.projects__title {
  margin: 0;
  font-size: var(--step-3);
}

.projects__link {
  color: inherit;
}

/* La fiche entière mène à la fiche projet (`DESIGN.md` § 5). La couche
   n'ajoute aucun lien : elle étend celui du titre, qui garde son nom
   accessible — le titre du projet, et non les trois lignes du bloc.

   Elle couvre la boîte de rembourrage de la fiche, donc pas la marge qui la
   sépare de la suivante : l'écart entre deux fiches ne mène nulle part.
   Le survol reste celui du lien, posé par `SiteLink` : le titre se souligne
   où que le curseur entre dans le bloc.

   Le temps de l'entrée de page, la cible se réduit au titre : le `h2` porte
   alors un `translate` — `page-entry`, en `animation-fill-mode: backwards` —
   et devient le bloc de référence de la couche. Le `translate` retombe à
   `none` à la fin de la figure, la cible reprend tout le bloc, et sous
   `prefers-reduced-motion` la fenêtre est nulle. */
.projects__link::after {
  content: '';
  position: absolute;
  inset: 0;
}

/* L'anneau de focus cerne ce qui est activable, et c'est le bloc. Le lien
   rend donc le sien — seul `outline: none` du dépôt, remplacé ici même et
   non supprimé (`.claude/rules/frontend.md`). Les valeurs sont celles de
   `:focus-visible` dans `_base.scss` : un seul anneau pour tout le site. */
.projects__link:focus-visible {
  outline: none;
}

.projects__item:has(.projects__link:focus-visible) {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.projects__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  margin-top: var(--space-3xs);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.projects__role::before {
  content: '·';
  margin-right: var(--space-2xs);
}

.projects__problem {
  margin-top: var(--space-s);
}

/* L'écart appartient à la page : l'atome `TagList` ne pose aucune marge
   extérieure. La couleur et le corps du libellé viennent de lui. */
.projects__stack {
  margin-top: var(--space-s);
}
</style>
