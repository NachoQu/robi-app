import { describe, it, expect } from 'vitest'
import { parseQuizResponse } from '@/lib/ai/claude-provider'

describe('parseQuizResponse', () => {
  it('parsea JSON envuelto en texto/markdown', () => {
    const raw = '```json\n{"questions":[{"question_text":"q","options":["a","b","c","d"],"correct_index":1,"source_quote":"x"}]}\n```'
    const out = parseQuizResponse(raw)
    expect(out).toHaveLength(1)
    expect(out[0].correct_index).toBe(1)
  })
})
