export type QuizQuestion = {
  question_text: string
  options: string[]
  correct_index: number
  source_quote: string
}

export interface AIProvider {
  filterContent(transcript: string): Promise<{ safe: boolean; reason?: string }>
  generateQuiz(transcript: string): Promise<QuizQuestion[]>
}
