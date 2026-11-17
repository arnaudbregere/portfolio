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
  { name: '--color-priority-high', role: 'Priorité élevée', min: 4.5 },
  { name: '--color-priority-medium', role: 'Priorité moyenne', min: 4.5 },
  { name: '--color-priority-low', role: 'Priorité faible', min: 4.5 },
  { name: '--color-line-strong', role: 'Bordure de contrôle', min: 3 },
  { name: '--color-focus', role: 'Indicateur de focus', min: 3 },
  { name: '--color-line', role: 'Filet décoratif', min: null },
]

type Measured = Token & { value: string; ratio: number | null }

const measured = ref<Measured[]>([])

const measure = () => {
  const styles = getComputedStyle(document.documentElement)
  const planche = getComputedStyle(document.querySelector('.ds')!)
  const background = parseColor(styles.getPropertyValue('--color-bg'))

  viewport.value = window.innerWidth

  resolved.value = Object.fromEntries(
    [...typography, ...rules, ...controls, ...motion, ...layout]
      .map(({ name }) => [name, styles.getPropertyValue(name).trim()])
      .concat(
        breakpointNames.map((name) => [name, planche.getPropertyValue(name).trim()]),
      ),
  )

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

onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => window.removeEventListener('resize', measure))
watch(theme, async () => {
  await nextTick()
  measure()
})

/**
 * Les tokens rendus tels quels, sans mesure : leur valeur est la donnée.
 * Lus sur l'élément racine comme les couleurs, donc une valeur modifiée dans
 * `_tokens.scss` se voit ici sans que rien ne soit recopié.
 */
type Readout = { name: string; role: string }

const resolved = ref<Record<string, string>>({})

const readouts = (names: Readout[]) =>
  computed(() =>
    names.map((entry) => ({ ...entry, value: resolved.value[entry.name] ?? '' })),
  )

const typography: Readout[] = [
  { name: '--font-display', role: 'Titres, libellés, boutons' },
  { name: '--font-ui', role: 'Texte courant et interface' },
  { name: '--display-weight', role: 'Graisse du registre d’affichage' },
  { name: '--display-stretch', role: 'Largeur du registre d’affichage' },
  { name: '--label-weight', role: 'Graisse des libellés en capitales' },
  { name: '--label-stretch', role: 'Largeur des libellés en capitales' },
  { name: '--tracking-display', role: 'Approche des titres' },
  { name: '--tracking-label', role: 'Approche des libellés' },
  { name: '--leading-tight', role: 'Interligne des titres' },
  { name: '--leading-normal', role: 'Interligne du texte' },
  { name: '--size-label', role: 'Corps fixe des libellés — 13 px' },
]

const rules: Readout[] = [
  { name: '--rule', role: 'Filet décoratif, division de page' },
  { name: '--rule-strong', role: 'Bordure de contrôle' },
  { name: '--rule-ink', role: 'Filet de l’étiquette de taxonomie' },
  { name: '--radius-s', role: 'Seul rayon du site, réservé à la taxonomie' },
]

const controls: Readout[] = [
  { name: '--control-min-height', role: 'Cible tactile RGAA 4.1 — 44 px' },
  { name: '--control-min-width', role: 'Réserve du plus long libellé' },
]

const motion: Readout[] = [
  { name: '--dur-fast', role: 'Survol, bascule d’état' },
  { name: '--dur-base', role: 'Transition courante' },
  { name: '--dur-slow', role: 'Entrée de page' },
  { name: '--dur-slower', role: 'Entrée du nom, accueil' },
  { name: '--ease-out', role: 'Seule courbe du site' },
]

const layout: Readout[] = [
  { name: '--measure', role: 'Largeur de lecture du texte' },
  { name: '--page-max', role: 'Largeur maximale du gabarit' },
  { name: '--page-gutter', role: 'Gouttière latérale' },
]

/** Les sept pictogrammes écrits dans l'atome `Icon`, et rien de plus. */
const icons = [
  'phone',
  'mail',
  'chevron-left',
  'chevron-right',
  'chevron-down',
  'sun',
  'moon',
] as const

/**
 * Les points de rupture viennent de `_breakpoints.scss` par le bloc de style
 * de cette page : ce sont des variables Sass, qu'une media query exige, et les
 * recopier ici les ferait diverger au premier changement.
 */
const breakpointNames = ['--bp-s', '--bp-m', '--bp-l', '--bp-xl'] as const

const viewport = ref(0)

const breakpoints = computed(() =>
  breakpointNames.map((name) => {
    const value = resolved.value[name] ?? ''
    const em = Number.parseFloat(value)
    const pixels = Number.isNaN(em) ? null : em * 16

    return {
      name,
      value,
      pixels,
      active: pixels !== null && viewport.value >= pixels,
    }
  }),
)

const typographyRows = readouts(typography)
const ruleRows = readouts(rules)
const controlRows = readouts(controls)
const motionRows = readouts(motion)
const layoutRows = readouts(layout)

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
      <div class="ds__body">
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
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Registres typographiques</h2>
      <div class="ds__body">
        <div class="ds__specimen">
          <p class="ds__specimen-display">Brégère</p>
          <p class="ds__specimen-label">Projets · À propos · Contact</p>
          <p class="ds__specimen-ui">
            Le registre d’affichage porte les titres et les libellés ; le texte
            courant revient à la police du système.
          </p>
        </div>
        <div class="ds__scroller" role="region" aria-label="Tokens de typographie" tabindex="0">
          <table class="ds__table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Rôle</th>
                <th scope="col">Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in typographyRows" :key="token.name">
                <td><code>{{ token.name }}</code></td>
                <td>{{ token.role }}</td>
                <td><code>{{ token.value }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Échelle typographique</h2>
      <div class="ds__body">
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
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Espacement</h2>
      <div class="ds__body">
        <ul class="ds__spaces">
          <li v-for="space in spaces" :key="space">
            <span class="ds__token">{{ space }}</span>
            <span class="ds__bar" :style="{ inlineSize: `var(${space})` }" />
          </li>
        </ul>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Mise en page</h2>
      <div class="ds__body">
        <div class="ds__scroller" role="region" aria-label="Tokens de mise en page" tabindex="0">
          <table class="ds__table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Rôle</th>
                <th scope="col">Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in layoutRows" :key="token.name">
                <td><code>{{ token.name }}</code></td>
                <td>{{ token.role }}</td>
                <td><code>{{ token.value }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Points de rupture</h2>
      <div class="ds__body">
        <ul class="ds__breakpoints">
          <li v-for="point in breakpoints" :key="point.name">
            <span class="ds__token">{{ point.name }}</span>
            <code>{{ point.value }}</code>
            <span class="ds__muted">{{ point.pixels === null ? '—' : `${point.pixels} px` }}</span>
            <strong v-if="point.active">atteint</strong>
            <span v-else class="ds__muted">non atteint</span>
          </li>
        </ul>
        <p class="ds__note">
          Fenêtre mesurée : <strong>{{ viewport }} px</strong>. Les valeurs
          viennent de <code>_breakpoints.scss</code> par le bloc de style de cette
          page — ce sont des variables Sass, qu’une media query exige.
        </p>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Filets et rayon</h2>
      <div class="ds__body">
        <div class="ds__rules">
          <p class="ds__rule-sample ds__rule-sample--light">--rule</p>
          <p class="ds__rule-sample ds__rule-sample--strong">--rule-strong</p>
          <p class="ds__rule-sample ds__rule-sample--ink">--rule-ink · --radius-s</p>
        </div>
        <div class="ds__scroller" role="region" aria-label="Tokens de filet et de rayon" tabindex="0">
          <table class="ds__table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Rôle</th>
                <th scope="col">Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in ruleRows" :key="token.name">
                <td><code>{{ token.name }}</code></td>
                <td>{{ token.role }}</td>
                <td><code>{{ token.value }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Contrôles</h2>
      <div class="ds__body">
        <div class="ds__scroller" role="region" aria-label="Tokens de contrôle" tabindex="0">
          <table class="ds__table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Rôle</th>
                <th scope="col">Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in controlRows" :key="token.name">
                <td><code>{{ token.name }}</code></td>
                <td>{{ token.role }}</td>
                <td><code>{{ token.value }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ds__controls">
          <Button>Libellé</Button>
          <Button icon><Icon name="sun" /></Button>
          <a class="ds__focus-demo" href="#contenu">Cible de focus</a>
        </div>
        <p class="ds__note">
          Le champ de saisie et le <code>&lt;select&gt;</code> ne sont pas repris
          ici : leur style vit dans <code>TodoList.vue</code>, et le recopier
          ferait diverger les deux. Ils se regardent sur
          <code>/projets/todo-list</code>.
        </p>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Pictogrammes</h2>
      <div class="ds__body">
        <ul class="ds__icons">
          <li v-for="name in icons" :key="name">
            <Icon :name="name" />
            <span class="ds__token">{{ name }}</span>
          </li>
        </ul>
        <p class="ds__note">Les sept pictogrammes écrits dans l’atome <code>Icon</code>. Chacun rend un <code>&lt;svg aria-hidden="true"&gt;</code> : le sens est porté par le texte du bouton.</p>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Étiquette de taxonomie</h2>
      <div class="ds__body">
        <div class="ds__tags">
          <!-- La seule forme arrondie du site, `DESIGN.md` § 5 : filet et
               libellé en encre, rayon `--radius-s`. Elle est posée ici pour que
               la bascule de thème la montre dans ses deux encres. -->
          <TagList :items="['Vue', 'Nuxt', 'TypeScript', 'SCSS']" label="Exemple de technologies" />
          <p class="ds__token">--radius-s · --rule-ink · --color-ink</p>
        </div>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Rangs de priorité</h2>
      <div class="ds__body">
        <div class="ds__tags ds__tags--row">
          <TagList class="ds__tag--high" :items="['Élevée']" label="Priorité élevée" />
          <TagList class="ds__tag--medium" :items="['Moyenne']" label="Priorité moyenne" />
          <TagList class="ds__tag--low" :items="['Faible']" label="Priorité faible" />
        </div>
        <p class="ds__note">
          Les trois rangs de la démo de liste de tâches, posés par la propriété
          <code>--tag-ink</code> de l’atome <code>TagList</code>. Le mot reste
          écrit à côté de la couleur : elle le double, elle ne le porte jamais
          seule.
        </p>
      </div>
    </section>

    <section class="ds__figure">
      <h2 class="ds__label">Mouvement</h2>
      <div class="ds__body">
        <div class="ds__scroller" role="region" aria-label="Tokens de durée et de courbe" tabindex="0">
          <table class="ds__table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Rôle</th>
                <th scope="col">Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in motionRows" :key="token.name">
                <td><code>{{ token.name }}</code></td>
                <td>{{ token.role }}</td>
                <td><code>{{ token.value }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="ds__note">
          Toute animation est désactivée sous
          <code>prefers-reduced-motion: reduce</code>, par une règle unique de
          <code>_reset.scss</code>.
        </p>
      </div>
    </section>

  </div>
</template>

<style scoped lang="scss">
@use '../styles/breakpoints' as bp;

/* Le cadrage appartient au gabarit : la planche ne repose ni gouttière ni
   largeur maximale. */
.ds {
  display: grid;

  /* Les points de rupture sont des variables Sass — le CSS natif n'accepte
     pas de custom property dans une media query. Ils sont exposés ici en
     propriétés personnalisées pour que la planche les lise au lieu de les
     recopier : `_breakpoints.scss` reste la source unique. */
  --bp-s: #{bp.$bp-s};
  --bp-m: #{bp.$bp-m};
  --bp-l: #{bp.$bp-l};
  --bp-xl: #{bp.$bp-xl};
}

.ds__note {
  max-width: var(--measure);
  margin-top: var(--space-2xs);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

/* -- Typographie ---------------------------------------------------------- */
.ds__specimen {
  display: grid;
  gap: var(--space-2xs);
  margin-bottom: var(--space-s);
}

.ds__specimen-display {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--step-4);
  font-weight: var(--display-weight);
  font-stretch: var(--display-stretch);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-display);
}

.ds__specimen-label {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--size-label);
  font-weight: var(--label-weight);
  font-stretch: var(--label-stretch);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.ds__specimen-ui {
  max-width: var(--measure);
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--step-0);
  line-height: var(--leading-normal);
}

/* -- Filets --------------------------------------------------------------- */
.ds__rules {
  display: grid;
  gap: var(--space-s);
  margin-bottom: var(--space-s);
  justify-items: start;
}

.ds__rule-sample {
  margin: 0;
  padding: var(--space-2xs) var(--space-xs);
  color: var(--color-fg-muted);
  font-family: var(--font-ui);
  font-size: var(--size-label);
}

.ds__rule-sample--light {
  border: var(--rule);
}

.ds__rule-sample--strong {
  border: var(--rule-strong);
}

.ds__rule-sample--ink {
  border: var(--rule-ink);
  border-radius: var(--radius-s);
  color: var(--color-ink);
}

/* -- Contrôles ------------------------------------------------------------ */
.ds__controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s);
  align-items: center;
  margin-top: var(--space-s);
}

/* Posé pour que l'anneau de `_base.scss` se voie sans quitter la planche : le
   lien reçoit le focus à la tabulation, comme n'importe quel lien du site. */
.ds__focus-demo {
  font-size: var(--step--1);
}

/* -- Pictogrammes --------------------------------------------------------- */
.ds__icons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s);
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    gap: var(--space-3xs);
    justify-items: center;
  }
}

/* -- Rangs de priorité ---------------------------------------------------- */
.ds__tag--high {
  --tag-ink: var(--color-priority-high);
}

.ds__tag--medium {
  --tag-ink: var(--color-priority-medium);
}

.ds__tag--low {
  --tag-ink: var(--color-priority-low);
}

/* -- Points de rupture ---------------------------------------------------- */
.ds__breakpoints {
  display: grid;
  gap: var(--space-2xs);
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2xs) var(--space-s);
    align-items: baseline;
    font-size: var(--step--1);
  }
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
    min-height: 2.75rem; /* 44px : cible tactile RGAA */
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

/* Chaque rubrique ne pose qu'**un** enfant après son titre : la grille de
   `.ds__figure` range ses enfants un par cellule, et un second enfant
   tomberait dans la colonne de 12 rem réservée au libellé. */
.ds__body {
  display: grid;
  gap: var(--space-s);
  min-width: 0;
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

.ds__tags {
  display: grid;
  gap: var(--space-2xs);
  justify-items: start;
}

/* Les trois rangs se lisent de front : empilés, ils se compareraient mal. */
.ds__tags--row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-s);
  align-items: center;
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
