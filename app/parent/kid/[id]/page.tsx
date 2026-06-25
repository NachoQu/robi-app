import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditProfileButton } from './edit-profile-button'

function formatDate(dateStr: string) {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 14) return 'Hace 1 semana'
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function formatAbsoluteDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function correctAnswers(bonusPoints: number) {
  return Math.round(bonusPoints / 5)
}

function answersColor(correct: number) {
  if (correct >= 5) return 'text-green-600 dark:text-green-400'
  if (correct >= 3) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-500 dark:text-red-400'
}

export default async function KidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: profile } = await supabase
    .from('child_profiles')
    .select('id, name, avatar, total_points')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) notFound()

  const [{ data: activities }, { data: redemptions }, { data: watches }, { count: totalAssigned }, { data: nextVouchers }] = await Promise.all([
    supabase
      .from('activities')
      .select('id, video_id, completed_at, bonus_points, videos(title)')
      .eq('child_profile_id', id)
      .order('completed_at', { ascending: false }),
    supabase
      .from('redemptions')
      .select('id, redeemed_at, vouchers(title, points_cost)')
      .eq('child_profile_id', id)
      .order('redeemed_at', { ascending: false }),
    supabase
      .from('video_assignments')
      .select('video_id, watched_at')
      .eq('child_profile_id', id)
      .not('watched_at', 'is', null)
      .order('watched_at', { ascending: false }),
    supabase
      .from('video_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('child_profile_id', id),
    supabase
      .from('vouchers')
      .select('points_cost')
      .eq('user_id', user.id)
      .gt('points_cost', profile.total_points)
      .order('points_cost', { ascending: true })
      .limit(1),
  ])

  const rows = (activities ?? []) as unknown as {
    id: string
    video_id: string
    completed_at: string
    bonus_points: number
    videos: { title: string | null } | null
  }[]

  const watchRows = (watches ?? []) as unknown as {
    video_id: string
    watched_at: string
  }[]

  // IDs de videos con quiz completado para no mostrar "Vio el video" duplicado
  const completedVideoIds = new Set(rows.map((r) => r.video_id))

  // Mapa de video_id → title para los watched (busca en activities primero, luego muestra genérico)
  const titleByVideoId = new Map(rows.map((r) => [r.video_id, r.videos?.title ?? null]))

  // Para watches sin title en activities, buscar en videos
  const unwatchedIds = watchRows.filter((w) => !completedVideoIds.has(w.video_id)).map((w) => w.video_id)
  if (unwatchedIds.length > 0) {
    const { data: videoTitles } = await supabase
      .from('videos')
      .select('id, title')
      .in('id', unwatchedIds)
    ;(videoTitles ?? []).forEach((v: { id: string; title: string | null }) => titleByVideoId.set(v.id, v.title))
  }

  type HistorialEntry =
    | { kind: 'quiz'; id: string; date: string; title: string | null; bonus_points: number }
    | { kind: 'watch'; id: string; date: string; title: string | null }

  const historial: HistorialEntry[] = [
    ...rows.map((r) => ({ kind: 'quiz' as const, id: r.id, date: r.completed_at, title: r.videos?.title ?? null, bonus_points: r.bonus_points })),
    ...watchRows
      .filter((w) => !completedVideoIds.has(w.video_id))
      .map((w) => ({ kind: 'watch' as const, id: w.video_id, date: w.watched_at, title: titleByVideoId.get(w.video_id) ?? null })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const redemptionRows = (redemptions ?? []) as unknown as {
    id: string
    redeemed_at: string
    vouchers: { title: string | null; points_cost: number } | null
  }[]

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weeklyCount = rows.filter((r) => new Date(r.completed_at) >= weekStart).length
  const weeklyWatched = historial.filter((e) => new Date(e.date) >= weekStart).length

  const nextVoucherCost = (nextVouchers ?? [])[0]?.points_cost ?? null
  const ptsToNextPrize = nextVoucherCost !== null ? nextVoucherCost - profile.total_points : null


  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <span
          className="flex items-center justify-center rounded-full text-3xl shrink-0"
          style={{ width: 56, height: 56, background: 'var(--robi-accent)' }}
        >
          {profile.avatar}
        </span>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-foreground">{profile.name}</h1>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">
            ⭐ {profile.total_points} pts acumulados
          </p>
        </div>
        <EditProfileButton
          profileId={profile.id}
          initialName={profile.name}
          initialAvatar={profile.avatar}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">

        {/* Videos */}
        <div className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'color-mix(in oklch, #8b5cf6 15%, transparent)' }}>📺</div>
            <div>
              <p className="text-sm font-bold text-foreground">Videos</p>
              <p className="text-xs text-muted-foreground font-medium">completados</p>
            </div>
          </div>
          <div className="flex items-baseline justify-center gap-1.5">
            <p className="text-5xl font-extrabold text-foreground leading-none">{weeklyWatched}</p>
            <span className="text-xl font-semibold text-muted-foreground">/{totalAssigned ?? 0}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden w-full" style={{ background: 'color-mix(in oklch, #8b5cf6 15%, transparent)' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${(totalAssigned ?? 0) > 0 ? Math.min(100, (weeklyWatched / (totalAssigned ?? 1)) * 100) : 0}%`, background: '#8b5cf6' }} />
          </div>
          {(totalAssigned ?? 0) > 0 && (
            <div className="rounded-xl px-3 py-2.5 w-full flex items-center gap-2"
              style={{ background: 'color-mix(in oklch, #8b5cf6 10%, transparent)' }}>
              <span className="text-base">🎉</span>
              <div>
                <p className="text-xs font-bold" style={{ color: '#8b5cf6' }}>
                  {weeklyWatched >= (totalAssigned ?? 0) ? '¡Completó todos los videos!' : '¡Va por buen camino!'}
                </p>
                {weeklyWatched < (totalAssigned ?? 0) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Le falta{(totalAssigned ?? 0) - weeklyWatched === 1 ? '' : 'n'} {(totalAssigned ?? 0) - weeklyWatched} por completar.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quizzes */}
        <div className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'color-mix(in oklch, var(--robi-primary) 15%, transparent)' }}>✅</div>
            <div>
              <p className="text-sm font-bold text-foreground">Quizzes</p>
              <p className="text-xs text-muted-foreground font-medium">completados</p>
            </div>
          </div>
          <div className="flex items-baseline justify-center gap-1.5">
            <p className="text-5xl font-extrabold text-foreground leading-none">{weeklyCount}</p>
            <span className="text-xl font-semibold text-muted-foreground">/{totalAssigned ?? 0}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden w-full" style={{ background: 'color-mix(in oklch, var(--robi-primary) 15%, transparent)' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${(totalAssigned ?? 0) > 0 ? Math.min(100, (weeklyCount / (totalAssigned ?? 1)) * 100) : 0}%`, background: 'var(--robi-primary)' }} />
          </div>
          {(totalAssigned ?? 0) > 0 && (
            <div className="rounded-xl px-3 py-2.5 w-full flex items-center gap-2"
              style={{ background: 'color-mix(in oklch, var(--robi-primary) 10%, transparent)' }}>
              <span className="text-base">🎉</span>
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--robi-primary)' }}>
                  {weeklyCount >= (totalAssigned ?? 0) ? '¡Completó todos los quizzes!' : '¡Va por buen camino!'}
                </p>
                {weeklyCount < (totalAssigned ?? 0) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Le falta{(totalAssigned ?? 0) - weeklyCount === 1 ? '' : 'n'} {(totalAssigned ?? 0) - weeklyCount} quiz{(totalAssigned ?? 0) - weeklyCount === 1 ? '' : 'zes'} por completar.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Historial */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[22px] font-bold text-foreground">Historial de videos</h2>

        {historial.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border px-6 py-8 flex flex-col items-start gap-2">
            <span className="text-3xl mb-1">🎬</span>
            <p className="text-sm font-bold text-foreground">Todavía no completó ningún video</p>
            <p className="text-xs text-muted-foreground font-medium">
              Asigná un video para que {profile.name} empiece a aprender.
            </p>
            <Link href="/parent/add-video" className="text-xs font-bold text-primary hover:opacity-70 transition-opacity mt-1">
              Asignar video →
            </Link>
          </div>
        ) : (
          <div className="relative flex flex-col">
            {/* Línea vertical continua */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: 'color-mix(in oklch, var(--robi-primary) 25%, transparent)' }} />

            {(() => {
              let lastDay = ''
              return historial.map((entry) => {
                const day = new Date(entry.date).toDateString()
                const showLabel = day !== lastDay
                lastDay = day
                return (
                  <div key={entry.kind + entry.id + entry.date} className="flex flex-col">
                    {showLabel && (
                      <div className="flex items-center mt-2 mb-1.5">
                        <span
                          className="text-xs font-semibold px-2.5 py-0.5 rounded-full relative z-10 -translate-x-1/2"
                          style={{ marginLeft: '7px', background: 'color-mix(in oklch, var(--robi-primary) 18%, var(--background))', color: 'var(--robi-primary)' }}
                        >
                          {formatDate(entry.date)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      {/* Dot */}
                      <div className="shrink-0 w-[15px] h-[15px] rounded-full border-2 relative z-10"
                        style={{
                          borderColor: 'var(--robi-primary)',
                          background: entry.kind === 'quiz'
                            ? 'var(--robi-primary)'
                            : 'color-mix(in oklch, var(--robi-primary) 20%, var(--background))',
                        }}
                      />
                      {/* Card */}
                      <div className="flex-1 grid grid-cols-[1fr_56px] gap-2 items-center rounded-2xl bg-card border border-border pl-4 pr-6 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate leading-snug">
                            {entry.title ?? 'Video sin título'}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                            {entry.kind === 'quiz' ? '✅ Completó el quiz' : '👀 Vio el video'}
                          </p>
                        </div>
                        <p className={`text-sm font-bold text-right ${entry.kind === 'quiz' ? answersColor(correctAnswers(entry.bonus_points)) : 'text-muted-foreground'}`}>
                          {entry.kind === 'quiz' ? `${correctAnswers(entry.bonus_points)}/5` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        )}
      </section>

      {/* Premios canjeados */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[22px] font-bold text-foreground">Premios canjeados</h2>

        {redemptionRows.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border px-6 py-8 flex flex-col items-start gap-2">
            <span className="text-3xl mb-1">🎁</span>
            <p className="text-sm font-bold text-foreground">Todavía no canjeó ningún premio</p>
            <p className="text-xs text-muted-foreground font-medium">
              Cuando {profile.name} acumule suficientes puntos podrá canjear premios.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_80px_60px] gap-2 px-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Premio</p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Fecha</p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Pts</p>
            </div>
            {redemptionRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_80px_60px] gap-2 items-center rounded-2xl bg-card border border-border px-4 py-3"
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {row.vouchers?.title ?? 'Premio'}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {formatDate(row.redeemed_at)}
                </p>
                <p className="text-sm font-bold text-right" style={{ color: 'var(--robi-accent-ink)' }}>
                  -{row.vouchers?.points_cost ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
