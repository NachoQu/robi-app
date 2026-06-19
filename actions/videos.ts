'use server'
import { createClient } from '@/lib/supabase/server'
import { parseYoutubeId } from '@/lib/youtube/parse-url'
import { fetchTranscript } from '@/lib/youtube/transcript'
import { getAIProvider } from '@/lib/ai'
import { validateAnchoring } from '@/lib/ai/anchoring'

const FREE_VIDEO_LIMIT = 5

export async function processVideo(input: { url: string; childProfileId: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'No autenticado' }

  const youtubeId = parseYoutubeId(input.url)
  if (!youtubeId) return { ok: false, reason: 'La URL no es de YouTube' }

  // límite free tier por perfil
  const { count } = await supabase.from('video_assignments').select('*', { count: 'exact', head: true })
    .eq('child_profile_id', input.childProfileId)
  if ((count ?? 0) >= FREE_VIDEO_LIMIT) return { ok: false, reason: 'Llegaste al límite de 5 videos' }

  // de-dupe: reusar video ya procesado
  const { data: existing } = await supabase.from('videos').select('id,status')
    .eq('user_id', user.id).eq('youtube_id', youtubeId).maybeSingle()
  if (existing?.status === 'ready') {
    await supabase.from('video_assignments').insert({ video_id: existing.id, child_profile_id: input.childProfileId })
    return { ok: true, videoId: existing.id }
  }

  const { data: video } = await supabase.from('videos')
    .insert({ user_id: user.id, youtube_url: input.url, youtube_id: youtubeId, status: 'processing' })
    .select('id').single()
  if (!video) return { ok: false, reason: 'No pudimos iniciar el procesamiento del video. Probá de nuevo.' }
  const videoId = video.id

  const reject = async (reason: string) => {
    await supabase.from('videos').update({ status: 'rejected', reject_reason: reason }).eq('id', videoId)
    return { ok: false, reason }
  }

  // Fetch transcript — network errors must not leave video stuck in 'processing'
  let transcript: string | null
  try {
    transcript = await fetchTranscript(youtubeId)
  } catch {
    return reject('Hubo un problema procesando el video. Probá de nuevo o con otro.')
  }
  if (!transcript) return reject('Este video no tiene subtítulos disponibles. Probá con otro.')

  const ai = getAIProvider()

  // Content filter — AI call can throw (network error, malformed JSON)
  let filter: { safe: boolean; reason?: string }
  try {
    filter = await ai.filterContent(transcript)
  } catch {
    return reject('Hubo un problema procesando el video. Probá de nuevo o con otro.')
  }
  if (!filter.safe) return reject('El contenido del video no es apto. Probá con otro.')

  // Quiz generation + anchoring — retry once, AI call can throw
  let questions
  try {
    questions = validateAnchoring(await ai.generateQuiz(transcript), transcript)
    if (questions.length < 5) {
      questions = validateAnchoring(await ai.generateQuiz(transcript), transcript) // reintento único
    }
  } catch {
    return reject('Hubo un problema procesando el video. Probá de nuevo o con otro.')
  }
  if (questions.length < 5) return reject('No pudimos generar un buen quiz para este video. Probá con otro.')

  await supabase.from('videos').update({ status: 'ready', transcript }).eq('id', videoId)
  await supabase.from('quiz_questions').insert(
    questions.slice(0, 5).map((q, i) => ({
      video_id: videoId, question_text: q.question_text, options: q.options,
      correct_index: q.correct_index, source_quote: q.source_quote, position: i,
    }))
  )
  await supabase.from('video_assignments').insert({ video_id: videoId, child_profile_id: input.childProfileId })
  return { ok: true, videoId }
}
