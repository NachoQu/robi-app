import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VideoPlayer } from './video-player'

interface PageProps {
  params: Promise<{ profileId: string; videoId: string }>
}

export default async function WatchPage({ params }: PageProps) {
  const { profileId, videoId } = await params
  const supabase = await createClient()

  const [{ data: video }, { data: previousActivity }] = await Promise.all([
    supabase
      .from('videos')
      .select('id, youtube_id, title')
      .eq('id', videoId)
      .single(),
    supabase
      .from('activities')
      .select('base_points, bonus_points')
      .eq('child_profile_id', profileId)
      .eq('video_id', videoId)
      .limit(1)
      .maybeSingle(),
  ])

  if (!video) notFound()

  return (
    <VideoPlayer
      youtubeId={video.youtube_id}
      title={video.title ?? 'Video educativo'}
      profileId={profileId}
      videoId={videoId}
      previousActivity={previousActivity}
    />
  )
}
