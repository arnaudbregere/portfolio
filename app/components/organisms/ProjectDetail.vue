<script setup lang="ts">
import type { Project } from '~~/content/types'

/**
 * Corps d'une fiche projet : la même structure pour toutes, qu'elles soient
 * rendues par la route dynamique ou par une page dédiée qui ajoute une démo.
 * Le JSON-LD et les métadonnées restent à la page : ils appartiennent à la
 * route, pas au rendu.
 */
defineProps<{ project: Project }>()

/**
 * L'entrée de page vit dans l'organisme et non dans la page : la page ne rend
 * qu'un `<ProjectDetail>`, tout le DOM est ici. `/projets/calculatrice` en
 * hérite donc sans rien faire, puisqu'elle passe par le même composant.
 */
const root = ref<HTMLElement | null>(null)

useRevealCascade(root)

/**
 * La pellicule de la rubrique « Aperçu ». Le défilement reste au navigateur ;
 * le composable ne dit que ce que le CSS ignore — si une flèche a encore
 * quelque chose à montrer.
 */
const strip = ref<HTMLElement | null>(null)

const { canScrollBack, canScrollForward, scrollBack, scrollForward } = useFilmstrip(strip)
</script>

<template>
  <article ref="root" class="o-project">
    <p class="o-project__back">
      <SiteLink href="/projets">Retour aux projets</SiteLink>
    </p>

    <h1>{{ project.title }}</h1>
    <p>{{ project.problem }}</p>

    <p class="o-project__meta">
      <span>{{ project.year }}</span>
      <span class="o-project__role">{{ project.role }}</span>
    </p>

    <!-- Démo jouable, quand la page en fournit une. -->
    <div v-if="$slots.default" class="o-project__demo">
      <slot />
    </div>

    <section
      v-if="project.images?.length"
      class="o-project__section"
      aria-labelledby="apercu"
      data-reveal-section
    >
      <h2 id="apercu" data-reveal-item>Aperçu</h2>

      <!-- Pellicule à défilement horizontal, en CSS seul : `DESIGN.md` § 5
           porte la décision et ce qu'elle révise (issue #82). La capture
           suivante dépasse du bord : c'est l'affordance, et elle ne coûte ni
           flèche, ni script.

           `tabindex="0"` n'est pas décoratif. Une zone défilante doit
           s'atteindre sans souris — WCAG 2.1.1 — et seul le focus rend les
           flèches du clavier opérantes sur un conteneur qui n'est pas un
           contrôle. L'`aria-label` dit au lecteur d'écran ce qu'il vient
           d'atteindre.

           Pas de `role="group"` ici : il **écrase** le rôle `list` implicite
           de l'`<ol>`, et les `<li>` se retrouvent orphelins. Axe l'a relevé
           le 16/11/2026, cinq violations `serious` par fiche. Une liste
           nommée dit déjà ce qu'il faut. -->
      <!-- La pellicule déborde la mesure du texte à partir de `m` : les
           captures ont droit à toute la largeur du gabarit, que la rubrique
           n'a pas. D'où ce conteneur — il porte la largeur, la liste porte le
           défilement. -->
      <div class="o-project__film" data-reveal-item>
        <ol
          ref="strip"
          class="o-project__strip"
          tabindex="0"
          :aria-label="`Captures de ${project.title}, défilement horizontal`"
        >
          <li v-for="image in project.images" :key="image.src" class="o-project__slide">
            <figure class="o-project__figure">
              <!-- Pas de `sizes` : les fichiers font 766 px de large et pèsent
                   moins de 120 Ko. `densities="1"` écarte la variante 2x, qui
                   ne ferait qu'agrandir une source déjà fixe — la densité est
                   déjà dans le fichier, capturé à 2x sur une fenêtre de
                   383 px. -->
              <NuxtImg
                class="o-project__image"
                :src="image.src"
                :alt="image.alt"
                :width="image.width"
                :height="image.height"
                densities="1"
                loading="lazy"
              />
              <figcaption>{{ image.caption }}</figcaption>
            </figure>
          </li>
        </ol>

        <!-- Les deux flèches sont rendues au serveur, désactivées, et non
             posées au montage : l'état de départ est le même des deux côtés,
             donc il n'y a rien à réconcilier, et la ligne ne saute pas sous
             les captures — `.claude/rules/frontend.md` § « Rendu serveur ».

             Le pictogramme ne porte pas le sens : il est `aria-hidden`, et le
             texte masqué visuellement nomme le bouton. -->
        <p class="o-project__nav">
          <button
            type="button"
            class="o-project__arrow"
            :disabled="!canScrollBack"
            @click="scrollBack"
          >
            <Icon name="chevron-left" />
            <span class="visually-hidden">Capture précédente</span>
          </button>
          <button
            type="button"
            class="o-project__arrow"
            :disabled="!canScrollForward"
            @click="scrollForward"
          >
            <Icon name="chevron-right" />
            <span class="visually-hidden">Capture suivante</span>
          </button>
        </p>
      </div>
    </section>

    <section class="o-project__section" aria-labelledby="solution" data-reveal-section>
      <h2 id="solution" data-reveal-item>Solution</h2>
      <p data-reveal-item>{{ project.solution }}</p>
    </section>

    <section class="o-project__section" aria-labelledby="resultat" data-reveal-section>
      <h2 id="resultat" data-reveal-item>Résultat</h2>
      <p data-reveal-item>{{ project.result }}</p>
    </section>

    <section class="o-project__section" aria-labelledby="stack" data-reveal-section>
      <h2 id="stack" data-reveal-item>Stack</h2>
      <!-- Les mêmes étiquettes que la liste `/projets` et que le pied de
           fiche de `/a-propos` : une pile jointe par ` · ` ne disait pas où
           finit une techno. Pas d'`aria-label` ici — le `h2` « Stack » ouvre
           la rubrique juste au-dessus, et le redire nommerait la liste deux
           fois. -->
      <TagList class="o-project__stack" :items="project.stack" data-reveal-item />
    </section>

    <section
      v-if="project.links.length"
      class="o-project__section"
      aria-labelledby="liens"
      data-reveal-section
    >
      <h2 id="liens" data-reveal-item>Liens</h2>
      <ul class="o-project__links">
        <li v-for="link in project.links" :key="link.url" data-reveal-item>
          <SiteLink :href="link.url">{{ link.label }}</SiteLink>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped lang="scss">
@use '../../styles/breakpoints' as bp;

/* -- Tête de fiche --------------------------------------------------------
   La figure partagée vit dans `app/styles/_motion.scss`. Ne restent ici que
   les délais fixes de cette tête : elle n'est pas une rubrique, donc
   `useRevealCascade` ne la classe pas et ne lui pose aucun délai.

   La démo entre comme **un bloc**, et non comme une rubrique : une
   calculatrice dont les touches apparaîtraient une à une serait du décor. Elle
   reste utilisable pendant l'entrée, `opacity` et `translate` n'interceptant
   aucun clic.

   Propriétés longues et non le raccourci `animation` : un `var()` dans le
   raccourci met tous ses longhands en substitution différée. */
.o-project__back,
.o-project h1,
.o-project h1 + p,
.o-project__meta,
.o-project__demo {
  animation-name: page-entry;
  animation-duration: var(--dur-slow);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: backwards;
}

/* 140 ms d'écart, comme les têtes de `/`, `/projets` et `/contact`. */
.o-project h1 {
  animation-delay: 140ms;
}

.o-project h1 + p {
  animation-delay: 280ms;
}

.o-project__meta {
  animation-delay: 420ms;
}

.o-project__demo {
  animation-delay: 560ms;
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, la tête de fiche resterait vide le temps de la cascade.
   Les lignes marquées `data-reveal-item` sont remises à zéro par
   `_motion.scss`. */
@media (prefers-reduced-motion: reduce) {
  .o-project h1,
  .o-project h1 + p,
  .o-project__meta,
  .o-project__demo {
    animation-delay: 0ms !important;
  }
}

/* Conteneur de requête : il donne à la pellicule la largeur du gabarit, que
   la mesure du texte lui refuse. `inline-size` seul — la hauteur reste celle
   du contenu, et rien ici n'est en position fixe. */
.o-project {
  container-type: inline-size;
}

.o-project__back {
  margin-bottom: var(--space-m);
  font-size: var(--step--1);
}

.o-project__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  margin-top: var(--space-s);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.o-project__role::before {
  content: '·';
  margin-right: var(--space-2xs);
}

.o-project__demo {
  margin-top: var(--space-l);
}

.o-project__section {
  max-width: var(--measure);
  margin-top: var(--space-2xl);
  padding-top: var(--space-m);
  border-top: var(--rule-strong);
}

.o-project__section p {
  margin-top: var(--space-s);
}

/* -- Pellicule ------------------------------------------------------------
   Cinq captures de téléphone, en portrait. Empilées pleine largeur, elles
   font ~3400 px de défilement sur un téléphone, et une capture de 383 px
   étirée à la mesure du texte est floue. La pellicule les sert à leur taille,
   côte à côte. `DESIGN.md` § 5 porte la décision. */
/* La pellicule déborde la mesure du texte à partir de `m`. `100cqi` et non
   `100vw` : la requête de conteneur mesure le gabarit, quand `100vw` compte
   la barre de défilement de la page et ouvrirait un défilement horizontal de
   quinze pixels. Le conteneur est `.o-project`, déclaré plus bas. */
.o-project__film {
  margin-top: var(--space-l);
}

.o-project__film {
  @include bp.respond-up(m) {
    width: 100cqi;
  }
}

.o-project__strip {
  display: flex;
  gap: var(--space-m);
  margin: 0;
  padding: 0 0 var(--space-2xs);
  overflow-x: auto;
  list-style: none;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
  /* La barre de défilement reste : elle dit où l'on en est, et se traîne au
     pointeur. Elle se range seulement à la mesure du site. */
  scrollbar-width: thin;
  scrollbar-color: var(--color-line-strong) transparent;
}

/* Le focus se voit sur le conteneur, pas sur une capture : c'est lui qui
   reçoit les flèches du clavier. `--color-focus` est l'encre de la palette,
   `_base.scss` en fixe la forme pour tout le site. */
.o-project__strip:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: var(--space-3xs);
}

.o-project__slide {
  flex: 0 0 auto;
  /* 72 % laissent dépasser la capture suivante : c'est l'affordance, et elle
     remplace la flèche. Au-delà de `m`, la largeur se fixe — trois captures
     tiennent alors dans la mesure du texte. */
  width: 72%;
  scroll-snap-align: start;
}

.o-project__slide {
  /* 20 rem, soit 320 px : la capture est née d'une fenêtre de 383 px, donc
     elle se sert ici à 0,84 de sa taille — assez grande pour qu'on lise
     l'interface, assez nette pour qu'on la croie. 13,5 rem, essayés le
     16/11/2026, rendaient une vignette illisible. */
  @include bp.respond-up(m) {
    width: 20rem;
  }
}

/* -- Flèches --------------------------------------------------------------
   Elles ne remplacent ni le doigt, ni la molette, ni les flèches du clavier :
   elles les doublent, parce qu'un visiteur à la souris n'a rien d'autre que
   la barre de défilement. Demandées par Arnaud le 16/11/2026. */
/* `max-width: none` n'est pas décoratif : `_base.scss` borne tout `<p>` à la
   mesure du texte, et la ligne des flèches se serait arrêtée au bord du
   paragraphe plutôt qu'à celui de la pellicule. Mesuré le 16/11/2026 :
   622 px au lieu de 1408. */
.o-project__nav {
  display: flex;
  max-width: none;
  justify-content: flex-end;
  gap: var(--space-2xs);
  margin-top: var(--space-s);
}

.o-project__arrow {
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border: var(--rule-strong);
  background: none;
  color: var(--color-fg);
  cursor: pointer;
  font-size: var(--step-0);

  &:disabled {
    color: var(--color-fg-muted);
    cursor: default;
    opacity: 0.4;
  }
}

/* Le pictogramme suit l'encre du bouton, et non l'encre atténuée que l'atome
   se donne pour les lignes de coordonnées. */
.o-project__arrow :deep(.a-icon) {
  color: inherit;
}

.o-project__figure {
  margin: 0;
}

.o-project__image {
  display: block;
  width: 100%;
  height: auto;
  border: var(--rule);
}

.o-project__figure figcaption {
  margin-top: var(--space-2xs);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

/* Le défilement animé du clavier et des ancres tombe avec le reste du
   mouvement : `_reset.scss` traite les animations, pas `scroll-behavior`. */
@media (prefers-reduced-motion: reduce) {
  .o-project__strip {
    scroll-behavior: auto;
  }
}

/* La couleur et le corps du libellé viennent de l'atome `TagList` ; la
   rubrique ne pose que l'écart qui la sépare de son titre. */
.o-project__stack {
  margin-top: var(--space-s);
}

.o-project__links {
  margin-top: var(--space-s);
  padding: 0;
  list-style: none;
}

.o-project__links li + li {
  margin-top: var(--space-2xs);
}
</style>
