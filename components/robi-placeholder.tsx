interface RobiPlaceholderProps {
  size?: number
  className?: string
}

/**
 * Shared Robi placeholder — a 🤖 in a styled circle using Robi palette tokens.
 * Task 15 will replace this with the real animated <Robi /> component.
 * This is the single swap point.
 */
export function RobiPlaceholder({ size = 80, className }: RobiPlaceholderProps) {
  const fontSize = Math.round(size * 0.48)
  return (
    <span
      className={`flex items-center justify-center rounded-full select-none shrink-0${className ? ` ${className}` : ''}`}
      style={{
        width: size,
        height: size,
        background: 'var(--robi-primary)',
        boxShadow: '0 4px 20px oklch(0.58 0.22 262 / 0.35)',
        fontSize,
      }}
      aria-label="Robi el robot"
    >
      🤖
    </span>
  )
}
