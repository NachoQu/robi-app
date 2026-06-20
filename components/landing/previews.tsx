import type { ReactNode } from 'react'
import { Play, Check } from 'lucide-react'
import { AchievementBadge } from '@/components/ui/achievement-badge'
import { cn } from '@/lib/utils'

export function DeviceFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-3xl border border-border bg-card p-2 shadow-xl', className)}>
      <div className="overflow-hidden rounded-2xl bg-background">{children}</div>
    </div>
  )
}

export function PreviewVideo({ className }: { className?: string }) {
  return (
    <DeviceFrame className={className}>
      <div className="relative aspect-video w-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-black/50">
            <Play size={24} className="ml-1 text-white" fill="white" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white">3:20</span>
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-foreground">¿Cómo funcionan los volcanes?</p>
      </div>
    </DeviceFrame>
  )
}

const QUIZ_OPTIONS = ['Lava', 'Agua', 'Aire', 'Hielo']

export function PreviewQuiz({ className }: { className?: string }) {
  return (
    <DeviceFrame className={className}>
      <div className="p-4">
        <p className="mb-3 text-sm font-bold text-foreground">¿Qué sale de un volcán?</p>
        <div className="grid grid-cols-2 gap-2">
          {QUIZ_OPTIONS.map((o, i) => (
            <div
              key={o}
              className={cn(
                'flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-bold',
                i === 0 ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              <span>{o}</span>
              {i === 0 && <Check size={14} />}
            </div>
          ))}
        </div>
      </div>
    </DeviceFrame>
  )
}

export function PreviewResult({ className }: { className?: string }) {
  return (
    <DeviceFrame className={className}>
      <div className="flex flex-col items-center gap-2 p-5 text-center">
        <AchievementBadge kind="star" size={56} />
        <p className="text-base font-extrabold text-primary">¡Excelente!</p>
        <p className="text-2xl font-extrabold text-primary">+25 pts</p>
        <p className="text-xs font-semibold text-muted-foreground">4 de 5 correctas</p>
      </div>
    </DeviceFrame>
  )
}
