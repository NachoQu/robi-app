import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, QuizQuestion } from './types'
import { FILTER_SYSTEM, QUIZ_SYSTEM } from './prompts'

const MODEL = 'claude-sonnet-4-6'

function extractJson(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fenced ? fenced[1] : text
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  return JSON.parse(body.slice(start, end + 1))
}

export function parseQuizResponse(text: string): QuizQuestion[] {
  const data = extractJson(text)
  return (data.questions ?? []) as QuizQuestion[]
}

export class ClaudeProvider implements AIProvider {
  private client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  async filterContent(transcript: string) {
    const res = await this.client.messages.create({
      model: MODEL, max_tokens: 256, system: FILTER_SYSTEM,
      messages: [{ role: 'user', content: transcript.slice(0, 50000) }],
    })
    const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
    return extractJson(text) as { safe: boolean; reason?: string }
  }

  async generateQuiz(transcript: string) {
    const res = await this.client.messages.create({
      model: MODEL, max_tokens: 2048, system: QUIZ_SYSTEM,
      messages: [{ role: 'user', content: transcript.slice(0, 50000) }],
    })
    const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
    return parseQuizResponse(text)
  }
}
