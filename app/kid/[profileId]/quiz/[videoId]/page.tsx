import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuizClient from './quiz-client'

interface PageProps {
  params: Promise<{ profileId: string; videoId: string }>
}

export default async function QuizPage({ params }: PageProps) {
  const { profileId, videoId } = await params
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('activities')
    .select('id')
    .eq('child_profile_id', profileId)
    .eq('video_id', videoId)
    .limit(1)
    .maybeSingle()

  if (existing) redirect(`/kid/${profileId}`)

  return <QuizClient />
}
