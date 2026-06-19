import { describe, it, expect } from 'vitest'
import { validateAnchoring } from '@/lib/ai/anchoring'

const t = 'El sol es una estrella. Los planetas giran alrededor del sol.'

describe('validateAnchoring', () => {
  it('mantiene preguntas con quote presente', () => {
    const q = [{ question_text: 'q', options: ['a','b','c','d'], correct_index: 0, source_quote: 'El sol es una estrella' }]
    expect(validateAnchoring(q, t)).toHaveLength(1)
  })
  it('descarta preguntas con quote inventado', () => {
    const q = [{ question_text: 'q', options: ['a','b','c','d'], correct_index: 0, source_quote: 'La luna es de queso' }]
    expect(validateAnchoring(q, t)).toHaveLength(0)
  })
  it('normaliza mayúsculas y espacios', () => {
    const q = [{ question_text: 'q', options: ['a','b','c','d'], correct_index: 0, source_quote: '  los  PLANETAS giran ' }]
    expect(validateAnchoring(q, t)).toHaveLength(1)
  })
})
