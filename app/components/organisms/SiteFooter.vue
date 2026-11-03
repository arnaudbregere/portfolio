<script setup lang="ts">
import { siteNav } from '~~/content/nav'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="o-footer">
    <nav class="o-footer__nav" aria-label="Pied de page">
      <ul>
        <li v-for="item in siteNav" :key="item.to">
          <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="o-footer__aside">
      <ul class="o-footer__external">
        <li>
          <a href="https://github.com/arnaudbregere" rel="me noopener">GitHub</a>
        </li>
      </ul>
      <ThemeToggle />
    </div>

    <p class="o-footer__legal">
      <small>© {{ year }} Arnaud Brégère</small>
    </p>
  </footer>
</template>

<style scoped lang="scss">
@use '../../styles/breakpoints' as bp;

.o-footer {
  display: grid;
  gap: var(--space-l);
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding: var(--space-l) var(--page-gutter) var(--space-xl);
  border-top: var(--rule-strong);

  @include bp.respond-up(m) {
    grid-template-columns: 1fr auto;
    align-items: start;
  }
}

ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s) var(--space-m);
  margin: 0;
  padding: 0;
  list-style: none;
}

.o-footer__nav a,
.o-footer__external a {
  display: inline-block;
  padding-block: var(--space-2xs);
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

/* La rubrique courante se marque par l'encre, le seul emploi de couleur ici. */
.o-footer__nav a.router-link-active {
  color: var(--color-ink);
}

.o-footer__aside {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-m);
  align-items: center;
}

.o-footer__legal {
  color: var(--color-fg-muted);

  @include bp.respond-up(m) {
    grid-column: 1 / -1;
  }
}
</style>
