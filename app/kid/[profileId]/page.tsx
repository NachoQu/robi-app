import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Gift } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { VideoCard } from '@/components/ui/video-card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RobiFloatingImage } from '@/components/robi-floating-image'
import { KidShell } from '@/components/shell/kid-shell'

interface PageProps {
  params: Promise<{ profileId: string }>
}

export default async function KidLibraryPage({ params }: PageProps) {
  const { profileId } = await params
  const supabase = await createClient()

  // Load profile
  const { data: profile } = await supabase
    .from('child_profiles')
    .select('id, name, avatar, total_points')
    .eq('id', profileId)
    .single()

  if (!profile) notFound()

  // Load assigned ready videos
  const { data: assignments } = await supabase
    .from('video_assignments')
    .select('video_id, videos!inner(id, youtube_id, title, status)')
    .eq('child_profile_id', profileId)
    .eq('videos.status', 'ready')

  type AssignedVideo = {
    video_id: string
    videos: { id: string; youtube_id: string; title: string | null; status: string }
  }

  const videos: AssignedVideo[] = ((assignments ?? []) as unknown as AssignedVideo[])
    // Defensive JS-level guard: only render videos whose status is exactly 'ready'
    // (belt-and-suspenders on top of the PostgREST embedded filter)
    .filter((a) => a.videos?.status === 'ready')

  // Load completed activities for this profile to determine "visto" state
  const videoIds = videos.map((a) => a.video_id)
  const { data: activities } = videoIds.length > 0
    ? await supabase
        .from('activities')
        .select('video_id')
        .eq('child_profile_id', profileId)
        .in('video_id', videoIds)
    : { data: [] }

  const watchedSet = new Set((activities ?? []).map((a) => a.video_id))

  // Derive progress from already-loaded data (no fabricated backend data)
  const watchedCount = watchedSet.size
  const totalCount = videos.length
  const progressValue = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0

  return (
    <KidShell
      profileId={profileId}
      profileName={profile.name}
      profileAvatar={profile.avatar}
      points={profile.total_points}
    >
      {/* Header card */}
      <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-sm border border-border sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl select-none" role="img" aria-label={`Avatar de ${profile.name}`}>
            {profile.avatar}
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[28px] font-bold leading-none text-foreground">
              ¡Hola, {profile.name}!
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
                ⭐ {profile.total_points.toLocaleString('es-AR')} pts
              </span>
            </div>
            {totalCount > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {watchedCount} de {totalCount} videos vistos
                </span>
                <div className="w-24">
                  <Progress value={progressValue} />
                </div>
              </div>
            )}
          </div>
        </div>
        <Link href={`/kid/${profileId}/rewards`}>
          <Button variant="primary" className="h-10 px-5 gap-2">
            <Gift size={18} />
            Ver premios
          </Button>
        </Link>
      </header>

      {/* Robi greeting */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-primary/5 px-5 py-3 border border-primary/10">
        <RobiFloatingImage size={48} />
        <p className="text-base font-bold text-foreground">
          ¡Elegí un video y aprendé algo nuevo hoy!
        </p>
      </div>

      {/* Video grid */}
      <h2 className="mb-4 text-[22px] font-bold text-foreground">Tus videos</h2>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-10 text-center border border-border">
          <span className="text-6xl select-none">📭</span>
          <p className="text-lg font-bold text-foreground">
            Todavía no hay videos.
          </p>
          <p className="text-base font-semibold text-muted-foreground">
            ¡Pedile a mamá o papá que cargue uno!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {videos.map((a) => (
            <VideoCard
              key={a.videos.id}
              href={`/kid/${profileId}/watch/${a.videos.id}`}
              title={a.videos.title ?? 'Video educativo'}
              thumbnailUrl={`https://img.youtube.com/vi/${a.videos.youtube_id}/hqdefault.jpg`}
              status={watchedSet.has(a.videos.id) ? 'completado' : 'nuevo'}
            />
          ))}
        </div>
      )}
    </KidShell>
  )
}
