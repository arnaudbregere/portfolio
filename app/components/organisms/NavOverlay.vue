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
      <button type="button" class="o-nav__close" @click="open = false">
        Fermer
      </button>
    </div>

    <nav class="o-nav__body" aria-label="Rubriques">
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

  &::backdrop {
    background-color: var(--color-bg);
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

.o-nav__close {
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

/* Figure numérotée : chaque rubrique porte son rang, comme sur une planche. */
.o-nav__figure {
  font-size: var(--size-label);
  font-stretch: normal;
  letter-spacing: var(--tracking-label);
  color: var(--color-fg-muted);
  font-variant-numeric: tabular-nums;
}
</style>
