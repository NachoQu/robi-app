'use client'

import { useState } from 'react'
import { Crown, ChevronRight, X, Check } from 'lucide-react'

const FREE_VIDEO_LIMIT = 5

const PREMIUM_BENEFITS = [
  { title: 'Hasta 5 perfiles', description: 'Agregá hasta 5 perfiles de hijos.' },
  { title: 'Videos ilimitados', description: 'Sin límite de videos por perfil.' },
  { title: 'Catálogo de premios ampliado', description: 'Más opciones de premios para motivar a tus hijos.' },
  { title: 'Soporte prioritario', description: 'Atención directa ante cualquier consulta.' },
]

function BenefitsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card border border-border flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-5 flex items-start justify-between gap-4" style={{ background: 'color-mix(in oklch, var(--robi-accent) 10%, transparent)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl" style={{ background: 'var(--robi-accent)' }}>
              <Crown size={20} className="text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold text-foreground">Plan Premium</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Todo lo del plan Free, y más</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Benefits list */}
        <div className="px-5 py-4 flex flex-col gap-3">
          {PREMIUM_BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 shrink-0 mt-0.5">
                <Check size={13} className="text-green-600 dark:text-green-400" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{b.title}</p>
                <p className="text-xs text-muted-foreground font-medium">{b.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <button
            className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--robi-accent)' }}
          >
            Próximamente
          </button>
        </div>
      </div>
    </div>
  )
}

export function PlanCard({ usedCount }: { usedCount: number }) {
  const [open, setOpen] = useState(false)
  const remaining = Math.max(0, FREE_VIDEO_LIMIT - usedCount)
  const progressPct = Math.min(100, (usedCount / FREE_VIDEO_LIMIT) * 100)

  return (
    <>
      <div className="rounded-2xl bg-card border border-border px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Tu plan Free</p>
            <p className="mt-0.5">
              <span className="text-2xl font-extrabold text-foreground">{usedCount} / {FREE_VIDEO_LIMIT}</span>
              <span className="text-sm font-semibold text-foreground ml-1.5">videos usados</span>
            </p>
            <div className="mt-2.5 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1.5">
              {remaining > 0
                ? `Te quedan ${remaining} espacio${remaining !== 1 ? 's' : ''} disponible${remaining !== 1 ? 's' : ''}`
                : 'Alcanzaste el límite del plan gratuito'}
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-xs font-bold shrink-0 hover:opacity-75 transition-opacity mt-1"
            style={{ color: 'var(--robi-primary)' }}
          >
            <Crown size={13} />
            Ver beneficios
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {open && <BenefitsModal onClose={() => setOpen(false)} />}
    </>
  )
}
