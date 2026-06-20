'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RobiPlaceholder } from '@/components/robi-placeholder'

interface QuizResult {
  base: number
  bonus: number
  total: number
  correctCount: number
}

// Confetti particle component
function ConfettiParticle({ color, x, delay }: { color: string; x: number; delay: number }) {
  return (
    <motion.div
      className="absolute top-0 rounded-sm pointer-events-none"
      style={{
        left: `${x}%`,
        width: 10,
        height: 10,
        background: color,
        originX: '50%',
        originY: '0%',
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: '100vh',
        opacity: [1, 1, 0],
        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1) * 3],
        x: [0, (Math.random() - 0.5) * 120],
      }}
      transition={{
        duration: 2.2 + Math.random() * 1.2,
        delay,
        ease: 'easeIn',
      }}
    />
  )
}

const CONFETTI_COLORS = [
  'var(--robi-primary)',
  'var(--robi-accent)',
  'var(--robi-success)',
  'var(--robi-coral)',
  'oklch(0.85 0.18 60)',
  'oklch(0.78 0.20 280)',
]

const CONFETTI_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  x: (i / 28) * 100 + (Math.random() * 3 - 1.5),
  delay: i * 0.06,
}))

export default function ResultPage() {
  const params = useParams()
  const profileId = params.profileId as string
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem(`quiz-result-${profileId}`)
    if (!raw) {
      // No result data — redirect back to kid library
      router.replace(`/kid/${profileId}`)
      return
    }
    try {
      const parsed = JSON.parse(raw) as QuizResult
      setResult(parsed)
      // Clear after reading so back-navigation is clean
      sessionStorage.removeItem(`quiz-result-${profileId}`)
    } catch {
      router.replace(`/kid/${profileId}`)
      return
    }
    setReady(true)
  }, [profileId, router])

  if (!ready || !result) {
    return null // Redirecting
  }

  const earned = result.base + result.bonus
  const maxScore = 35
  const pct = Math.round((earned / maxScore) * 100)
  const allCorrect = result.correctCount === 5
  const mostCorrect = result.correctCount >= 4

  const headline = allCorrect
    ? '¡Perfecto! ¡Las acertaste todas! 🌟'
    : mostCorrect
    ? '¡Casi perfecto! ¡Muy bien! 🎊'
    : result.correctCount >= 2
    ? '¡Buen trabajo! ¡Seguí así! 💪'
    : '¡Hiciste la actividad! ¡A seguir aprendiendo! 🚀'

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, oklch(0.92 0.07 262) 0%, oklch(0.96 0.06 95) 60%, oklch(0.94 0.08 155 / 0.4) 100%)',
      }}
    >
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <AnimatePresence>
          {CONFETTI_PARTICLES.map((p) => (
            <ConfettiParticle key={p.id} color={p.color} x={p.x} delay={p.delay} />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">

        {/* Robi celebration */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
        >
          <motion.div
            animate={{
              y: [0, -14, 0],
              rotate: [0, 6, -6, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: 'easeInOut',
            }}
          >
            <RobiPlaceholder size={96} mood="celebrate" />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-extrabold text-center leading-snug"
          style={{ color: 'var(--robi-primary)' }}
        >
          {headline}
        </motion.h1>

        {/* Badge card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 240, damping: 20 }}
          className="w-full rounded-3xl px-6 py-6 flex flex-col items-center gap-4 shadow-xl"
          style={{
            background: 'oklch(1 0 0 / 0.88)',
            boxShadow: '0 8px 40px oklch(0.58 0.22 262 / 0.18)',
          }}
        >
          {/* Badge earned */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 14 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-6xl select-none" role="img" aria-label="Badge ganado">🏅</span>
            <p
              className="text-lg font-extrabold"
              style={{ color: 'oklch(0.45 0.12 262)' }}
            >
              ¡Ganaste un badge!
            </p>
          </motion.div>

          <div className="w-full h-px" style={{ background: 'oklch(0.88 0.06 262 / 0.4)' }} />

          {/* Score breakdown */}
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-muted-foreground">
                Respuestas correctas
              </span>
              <span
                className="text-base font-extrabold"
                style={{ color: result.correctCount >= 3 ? 'var(--robi-success)' : 'var(--robi-coral)' }}
              >
                {result.correctCount} / 5
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-muted-foreground">Puntos base</span>
              <span className="text-base font-extrabold" style={{ color: 'oklch(0.35 0.08 262)' }}>
                +{result.base}
              </span>
            </div>

            {result.bonus > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-muted-foreground">Bonus aciertos</span>
                <span
                  className="text-base font-extrabold"
                  style={{ color: 'var(--robi-accent)' }}
                >
                  +{result.bonus}
                </span>
              </div>
            )}

            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: 'oklch(0.94 0.07 95 / 0.6)' }}
            >
              <span
                className="text-lg font-extrabold"
                style={{ color: 'oklch(0.38 0.12 80)' }}
              >
                +{earned} puntos ganados
              </span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
                className="text-2xl"
                role="img"
                aria-label="puntos"
              >
                🌟
              </motion.span>
            </div>
          </div>

          {/* Score bar */}
          <div className="w-full">
            <div
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ background: 'oklch(0.88 0.06 262 / 0.4)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--robi-success)' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.75, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Total */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-2"
          >
            <span
              className="flex items-center gap-1.5 text-xl font-extrabold rounded-full px-5 py-2"
              style={{
                background: 'oklch(0.94 0.06 95)',
                color: 'oklch(0.40 0.15 80)',
                boxShadow: '0 2px 10px oklch(0.88 0.18 95 / 0.5)',
              }}
            >
              ⭐ Tenés {result.total.toLocaleString('es-AR')} puntos
            </span>
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="w-full flex flex-col gap-3"
        >
          <Link
            href={`/kid/${profileId}`}
            className="w-full block rounded-3xl py-4 text-center text-lg font-extrabold tracking-wide transition-all active:scale-95"
            style={{
              background: 'var(--robi-primary)',
              color: 'white',
              boxShadow: '0 6px 24px oklch(0.58 0.22 262 / 0.4)',
            }}
          >
            ← Volver a mis videos
          </Link>

          <Link
            href={`/kid/${profileId}/album`}
            className="w-full block rounded-3xl py-4 text-center text-lg font-extrabold tracking-wide transition-all active:scale-95"
            style={{
              background: 'var(--robi-success)',
              color: 'white',
              boxShadow: '0 6px 24px oklch(0.55 0.18 155 / 0.4)',
            }}
          >
            📚 Ver mi álbum
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
