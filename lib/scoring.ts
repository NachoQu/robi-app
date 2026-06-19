export function scoreQuiz(correctCount: number) {
  const correct = Math.max(0, Math.min(5, Math.floor(correctCount || 0)))
  const base = 10
  const bonus = correct * 5
  return { base, bonus, total: base + bonus }
}
