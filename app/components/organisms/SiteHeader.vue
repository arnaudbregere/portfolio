<script setup lang="ts">
import { siteNav } from '~~/content/nav'

const isMenuOpen = ref(false)

/**
 * La surcouche se ferme au franchissement du point de rupture : ouverte en
 * mobile puis la fenêtre élargie, le déclencheur disparaît et plus rien ne la
 * referme sinon `Échap`. `DESIGN.md` § 6 porte la règle.
 *
 * La requête est en `em`, comme le mixin `respond-up(m)` dont elle double la
 * valeur : en pixels, elle ne suivrait pas une taille de police de navigateur
 * agrandie, et la barre s'afficherait pendant que le déclencheur commande
 * encore une surcouche.
 */
const DESKTOP_QUERY = '(min-width: 48em)'

let desktop: MediaQueryList | undefined

const closeOnDesktop = (event: MediaQueryListEvent) => {
  if (event.matches) isMenuOpen.value = false
}

onMounted(() => {
  desktop = window.matchMedia(DESKTOP_QUERY)
  desktop.addEventListener('change', closeOnDesktop)
})

onBeforeUnmount(() => desktop?.removeEventListener('change', closeOnDesktop))
</script>

<template>
  <header class="o-header">
    <div class="o-header__inner">
      <!-- Le monogramme est `aria-hidden` : deux lettres ne nomment pas le
           site. Le nom le suit en texte réel, masqué visuellement, donc le
           lien garde « Arnaud Brégère » pour nom accessible. -->
      <NuxtLink to="/" class="o-header__wordmark">
        <span class="o-header__monogram" aria-hidden="true">ab</span>
        <span class="visually-hidden">Arnaud Brégère</span>
      </NuxtLink>

      <!-- Les quatre rubriques en clair à partir de `m`, sans leur rang : les
           chiffres `01` à `04` restent à la surcouche mobile, où le corps du
           texte leur donne leur place. `DESIGN.md` § 6. -->
      <nav class="o-header__nav" aria-label="Rubriques">
        <ul>
          <li v-for="item in siteNav" :key="item.to">
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Enveloppe plutôt qu'une classe posée sur le composant : la règle qui
           le cache et celle que porte son propre style viseraient sinon le même
           élément avec la même spécificité, et l'ordre d'injection trancherait. -->
      <div class="o-header__toggle">
        <ThemeToggle />
      </div>

      <!-- Enveloppe plutôt qu'une classe posée sur le composant : la règle qui
           le cache et celle que porte `Button` viseraient sinon le même élément
           avec la même spécificité, et l'ordre d'injection trancherait. -->
      <div class="o-header__trigger">
        <Button
          aria-controls="menu-principal"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = true"
        >
          Menu
        </Button>
      </div>
    </div>

    <NavOverlay v-model:open="isMenuOpen" />
  </header>
</template>

<style scoped lang="scss">
@use '../../styles/breakpoints' as bp;

/* L'en-tête suit le défilement : le menu doit rester atteignable sur une page
   longue, sans remonter. */
.o-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-bg);
  border-bottom: var(--rule);
}

/* La signature pousse tout le reste à droite : la barre, la bascule et le
   déclencheur restent groupés, dans cet ordre, à toute largeur. */
.o-header__inner {
  display: flex;
  gap: var(--space-s);
  align-items: center;
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding: var(--space-s) var(--page-gutter);
}

/* `min-height` et le centrage : la cible tactile d'un lien de l'en-tête vaut
   celle d'un bouton, 44 px (RGAA 4.1), même quand son texte est plus court.
   `DESIGN.md` § 5. */
.o-header__wordmark {
  display: inline-flex;
  align-items: center;
  min-height: var(--control-min-height);
  margin-inline-end: auto;
  color: inherit;
  text-decoration: none;
}

/* Monogramme : deux minuscules serrées, dessinées par les axes de la police
   plutôt que par un fichier. `DESIGN.md` § 5.

   `font-weight` et `font-stretch` et non `font-variation-settings` : les
   propriétés natives héritent et s'animent, ce que `_fonts.scss` pose comme
   règle de la police variable. L'interlettrage est négatif pour que le `b`
   morde sur le `a`.

   `line-height: 1` et `display: block` : sans eux, l'interligne du corps de
   texte grandirait la barre autour de deux lettres.

   Le dernier caractère porte l'interlettrage négatif comme les autres, donc
   le `b` finirait collé au bord droit : `padding-inline-end` lui rend sa
   place. */
.o-header__monogram {
  display: block;
  padding-inline-end: 0.19em;
  font-family: var(--font-display);
  font-size: var(--step-4);
  font-weight: 900;
  font-stretch: 100%;
  letter-spacing: -0.19em;
  line-height: 1;
}

/* `display: none` et non un masquage visuel : les deux formes de navigation ne
   doivent jamais être dans l'arbre d'accessibilité en même temps, sinon un
   lecteur d'écran se voit offrir deux chemins pour une seule navigation. */
.o-header__nav {
  display: none;

  @include bp.respond-up(m) {
    display: block;
  }

  ul {
    display: flex;
    gap: var(--space-m);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Mêmes attributs de libellé que la signature : la barre est un index, au
     même rang typographique que le nom qui la précède. */
  a {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem; // 44px : cible tactile RGAA 4.1
    color: inherit;
    font-family: var(--font-display);
    font-size: var(--size-label);
    font-weight: var(--label-weight);
    font-stretch: var(--label-stretch);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    text-decoration: none;
    transition: color var(--dur-fast) var(--ease-out);
  }

  /* La rubrique courante passe à l'encre. `NuxtLink` pose `aria-current` sur
     elle : la couleur double une information déjà portée par l'attribut, elle
     ne la porte pas seule. */
  a:hover,
  a[aria-current='page'] {
    color: var(--color-ink);
  }
}

/* Une seule instance, à toute largeur : en bout de barre en desktop, à gauche
   du déclencheur en mobile. `DESIGN.md` § 6. L'écart supplémentaire n'existe
   qu'en desktop, où la place ne manque pas. */
.o-header__toggle {
  @include bp.respond-up(m) {
    margin-inline-start: var(--space-m);
  }
}

.o-header__trigger {
  @include bp.respond-up(m) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .o-header__nav a {
    transition: none;
  }
}
</style>
