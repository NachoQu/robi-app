import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AddVideoShortcut } from './add-video-shortcut'
import { VideoListClient } from './video-list-client'
import { PlanCard } from './plan-card'

const FREE_VIDEO_LIMIT = 5

export default async function VideosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [{ data: videos }, { data: profiles }] = await Promise.all([
    supabase
      .from('videos')
      .select('id, title, youtube_id, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('child_profiles')
      .select('id, name, avatar')
      .eq('user_id', user.id)
      .order('name'),
  ])

  const allVideos = videos ?? []
  const allProfiles = profiles ?? []
  const videoIds = allVideos.map((v) => v.id)

  const assignmentsByVideo: Record<string, { id: string; name: string; avatar: string }[]> = {}

  if (videoIds.length > 0) {
    const { data: assignments } = await supabase
      .from('video_assignments')
      .select('video_id, child_profiles(id, name, avatar)')
      .in('video_id', videoIds)

    for (const row of assignments ?? []) {
      const r = row as unknown as { video_id: string; child_profiles: { id: string; name: string; avatar: string } | null }
      if (!assignmentsByVideo[r.video_id]) assignmentsByVideo[r.video_id] = []
      if (r.child_profiles) assignmentsByVideo[r.video_id].push(r.child_profiles)
    }
  }

  const usedCount = allVideos.filter((v) => v.status !== 'rejected').length
  const remaining = Math.max(0, FREE_VIDEO_LIMIT - usedCount)
  const progressPct = Math.min(100, (usedCount / FREE_VIDEO_LIMIT) * 100)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Biblioteca de videos</h1>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">
          Acá se guardan los videos que cargás para tus hijos.
        </p>
      </div>

      {/* Plan card */}
      <PlanCard usedCount={usedCount} />

      {/* Reminder */}
      <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <span className="text-base shrink-0">🛡️</span>
        <p className="text-xs text-muted-foreground font-medium leading-snug">
          <span className="font-bold text-foreground">Revisá antes de cargar: </span>
          mirá el video completo antes de asignarlo para asegurarte de que sea apto.
        </p>
      </div>

      {/* Add video shortcut */}
      <AddVideoShortcut />

      {/* Video list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">
            Videos ({usedCount}/{FREE_VIDEO_LIMIT})
          </h2>
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-0.5">
            Más recientes <ChevronRight size={12} className="rotate-90" />
          </span>
        </div>

        <VideoListClient
          videos={allVideos}
          assignmentsByVideo={assignmentsByVideo}
          allProfiles={allProfiles}
        />
      </section>
    </div>
  )
}
