'use client'

// Minimal typing for the YouTube IFrame Player API
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: (event: { target: { playVideo: () => void } }) => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => void
      PlayerState: {
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RobiPlaceholder } from '@/components/robi-placeholder'

interface VideoPlayerProps {
  youtubeId: string
  title: string
  profileId: string
  videoId: string
}

export function VideoPlayer({ youtubeId, title, profileId, videoId }: VideoPlayerProps) {
  const router = useRouter()
  const playerContainerId = 'yt-player-container'
  const [videoEnded, setVideoEnded] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  const playerRef = useRef<boolean>(false)

  const initPlayer = useCallback(() => {
    if (playerRef.current) return
    playerRef.current = true

    new window.YT.Player(playerContainerId, {
      videoId: youtubeId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onStateChange: (event) => {
          // YT.PlayerState.ENDED === 0
          if (event.data === 0) {
            setVideoEnded(true)
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
      // Clean up only our callback; do not remove the script (YT caches it globally)
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
    <div
      className="min-h-screen flex flex-col px-4 py-6"
      style={{
        background: 'linear-gradient(160deg, oklch(0.14 0.04 262) 0%, oklch(0.18 0.05 262) 100%)',
      }}
    >
      {/* Back + title */}
      <div className="w-full max-w-2xl mx-auto mb-4">
        <Link
          href={`/kid/${profileId}`}
          className="text-sm font-bold flex items-center gap-1 mb-3"
          style={{ color: 'oklch(0.75 0.12 262)' }}
        >
          ← Volver a mis videos
        </Link>
        <h1
          className="text-xl font-extrabold leading-snug"
          style={{ color: 'oklch(0.96 0.01 262)' }}
        >
          {title}
        </h1>
      </div>

      {/* Player wrapper */}
      <div className="w-full max-w-2xl mx-auto">
        <div
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
          style={{
            aspectRatio: '16/9',
            background: 'oklch(0 0 0)',
            boxShadow: '0 8px 48px oklch(0.58 0.22 262 / 0.45)',
          }}
        >
          <div id={playerContainerId} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* Robi cheer hint */}
      {!videoEnded && (
        <div className="w-full max-w-2xl mx-auto mt-4">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'oklch(0.22 0.06 262 / 0.8)' }}
          >
            <RobiPlaceholder size={40} />
            <p className="text-sm font-bold" style={{ color: 'oklch(0.88 0.06 262)' }}>
              ¡Muy bien! Cuando termines, tocá el botón 🎉
            </p>
          </div>
        </div>
      )}

      {/* "¡Listo! Hacer la actividad" button — appears when video ends */}
      <AnimatePresence>
        {videoEnded && (
          <motion.div
            key="activity-btn"
            initial={{ opacity: 0, scale: 0.82, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="w-full max-w-2xl mx-auto mt-6 flex flex-col items-center gap-4"
          >
            {/* Celebration row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <RobiPlaceholder size={52} />
              <p
                className="text-xl font-extrabold"
                style={{ color: 'oklch(0.96 0.01 262)' }}
              >
                ¡Genial, lo viste todo! 🎊
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleActivity}
              className="w-full rounded-3xl py-5 text-xl font-extrabold tracking-wide shadow-2xl transition-colors"
              style={{
                background: 'var(--robi-success)',
                color: 'white',
                boxShadow: '0 6px 32px oklch(0.68 0.18 155 / 0.55)',
              }}
            >
              ¡Listo! Hacer la actividad 🚀
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
