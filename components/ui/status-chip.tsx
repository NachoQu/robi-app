import { cn } from '@/lib/utils'

const STATUS = {
  nuevo: { label: 'Nuevo', dot: 'bg-[var(--robi-accent)]', text: 'text-[#8A6A00]', bg: 'bg-[var(--robi-accent)]/20' },
  'en-progreso': { label: 'En progreso', dot: 'bg-[var(--robi-blue)]', text: 'text-[#1E5FA8]', bg: 'bg-[var(--robi-blue)]/15' },
  completado: { label: 'Completado', dot: 'bg-[var(--robi-primary)]', text: 'text-[#1B7A66]', bg: 'bg-[var(--robi-primary)]/15' },
} as const

export type StatusKind = keyof typeof STATUS

export function StatusChip({ status, className }: { status: StatusKind; className?: string }) {
  const s = STATUS[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', s.bg, s.text, className)}>
      <span className={cn('size-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}
