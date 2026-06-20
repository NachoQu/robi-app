import { Star, Shield, Gem, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Kind = 'star' | 'shield' | 'gem'

const KIND: Record<Kind, { Icon: LucideIcon; color: string }> = {
  star: { Icon: Star, color: 'var(--robi-accent)' },
  shield: { Icon: Shield, color: 'var(--robi-primary)' },
  gem: { Icon: Gem, color: 'var(--robi-blue)' },
}

export function AchievementBadge({
  kind,
  locked = false,
  size = 56,
  className,
}: { kind: Kind; locked?: boolean; size?: number; className?: string }) {
  const { Icon, color } = KIND[kind]
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full shadow-md', className)}
      style={{
        width: size,
        height: size,
        background: locked ? 'var(--muted)' : color,
        opacity: locked ? 0.5 : 1,
      }}
      aria-label={locked ? 'Logro bloqueado' : `Logro ${kind}`}
    >
      <Icon
        size={size * 0.5}
        color={locked ? 'var(--muted-foreground)' : 'white'}
        fill={locked ? 'none' : 'white'}
        strokeWidth={2}
      />
    </span>
  )
}
