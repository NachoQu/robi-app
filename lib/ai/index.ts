import type { AIProvider } from './types'
import { ClaudeProvider } from './claude-provider'

let instance: AIProvider | null = null
export function getAIProvider(): AIProvider {
  if (!instance) instance = new ClaudeProvider()
  return instance
}
export type { AIProvider, QuizQuestion } from './types'
