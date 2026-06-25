import Link from 'next/link'
import { Star, Plus, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { FeedList } from './feed-list'

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

function daysDiff(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

function formatLastDate(dateStr: string) {
  const days = daysDiff(dateStr)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Hace 1 día'
  return `Hace ${days} días`
}

function activityBadge(lastDate: string | null) {
  if (!lastDate) return null
  const days = daysDiff(lastDate)
  if (days === 0) return { label: 'Activo hoy', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
  if (days <= 3) return { label: `Hace ${days} día${days > 1 ? 's' : ''}`, cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
  return { label: 'Sin actividad', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
}

function motivationalMessage(weeklyCount: number, lastDate: string | null) {
  if (!lastDate) return null
  const days = daysDiff(lastDate)
  if (weeklyCount >= 2) return { icon: '🏆', text: `¡Excelente! Completó ${weeklyCount} videos esta semana.` }
  if (days <= 3) return { icon: '💡', text: '¡Seguí así, está aprendiendo cosas increíbles!' }
  return { icon: '🔔', text: 'Hace varios días sin actividad. ¡Asignale un video para volver a empezar!' }
}

export default async function ParentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-base text-muted-foreground font-medium">Sesión no encontrada.</p>
      </div>
    )
  }

  const { data: profiles } = await supabase
    .from('child_profiles')
    .select('id, name, avatar, total_points')
    .eq('user_id', user.id)
    .order('name')

  const childProfiles: ChildProfile[] = profiles ?? []
  const profileIds = childProfiles.map((p) => p.id)

  let assignmentsByProfile: Record<string, VideoAssignment[]> = {}

  type ActivityRow = {
    child_profile_id: string
    video_id: string
    completed_at: string
    base_points: number
    bonus_points: number
    child_profiles: { name: string; avatar: string } | null
    videos: { title: string | null } | null
  }

  type WatchRow = {
    child_profile_id: string
    video_id: string
    watched_at: string
    child_profiles: { name: string; avatar: string } | null
    videos: { title: string | null } | null
  }

  let allActivities: ActivityRow[] = []

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

    const { data: acts } = await supabase
      .from('activities')
      .select('child_profile_id, video_id, completed_at, base_points, bonus_points, child_profiles(name, avatar), videos(title)')
      .in('child_profile_id', profileIds)
      .order('completed_at', { ascending: false })

    allActivities = (acts ?? []) as unknown as ActivityRow[]
  }

  // Derive per-profile stats from single activities result
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weekStartMs = weekStart.getTime()

  const completedCountByProfile: Record<string, number> = {}
  const weeklyCompletedByProfile: Record<string, number> = {}
  const lastActivityByProfile: Record<string, { date: string; videoTitle: string }> = {}

  for (const act of allActivities) {
    const pid = act.child_profile_id
    completedCountByProfile[pid] = (completedCountByProfile[pid] ?? 0) + 1
    if (new Date(act.completed_at).getTime() >= weekStartMs) {
      weeklyCompletedByProfile[pid] = (weeklyCompletedByProfile[pid] ?? 0) + 1
    }
    if (!lastActivityByProfile[pid]) {
      lastActivityByProfile[pid] = {
        date: act.completed_at,
        videoTitle: act.videos?.title ?? 'Video sin título',
      }
    }
  }

  // Watches sin quiz completado
  const completedPairs = new Set(allActivities.map((a) => `${a.child_profile_id}:${a.video_id}`))

  let watchRows: WatchRow[] = []
  if (profileIds.length > 0) {
    const { data: watches } = await supabase
      .from('video_assignments')
      .select('child_profile_id, video_id, watched_at, child_profiles(name, avatar), videos(title)')
      .in('child_profile_id', profileIds)
      .not('watched_at', 'is', null)
      .order('watched_at', { ascending: false })
      .limit(20)
    watchRows = ((watches ?? []) as unknown as WatchRow[])
      .filter((w) => !completedPairs.has(`${w.child_profile_id}:${w.video_id}`))
  }

  // Feed: recent activities + watches + redemptions merged

  const recentActs = allActivities.slice(0, 10)

  const { data: recentRedemptions } = profileIds.length > 0
    ? await supabase
        .from('redemptions')
        .select('id, redeemed_at, child_profile_id, child_profiles(name, avatar), vouchers(title)')
        .in('child_profile_id', profileIds)
        .order('redeemed_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const feed: import('./feed-list').FeedItem[] = [
    ...recentActs.map((a) => ({
      kind: 'activity' as const,
      id: `act-${a.child_profile_id}-${a.completed_at}`,
      date: a.completed_at,
      childName: a.child_profiles?.name ?? '',
      childAvatar: a.child_profiles?.avatar ?? '👤',
      videoTitle: a.videos?.title ?? 'Video sin título',
      points: (a.base_points ?? 0) + (a.bonus_points ?? 0),
    })),
    ...watchRows.map((w) => ({
      kind: 'watch' as const,
      id: `watch-${w.child_profile_id}-${w.video_id}`,
      date: w.watched_at,
      childName: w.child_profiles?.name ?? '',
      childAvatar: w.child_profiles?.avatar ?? '👤',
      videoTitle: w.videos?.title ?? 'Video sin título',
    })),
    ...((recentRedemptions ?? []) as any[]).map((r) => ({
      kind: 'redemption' as const,
      id: r.id,
      date: r.redeemed_at,
      childName: r.child_profiles?.name ?? '',
      childAvatar: r.child_profiles?.avatar ?? '👤',
      voucherTitle: r.vouchers?.title ?? 'Premio',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20)

  // Cheapest active voucher
  const { data: activeVouchers } = await supabase
    .from('vouchers')
    .select('points_cost')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const cheapestVoucher: number | null =
    activeVouchers && activeVouchers.length > 0
      ? Math.min(...activeVouchers.map((v) => v.points_cost))
      : null

  const totalAssigned = Object.values(assignmentsByProfile).reduce((s, v) => s + v.length, 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Panel Adultos</h1>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">
          Supervisá el aprendizaje y cargá nuevos videos.
        </p>
      </div>

      {/* CTA primer video */}
      {totalAssigned === 0 && childProfiles.length > 0 && (
        <Link href="/parent/add-video" className="block">
          <div className="flex items-center gap-4 rounded-2xl bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 px-5 py-4 hover:brightness-95 transition-all">
            <div className="shrink-0">
              <RobiPlaceholder size={52} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">¡Asigná un video y empezá a ver el progreso!</p>
              <p className="text-xs text-green-700 dark:text-green-400 font-medium mt-0.5">
                Los niños aprenden más cuando tienen contenido para descubrir todos los días.
              </p>
            </div>
            <ChevronRight size={18} className="text-green-600 dark:text-green-400 shrink-0" />
          </div>
        </Link>
      )}

      {/* Progreso por hijo */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-bold text-foreground">Progreso por hijo</h2>
          <Link href="/parent/add-video">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus size={18} />
              Agregar video
            </Button>
          </Link>
        </div>

        {childProfiles.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border px-8 py-10 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">👶</span>
            <h3 className="text-lg font-bold text-foreground">Todavía no hay perfiles</h3>
            <p className="text-sm text-muted-foreground font-medium max-w-xs">
              Creá el primer perfil para tu hijo/a desde el onboarding para empezar.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {childProfiles.map((profile) => {
              const videos = assignmentsByProfile[profile.id] ?? []
              const completedCount = completedCountByProfile[profile.id] ?? 0
              const weeklyCount = weeklyCompletedByProfile[profile.id] ?? 0
              const lastActivity = lastActivityByProfile[profile.id] ?? null
              const assignedCount = videos.length
              const weeklyProgress = assignedCount > 0 ? Math.round((weeklyCount / assignedCount) * 100) : 0
              const totalProgress = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0
              const canRedeem = cheapestVoucher !== null && profile.total_points >= cheapestVoucher
              const badge = activityBadge(lastActivity?.date ?? null)
              const motivation = motivationalMessage(weeklyCount, lastActivity?.date ?? null)

              return (
                <div key={profile.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                  {/* Main row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5">

                    {/* Avatar + name + badge */}
                    <div className="flex items-center gap-3 sm:w-36 shrink-0">
                      <span
                        className="flex items-center justify-center rounded-full text-3xl shrink-0"
                        style={{ width: 56, height: 56, background: 'var(--robi-accent)' }}
                      >
                        {profile.avatar}
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-foreground leading-tight">{profile.name}</p>
                        {badge && (
                          <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )}
                        {canRedeem && (
                          <span className="block mt-1 text-[11px] font-semibold text-[var(--robi-accent-ink)]">
                            🎁 Puede canjear
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info columns */}
                    <div className="flex-1 grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1.2fr)] gap-2 sm:gap-3">
                      {/* Última actividad */}
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] text-muted-foreground font-medium">Última actividad</p>
                        <p className="text-sm font-bold text-foreground">
                          {lastActivity ? formatLastDate(lastActivity.date) : '—'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {completedCount > 0 ? `${completedCount} video${completedCount !== 1 ? 's' : ''} completado${completedCount !== 1 ? 's' : ''}` : 'Sin actividad'}
                        </p>
                      </div>

                      {/* Último video */}
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] text-muted-foreground font-medium">Último video</p>
                        <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                          {lastActivity?.videoTitle ?? '—'}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                          <Star size={10} className="text-primary shrink-0" />
                          {profile.total_points ?? 0} pts
                        </p>
                      </div>

                      {/* Progreso semanal */}
                      <div className="flex flex-col gap-1">
                        <p className="text-[11px] text-muted-foreground font-medium">Progreso</p>
                        <p className="text-sm font-bold text-foreground">{totalProgress}%</p>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${totalProgress}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground">{completedCount} de {assignedCount} videos</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Link
                        href={`/parent/kid/${profile.id}`}
                        className="flex items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                      >
                        Ver detalle <ChevronRight size={14} />
                      </Link>
                      <Link
                        href={`/parent/add-video?profileId=${profile.id}`}
                        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                      >
                        <Plus size={13} /> Asignar video
                      </Link>
                    </div>
                  </div>

                  {/* Motivational footer */}
                  {motivation && (
                    <div className="border-t border-border bg-muted/40 px-5 py-2.5 flex items-center gap-2">
                      <span className="text-sm">{motivation.icon}</span>
                      <p className="text-xs text-muted-foreground font-medium">{motivation.text}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Actividad reciente */}
      <section>
        <h2 className="mb-4 text-[22px] font-bold text-foreground">Actividad reciente</h2>

        {feed.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border px-6 py-8 flex flex-col items-start gap-2">
            <span className="text-3xl mb-1">🎬</span>
            <p className="text-sm font-bold text-foreground">Aún no hay actividad</p>
            <p className="text-xs text-muted-foreground font-medium max-w-xs">
              Asigná un video para que tu hijo comience a aprender y empiece a ganar puntos.
            </p>
            <Link href="/parent/add-video" className="text-xs font-bold text-primary hover:opacity-70 transition-opacity mt-1">
              Asignar video →
            </Link>
          </div>
        ) : (
          <FeedList items={feed} />
        )}
      </section>
    </div>
  )
}
