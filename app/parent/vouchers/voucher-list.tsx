'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toggleVoucher } from '@/actions/vouchers'
import type { Voucher } from './page'

const TITLE_ICONS: Record<string, string> = {
  '30 min más de pantalla': '/telefono-icon.png',
  'Elegir la cena': '/cena-icon.png',
  'Noche de pijamas en el living': '/pijamada-icon.png',
  'Elegir la película del viernes': '/tv-icon.png',
  'Una hora de juego con mamá/papá': '/estrella-icon.png',
  'Traer un amigo a dormir': '/dormir-icon.png',
}

function VoucherIcon({ title }: { title: string }) {
  const src = TITLE_ICONS[title]
  if (src) return <Image src={src} alt={title} width={40} height={40} className="select-none" />
  return <span className="text-2xl select-none">⭐</span>
}

interface Props {
  initialVouchers: Voucher[]
}

export default function VoucherList({ initialVouchers }: Props) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers)
  const [pending, startTransition] = useTransition()
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  function handleToggle(id: string, currentActive: boolean) {
    const newActive = !currentActive
    // Optimistic update
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, is_active: newActive } : v))
    )
    startTransition(async () => {
      const result = await toggleVoucher(id, newActive)
      if (!result.ok) {
        // Revert on failure
        setVouchers((prev) =>
          prev.map((v) => (v.id === id ? { ...v, is_active: currentActive } : v))
        )
      }
    })
  }

  const activeCount = vouchers.filter((v) => v.is_active).length

  return (
    <div className="flex flex-col gap-4">
      {/* Crear nuevo */}
      <button
        onClick={() => setUpgradeOpen(true)}
        className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors w-full"
      >
        <Plus size={16} />
        Crear nuevo premio
      </button>

      {/* Summary badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--robi-secondary)]/25 text-[var(--robi-success-ink)] border border-[var(--robi-secondary)]/40">
          ✅ {activeCount} activo{activeCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
          {vouchers.length - activeCount} inactivo{vouchers.length - activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {vouchers.length === 0 && (
        <div className="rounded-2xl px-6 py-8 text-center text-sm font-medium bg-muted text-muted-foreground border border-dashed border-border">
          No hay premios configurados todavía.
        </div>
      )}

      <AnimatePresence initial={false}>
        {vouchers.map((voucher) => (
          <motion.div
            key={voucher.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card
              className="rounded-2xl border border-border shadow-sm bg-card"
              style={{
                opacity: voucher.is_active ? 1 : 0.6,
                transition: 'opacity 0.2s ease',
              }}
            >
              <CardContent className="px-5 py-4 flex items-start gap-4">
                {/* Points badge */}
                <div
                  className={[
                    'shrink-0 flex flex-col items-center justify-center rounded-2xl text-center transition-colors',
                    voucher.is_active
                      ? 'bg-[var(--robi-accent)]/25 border border-[var(--robi-accent)]/40'
                      : 'bg-muted border border-border',
                  ].join(' ')}
                  style={{ minWidth: 68, height: 68 }}
                >
                  <VoucherIcon title={voucher.title} />
                  <span
                    className={[
                      'text-xs font-bold mt-0.5 leading-none',
                      voucher.is_active ? 'text-[var(--robi-accent-ink)]' : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    {voucher.points_cost}
                  </span>
                </div>

                {/* Title + description */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <p
                    className="text-sm font-bold leading-snug"
                    style={{
                      color: voucher.is_active ? 'var(--foreground)' : 'var(--muted-foreground)',
                      transition: 'color 0.2s',
                    }}
                  >
                    {voucher.title}
                  </p>
                  {voucher.description && (
                    <p className="text-xs font-medium leading-snug text-muted-foreground">
                      {voucher.description}
                    </p>
                  )}
                  <span
                    className={[
                      'text-xs font-semibold mt-1 w-fit px-2 py-0.5 rounded-full',
                      voucher.is_active
                        ? 'bg-[var(--robi-secondary)]/20 text-[var(--robi-success-ink)]'
                        : 'bg-muted text-muted-foreground',
                    ].join(' ')}
                  >
                    {voucher.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Toggle */}
                <button
                  aria-label={voucher.is_active ? 'Desactivar premio' : 'Activar premio'}
                  aria-pressed={voucher.is_active}
                  disabled={pending}
                  onClick={() => handleToggle(voucher.id, voucher.is_active)}
                  className="shrink-0 relative inline-flex items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {/* Track */}
                  <span
                    className="block rounded-full transition-colors duration-200"
                    style={{
                      width: 44,
                      height: 24,
                      background: voucher.is_active
                        ? 'var(--robi-primary)'
                        : 'var(--muted)',
                    }}
                  />
                  {/* Thumb */}
                  <span
                    className="absolute block rounded-full bg-white shadow transition-transform duration-200"
                    style={{
                      width: 18,
                      height: 18,
                      left: 3,
                      transform: voucher.is_active ? 'translateX(20px)' : 'translateX(0px)',
                    }}
                  />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Premium dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="rounded-3xl border border-border shadow-2xl max-w-sm w-full bg-card">
          <DialogHeader className="pt-2">
            <div className="flex flex-col items-center gap-3">
              <Image src="/regalo-icon.png" alt="Premio" width={56} height={56} className="select-none" />
              <DialogTitle className="text-xl font-extrabold text-center text-primary">
                ¡Premios personalizados con Premium!
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-4 pb-4 px-2 text-center">
            <p className="text-base text-muted-foreground font-medium">
              Con <strong className="text-primary">Robi Premium</strong> podés crear premios a medida para motivar a tus hijos según sus intereses.
            </p>
            <div className="rounded-2xl px-4 py-3 text-sm font-semibold bg-[var(--robi-accent)]/20 text-[var(--robi-accent-ink)] border border-[var(--robi-accent)]/40">
              ⭐ Próximamente disponible
            </div>
            <Button variant="primary" size="lg" onClick={() => setUpgradeOpen(false)} className="rounded-2xl font-bold h-12">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
