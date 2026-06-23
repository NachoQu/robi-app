import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AlbumClient from './album-client'
import { KidShell } from '@/components/shell/kid-shell'

interface PageProps {
  params: Promise<{ profileId: string }>
}

export default async function AlbumPage({ params }: PageProps) {
  const { profileId } = await params
  const supabase = await createClient()

  // Load profile
  const { data: profile } = await supabase
    .from('child_profiles')
    .select('id, name, avatar, total_points')
    .eq('id', profileId)
    .single()

  if (!profile) notFound()

  // Load earned badges with video info
  const { data: badgesRaw } = await supabase
    .from('badges')
    .select('id, video_id, earned_at, videos!inner(id, title)')
    .eq('child_profile_id', profileId)
    .order('earned_at', { ascending: false })

  type BadgeRow = {
    id: string
    video_id: string
    earned_at: string
    videos: { id: string; title: string | null }
  }
  const badges: BadgeRow[] = ((badgesRaw ?? []) as unknown as BadgeRow[])

  // Load all video assignments for this profile
  const { data: assignmentsRaw } = await supabase
    .from('video_assignments')
    .select('video_id, videos!inner(id, title)')
    .eq('child_profile_id', profileId)

  type AssignmentRow = {
    video_id: string
    videos: { id: string; title: string | null }
  }
  const assignments: AssignmentRow[] = ((assignmentsRaw ?? []) as unknown as AssignmentRow[])

  // Build the earned set for quick lookup
  const earnedVideoIds = new Set(badges.map((b) => b.video_id))

  // Build unified slot list: earned first, then unearned
  const earnedSlots = badges.map((b) => ({
    id: b.id,
    videoId: b.video_id,
    videoTitle: b.videos?.title ?? 'Video educativo',
    earnedAt: b.earned_at,
    earned: true as const,
  }))

  const emptySlots = assignments
    .filter((a) => !earnedVideoIds.has(a.video_id))
    .map((a) => ({
      videoId: a.video_id,
      videoTitle: a.videos?.title ?? 'Video educativo',
      earned: false as const,
    }))

  const slots = [...earnedSlots, ...emptySlots]

  return (
    <KidShell
      profileId={profileId}
      profileName={profile.name}
      profileAvatar={profile.avatar}
      points={profile.total_points}
    >
      <AlbumClient
        profileId={profileId}
        profileName={profile.name}
        profileAvatar={profile.avatar}
        slots={slots}
        earnedCount={earnedSlots.length}
        totalCount={slots.length}
      />
    </KidShell>
  )
}
