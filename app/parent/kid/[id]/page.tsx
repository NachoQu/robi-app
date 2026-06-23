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

  const [{ data: activities }, { data: redemptions }] = await Promise.all([
    supabase
      .from('activities')
      .select('id, completed_at, bonus_points, videos(title)')
      .eq('child_profile_id', id)
      .order('completed_at', { ascending: false }),
    supabase
      .from('redemptions')
      .select('id, redeemed_at, vouchers(title, points_cost)')
      .eq('child_profile_id', id)
      .order('redeemed_at', { ascending: false }),
  ])

  const rows = (activities ?? []) as unknown as {
    id: string
    completed_at: string
    bonus_points: number
    videos: { title: string | null } | null
  }[]

  const redemptionRows = (redemptions ?? []) as unknown as {
    id: string
    redeemed_at: string
    vouchers: { title: string | null; points_cost: number } | null
  }[]

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weeklyCount = rows.filter((r) => new Date(r.completed_at) >= weekStart).length

  const avgCorrect = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + correctAnswers(r.bonus_points), 0) / rows.length * 20)
    : 0

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Link
        href="/parent"
        className="text-sm font-semibold transition-opacity hover:opacity-70 inline-flex items-center gap-1 w-fit"
        style={{ color: 'var(--robi-primary)' }}
      >
        ← Volver al panel
      </Link>

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
            {rows.length} video{rows.length !== 1 ? 's' : ''} completado{rows.length !== 1 ? 's' : ''} · {profile.total_points} pts acumulados
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
        <div className="rounded-2xl bg-card border border-border px-4 py-4">
          <p className="text-xs text-muted-foreground font-medium">Esta semana</p>
          <p className="text-2xl font-extrabold text-foreground mt-1 leading-none">{weeklyCount}</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">videos completados</p>
        </div>
        <div className="rounded-2xl bg-card border border-border px-4 py-4">
          <p className="text-xs text-muted-foreground font-medium">Promedio de aciertos</p>
          <p className="text-2xl font-extrabold text-foreground mt-1 leading-none">{avgCorrect}%</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">sobre 5 preguntas</p>
        </div>
      </div>

      {/* Historial */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[22px] font-bold text-foreground">Historial de videos</h2>

        {rows.length === 0 ? (
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
          <div className="flex flex-col gap-2">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_80px_52px] gap-2 px-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Video</p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Fecha</p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Resp.</p>
            </div>

            {rows.map((row) => {
              const correct = correctAnswers(row.bonus_points)
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_80px_52px] gap-2 items-center rounded-2xl bg-card border border-border px-4 py-3"
                >
                  <p className="text-sm font-medium text-foreground truncate">
                    {row.videos?.title ?? 'Video sin título'}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {formatDate(row.completed_at)}
                  </p>
                  <p className={`text-sm font-bold text-right ${answersColor(correct)}`}>
                    {correct}/5
                  </p>
                </div>
              )
            })}
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
