'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { RobiPlaceholder } from '@/components/robi-placeholder'

interface EarnedSlot {
  id: string
  videoId: string
  videoTitle: string
  earnedAt: string
  earned: true
}

interface EmptySlot {
  videoId: string
  videoTitle: string
  earned: false
}

type AlbumSlot = EarnedSlot | EmptySlot

interface AlbumClientProps {
  profileId: string
  profileName: string
  profileAvatar: string
  slots: AlbumSlot[]
  earnedCount: number
  totalCount: number
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Badge emojis that rotate per slot index (earned slots only)
const BADGE_EMOJIS = ['🏅', '⭐', '🌟', '🎖️', '🥇', '✨', '🎯', '🚀']

export default function AlbumClient({
  profileId,
  profileName,
  profileAvatar,
  slots,
  earnedCount,
  totalCount,
}: AlbumClientProps) {
  return (
    <div
      className="min-h-screen flex flex-col px-4 py-6"
      style={{
        background:
          'linear-gradient(160deg, oklch(0.92 0.07 262) 0%, oklch(0.96 0.06 95) 60%, oklch(0.94 0.08 155 / 0.4) 100%)',
      }}
    >
      {/* Header area */}
      <div className="flex flex-col items-center gap-3 mb-6 w-full max-w-lg mx-auto">
        <div className="w-full">
          <Link
            href={`/kid/${profileId}`}
            className="text-sm font-bold flex items-center gap-1"
            style={{ color: 'var(--robi-primary)' }}
          >
            ← Volver
          </Link>
        </div>

        {/* Profile / title card */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-2 rounded-3xl px-8 py-5 w-full shadow-lg"
          style={{
            background: 'oklch(1 0 0 / 0.88)',
            boxShadow: '0 6px 32px oklch(0.58 0.22 262 / 0.18)',
          }}
        >
          <span
            className="text-5xl select-none"
            role="img"
            aria-label={`Avatar de ${profileName}`}
          >
            {profileAvatar}
          </span>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: 'var(--robi-primary)' }}
          >
            📚 Mi Álbum
          </h1>

          {/* Badge count pill */}
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
            className="flex items-center gap-1.5 text-base font-extrabold rounded-full px-5 py-2"
            style={{
              background:
                earnedCount === totalCount && totalCount > 0
                  ? 'var(--robi-success)'
                  : 'oklch(0.94 0.06 95)',
              color:
                earnedCount === totalCount && totalCount > 0
                  ? 'white'
                  : 'oklch(0.45 0.15 80)',
              boxShadow: '0 2px 8px oklch(0.88 0.18 95 / 0.5)',
            }}
          >
            🏅 Tenés {earnedCount} de {totalCount} insignias
          </motion.span>
        </motion.div>

        {/* Robi tip bubble */}
        <div
          className="flex items-center gap-3 rounded-3xl px-5 py-3 w-full"
          style={{ background: 'oklch(0.94 0.06 262 / 0.6)' }}
        >
          <RobiPlaceholder size={44} />
          <p className="text-sm font-bold" style={{ color: 'oklch(0.25 0.08 262)' }}>
            {earnedCount === 0
              ? '¡Mirá videos y completá quizzes para coleccionar insignias! 🎯'
              : earnedCount === totalCount && totalCount > 0
              ? '¡Colección completa! ¡Sos un campeón! 🏆'
              : `¡Muy bien! Te faltan ${totalCount - earnedCount} insignia${totalCount - earnedCount === 1 ? '' : 's'} para completar el álbum. ✨`}
          </p>
        </div>
      </div>

      {/* Album grid */}
      <div className="w-full max-w-lg mx-auto flex-1">
        {totalCount === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4 rounded-3xl px-6 py-12 text-center"
            style={{
              background: 'oklch(1 0 0 / 0.75)',
              boxShadow: '0 4px 20px oklch(0.58 0.22 262 / 0.10)',
            }}
          >
            <span className="text-6xl select-none">📭</span>
            <p className="text-xl font-extrabold" style={{ color: 'oklch(0.45 0.08 262)' }}>
              Tu álbum está vacío
            </p>
            <p className="text-base font-semibold text-muted-foreground">
              ¡Pedile a mamá o papá que asigne videos para empezar!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {slots.map((slot, i) => (
              <motion.div
                key={slot.videoId}
                initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.05 * i,
                  type: 'spring',
                  stiffness: 260,
                  damping: 18,
                }}
              >
                {slot.earned ? (
                  /* ── Earned badge ── colorful sticker */
                  <div
                    className="rounded-3xl p-4 flex flex-col items-center gap-2 text-center shadow-lg"
                    style={{
                      background: 'oklch(1 0 0 / 0.92)',
                      boxShadow: '0 6px 24px oklch(0.58 0.22 262 / 0.22)',
                      border: '2.5px solid oklch(0.88 0.18 95 / 0.7)',
                    }}
                  >
                    <motion.span
                      className="text-4xl select-none"
                      role="img"
                      aria-label="Insignia ganada"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2 + (i % 3) * 0.4,
                        ease: 'easeInOut',
                        delay: i * 0.15,
                      }}
                    >
                      {BADGE_EMOJIS[i % BADGE_EMOJIS.length]}
                    </motion.span>

                    <p
                      className="text-xs font-extrabold leading-tight line-clamp-2"
                      style={{ color: 'oklch(0.25 0.08 262)' }}
                    >
                      {slot.videoTitle}
                    </p>

                    <span
                      className="text-[10px] font-bold rounded-full px-2.5 py-0.5"
                      style={{
                        background: 'var(--robi-success)',
                        color: 'white',
                      }}
                    >
                      {formatDate(slot.earnedAt)}
                    </span>
                  </div>
                ) : (
                  /* ── Empty slot ── grayed / locked */
                  <div
                    className="rounded-3xl p-4 flex flex-col items-center gap-2 text-center"
                    style={{
                      background: 'oklch(0.93 0.02 262 / 0.55)',
                      border: '2.5px dashed oklch(0.72 0.06 262 / 0.5)',
                    }}
                  >
                    <span
                      className="text-4xl select-none"
                      role="img"
                      aria-label="Insignia no ganada"
                      style={{ filter: 'grayscale(1) opacity(0.35)' }}
                    >
                      🏅
                    </span>

                    <p
                      className="text-xs font-bold leading-tight line-clamp-2"
                      style={{ color: 'oklch(0.55 0.05 262)' }}
                    >
                      {slot.videoTitle}
                    </p>

                    <span
                      className="text-[10px] font-bold rounded-full px-2.5 py-0.5"
                      style={{
                        background: 'oklch(0.80 0.04 262 / 0.5)',
                        color: 'oklch(0.45 0.06 262)',
                      }}
                    >
                      ¿?
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
