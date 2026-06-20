import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function RewardCard({
  title,
  points,
  icon,
  locked = false,
  missing,
  onRedeem,
  className,
}: {
  title: string
  points: number
  icon: ReactNode
  locked?: boolean
  missing?: number
  onRedeem?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center shadow-sm border border-border',
        locked && 'opacity-70',
        className,
      )}
    >
      <div className="text-4xl select-none" aria-hidden>{icon}</div>
      <p className="font-bold text-sm leading-snug text-foreground">{title}</p>
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--robi-accent)]/20 px-2.5 py-0.5 text-xs font-bold text-[var(--robi-accent-ink)]">
        ⭐ {points.toLocaleString('es-AR')} pts
      </span>
      {locked ? (
        <span className="text-xs font-semibold text-muted-foreground">
          Te faltan {missing?.toLocaleString('es-AR')} pts
        </span>
      ) : (
        <Button variant="primary" className="h-8 px-4 text-xs" onClick={onRedeem}>
          Canjear
        </Button>
      )}
    </div>
  )
}
