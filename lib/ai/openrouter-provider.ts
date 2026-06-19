import type { AIProvider } from './types'
import { FILTER_SYSTEM, QUIZ_SYSTEM } from './prompts'
import { extractJson, parseQuizResponse } from './json'

const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free'
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

async function callOpenRouter(systemPrompt: string, transcript: string): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript.slice(0, 50000) },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    throw new Error(`OpenRouter error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export class OpenRouterProvider implements AIProvider {
  async filterContent(transcript: string) {
    const text = await callOpenRouter(FILTER_SYSTEM, transcript)
    return extractJson(text) as { safe: boolean; reason?: string }
  }

  async generateQuiz(transcript: string) {
    const text = await callOpenRouter(QUIZ_SYSTEM, transcript)
    return parseQuizResponse(text)
  }
}
