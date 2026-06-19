import type { QuizQuestion } from './types'

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()

export function validateAnchoring(questions: QuizQuestion[], transcript: string): QuizQuestion[] {
  const haystack = norm(transcript)
  return questions.filter((q) => q.source_quote && haystack.includes(norm(q.source_quote)))
}
