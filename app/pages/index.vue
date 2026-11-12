<script setup lang="ts">
import { cvFile, profile } from '~~/content/cv'
import { siteNav } from '~~/content/nav'
import { projects } from '~~/content/projects'
import { telHref } from '~/utils/contact'
import { pageSeoMeta } from '~/utils/page-seo'

const root = ref<HTMLElement | null>(null)

useRevealCascade(root)

useSeoMeta(
  pageSeoMeta({
    title: 'Arnaud Brégère — Développeur front-end senior',
    description:
      'Développeur front-end senior, Vue 3 et Nuxt, dix ans d’expérience front-end dont sept chez Figaro Classifieds. Migration, performance, référencement et accessibilité. CV, téléphone et adresse e-mail.',
  }),
)

/**
 * Les années d'expérience front-end : **une valeur déclarée**, posée par
 * Arnaud le 12/11/2026 (issue #53).
 *
 * Elle était calculée depuis `'2019-10'`, l'entrée chez Figaro Classifieds
 * comme développeur front-end JavaScript — ce qui rendait 7. Le commentaire
 * disait alors qu'une année écrite en dur devient fausse au premier janvier
 * suivant, et c'est toujours vrai : cette valeur ne se met plus à jour seule.
 *
 * Aucune date de `content/cv.ts` ne donne 10 : l'intégration web commence en
 * février 2015, soit 11 ans révolus, et le premier poste de développeur
 * front-end en octobre 2019, soit 7. Le chiffre est donc une affirmation
 * d'Arnaud sur son parcours, pas une dérivation du CV — d'où sa place ici, en
 * clair, et non dans `content/cv.ts`, qui ne porte que le transcrit du PDF.
 *
 * **À revoir au 1er janvier.** Ancré sur le même départ, il devra lire 11.
 */
const yearsOfFrontEnd = 10

const contact = siteNav.find((item) => item.to === '/contact')!

/**
 * Les projets mis en avant, dans l'ordre d'affiche de `content/projects.ts` :
 * `DESIGN.md` pose que l'ordre est la hiérarchie. `PRODUCT.md` en fixe le
 * nombre à deux depuis le 04/11/2026.
 */
const featuredProjects = projects.filter((project) => project.featured)

/**
 * Le nom coupé à sa première espace : le prénom porte la couleur de marque,
 * le reste suit. Couper plutôt que recopier — `content/cv.ts` reste la source
 * unique, et un nom composé continuerait de s'afficher entier.
 */
const [given = profile.name, ...rest] = profile.name.split(' ')
const family = rest.join(' ')
</script>

<template>
  <article ref="root" class="home">
    <!-- Le prénom est isolé pour porter la couleur de marque. Le nom reste
         `profile.name` : il n'est pas recopié, seulement coupé à sa première
         espace, et l'espace entre les deux mots est conservée — c'est elle
         que `word-spacing` resserre, et c'est elle qui fait lire deux mots à
         un lecteur d'écran. La minuscule est posée par le style, donc le
         texte de la page garde ses capitales. -->
    <!-- Les deux `span` restent sur la même ligne : un retour à la ligne
         entre eux entrerait dans le `textContent` du titre, et c'est cette
         espace unique que `word-spacing` resserre. -->
    <h1 class="home__name">
      <span class="home__given">{{ given }}</span> <span class="home__family">{{ family }}</span>
    </h1>
    <p class="home__tagline">{{ profile.tagline }}</p>

    <p v-for="paragraph in profile.pitch" :key="paragraph" class="home__pitch">
      {{ paragraph }}
    </p>

    <p class="home__download">
      <CvLink :href="cvFile.path" :format="cvFile.format" :size-kb="cvFile.sizeKb" />
    </p>

    <section class="home__section" aria-labelledby="projets" data-reveal-section>
      <h2 id="projets" data-reveal-item>Projets</h2>

      <!-- Une liste à filets, pas une grille de cartes égales : le rang se lit
           dans l'ordre et dans la taille du texte (`DESIGN.md`, § Formes). -->
      <ol class="home__projects">
        <li
          v-for="project in featuredProjects"
          :key="project.slug"
          class="home__project"
          data-reveal-item
        >
          <h3 class="home__project-title">
            <SiteLink class="home__project-link" :href="`/projets/${project.slug}`">
              {{ project.title }}
            </SiteLink>
          </h3>

          <p class="home__project-year">{{ project.year }}</p>
          <p class="home__project-problem">{{ project.problem }}</p>
        </li>
      </ol>

      <p class="home__actions" data-reveal-item>
        <NuxtLink class="home__action" to="/projets">Tous les projets</NuxtLink>
      </p>
    </section>

    <section class="home__section" aria-labelledby="reperes" data-reveal-section>
      <h2 id="reperes" data-reveal-item>Repères</h2>

      <dl class="home__facts">
        <!-- Le poste visé ouvre les repères depuis le 09/11/2026 : il était
             dans le texte de présentation, que ce texte ne porte plus. C'est
             un fait, il est à sa place parmi des faits. -->
        <div class="home__fact" data-reveal-item>
          <dt>Poste recherché</dt>
          <dd>{{ profile.role }}</dd>
        </div>
        <div class="home__fact" data-reveal-item>
          <dt>Expérience front-end</dt>
          <dd>{{ yearsOfFrontEnd }} ans</dd>
        </div>
        <div class="home__fact" data-reveal-item>
          <dt>Dans le métier depuis</dt>
          <dd>2009</dd>
        </div>
        <div class="home__fact" data-reveal-item>
          <dt>Terrain</dt>
          <dd>Figaro Classifieds, Groupe La Poste, BrandAlley, RueDuCommerce</dd>
        </div>
        <div class="home__fact" data-reveal-item>
          <dt>Socle</dt>
          <!-- La ligne de compétences de `content/cv.ts`, et non une liste
               réécrite ici : deux énumérations des mêmes savoir-faire
               divergeraient à la première mise à jour. Elle paraît aussi en
               tête de page, sous le nom. -->
          <dd class="home__fact-stack">{{ profile.tagline }}</dd>
        </div>
      </dl>
    </section>

    <section class="home__section" aria-labelledby="joindre" data-reveal-section>
      <h2 id="joindre" data-reveal-item>{{ profile.availability }}</h2>

      <!-- Les coordonnées en clair dès l'accueil (issue #53) : `PRODUCT.md`
           les inscrit comme attente du public « Recruteur / RH », et le
           détour par `/contact` leur coûtait un clic.

           La forme est celle de `/a-propos` et de `/contact` : un
           pictogramme, puis le libellé. L'icône ne porte jamais le sens —
           elle est `aria-hidden`, et le texte du lien reste la seule source
           d'information. `mailto:` et `tel:` ne naviguent pas, donc ne
           passent pas par `SiteLink`, qui ouvrirait un onglet vide. -->
      <ul class="home__contact">
        <li data-reveal-item>
          <Icon name="phone" />
          <a :href="telHref(profile.phone)">{{ profile.phone }}</a>
        </li>
        <li data-reveal-item>
          <Icon name="mail" />
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </li>
      </ul>

      <p class="home__actions" data-reveal-item>
        <NuxtLink class="home__action" :to="contact.to">{{ contact.label }}</NuxtLink>
      </p>
    </section>
  </article>
</template>

<style scoped lang="scss">
@use '../styles/breakpoints' as bp;

/* -- Tête de page ---------------------------------------------------------
   La figure partagée vit dans `app/styles/_motion.scss`. Ne restent ici que
   les délais fixes de cette tête : elle n'est pas une rubrique, donc
   `useRevealCascade` ne la classe pas et ne lui pose aucun délai.

   Propriétés longues et non le raccourci `animation` : un `var()` dans le
   raccourci met tous ses longhands en substitution différée. */
.home__tagline,
.home__pitch,
.home__download {
  animation-name: page-entry;
  animation-duration: var(--dur-slow);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: backwards;
}

/* 140 ms d'écart, comme la tête de `/contact` : le nom, la ligne de métier,
   le pitch, puis le CV. */
.home__tagline {
  animation-delay: 140ms;
}

.home__pitch {
  animation-delay: 280ms;
}

.home__download {
  animation-delay: 420ms;
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, la tête de page resterait vide le temps de la cascade.
   Les lignes marquées `data-reveal-item` sont remises à zéro par
   `_motion.scss`. */
@media (prefers-reduced-motion: reduce) {
  .home__tagline,
  .home__pitch,
  .home__download {
    animation-delay: 0ms !important;
  }

  /* Les deux mots du nom ne glissent plus : ils entrent sur place. La règle
     globale de `_reset.scss` écrase la durée, pas le tracé — sans cette
     remise à zéro, ils apparaîtraient décalés. */
  .home__given,
  .home__family {
    animation-name: none;
  }
}

/* Le nom est le seul élément à sortir de l'échelle de texte courante : il
   ouvre la page et rien d'autre ne le concurrence.

   `word-spacing` est en `em` et non en pixels : il vaut -32 px à la taille
   maximale du titre, 89,76 px, mais `--step-6` descend à 44,8 px en mobile,
   où -32 px feraient entrer le second mot dans le premier. L'`em` tient le
   même rapport à toute largeur.

   La minuscule est posée ici et non dans le contenu : `profile.name` garde
   ses capitales pour le texte de la page et pour le nom accessible. */
.home__name {
  /* Le nom soudé mesure 7,99 fois sa taille de police — rapport mesuré dans
     Chrome et constant, puisqu'il ne dépend que des métriques de la fonte.
     `--step-6` l'ignore : à 416 px de large il rend 48,99 px, soit un nom de
     391 px pour 384 px disponibles. Le nom passait alors à la ligne, et la
     marge négative qui soude les deux mots débordait à gauche en seconde
     ligne, où l'`overflow-x` de l'entrée la rognait.

     Le second terme borne donc la taille à ce que la gouttière laisse, avec
     8,1 pour marge. Il l'emporte sous 436 px environ, `--step-6` au-dessus.

     `nowrap` est la ceinture : un nom soudé qui passe à la ligne n'a aucun
     sens, et aucun réglage ne doit pouvoir l'y remettre. */
  font-size: min(
    var(--step-6),
    calc((100vw - 2 * var(--page-gutter)) / 8.1)
  );
  line-height: 1;
  text-transform: lowercase;
  white-space: nowrap;

  /* Le nom sort de sa boîte pendant l'entrée : le prénom de 1,5em à gauche,
     le nom d'autant à droite. Vers la gauche, un débordement n'est jamais
     défilable ; vers la droite, il le serait, et une fenêtre à peine plus
     large que `--page-max` gagnerait une barre horizontale le temps de
     l'animation.

     `overflow-x: clip` l'empêche sans créer de conteneur de défilement,
     donc sans casser le `position: sticky` de l'en-tête — ce que
     `overflow: hidden` aurait fait. La marge de rognage laisse passer toute
     la course, donc rien de visible n'est coupé. */
  overflow-x: clip;
  overflow-clip-margin: 2em;
}

/* Le chevauchement des deux mots passe par une marge et non par
   `word-spacing`. Entre deux boîtes en ligne, l'effet négatif de
   `word-spacing` est **plafonné** : les mots se touchent sans se recouvrir.
   Mesuré dans Chrome — passer de `-0.3565em` à `-0.48em` ne changeait plus
   rien dès que le second mot avait son propre `span`, que le premier
   `span` seul resserrait encore.

   La marge n'est pas plafonnée. `-0.3571em` rend le titre à la largeur
   exacte du dessin validé. */
.home__family {
  margin-inline-start: -0.3571em;
}

/* Le nom entre en deux mouvements qui se rejoignent : le prénom vient de la
   gauche, le nom de la droite, et le `word-spacing` négatif les soude à
   l'arrivée. Décision d'Arnaud du 09/11/2026, consignée en § 7 de
   `DESIGN.md` — c'est le seul endroit du site où l'entrée n'est pas la
   figure commune, et le § dit pourquoi.

   `translate` et `opacity` seules : les deux propriétés que le navigateur
   compose sans recalculer la mise en page.

   La course est en `em`, comme le `word-spacing` : elle suit la taille du
   titre, qui va de 44,8 à 89,76 px. */
@keyframes name-from-left {
  from {
    opacity: 0;
    translate: -1.5em 0;
  }
}

@keyframes name-from-right {
  from {
    opacity: 0;
    translate: 1.5em 0;
  }
}

.home__given,
.home__family {
  display: inline-block;
  animation-duration: var(--dur-slower);
  animation-timing-function: var(--ease-out);
  animation-fill-mode: backwards;
}

.home__given {
  animation-name: name-from-left;
}

.home__family {
  animation-name: name-from-right;
}

/* Le prénom porte la couleur de la marque, fixe dans les deux thèmes, comme
   le `a` du monogramme. Écart de contraste assumé et chiffré dans
   `DESIGN.md` § 5 : 2,72:1 sur le papier clair, sous le seuil qu'un titre
   doit tenir. */
.home__given {
  color: var(--color-logo-ink);
}

.home__tagline {
  max-width: var(--measure);
  margin-top: var(--space-m);
  color: var(--color-fg-muted);
  font-size: var(--step-2);
}

.home__pitch {
  max-width: var(--measure);
  margin-top: var(--space-m);
}

.home__download {
  margin-top: var(--space-l);
}

.home__section {
  margin-top: var(--space-2xl);
  padding-top: var(--space-m);
  border-top: var(--rule-strong);
}

.home__projects {
  margin: var(--space-m) 0 0;
  padding: 0;
  list-style: none;
}

.home__project {
  max-width: var(--measure);
  padding-top: var(--space-s);
  border-top: var(--rule);
}

.home__project + .home__project {
  margin-top: var(--space-l);
}

.home__project-title {
  margin: 0;
  font-size: var(--step-2);
}

.home__project-link {
  color: inherit;
}

.home__project-year {
  margin-top: var(--space-3xs);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.home__project-problem {
  margin-top: var(--space-s);
}

.home__facts {
  margin: 0;
}

/* Un repère par ligne, séparé par un filet : la liste se lit en diagonale
   sans devenir une grille de cartes. */
.home__fact {
  display: grid;
  gap: var(--space-3xs);
  padding: var(--space-s) 0;
  border-bottom: var(--rule);
}

.home__fact dt {
  color: var(--color-fg-muted);
  font-size: var(--step--1);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.home__fact dd {
  margin: 0;
  font-size: var(--step-1);
}

/* Le socle est une énumération longue, séparée par des barres verticales :
   un cran de texte en dessous des autres repères, pour qu'il tienne sans
   couper un terme en deux sur un téléphone. */
.home__fact-stack {
  font-size: var(--step-0);
}

.home__fact {
  @include bp.respond-up(m) {
    grid-template-columns: 16rem 1fr;
    gap: var(--space-m);
    align-items: baseline;
  }
}

/* Les coordonnées : la forme des listes « Me joindre » de `/a-propos`, à un
   cran de texte au-dessus — c'est l'appel de fin de page. */
.home__contact {
  margin: var(--space-m) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--step-1);
}

.home__contact li {
  display: flex;
  align-items: baseline;
  gap: var(--space-2xs);
}

.home__contact li + li {
  margin-top: var(--space-2xs);
}

.home__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s);
  margin-top: var(--space-m);
}

.home__action {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: var(--space-2xs) var(--space-s);
  border: var(--rule-strong);
  color: var(--color-fg);
  text-decoration: none;
}

.home__action:hover {
  background-color: var(--color-fg);
  color: var(--color-bg);
}
</style>
