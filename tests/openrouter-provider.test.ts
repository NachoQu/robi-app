import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest'
import { OpenRouterProvider } from '@/lib/ai/openrouter-provider'

beforeAll(() => {
  process.env.OPENROUTER_API_KEY = 'test'
})

afterEach(() => {
  vi.restoreAllMocks()
})

function makeFetchMock(content: string) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      choices: [{ message: { content } }],
    }),
  } as unknown as Response)
}

describe('OpenRouterProvider', () => {
  it('generateQuiz parsea correctamente las preguntas del response', async () => {
    const content =
      '```json\n{"questions":[{"question_text":"¿Cuál es la capital?","options":["A","B","C","D"],"correct_index":2,"source_quote":"la capital es..."}]}\n```'
    global.fetch = makeFetchMock(content)

    const provider = new OpenRouterProvider()
    const questions = await provider.generateQuiz('transcripción de ejemplo')

    expect(questions).toHaveLength(1)
    expect(questions[0].question_text).toBe('¿Cuál es la capital?')
    expect(questions[0].correct_index).toBe(2)
  })

  it('filterContent parsea el resultado de seguridad correctamente', async () => {
    const content = '{"safe":true}'
    global.fetch = makeFetchMock(content)

    const provider = new OpenRouterProvider()
    const result = await provider.filterContent('contenido de video')

    expect(result.safe).toBe(true)
  })

  it('filterContent propaga errores cuando la API responde con error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    } as unknown as Response)

    const provider = new OpenRouterProvider()
    await expect(provider.filterContent('texto')).rejects.toThrow('OpenRouter error: 429')
  })
})
