import type { AIProvider } from './types'
// Single swap point: change the import below to use ClaudeProvider (Anthropic) instead of OpenRouterProvider
import { OpenRouterProvider } from './openrouter-provider'

let instance: AIProvider | null = null
export function getAIProvider(): AIProvider {
  if (!instance) instance = new OpenRouterProvider()
  return instance
}
export type { AIProvider, QuizQuestion } from './types'
