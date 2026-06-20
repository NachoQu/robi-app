import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { RobiPlaceholder } from '@/components/robi-placeholder'

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

  return (
    <div
      className="min-h-screen flex flex-col px-4 py-6"
      style={{
        background: 'linear-gradient(160deg, oklch(0.92 0.07 262) 0%, oklch(0.96 0.06 95) 60%, oklch(0.94 0.08 155 / 0.4) 100%)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-6">
        {/* Back link */}
        <div className="w-full max-w-lg">
          <Link
            href="/"
            className="text-sm font-bold flex items-center gap-1"
            style={{ color: 'var(--robi-primary)' }}
          >
            ← Cambiar perfil
          </Link>
        </div>

        {/* Avatar + name + points */}
        <div
          className="flex flex-col items-center gap-2 rounded-3xl px-8 py-5 w-full max-w-lg shadow-lg"
          style={{
            background: 'oklch(1 0 0 / 0.85)',
            boxShadow: '0 6px 32px oklch(0.58 0.22 262 / 0.18)',
          }}
        >
          <span className="text-6xl select-none" role="img" aria-label={`Avatar de ${profile.name}`}>
            {profile.avatar}
          </span>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: 'var(--robi-primary)' }}
          >
            ¡Hola, {profile.name}!
          </h1>
          <span
            className="flex items-center gap-1 text-lg font-extrabold rounded-full px-4 py-1.5"
            style={{
              background: 'oklch(0.94 0.06 95)',
              color: 'oklch(0.45 0.15 80)',
              boxShadow: '0 2px 8px oklch(0.88 0.18 95 / 0.5)',
            }}
          >
            ⭐ {profile.total_points.toLocaleString('es-AR')} puntos
          </span>
        </div>

        {/* Robi greeting */}
        <div
          className="flex items-center gap-3 rounded-3xl px-5 py-3 w-full max-w-lg"
          style={{ background: 'oklch(0.94 0.06 262 / 0.6)' }}
        >
          <RobiPlaceholder size={48} />
          <p className="text-base font-bold" style={{ color: 'oklch(0.25 0.08 262)' }}>
            ¡Elegí un video y aprendé algo nuevo hoy! 🚀
          </p>
        </div>
      </div>

      {/* Quick access buttons */}
      <div className="flex gap-3 mb-6 w-full max-w-lg mx-auto">
        <Link
          href={`/kid/${profileId}/album`}
          className="flex-1 flex flex-col items-center gap-1.5 rounded-3xl py-4 font-extrabold text-sm transition-all active:scale-95"
          style={{
            background: 'var(--robi-success)',
            color: 'white',
            boxShadow: '0 4px 16px oklch(0.68 0.18 155 / 0.4)',
          }}
        >
          <span className="text-2xl">📚</span>
          Mi álbum
        </Link>
        <Link
          href={`/kid/${profileId}/rewards`}
          className="flex-1 flex flex-col items-center gap-1.5 rounded-3xl py-4 font-extrabold text-sm transition-all active:scale-95"
          style={{
            background: 'var(--robi-coral)',
            color: 'white',
            boxShadow: '0 4px 16px oklch(0.70 0.18 30 / 0.4)',
          }}
        >
          <span className="text-2xl">🏆</span>
          Mis premios
        </Link>
      </div>

      {/* Video grid */}
      <div className="w-full max-w-lg mx-auto flex-1">
        <h2
          className="text-xl font-extrabold mb-4"
          style={{ color: 'oklch(0.25 0.08 262)' }}
        >
          🎬 Mis videos
        </h2>

        {videos.length === 0 ? (
          /* Empty state */
          <div
            className="flex flex-col items-center gap-4 rounded-3xl px-6 py-10 text-center"
            style={{
              background: 'oklch(1 0 0 / 0.75)',
              boxShadow: '0 4px 20px oklch(0.58 0.22 262 / 0.10)',
            }}
          >
            <span className="text-6xl select-none">📭</span>
            <p className="text-lg font-bold" style={{ color: 'oklch(0.45 0.08 262)' }}>
              Todavía no hay videos.
            </p>
            <p className="text-base font-semibold text-muted-foreground">
              ¡Pedile a mamá o papá que cargue uno!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {videos.map((assignment) => {
              const video = assignment.videos
              const isWatched = watchedSet.has(video.id)
              const thumbUrl = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`

              return (
                <Link
                  key={video.id}
                  href={`/kid/${profileId}/watch/${video.id}`}
                  className="block group"
                >
                  <div
                    className="rounded-3xl overflow-hidden shadow-lg transition-all active:scale-95 group-hover:shadow-xl"
                    style={{
                      background: 'oklch(1 0 0)',
                      boxShadow: '0 4px 16px oklch(0.58 0.22 262 / 0.13)',
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video overflow-hidden">
                      <Image
                        src={thumbUrl}
                        alt={video.title ?? 'Video'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {/* Badge overlay */}
                      <div className="absolute top-2 right-2">
                        {isWatched ? (
                          <span
                            className="flex items-center gap-1 text-xs font-extrabold rounded-full px-2.5 py-1 shadow"
                            style={{
                              background: 'var(--robi-success)',
                              color: 'white',
                            }}
                          >
                            ✓ Visto
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-xs font-extrabold rounded-full px-2.5 py-1 shadow"
                            style={{
                              background: 'var(--robi-coral)',
                              color: 'white',
                            }}
                          >
                            ¡Nuevo!
                          </span>
                        )}
                      </div>
                      {/* Play icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center opacity-90"
                          style={{ background: 'oklch(0 0 0 / 0.5)' }}
                        >
                          <span className="text-white text-xl ml-1">▶</span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="px-3 py-2.5">
                      <p
                        className="text-sm font-bold leading-snug line-clamp-2"
                        style={{ color: 'oklch(0.20 0.04 262)' }}
                      >
                        {video.title ?? 'Video educativo'}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
