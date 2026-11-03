import { describe, expect, it } from 'vitest'
import { compute, useCalculator } from '~/composables/useCalculator'

/** Frappe une suite de touches sur une calculatrice neuve. */
const type = (keys: string) => {
  const calculator = useCalculator()

  for (const key of keys) {
    if (/\d/.test(key)) calculator.inputDigit(key)
    else if (key === ',') calculator.inputDecimal()
    else if (key === '=') calculator.equals()
    else if (key === 'c') calculator.clear()
    else if (key === '±') calculator.toggleSign()
    else if (key === '%') calculator.percent()
    else if (key === '<') calculator.backspace()
    else calculator.chooseOperator(key as '+' | '−' | '×' | '÷')
  }

  return calculator
}

describe('compute', () => {
  it('fait les quatre opérations', () => {
    expect(compute(7, '+', 3)).toBe(10)
    expect(compute(7, '−', 3)).toBe(4)
    expect(compute(7, '×', 3)).toBe(21)
    expect(compute(8, '÷', 2)).toBe(4)
  })

  it('masque les artefacts du binaire', () => {
    expect(compute(0.1, '+', 0.2)).toBe(0.3)
  })
})

describe('useCalculator', () => {
  it('démarre à zéro', () => {
    expect(type('').display.value).toBe('0')
  })

  it('remplace le zéro de tête au lieu de s’y ajouter', () => {
    expect(type('7').display.value).toBe('7')
    expect(type('07').display.value).toBe('7')
  })

  it('affiche la virgule décimale, à la française', () => {
    expect(type('3,14').display.value).toBe('3,14')
  })

  it('n’accepte qu’une seule virgule', () => {
    expect(type('3,1,4').display.value).toBe('3,14')
  })

  it('ouvre une décimale sur un zéro quand rien n’est saisi', () => {
    expect(type(',5').display.value).toBe('0,5')
  })

  it('enchaîne les opérations sans attendre le signe égal', () => {
    expect(type('2+3+4=').display.value).toBe('9')
  })

  it('calcule le résultat au signe égal', () => {
    expect(type('12×12=').display.value).toBe('144')
  })

  it('corrige l’opérateur quand on en choisit un autre tout de suite', () => {
    expect(type('8+×2=').display.value).toBe('16')
  })

  it('annonce une erreur sur la division par zéro', () => {
    const calculator = type('5÷0=')

    expect(calculator.display.value).toBe('Erreur')
    expect(calculator.error.value).toBe(true)
  })

  it('repart d’une frappe après une erreur', () => {
    const calculator = type('5÷0=')
    calculator.inputDigit('7')

    expect(calculator.display.value).toBe('7')
    expect(calculator.error.value).toBe(false)
  })

  it('inverse le signe de la saisie en cours', () => {
    expect(type('5±').display.value).toBe('-5')
    expect(type('5±±').display.value).toBe('5')
  })

  it('laisse le zéro sans signe', () => {
    expect(type('±').display.value).toBe('0')
  })

  it('lit le pourcentage par rapport à l’opérande de gauche', () => {
    expect(type('200+10%=').display.value).toBe('220')
  })

  it('divise par cent hors addition et soustraction', () => {
    expect(type('50%').display.value).toBe('0,5')
  })

  it('efface le dernier caractère saisi', () => {
    expect(type('123<').display.value).toBe('12')
    expect(type('1<').display.value).toBe('0')
  })

  it('remet tout à zéro', () => {
    const calculator = type('9+9c')

    expect(calculator.display.value).toBe('0')
    expect(calculator.operator.value).toBe(null)
  })

  it('borne la saisie à douze chiffres', () => {
    expect(type('1234567890123456').display.value).toBe('123456789012')
  })
})
