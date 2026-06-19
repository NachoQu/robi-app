import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ChildProfile {
  id: string
  name: string
  avatar: string
  total_points: number
}

interface VideoAssignment {
  video_id: string
  videos: {
    id: string
    youtube_url: string
    title: string | null
    status: 'processing' | 'ready' | 'rejected'
    reject_reason: string | null
  } | null
}

const STATUS_LABELS: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  processing: {
    label: 'Procesando',
    emoji: '⏳',
    color: 'oklch(0.45 0.15 60)',
    bg: 'oklch(0.97 0.06 60 / 0.40)',
  },
  ready: {
    label: 'Listo',
    emoji: '✅',
    color: 'oklch(0.35 0.14 155)',
    bg: 'oklch(0.94 0.06 155 / 0.25)',
  },
  rejected: {
    label: 'Rechazado',
    emoji: '🚫',
    color: 'oklch(0.45 0.20 27)',
    bg: 'oklch(0.97 0.05 27 / 0.50)',
  },
  visto: {
    label: 'Visto',
    emoji: '🌟',
    color: 'oklch(0.35 0.18 262)',
    bg: 'oklch(0.94 0.06 262 / 0.20)',
  },
}

export default async function ParentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-base text-muted-foreground font-medium">Sesión no encontrada.</p>
      </div>
    )
  }

  // Load child profiles
  const { data: profiles } = await supabase
    .from('child_profiles')
    .select('id, name, avatar, total_points')
    .eq('user_id', user.id)
    .order('name')

  const childProfiles: ChildProfile[] = profiles ?? []

  // Load video assignments + activity counts per profile
  const profileIds = childProfiles.map((p) => p.id)

  let assignmentsByProfile: Record<string, VideoAssignment[]> = {}
  let completedCountByProfile: Record<string, number> = {}

  if (profileIds.length > 0) {
    const { data: assignments } = await supabase
      .from('video_assignments')
      .select('video_id, child_profile_id, videos(id, youtube_url, title, status, reject_reason)')
      .in('child_profile_id', profileIds)

    if (assignments) {
      for (const row of assignments) {
        const pid = (row as typeof row & { child_profile_id: string }).child_profile_id
        if (!assignmentsByProfile[pid]) assignmentsByProfile[pid] = []
        assignmentsByProfile[pid].push(row as unknown as VideoAssignment)
      }
    }

    const { data: activities } = await supabase
      .from('activities')
      .select('child_profile_id, video_id')
      .in('child_profile_id', profileIds)

    if (activities) {
      for (const act of activities) {
        const pid = (act as { child_profile_id: string; video_id: string }).child_profile_id
        completedCountByProfile[pid] = (completedCountByProfile[pid] ?? 0) + 1
      }
    }

    // Build set of completed video_ids per profile for "visto" badge
    var completedVideosByProfile: Record<string, Set<string>> = {}
    if (activities) {
      for (const act of activities as { child_profile_id: string; video_id: string }[]) {
        if (!completedVideosByProfile[act.child_profile_id]) {
          completedVideosByProfile[act.child_profile_id] = new Set()
        }
        completedVideosByProfile[act.child_profile_id].add(act.video_id)
      }
    }
  } else {
    var completedVideosByProfile: Record<string, Set<string>> = {}
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page title + quick actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Panel de adultos
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">
            Supervisá el aprendizaje y cargá nuevos videos.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link href="/parent/add-video">
            <Button
              className="rounded-2xl font-bold text-sm px-5 h-10 transition-all hover:opacity-90"
              style={{ background: 'var(--robi-primary)', color: 'white' }}
            >
              🎬 Cargar video
            </Button>
          </Link>
          <Link href="/parent/vouchers">
            <Button
              className="rounded-2xl font-bold text-sm px-5 h-10 transition-all hover:opacity-90"
              style={{
                background: 'oklch(0.97 0.05 60 / 0.60)',
                color: 'oklch(0.40 0.18 60)',
                border: '1.5px solid oklch(0.80 0.15 60 / 0.40)',
              }}
            >
              🎁 Gestionar premios
            </Button>
          </Link>
        </div>
      </div>

      {/* No profiles state */}
      {childProfiles.length === 0 && (
        <Card
          className="rounded-3xl border-0 shadow"
          style={{ boxShadow: '0 4px 20px oklch(0.58 0.22 262 / 0.08)' }}
        >
          <CardContent className="px-8 py-10 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">👶</span>
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              Todavía no hay perfiles
            </h2>
            <p className="text-sm text-muted-foreground font-medium max-w-xs">
              Creá el primer perfil para tu hijo/a desde el onboarding para empezar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Profile cards */}
      {childProfiles.map((profile) => {
        const videos = assignmentsByProfile[profile.id] ?? []
        const completedCount = completedCountByProfile[profile.id] ?? 0
        const completedSet = completedVideosByProfile?.[profile.id] ?? new Set<string>()

        return (
          <Card
            key={profile.id}
            className="rounded-3xl border-0 shadow-lg"
            style={{ boxShadow: '0 4px 28px oklch(0.58 0.22 262 / 0.10)' }}
          >
            {/* Profile header */}
            <CardHeader className="px-6 pt-5 pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <span
                    className="flex items-center justify-center rounded-full text-3xl shrink-0"
                    style={{
                      width: 56,
                      height: 56,
                      background: 'var(--robi-accent)',
                      boxShadow: '0 2px 10px oklch(0.75 0.18 90 / 0.30)',
                    }}
                  >
                    {profile.avatar}
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold" style={{ color: 'var(--foreground)' }}>
                      {profile.name}
                    </h2>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {completedCount} actividad{completedCount !== 1 ? 'es' : ''} completada{completedCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 rounded-2xl px-4 py-2 font-bold text-sm"
                  style={{
                    background: 'oklch(0.94 0.06 95 / 0.35)',
                    color: 'oklch(0.38 0.16 90)',
                    border: '1.5px solid oklch(0.75 0.18 90 / 0.35)',
                  }}
                >
                  <span className="text-lg">⭐</span>
                  <span>{profile.total_points ?? 0} puntos</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {videos.length === 0 ? (
                <div
                  className="rounded-2xl px-5 py-4 text-center text-sm font-medium"
                  style={{
                    background: 'oklch(0.96 0.02 262)',
                    color: 'var(--muted-foreground)',
                    border: '1.5px dashed oklch(0.82 0.08 262)',
                  }}
                >
                  Sin videos asignados todavía.{' '}
                  <Link
                    href="/parent/add-video"
                    className="font-bold underline underline-offset-2 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--robi-primary)' }}
                  >
                    Cargar uno →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Videos asignados ({videos.length}/5)
                  </p>
                  {videos.map((assignment) => {
                    const video = assignment.videos
                    if (!video) return null

                    const isVisto = completedSet.has(video.id)
                    const statusKey = isVisto ? 'visto' : video.status
                    const badge = STATUS_LABELS[statusKey] ?? STATUS_LABELS.processing

                    const youtubeId = video.youtube_url.match(
                      /(?:v=|youtu\.be\/|embed\/|\/v\/|\/e\/|watch\?v=|&v=)([^#&?]*)/
                    )?.[1]

                    return (
                      <div
                        key={video.id}
                        className="flex items-start gap-3 rounded-2xl px-4 py-3"
                        style={{
                          background: 'oklch(0.97 0.02 262)',
                          border: '1.5px solid oklch(0.90 0.04 262)',
                        }}
                      >
                        {/* Thumbnail */}
                        {youtubeId && (
                          <img
                            src={`https://img.youtube.com/vi/${youtubeId}/default.jpg`}
                            alt="Miniatura"
                            className="w-16 h-12 rounded-xl object-cover shrink-0"
                            style={{ border: '1.5px solid oklch(0.88 0.05 262)' }}
                          />
                        )}

                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <p
                            className="text-sm font-semibold leading-snug truncate"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {video.title ?? video.youtube_url}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                              style={{ background: badge.bg, color: badge.color }}
                            >
                              {badge.emoji} {badge.label}
                            </span>
                            {video.status === 'rejected' && video.reject_reason && (
                              <span
                                className="text-xs font-medium truncate max-w-[180px]"
                                style={{ color: 'oklch(0.50 0.18 27)' }}
                              >
                                {video.reject_reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
