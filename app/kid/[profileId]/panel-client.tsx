'use client'

import Link from 'next/link'
import { Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import { VideoCard } from '@/components/ui/video-card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RobiFloatingImage } from '@/components/robi-floating-image'

interface Video {
  id: string
  youtube_id: string
  title: string | null
}

interface PanelClientProps {
  profileId: string
  profileName: string
  profileAvatar: string
  totalPoints: number
  videos: Video[]
  watchedIds: string[]
}

export default function PanelClient({
  profileId,
  profileName,
  profileAvatar,
  totalPoints,
  videos,
  watchedIds,
}: PanelClientProps) {
  const watchedSet = new Set(watchedIds)
  const watchedCount = watchedSet.size
  const totalCount = videos.length
  const progressValue = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0

  return (
    <div className="flex flex-col">
      {/* Header card */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-card px-6 py-5 shadow-sm border border-border"
      >
        <div className="flex items-center gap-4">
          <span className="text-5xl select-none" role="img" aria-label={`Avatar de ${profileName}`}>
            {profileAvatar}
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-[26px] font-bold leading-none text-foreground">
              ¡Hola, {profileName}!
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
                className="rounded-full px-3 py-0.5 text-sm font-bold text-foreground"
                style={{ background: '#FEF9C3' }}
              >
                ⭐ {totalPoints.toLocaleString('es-AR')} pts
              </motion.span>
              {totalCount > 0 && (
                <div className="flex items-center gap-2">
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
        </div>
        <Link href={`/kid/${profileId}/rewards`} className="shrink-0">
          <Button variant="primary" className="h-10 px-5 gap-2">
            <Gift size={18} />
            Ver premios
          </Button>
        </Link>
      </motion.header>

      {/* Robi greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-6 flex items-center gap-3 rounded-2xl bg-primary/5 px-5 py-3 border border-primary/10"
      >
        <RobiFloatingImage size={48} />
        <p className="text-base font-bold text-foreground">
          ¡Elegí un video y aprendé algo nuevo hoy!
        </p>
      </motion.div>

      {/* Video grid */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mb-4 text-[22px] font-bold text-foreground"
      >
        Tus videos
      </motion.h2>

      {videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-10 text-center border border-border"
        >
          <span className="text-6xl select-none">📭</span>
          <p className="text-lg font-bold text-foreground">Todavía no hay videos.</p>
          <p className="text-base font-semibold text-muted-foreground">
            ¡Pedile a mamá o papá que cargue uno!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + 0.07 * i, type: 'spring', stiffness: 240, damping: 20 }}
            >
              <VideoCard
                href={`/kid/${profileId}/watch/${video.id}`}
                title={video.title ?? 'Video educativo'}
                thumbnailUrl={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                status={watchedSet.has(video.id) ? 'completado' : 'nuevo'}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
