<script setup lang="ts">
import { siteNav } from '~~/content/nav'

/**
 * Menu plein écran. Il s'appuie sur `<dialog>` et `showModal()` : le piège à
 * focus, la fermeture par `Échap` et la restitution du focus à l'élément
 * déclencheur sont alors tenus par le navigateur, et non réécrits à la main.
 * `PRODUCT.md` exige les trois.
 */
const open = defineModel<boolean>('open', { required: true })

const dialog = ref<HTMLDialogElement | null>(null)
const route = useRoute()

watch(open, async (isOpen) => {
  await nextTick()

  if (isOpen) dialog.value?.showModal()
  else dialog.value?.close()
})

// Naviguer ferme le menu : la route change sous une surcouche qui, sinon,
// resterait ouverte par-dessus la page atteinte.
watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <dialog
    id="menu-principal"
    ref="dialog"
    class="o-nav"
    aria-label="Menu principal"
    @close="open = false"
  >
    <div class="o-nav__head">
      <Button @click="open = false">Fermer</Button>
    </div>

    <!-- Pas d'`aria-label` : le `<dialog>` qui l'entoure se nomme déjà « Menu
         principal », et la barre de l'en-tête porte le nom « Rubriques ». Deux
         repères de navigation du même nom dans un document se confondent. -->
    <nav class="o-nav__body">
      <ul>
        <li v-for="(item, index) in siteNav" :key="item.to">
          <NuxtLink :to="item.to">
            <span class="o-nav__figure">{{
              String(index + 1).padStart(2, '0')
            }}</span>
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </dialog>
</template>

<style scoped lang="scss">
@use '../../styles/breakpoints' as bp;

/**
 * Ouverture et fermeture animées sans une ligne de JavaScript : `@starting-style`
 * donne l'état d'avant l'ouverture, et `allow-discrete` laisse `display` et
 * `overlay` participer à la transition — sans quoi le menu disparaîtrait d'un
 * coup à la fermeture, avant d'avoir pu s'effacer.
 *
 * Le mouvement n'ajoute aucune information : le menu est lisible à l'arrêt.
 */
.o-nav {
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background-color: var(--color-bg);
  color: var(--color-fg);
  opacity: 0;
  translate: 0 -0.5rem;
  transition:
    opacity var(--dur-base) var(--ease-out),
    translate var(--dur-base) var(--ease-out),
    display var(--dur-base) allow-discrete,
    overlay var(--dur-base) allow-discrete;

  &[open] {
    opacity: 1;
    translate: 0 0;

    @starting-style {
      opacity: 0;
      translate: 0 -0.5rem;
    }
  }

  &::backdrop {
    background-color: var(--color-bg);
    opacity: 0;
    transition:
      opacity var(--dur-base) var(--ease-out),
      display var(--dur-base) allow-discrete,
      overlay var(--dur-base) allow-discrete;
  }

  &[open]::backdrop {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
}

.o-nav__head {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding: var(--space-s) var(--page-gutter);
  border-bottom: var(--rule);
}

.o-nav__body {
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding: var(--space-l) var(--page-gutter);

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li + li {
    border-top: var(--rule);
  }

  a {
    display: flex;
    align-items: baseline;
    gap: var(--space-s);
    padding-block: var(--space-s);
    font-family: var(--font-display);
    font-size: var(--step-4);
    font-weight: var(--display-weight);
    font-stretch: var(--display-stretch);
    line-height: var(--leading-tight);
    letter-spacing: var(--tracking-display);
    text-transform: uppercase;
    text-decoration: none;

    @include bp.respond-up(m) {
      font-size: var(--step-5);
    }

    &:hover,
    &.router-link-active {
      color: var(--color-ink);
    }
  }
}

/* Les rubriques entrent l'une après l'autre, 40 ms d'écart : assez pour donner
   le sens de lecture, trop peu pour faire attendre. */
.o-nav[open] .o-nav__body li {
  animation: nav-entry var(--dur-base) var(--ease-out) backwards;
}

@for $i from 1 through 6 {
  .o-nav__body li:nth-child(#{$i}) {
    animation-delay: #{40ms * $i};
  }
}

@keyframes nav-entry {
  from {
    opacity: 0;
    translate: 0 0.75rem;
  }
}

/* La règle globale de `_reset.scss` écrase les durées, pas les délais : sans
   cette remise à zéro, le menu resterait vide le temps du décalage. */
@media (prefers-reduced-motion: reduce) {
  .o-nav__body li {
    animation-delay: 0ms !important;
  }
}

/* Figure numérotée : chaque rubrique porte son rang, comme sur une planche. */
.o-nav__figure {
  font-size: var(--size-label);
  font-stretch: normal;
  letter-spacing: var(--tracking-label);
  color: var(--color-fg-muted);
  font-variant-numeric: tabular-nums;
}
</style>
