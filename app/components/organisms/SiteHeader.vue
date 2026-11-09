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
      <NuxtLink to="/" class="o-header__wordmark">Arnaud Brégère</NuxtLink>

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

      <button
        type="button"
        class="o-header__trigger"
        aria-controls="menu-principal"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = true"
      >
        Menu
      </button>
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

.o-header__inner {
  display: flex;
  gap: var(--space-s);
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding: var(--space-s) var(--page-gutter);
}

.o-header__wordmark {
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  font-stretch: var(--label-stretch);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  text-decoration: none;
}

/* `display: none` et non un masquage visuel : les deux formes de navigation ne
   doivent jamais être dans l'arbre d'accessibilité en même temps, sinon un
   lecteur d'écran se voit offrir deux chemins pour une seule navigation. */
.o-header__nav {
  display: none;

  @include bp.respond-up(m) {
    display: block;
    margin-inline-start: auto;
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

.o-header__trigger {
  min-height: 2.75rem; // 44px : cible tactile RGAA 4.1
  padding: var(--space-2xs) var(--space-s);
  border: var(--rule-strong);
  background-color: transparent;
  color: inherit;
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-out);

  &:hover {
    background-color: var(--color-bg-subtle);
  }

  @include bp.respond-up(m) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .o-header__nav a,
  .o-header__trigger {
    transition: none;
  }
}
</style>
