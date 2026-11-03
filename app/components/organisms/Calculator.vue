<script setup lang="ts">
import { useCalculator } from '~/composables/useCalculator'

/**
 * Calculatrice jouable. Le composant ne porte que le rendu et le clavier :
 * tout le calcul vit dans `useCalculator`, testé sans monter de composant.
 */
const {
  display,
  operator,
  inputDigit,
  inputDecimal,
  chooseOperator,
  equals,
  toggleSign,
  percent,
  backspace,
  clear,
} = useCalculator()

type Key = {
  label: string
  /** Nom lu à voix haute quand le symbole seul ne se prononce pas. */
  name?: string
  action: () => void
  variant?: 'operator' | 'control'
}

const keys: readonly Key[][] = [
  [
    { label: 'C', name: 'Tout effacer', action: clear, variant: 'control' },
    { label: '±', name: 'Changer de signe', action: toggleSign, variant: 'control' },
    { label: '%', name: 'Pourcentage', action: percent, variant: 'control' },
    { label: '÷', name: 'Diviser', action: () => chooseOperator('÷'), variant: 'operator' },
  ],
  [
    { label: '7', action: () => inputDigit('7') },
    { label: '8', action: () => inputDigit('8') },
    { label: '9', action: () => inputDigit('9') },
    { label: '×', name: 'Multiplier', action: () => chooseOperator('×'), variant: 'operator' },
  ],
  [
    { label: '4', action: () => inputDigit('4') },
    { label: '5', action: () => inputDigit('5') },
    { label: '6', action: () => inputDigit('6') },
    { label: '−', name: 'Soustraire', action: () => chooseOperator('−'), variant: 'operator' },
  ],
  [
    { label: '1', action: () => inputDigit('1') },
    { label: '2', action: () => inputDigit('2') },
    { label: '3', action: () => inputDigit('3') },
    { label: '+', name: 'Additionner', action: () => chooseOperator('+'), variant: 'operator' },
  ],
  [
    { label: '0', action: () => inputDigit('0') },
    { label: ',', name: 'Virgule décimale', action: inputDecimal },
    { label: '⌫', name: 'Effacer le dernier chiffre', action: backspace, variant: 'control' },
    { label: '=', name: 'Égale', action: equals, variant: 'operator' },
  ],
]

const fromKeyboard: Record<string, () => void> = {
  '+': () => chooseOperator('+'),
  '-': () => chooseOperator('−'),
  '*': () => chooseOperator('×'),
  '/': () => chooseOperator('÷'),
  '=': equals,
  '%': percent,
  '.': inputDecimal,
  ',': inputDecimal,
  Backspace: backspace,
  Escape: clear,
  Enter: equals,
}

const onKeydown = (event: KeyboardEvent) => {
  // Entrée sur une touche focalisée actionne déjà cette touche : ne pas
  // calculer deux fois.
  if (event.key === 'Enter' && event.target instanceof HTMLButtonElement) return

  if (/^\d$/.test(event.key)) {
    inputDigit(event.key)
    event.preventDefault()
    return
  }

  const action = fromKeyboard[event.key]

  if (action) {
    action()
    event.preventDefault()
  }
}
</script>

<template>
  <div class="o-calculator" @keydown="onKeydown">
    <output class="o-calculator__screen" aria-live="polite">
      <span class="o-calculator__pending">{{ operator ?? '' }}</span>
      <span class="o-calculator__value">{{ display }}</span>
    </output>

    <div class="o-calculator__keys">
      <template v-for="(row, index) in keys" :key="index">
        <button
          v-for="key in row"
          :key="key.label"
          type="button"
          class="o-calculator__key"
          :class="key.variant && `o-calculator__key--${key.variant}`"
          :aria-label="key.name"
          @click="key.action"
        >
          {{ key.label }}
        </button>
      </template>
    </div>

    <p class="o-calculator__hint">
      Le clavier physique fonctionne : chiffres, opérateurs,
      <kbd>Entrée</kbd> pour le résultat, <kbd>Échap</kbd> pour tout effacer.
    </p>
  </div>
</template>

<style scoped lang="scss">
.o-calculator {
  max-width: 22rem;
  border: var(--rule-strong);
}

/* L'écran garde sa hauteur quel que soit le nombre : un afficheur qui saute
   déplace tout le clavier sous le doigt. */
.o-calculator__screen {
  display: flex;
  gap: var(--space-s);
  align-items: baseline;
  justify-content: flex-end;
  min-height: 4.5rem;
  padding: var(--space-s);
  border-bottom: var(--rule-strong);
  font-size: var(--step-3);
  font-variant-numeric: tabular-nums;
  text-align: right;
  word-break: break-all;
}

.o-calculator__pending {
  color: var(--color-ink);
  font-size: var(--step-1);
}

.o-calculator__keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.o-calculator__key {
  min-height: 3.5rem; // 56px, au-delà des 44px exigés par RGAA 4.1
  border: 0;
  border-right: var(--rule);
  border-bottom: var(--rule);
  background-color: transparent;
  color: var(--color-fg);
  font-family: inherit;
  font-size: var(--step-1);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.o-calculator__key:nth-child(4n) {
  border-right: 0;
}

.o-calculator__key:hover {
  background-color: var(--color-bg-subtle);
}

.o-calculator__key--operator {
  color: var(--color-ink);
  font-weight: 600;
}

.o-calculator__key--control {
  color: var(--color-fg-muted);
}

.o-calculator__hint {
  padding: var(--space-s);
  color: var(--color-fg-muted);
  font-size: var(--step--1);
}

.o-calculator__hint kbd {
  font-family: inherit;
  font-weight: 600;
}
</style>
