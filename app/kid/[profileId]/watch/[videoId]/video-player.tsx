'use client'

// Minimal typing for the YouTube IFrame Player API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { Button } from '@/components/ui/button'
import { markVideoWatched } from '@/actions/videos'

interface VideoPlayerProps {
  youtubeId: string
  title: string
  profileId: string
  videoId: string
  previousActivity?: { base_points: number; bonus_points: number } | null
}

export function VideoPlayer({ youtubeId, title, profileId, videoId, previousActivity }: VideoPlayerProps) {
  const router = useRouter()
  const playerContainerId = 'yt-player-container'
  const [videoEnded, setVideoEnded] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)

  const initPlayer = useCallback(() => {
    if (playerRef.current) return

    playerRef.current = new window.YT.Player(playerContainerId, {
      videoId: youtubeId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onStateChange: (event: { data: number }) => {
          // YT.PlayerState.ENDED === 0
          if (event.data === 0) {
            setVideoEnded(true)
            void markVideoWatched({ videoId, childProfileId: profileId })
          }
        },
      },
    })
  }, [youtubeId])

  useEffect(() => {
    // If YT API is already loaded (e.g. navigated back to this page)
    if (window.YT && window.YT.Player) {
      setApiReady(true)
      return
    }

    // Load YouTube IFrame API script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript.parentNode?.insertBefore(tag, firstScript)

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true)
    }

    return () => {
      // Clean up: destroy the player instance and reset the API-ready callback
      playerRef.current?.destroy?.()
      playerRef.current = null
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.onYouTubeIframeAPIReady = () => {}
    }
  }, [])

  useEffect(() => {
    if (apiReady) {
      initPlayer()
    }
  }, [apiReady, initPlayer])

  const handleActivity = () => {
    router.push(`/kid/${profileId}/quiz/${videoId}`)
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 bg-background">
      {/* Back + title */}
      <div className="w-full max-w-4xl mx-auto mb-4">
        <Link
          href={`/kid/${profileId}`}
          className="text-sm font-bold flex items-center gap-1 mb-3"
          style={{ color: 'var(--robi-primary)' }}
        >
          ← Volver a Mis Videos
        </Link>
        <h1 className="text-xl font-extrabold leading-snug text-foreground">
          {title}
        </h1>
      </div>

      {/* Player wrapper — TV frame */}
      <div className="w-full max-w-4xl mx-auto">
        {/* TV outer bezel */}
        <div
          className="relative w-full rounded-2xl shadow-2xl"
          style={{ background: '#1a1a1a', padding: '16px 16px 0 16px' }}
        >
          {/* Screen */}
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: '16/9', background: '#000', borderRadius: '4px' }}
          >
            <div id={playerContainerId} className="absolute inset-0 w-full h-full" />
          </div>

          {/* TV bottom bar */}
          <div
            className="flex items-center justify-center"
            style={{ height: '28px' }}
          >
            <div
              className="rounded-full"
              style={{ width: '8px', height: '8px', background: '#444' }}
            />
          </div>
        </div>
      </div>

      {/* Robi cheer hint */}
      {!videoEnded && (
        <div className="w-full max-w-4xl mx-auto mt-4">
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-muted/60">
            <RobiPlaceholder size={40} />
            <p className="text-sm font-bold text-foreground">
              ¡Muy bien! Cuando termines, tocá el botón 🎉
            </p>
          </div>
        </div>
      )}

      {/* Post-video panel — appears when video ends */}
      <AnimatePresence>
        {videoEnded && (
          <motion.div
            key="activity-btn"
            initial={{ opacity: 0, scale: 0.82, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="w-full max-w-4xl mx-auto mt-6 flex flex-col items-center gap-4"
          >
            {previousActivity ? (
              /* Already completed — show previous score */
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <RobiPlaceholder size={72} mood="celebrate" />
                  <p className="text-xl font-extrabold text-foreground text-center">
                    ¡Ya completaste esta actividad! ✅
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="w-full max-w-xs mx-auto rounded-2xl px-4 py-3 flex flex-col items-center gap-0.5 bg-primary/5 border border-primary/10"
                >
                  <span className="text-xs font-semibold text-muted-foreground">Tu puntaje anterior</span>
                  <span className="text-2xl font-extrabold leading-none text-foreground">
                    ⭐ {previousActivity.base_points + previousActivity.bonus_points} / 35
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(((previousActivity.base_points + previousActivity.bonus_points) / 35) * 100)}% completado
                  </span>
                </motion.div>

                <motion.div className="w-full max-w-xs mx-auto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="default"
                    className="w-full rounded-3xl py-3.5 text-lg font-extrabold tracking-wide h-auto"
                    onClick={() => router.push(`/kid/${profileId}`)}
                  >
                    Seguir aprendiendo →
                  </Button>
                </motion.div>
              </>
            ) : (
              /* First time — show activity button */
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <RobiPlaceholder size={52} />
                  <p className="text-xl font-extrabold text-foreground">
                    ¡Genial, lo viste todo! 🎊
                  </p>
                </motion.div>

                <motion.div
                  className="w-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="primary"
                    className="w-full rounded-3xl py-5 text-xl font-extrabold tracking-wide h-auto"
                    onClick={handleActivity}
                  >
                    ¡Listo! Hacer la actividad 🚀
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
