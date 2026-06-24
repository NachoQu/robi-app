'use server'
import { createClient } from '@/lib/supabase/server'

interface ActivityResult {
  base_points: number
  bonus_points: number
  total_points: number
}

export async function submitQuiz(input: { childProfileId: string; videoId: string; answers: number[] }) {
  const supabase = await createClient()
  const { data: questions } = await supabase.from('quiz_questions')
    .select('correct_index,position').eq('video_id', input.videoId).order('position')
  let correct = 0
  ;(questions ?? []).forEach((q, i) => { if (input.answers[i] === q.correct_index) correct++ })
  const { data, error } = await supabase.rpc('complete_activity', {
    p_child: input.childProfileId, p_video: input.videoId, p_correct: correct, p_answers: input.answers,
  }).single()
  if (error) throw new Error(error.message)
  const result = data as unknown as ActivityResult
  if (!result) throw new Error('No se recibió resultado del servidor')
  return { base: result.base_points, bonus: result.bonus_points, total: result.total_points, correctCount: correct }
}
