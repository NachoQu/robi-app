import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VideoPlayer } from './video-player'

interface PageProps {
  params: Promise<{ profileId: string; videoId: string }>
}

export default async function WatchPage({ params }: PageProps) {
  const { profileId, videoId } = await params
  const supabase = await createClient()

  const { data: video } = await supabase
    .from('videos')
    .select('id, youtube_id, title')
    .eq('id', videoId)
    .single()

  if (!video) notFound()

  return (
    <VideoPlayer
      youtubeId={video.youtube_id}
      title={video.title ?? 'Video educativo'}
      profileId={profileId}
      videoId={videoId}
    />
  )
}
