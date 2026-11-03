<script setup lang="ts">
import { contrastRatio, formatRatio, parseColor } from '~/utils/contrast'

/**
 * Planche de spécimen, développement seulement : `nuxt.config.ts` retire cette
 * route du build de production. Les ratios ne sont pas recopiés ici, ils sont
 * mesurés sur les tokens réellement appliqués : une couleur modifiée dans
 * `_tokens.scss` se voit immédiatement, dans le thème actif.
 */
useSeoMeta({
  title: 'Spécimen — design system',
  robots: 'noindex, nofollow',
})

type Token = {
  name: string
  role: string
  /** Seuil opposable pour ce rôle. `null` : élément décoratif, non soumis. */
  min: number | null
}

const tokens: Token[] = [
  { name: '--color-fg', role: 'Texte courant', min: 4.5 },
  { name: '--color-fg-muted', role: 'Texte secondaire', min: 4.5 },
  { name: '--color-ink', role: 'Encre d’annotation', min: 4.5 },
  { name: '--color-line-strong', role: 'Bordure de contrôle', min: 3 },
  { name: '--color-focus', role: 'Indicateur de focus', min: 3 },
  { name: '--color-line', role: 'Filet décoratif', min: null },
]

type Measured = Token & { value: string; ratio: number | null }

const measured = ref<Measured[]>([])

const measure = () => {
  const styles = getComputedStyle(document.documentElement)
  const background = parseColor(styles.getPropertyValue('--color-bg'))

  measured.value = tokens.map((token) => {
    const value = styles.getPropertyValue(token.name).trim()
    const color = parseColor(value)

    return {
      ...token,
      value,
      ratio: color && background ? contrastRatio(color, background) : null,
    }
  })
}

const colorMode = useColorMode()
const theme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))

onMounted(measure)
watch(theme, async () => {
  await nextTick()
  measure()
})

const steps = [
  '--step-6',
  '--step-5',
  '--step-4',
  '--step-3',
  '--step-2',
  '--step-1',
  '--step-0',
  '--step--1',
]

const spaces = [
  '--space-3xs',
  '--space-2xs',
  '--space-xs',
  '--space-s',
  '--space-m',
  '--space-l',
  '--space-xl',
  '--space-2xl',
  '--space-3xl',
]
</script>

<template>
  <div class="ds">
    <header class="ds__head">
      <h1>Spécimen</h1>
      <p class="ds__standfirst">
        Planche de contrôle du design system. Les ratios sont mesurés sur les
        tokens réellement appliqués, dans le thème actif. Cette route n’existe
        qu’en développement.
      </p>
      <div class="ds__theme" role="group" aria-label="Thème mesuré">
        <button
          type="button"
          :aria-pressed="theme === 'light'"
          @click="colorMode.preference = 'light'"
        >
          Clair
        </button>
        <button
          type="button"
          :aria-pressed="theme === 'dark'"
          @click="colorMode.preference = 'dark'"
        >
          Sombre
        </button>
      </div>
    </header>

    <section class="ds__figure">
      <h2 class="ds__label">Couleurs</h2>
      <!--
        Région défilable : à 390px le tableau ne tient pas. `tabindex` la rend
        atteignable au clavier, comme l'exige WCAG 2.1.1.
      -->
      <div
        class="ds__scroller"
        role="region"
        aria-label="Tokens de couleur et ratios de contraste mesurés"
        tabindex="0"
      >
        <table class="ds__table">
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Rôle</th>
              <th scope="col">Valeur</th>
              <th scope="col">Sur le fond</th>
              <th scope="col">Seuil</th>
              <th scope="col"><span class="visually-hidden">Échantillon</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in measured" :key="token.name">
              <td><code>{{ token.name }}</code></td>
              <td>{{ token.role }}</td>
              <td><code>{{ token.value }}</code></td>
              <td>{{ token.ratio === null ? '—' : formatRatio(token.ratio) }}</td>
              <td>
                <span v-if="token.min === null" class="ds__muted">décoratif</span>
                <span
                  v-else
                  :class="{ 'ds__fail': token.ratio !== null && token.ratio < token.min }"
                >{{ formatRatio(token.min) }}</span>
              </td>
              <td>
                <span
                  class="ds__swatch"
                  :style="{ backgroundColor: `var(${token.name})` }"
                />
              </td>
            </tr>
            <tr v-if="measured.length === 0">
              <td colspan="6" class="ds__muted">Mesure au montage de la page.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Échelle typographique</h2>
      <div>
        <p
          v-for="step in steps"
          :key="step"
          class="ds__step"
          :style="{ fontSize: `var(${step})` }"
        >
          <span class="ds__token">{{ step }}</span> Brégère
        </p>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Espacement</h2>
      <ul class="ds__spaces">
        <li v-for="space in spaces" :key="space">
          <span class="ds__token">{{ space }}</span>
          <span class="ds__bar" :style="{ inlineSize: `var(${space})` }" />
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/breakpoints' as bp;

/* Le cadrage appartient au gabarit : la planche ne repose ni gouttière ni
   largeur maximale. */
.ds {
  display: grid;
}

.ds__head {
  display: grid;
  gap: var(--space-m);
  justify-items: start;
  padding-bottom: var(--space-l);
  border-bottom: var(--rule-strong);
}

.ds__standfirst {
  color: var(--color-fg-muted);
}

.ds__theme {
  display: inline-flex;
  border: var(--rule-strong);

  button {
    min-height: 2.75rem; // 44px : cible tactile RGAA
    padding: var(--space-2xs) var(--space-s);
    border: 0;
    background-color: transparent;
    font-family: var(--font-display);
    font-size: var(--size-label);
    font-weight: var(--label-weight);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    cursor: pointer;
  }

  button + button {
    border-left: var(--rule-strong);
  }

  button[aria-pressed='true'] {
    background-color: var(--color-fg);
    color: var(--color-bg);
  }
}

/** La page se divise par des filets ; aucune figure n'est posée dans une carte. */
.ds__figure {
  display: grid;
  gap: var(--space-m);
  padding-block: var(--space-l);
  border-bottom: var(--rule);

  @include bp.respond-up(m) {
    grid-template-columns: 12rem 1fr;
    gap: var(--space-l);
  }
}

.ds__label {
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  font-stretch: var(--label-stretch);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-label);
  color: var(--color-fg-muted);
}

.ds__scroller {
  // `min-width: auto` sur un élément de grille le laisse pousser la grille à la
  // largeur de son contenu : la page déborderait au lieu de la seule région.
  min-width: 0;
  overflow-x: auto;
}

.ds__table {
  width: 100%;
  min-width: 44rem; // en deçà, les noms de tokens se coupent au milieu
  border-collapse: collapse;
  font-size: var(--step--1);
  text-align: left;

  th,
  td {
    padding: var(--space-2xs) var(--space-s) var(--space-2xs) 0;
    border-bottom: var(--rule);
    vertical-align: baseline;
  }

  th {
    font-family: var(--font-display);
    font-size: var(--size-label);
    font-weight: var(--label-weight);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
  }

  code {
    white-space: nowrap;
  }
}

.ds__muted {
  color: var(--color-fg-muted);
}

/** Un seuil non tenu se signale en encre : c'est ce qui est sous examen. */
.ds__fail {
  color: var(--color-ink);
  font-weight: 700;
}

.ds__swatch {
  display: block;
  width: var(--space-l);
  height: var(--space-s);
  border: var(--rule-strong);
}

.ds__step {
  max-width: none;
  font-family: var(--font-display);
  font-weight: var(--display-weight);
  font-stretch: var(--display-stretch);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-display);
  text-transform: uppercase;
}

.ds__spaces {
  display: grid;
  gap: var(--space-2xs);
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    gap: var(--space-s);
    align-items: center;
  }
}

.ds__bar {
  display: block;
  block-size: var(--space-2xs);
  background-color: var(--color-ink);
}

.ds__token {
  display: inline-block;
  min-width: 8ch;
  color: var(--color-fg-muted);
  font-family: var(--font-ui);
  font-size: var(--size-label);
  font-weight: 400;
  font-stretch: normal;
  letter-spacing: var(--tracking-ui);
  text-transform: none;
  font-variant-numeric: tabular-nums;
}
</style>
