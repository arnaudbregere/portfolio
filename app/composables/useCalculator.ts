/**
 * Machine à états d'une calculatrice à quatre opérations.
 *
 * Toute la logique vit ici, sans rien connaître du rendu : le composant ne
 * fait qu'afficher `display` et appeler ces fonctions. C'est ce qui rend la
 * calculatrice testable sans monter un seul composant.
 *
 * Le nombre en cours est tenu en chaîne, pas en nombre : `0,10` et `0,1` ne
 * s'écrivent pas pareil pendant la frappe, et seul un `Number` final arrondit.
 */

export type Operator = '+' | '−' | '×' | '÷'

const MAX_DIGITS = 12

/** Arrondi à 10 chiffres significatifs : masque les artefacts du binaire. */
const round = (value: number): number => Number(value.toPrecision(10))

export const compute = (left: number, operator: Operator, right: number): number => {
  switch (operator) {
    case '+':
      return round(left + right)
    case '−':
      return round(left - right)
    case '×':
      return round(left * right)
    case '÷':
      return round(left / right)
  }
}

export const useCalculator = () => {
  /** Nombre en cours de saisie, toujours avec un point décimal. */
  const entry = ref('0')
  const accumulator = ref<number | null>(null)
  const operator = ref<Operator | null>(null)
  /** La prochaine frappe remplace la saisie au lieu de s'y ajouter. */
  const replacing = ref(true)
  const error = ref(false)

  /** Affichage à la française : la virgule décimale, pas le point. */
  const display = computed(() => (error.value ? 'Erreur' : entry.value.replace('.', ',')))

  const reset = () => {
    entry.value = '0'
    accumulator.value = null
    operator.value = null
    replacing.value = true
    error.value = false
  }

  const inputDigit = (digit: string) => {
    if (error.value) reset()

    if (replacing.value) {
      entry.value = digit
      replacing.value = false
      return
    }

    // Un seul zéro de tête, et une longueur bornée : au-delà, l'écran ment.
    if (entry.value === '0') entry.value = digit
    else if (entry.value.replace(/[-.]/g, '').length < MAX_DIGITS) entry.value += digit
  }

  const inputDecimal = () => {
    if (error.value) reset()

    if (replacing.value) {
      entry.value = '0.'
      replacing.value = false
      return
    }

    if (!entry.value.includes('.')) entry.value += '.'
  }

  /** Applique l'opération en attente, s'il y en a une. */
  const resolve = (): number => {
    const right = Number(entry.value)

    if (accumulator.value === null || operator.value === null) return right

    const result = compute(accumulator.value, operator.value, right)

    if (!Number.isFinite(result)) {
      error.value = true
      return right
    }

    return result
  }

  const chooseOperator = (next: Operator) => {
    if (error.value) return

    // Changer d'opérateur avant de saisir le second nombre corrige le choix,
    // sans déclencher de calcul.
    if (!replacing.value || accumulator.value === null) {
      const result = resolve()

      if (error.value) return

      accumulator.value = result
      entry.value = String(result)
    }

    operator.value = next
    replacing.value = true
  }

  const equals = () => {
    if (error.value) return

    const result = resolve()

    if (error.value) return

    entry.value = String(result)
    accumulator.value = null
    operator.value = null
    replacing.value = true
  }

  /** Le signe s'inverse sur la saisie en cours, jamais sur un résultat passé. */
  const toggleSign = () => {
    if (error.value || entry.value === '0') return

    entry.value = entry.value.startsWith('-') ? entry.value.slice(1) : `-${entry.value}`
  }

  /**
   * Le pourcentage se lit par rapport à l'opérande de gauche : `200 + 10 %`
   * ajoute 20, pas 0,1. C'est la convention des calculatrices de bureau.
   */
  const percent = () => {
    if (error.value) return

    const value = Number(entry.value)
    const base = accumulator.value ?? 0
    const result =
      accumulator.value !== null && (operator.value === '+' || operator.value === '−')
        ? round((base * value) / 100)
        : round(value / 100)

    entry.value = String(result)
    replacing.value = false
  }

  const backspace = () => {
    if (error.value) return reset()
    if (replacing.value) return

    entry.value = entry.value.length > 1 ? entry.value.slice(0, -1) : '0'

    if (entry.value === '-' || entry.value === '0') {
      entry.value = '0'
      replacing.value = true
    }
  }

  return {
    display,
    operator: readonly(operator),
    error: readonly(error),
    inputDigit,
    inputDecimal,
    chooseOperator,
    equals,
    toggleSign,
    percent,
    backspace,
    clear: reset,
  }
}
