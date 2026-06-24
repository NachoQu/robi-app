import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KidShell } from '@/components/shell/kid-shell'
import PanelClient from './panel-client'

interface PageProps {
  params: Promise<{ profileId: string }>
}

export default async function KidLibraryPage({ params }: PageProps) {
  const { profileId } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('child_profiles')
    .select('id, name, avatar, total_points')
    .eq('id', profileId)
    .single()

  if (!profile) notFound()

  const { data: assignments } = await supabase
    .from('video_assignments')
    .select('video_id, videos!inner(id, youtube_id, title, status)')
    .eq('child_profile_id', profileId)
    .eq('videos.status', 'ready')

  type AssignedVideo = {
    video_id: string
    videos: { id: string; youtube_id: string; title: string | null; status: string }
  }

  const videos = ((assignments ?? []) as unknown as AssignedVideo[])
    .filter((a) => a.videos?.status === 'ready')
    .map((a) => a.videos)

  const videoIds = videos.map((v) => v.id)
  const { data: activities } = videoIds.length > 0
    ? await supabase
        .from('activities')
        .select('video_id')
        .eq('child_profile_id', profileId)
        .in('video_id', videoIds)
    : { data: [] }

  const watchedIds = (activities ?? []).map((a) => a.video_id)

  return (
    <KidShell
      profileId={profileId}
      profileName={profile.name}
      profileAvatar={profile.avatar}
      points={profile.total_points}
    >
      <PanelClient
        profileId={profileId}
        profileName={profile.name}
        profileAvatar={profile.avatar}
        totalPoints={profile.total_points}
        videos={videos}
        watchedIds={watchedIds}
      />
    </KidShell>
  )
}
