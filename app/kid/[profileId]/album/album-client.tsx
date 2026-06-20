'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { AchievementBadge } from '@/components/ui/achievement-badge'

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

// Badge kinds that rotate per slot index
const BADGE_KINDS: Array<'star' | 'shield' | 'gem'> = ['star', 'shield', 'gem']

export default function AlbumClient({
  profileId,
  profileName,
  profileAvatar,
  slots,
  earnedCount,
  totalCount,
}: AlbumClientProps) {
  return (
    <div className="min-h-screen flex flex-col px-4 py-6 bg-background">
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
          className="flex flex-col items-center gap-2 rounded-3xl px-8 py-5 w-full shadow-lg bg-card border border-border"
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
                  : 'color-mix(in oklch, var(--robi-accent) 20%, transparent)',
              color:
                earnedCount === totalCount && totalCount > 0
                  ? 'white'
                  : 'var(--foreground)',
            }}
          >
            🏅 Tenés {earnedCount} de {totalCount} insignias
          </motion.span>
        </motion.div>

        {/* Robi tip bubble */}
        <div
          className="flex items-center gap-3 rounded-3xl px-5 py-3 w-full"
          style={{ background: 'color-mix(in oklch, var(--robi-primary) 12%, transparent)' }}
        >
          <RobiPlaceholder size={44} />
          <p className="text-sm font-bold text-foreground">
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
            className="flex flex-col items-center gap-4 rounded-3xl px-6 py-12 text-center bg-card border border-border shadow-sm"
          >
            <span className="text-6xl select-none">📭</span>
            <p className="text-xl font-extrabold text-foreground">
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
                  /* ── Earned badge ── */
                  <div className="rounded-3xl p-4 flex flex-col items-center gap-2 text-center shadow-lg bg-card border-2 border-border">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2 + (i % 3) * 0.4,
                        ease: 'easeInOut',
                        delay: i * 0.15,
                      }}
                    >
                      <AchievementBadge
                        kind={BADGE_KINDS[i % BADGE_KINDS.length]}
                        locked={false}
                        size={56}
                      />
                    </motion.div>

                    <p className="text-xs font-extrabold leading-tight line-clamp-2 text-foreground">
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
                  /* ── Empty slot ── locked */
                  <div className="rounded-3xl p-4 flex flex-col items-center gap-2 text-center border-2 border-dashed border-border bg-muted/40">
                    <AchievementBadge
                      kind={BADGE_KINDS[i % BADGE_KINDS.length]}
                      locked
                      size={56}
                    />

                    <p className="text-xs font-bold leading-tight line-clamp-2 text-muted-foreground">
                      {slot.videoTitle}
                    </p>

                    <span className="text-[10px] font-bold rounded-full px-2.5 py-0.5 bg-muted text-muted-foreground">
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
