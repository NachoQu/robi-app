import type { QuizQuestion } from './types'

export function extractJson(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fenced ? fenced[1] : text
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) throw new Error('No JSON object found in AI response')
  return JSON.parse(body.slice(start, end + 1))
}

export function parseQuizResponse(text: string): QuizQuestion[] {
  const data = extractJson(text)
  return (data.questions ?? []) as QuizQuestion[]
}
