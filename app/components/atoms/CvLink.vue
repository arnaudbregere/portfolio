<script setup lang="ts">
/**
 * Lien de téléchargement du CV. Le format et le poids sont annoncés avant le
 * clic : sur mobile, un document inattendu de plusieurs centaines de
 * kilo-octets se paie en données. RGAA 4.1, critère 13.6.
 *
 * L'atome ne connaît pas `content/` : la page lui passe les valeurs.
 */
type Props = {
  href: string
  format: string
  sizeKb: number
}

const props = defineProps<Props>()

const details = computed(() => `${props.format}, ${props.sizeKb} Ko`)
</script>

<template>
  <a class="a-cv-link" :href="href" download>
    <span class="a-cv-link__label">Télécharger le CV</span>
    <span class="a-cv-link__details">{{ details }}</span>
  </a>
</template>

<style scoped lang="scss">
.a-cv-link {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  align-items: baseline;
  min-height: 44px;
  padding: var(--space-2xs) var(--space-s);
  border: var(--rule-strong);
  color: var(--color-fg);
  text-decoration: none;
}

.a-cv-link:hover {
  background-color: var(--color-fg);
  color: var(--color-bg);
}

.a-cv-link__label {
  font-weight: 600;
}

.a-cv-link__details {
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

/* Le fond s'inverse au survol : le texte secondaire doit suivre, sans quoi il
   passe sous le seuil de contraste. */
.a-cv-link:hover .a-cv-link__details {
  color: inherit;
}
</style>
