'use client'

/**
 * Robi — the animated SVG mascot robot.
 * Moods: idle | thinking | celebrate | talking
 * Respects prefers-reduced-motion by toning down animations.
 */

import { motion, useReducedMotion } from 'framer-motion'

export type RobiMood = 'idle' | 'thinking' | 'celebrate' | 'talking'

interface RobiProps {
  mood?: RobiMood
  size?: number
  className?: string
}

// ─── SVG sub-parts ────────────────────────────────────────────────────────────

/** Left or right eye of Robi. Blinks on idle. */
function Eye({ cx, cy, blink }: { cx: number; cy: number; blink: boolean }) {
  return (
    <motion.ellipse
      cx={cx}
      cy={cy}
      rx={5.5}
      ry={blink ? 0.5 : 5.5}
      fill="var(--robi-primary)"
      animate={blink ? { ry: [5.5, 0.5, 5.5] } : { ry: 5.5 }}
      transition={
        blink
          ? { duration: 0.18, times: [0, 0.5, 1], repeat: Infinity, repeatDelay: 3.2, ease: 'easeInOut' }
          : {}
      }
    />
  )
}

/** Small sparkle cross used in celebrate mood. */
function Sparkle({ x, y, delay, reduced }: { x: number; y: number; delay: number; reduced: boolean }) {
  if (reduced) return null
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], rotate: [0, 45, 90] }}
      transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 1.4, delay }}
    >
      <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke="var(--robi-accent)" strokeWidth={2} strokeLinecap="round" />
      <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke="var(--robi-accent)" strokeWidth={2} strokeLinecap="round" />
      <line x1={x - 3.5} y1={y - 3.5} x2={x + 3.5} y2={y + 3.5} stroke="var(--robi-accent)" strokeWidth={1.5} strokeLinecap="round" />
      <line x1={x + 3.5} y1={y - 3.5} x2={x - 3.5} y2={y + 3.5} stroke="var(--robi-accent)" strokeWidth={1.5} strokeLinecap="round" />
    </motion.g>
  )
}

/** Thinking dots — three pulsing circles that appear under the screen. */
function ThinkingDots({ reduced }: { reduced: boolean }) {
  const dots = [0, 1, 2]
  return (
    <g>
      {dots.map((i) => (
        <motion.circle
          key={i}
          cx={84 + i * 14}
          cy={140}
          r={3.5}
          fill="var(--robi-primary)"
          animate={reduced ? {} : { opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.28, ease: 'easeInOut' }}
        />
      ))}
    </g>
  )
}

/** Spinning gear — used in thinking mood on the antenna top. */
function Gear({ reduced }: { reduced: boolean }) {
  return (
    <motion.g
      animate={reduced ? {} : { rotate: 360 }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
      style={{ originX: '100px', originY: '20px' }}
    >
      {/* Gear body */}
      <circle cx={100} cy={20} r={7} fill="var(--robi-accent)" stroke="oklch(0.70 0.14 80)" strokeWidth={1.5} />
      {/* Gear teeth — 6 small rects rotated */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180
        const tx = 100 + Math.cos(angle) * 9
        const ty = 20 + Math.sin(angle) * 9
        return (
          <rect
            key={i}
            x={tx - 2}
            y={ty - 2}
            width={4}
            height={4}
            rx={1}
            fill="var(--robi-accent)"
            transform={`rotate(${i * 60} ${tx} ${ty})`}
          />
        )
      })}
      {/* Center dot */}
      <circle cx={100} cy={20} r={2.5} fill="oklch(0.55 0.18 80)" />
    </motion.g>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Robi({ mood = 'idle', size = 80, className }: RobiProps) {
  const reduced = useReducedMotion() ?? false

  // ── Wrapper motion (body float / bounce) ──────────────────────────────────
  const bodyVariants = {
    idle: reduced
      ? {}
      : {
          y: [0, -6, 0, -3, 0],
          transition: { duration: 3.2, ease: 'easeInOut', repeat: Infinity },
        },
    thinking: reduced
      ? {}
      : {
          y: [0, -3, 0],
          transition: { duration: 1.4, ease: 'easeInOut', repeat: Infinity },
        },
    celebrate: reduced
      ? {}
      : {
          y: [0, -14, 0, -8, 0],
          rotate: [0, -5, 5, -3, 3, 0],
          transition: { duration: 1.0, ease: 'easeInOut', repeat: Infinity },
        },
    talking: reduced
      ? {}
      : {
          y: [0, -2, 0],
          transition: { duration: 0.8, ease: 'easeInOut', repeat: Infinity },
        },
  }

  // ── Screen/mouth expression ────────────────────────────────────────────────
  // The "screen" inside Robi's head shows an expression depending on mood.
  // idle: simple smile arc
  // thinking: horizontal "hmm" line with ellipsis below
  // celebrate: big grin (wider arc)
  // talking: open mouth oval that slightly pulses

  // Antenna ball variant (pulsing in thinking, star in celebrate)
  const antennaBallColor = mood === 'thinking'
    ? 'var(--robi-primary)'
    : mood === 'celebrate'
    ? 'var(--robi-accent)'
    : mood === 'talking'
    ? 'var(--robi-accent)'
    : 'var(--robi-accent)'

  const showBlink = mood === 'idle'
  const showGear = mood === 'thinking'

  // The entire SVG is drawn on a 200×200 viewBox, scaled by `size`.
  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Robi el robot"
      role="img"
      animate={bodyVariants[mood] as Parameters<typeof motion.svg>[0]['animate']}
    >
      {/* ── Antenna stem ───────────────────────────────────────────────────── */}
      <rect x={97} y={28} width={6} height={20} rx={3} fill="oklch(0.72 0.12 262)" />

      {/* ── Antenna top: gear in thinking, glowing ball otherwise ─────────── */}
      {showGear ? (
        <Gear reduced={reduced} />
      ) : (
        <motion.circle
          cx={100}
          cy={20}
          r={8}
          fill={antennaBallColor}
          stroke="oklch(0.70 0.14 80)"
          strokeWidth={1.5}
          animate={
            reduced
              ? {}
              : { scale: [1, 1.15, 1] }
          }
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* ── Head (rounded rectangle) ────────────────────────────────────────── */}
      <rect
        x={48}
        y={44}
        width={104}
        height={86}
        rx={22}
        fill="oklch(0.94 0.05 262)"
        stroke="oklch(0.72 0.15 262)"
        strokeWidth={3}
      />

      {/* ── Ear nubs (left & right) ─────────────────────────────────────────── */}
      <rect x={36} y={68} width={14} height={22} rx={6} fill="oklch(0.80 0.12 262)" stroke="oklch(0.62 0.15 262)" strokeWidth={2} />
      <rect x={150} y={68} width={14} height={22} rx={6} fill="oklch(0.80 0.12 262)" stroke="oklch(0.62 0.15 262)" strokeWidth={2} />

      {/* ── Inner screen panel ──────────────────────────────────────────────── */}
      <rect
        x={60}
        y={54}
        width={80}
        height={60}
        rx={14}
        fill="oklch(0.20 0.08 262)"
        stroke="oklch(0.50 0.15 262)"
        strokeWidth={2}
      />

      {/* ── Eyes ────────────────────────────────────────────────────────────── */}
      {/* Eyes glow dots (highlight inside eye) */}
      <Eye cx={80} cy={76} blink={showBlink && !reduced} />
      <Eye cx={120} cy={76} blink={showBlink && !reduced} />
      {/* Highlight dots */}
      <circle cx={83} cy={73} r={1.8} fill="white" opacity={0.75} />
      <circle cx={123} cy={73} r={1.8} fill="white" opacity={0.75} />

      {/* ── Mouth / expression ──────────────────────────────────────────────── */}
      {mood === 'idle' && (
        /* Simple smile */
        <path
          d="M 82 96 Q 100 108 118 96"
          stroke="var(--robi-accent)"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      )}

      {mood === 'thinking' && (
        /* Flat "hmm" line */
        <path
          d="M 84 98 L 116 98"
          stroke="var(--robi-accent)"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      )}

      {mood === 'celebrate' && (
        /* Big grin */
        <path
          d="M 76 94 Q 100 114 124 94"
          stroke="var(--robi-accent)"
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
        />
      )}

      {mood === 'talking' && (
        /* Pulsing oval mouth */
        <motion.ellipse
          cx={100}
          cy={98}
          rx={14}
          ry={5}
          fill="var(--robi-accent)"
          animate={reduced ? { ry: 5 } : { ry: [5, 8, 4, 7, 5] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* ── Thinking dots below screen ──────────────────────────────────────── */}
      {mood === 'thinking' && <ThinkingDots reduced={reduced} />}

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <rect
        x={60}
        y={134}
        width={80}
        height={46}
        rx={16}
        fill="oklch(0.88 0.08 262)"
        stroke="oklch(0.68 0.15 262)"
        strokeWidth={3}
      />

      {/* ── Chest badge / buttons ───────────────────────────────────────────── */}
      <rect
        x={74}
        y={144}
        width={52}
        height={26}
        rx={8}
        fill="oklch(0.78 0.10 262)"
        stroke="oklch(0.60 0.14 262)"
        strokeWidth={1.5}
      />
      {/* Three small status lights */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={84 + i * 16}
          cy={157}
          r={4}
          fill={i === 0 ? 'var(--robi-accent)' : i === 1 ? 'var(--robi-success)' : 'var(--robi-coral)'}
          animate={
            reduced
              ? {}
              : mood === 'thinking'
              ? { opacity: [0.4, 1, 0.4] }
              : mood === 'celebrate'
              ? { scale: [1, 1.3, 1] }
              : { opacity: [0.7, 1, 0.7] }
          }
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Arms ────────────────────────────────────────────────────────────── */}
      <motion.rect
        x={30}
        y={138}
        width={32}
        height={14}
        rx={7}
        fill="oklch(0.80 0.12 262)"
        stroke="oklch(0.62 0.15 262)"
        strokeWidth={2}
        animate={
          reduced
            ? {}
            : mood === 'celebrate'
            ? { rotate: [0, -25, 0, -20, 0], y: [138, 130, 138] }
            : mood === 'talking'
            ? { rotate: [0, -8, 0, 8, 0] }
            : {}
        }
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '62px', originY: '145px' }}
      />
      <motion.rect
        x={138}
        y={138}
        width={32}
        height={14}
        rx={7}
        fill="oklch(0.80 0.12 262)"
        stroke="oklch(0.62 0.15 262)"
        strokeWidth={2}
        animate={
          reduced
            ? {}
            : mood === 'celebrate'
            ? { rotate: [0, 25, 0, 20, 0], y: [138, 130, 138] }
            : mood === 'talking'
            ? { rotate: [0, 8, 0, -8, 0] }
            : {}
        }
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        style={{ originX: '138px', originY: '145px' }}
      />

      {/* ── Legs ────────────────────────────────────────────────────────────── */}
      <rect x={72} y={180} width={18} height={16} rx={6} fill="oklch(0.75 0.14 262)" stroke="oklch(0.58 0.16 262)" strokeWidth={2} />
      <rect x={110} y={180} width={18} height={16} rx={6} fill="oklch(0.75 0.14 262)" stroke="oklch(0.58 0.16 262)" strokeWidth={2} />

      {/* ── Celebrate sparkles ──────────────────────────────────────────────── */}
      {mood === 'celebrate' && (
        <>
          <Sparkle x={28} y={72} delay={0} reduced={reduced} />
          <Sparkle x={170} y={68} delay={0.4} reduced={reduced} />
          <Sparkle x={18} y={130} delay={0.8} reduced={reduced} />
          <Sparkle x={180} y={124} delay={0.2} reduced={reduced} />
        </>
      )}
    </motion.svg>
  )
}
