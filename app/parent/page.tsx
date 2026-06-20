import Link from 'next/link'
import { Users, Video, Star, Plus, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { Progress } from '@/components/ui/progress'

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
  const completedVideosByProfile: Record<string, Set<string>> = {}

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
      for (const act of activities as { child_profile_id: string; video_id: string }[]) {
        const pid = act.child_profile_id
        completedCountByProfile[pid] = (completedCountByProfile[pid] ?? 0) + 1
        if (!completedVideosByProfile[pid]) {
          completedVideosByProfile[pid] = new Set()
        }
        completedVideosByProfile[pid].add(act.video_id)
      }
    }
  }

  // Derived stats for Resumen general
  const totalAssigned = Object.values(assignmentsByProfile).reduce(
    (sum, videos) => sum + videos.length,
    0
  )
  const totalPoints = childProfiles.reduce((sum, p) => sum + (p.total_points ?? 0), 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Panel</h1>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">
            Supervisá el aprendizaje y cargá nuevos videos.
          </p>
        </div>
        <Link href="/parent/add-video">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={18} />
            Agregar video
          </Button>
        </Link>
      </div>

      {/* Resumen general */}
      <section>
        <h2 className="mb-4 text-[22px] font-bold text-foreground">Resumen general</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value={childProfiles.length} label="Hijos" icon={<Users size={22} />} />
          <StatCard value={totalAssigned} label="Videos asignados" icon={<Video size={22} />} />
          <StatCard value={totalPoints} label="Puntos totales" icon={<Star size={22} />} />
        </div>
      </section>

      {/* Progreso por hijo */}
      <section>
        <h2 className="mb-4 text-[22px] font-bold text-foreground">Progreso por hijo</h2>

        {childProfiles.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border px-8 py-10 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">👶</span>
            <h3 className="text-lg font-bold text-foreground">Todavía no hay perfiles</h3>
            <p className="text-sm text-muted-foreground font-medium max-w-xs">
              Creá el primer perfil para tu hijo/a desde el onboarding para empezar.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {childProfiles.map((profile) => {
              const videos = assignmentsByProfile[profile.id] ?? []
              const completedCount = completedCountByProfile[profile.id] ?? 0
              const assignedCount = videos.length
              const progressValue = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0

              return (
                <div
                  key={profile.id}
                  className="flex items-center gap-4 rounded-2xl bg-card border border-border px-5 py-4"
                >
                  {/* Avatar */}
                  <span
                    className="flex items-center justify-center rounded-full text-2xl shrink-0"
                    style={{ width: 48, height: 48, background: 'var(--robi-accent)' }}
                  >
                    {profile.avatar}
                  </span>

                  {/* Name + progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-base font-bold text-foreground truncate">
                        {profile.name}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground shrink-0">
                        Nivel 1
                      </span>
                    </div>

                    {assignedCount === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Sin videos asignados.{' '}
                        <Link
                          href="/parent/add-video"
                          className="font-bold underline underline-offset-2 text-primary hover:opacity-70 transition-opacity"
                        >
                          Cargar uno →
                        </Link>
                      </p>
                    ) : (
                      <>
                        <Progress value={progressValue} className="mb-1" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {completedCount}/{assignedCount} videos
                          </span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Star size={12} className="text-primary" />
                            {profile.total_points ?? 0} pts
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Chevron */}
                  <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
