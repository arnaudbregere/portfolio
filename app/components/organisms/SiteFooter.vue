<script setup lang="ts">
import { siteNav } from '~~/content/nav'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="o-footer">
    <nav class="o-footer__nav" aria-label="Pied de page">
      <ul>
        <li v-for="item in siteNav" :key="item.to">
          <SiteLink :href="item.to">{{ item.label }}</SiteLink>
        </li>
      </ul>
    </nav>

    <p class="o-footer__legal">
      <small>© {{ year }} Arnaud Brégère</small>
    </p>
  </footer>
</template>

<style scoped lang="scss">
.o-footer {
  display: grid;
  gap: var(--space-l);
  width: 100%;
  max-width: var(--page-max);
  margin-inline: auto;
  padding: var(--space-l) var(--page-gutter) var(--space-xl);
  border-top: var(--rule-strong);
}

ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s) var(--space-m);
  margin: 0;
  padding: 0;
  list-style: none;
}

.o-footer__nav a {
  display: inline-block;
  padding-block: var(--space-2xs);
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

/* La rubrique courante se marque par l'encre, le seul emploi de couleur ici. */
.o-footer__nav a.router-link-active {
  color: var(--color-ink);
}

.o-footer__legal {
  color: var(--color-fg-muted);
}
</style>
