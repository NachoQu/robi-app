import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider } from './types'
import { FILTER_SYSTEM, QUIZ_SYSTEM } from './prompts'
import { extractJson, parseQuizResponse } from './json'

// Re-export so existing tests importing from this module stay green
export { parseQuizResponse } from './json'

const MODEL = 'claude-sonnet-4-6'

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
