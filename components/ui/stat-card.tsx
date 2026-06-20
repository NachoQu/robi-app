import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function StatCard({
  value,
  label,
  icon,
  className,
}: { value: ReactNode; label: string; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-2xl bg-card p-5 shadow-sm border border-border', className)}>
      {icon && <div className="text-primary mb-1">{icon}</div>}
      <span className="text-3xl font-bold leading-none text-foreground tabular-nums">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
