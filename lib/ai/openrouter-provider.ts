import type { AIProvider } from './types'
import { FILTER_SYSTEM, QUIZ_SYSTEM } from './prompts'
import { extractJson, parseQuizResponse } from './json'

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

const FALLBACK_MODELS = [
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
]

function buildCandidates(): string[] {
  const primary = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free'
  const seen = new Set<string>()
  const candidates: string[] = []
  for (const model of [primary, ...FALLBACK_MODELS]) {
    if (!seen.has(model)) {
      seen.add(model)
      candidates.push(model)
    }
  }
  return candidates
}

export class OpenRouterProvider implements AIProvider {
  private async chat(system: string, user: string): Promise<string> {
    const candidates = buildCandidates()
    let lastError: string = 'No candidates available'

    for (const model of candidates) {
      try {
        const res = await fetch(BASE_URL, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user.slice(0, 50000) },
            ],
          }),
          signal: AbortSignal.timeout(30000),
        })

        if (res.ok) {
          const data = await res.json()
          return data.choices?.[0]?.message?.content ?? ''
        }

        // Rate-limited or model unavailable — try next candidate
        if (res.status === 429 || res.status === 404) {
          lastError = `OpenRouter error: ${res.status} ${res.statusText} (model: ${model})`
          continue
        }

        // Any other non-ok status — also try next candidate
        lastError = `OpenRouter error: ${res.status} ${res.statusText} (model: ${model})`
        continue
      } catch (err) {
        // Network/abort error — try next candidate
        lastError = err instanceof Error ? err.message : String(err)
        continue
      }
    }

    throw new Error(`All OpenRouter candidates failed. Last error: ${lastError}`)
  }

  async filterContent(transcript: string) {
    const text = await this.chat(FILTER_SYSTEM, transcript)
    return extractJson(text) as { safe: boolean; reason?: string }
  }

  async generateQuiz(transcript: string) {
    const text = await this.chat(QUIZ_SYSTEM, transcript)
    return parseQuizResponse(text)
  }
}
