import { describe, it, expect } from 'vitest'
import { scoreQuiz } from '@/lib/scoring'

describe('scoreQuiz', () => {
  it('0 aciertos → 10 base, 0 bonus, 10 total', () => {
    expect(scoreQuiz(0)).toEqual({ base: 10, bonus: 0, total: 10 })
  })
  it('5 aciertos → 10 base, 25 bonus, 35 total', () => {
    expect(scoreQuiz(5)).toEqual({ base: 10, bonus: 25, total: 35 })
  })
  it('clampa entradas inválidas a 0..5', () => {
    expect(scoreQuiz(9).total).toBe(35)
    expect(scoreQuiz(-2).total).toBe(10)
  })
})
