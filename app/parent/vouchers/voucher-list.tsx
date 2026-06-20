'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { toggleVoucher } from '@/actions/vouchers'
import type { Voucher } from './page'

interface Props {
  initialVouchers: Voucher[]
}

export default function VoucherList({ initialVouchers }: Props) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers)
  const [pending, startTransition] = useTransition()

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
      {/* Summary badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{
            background: 'oklch(0.94 0.06 155 / 0.25)',
            color: 'oklch(0.38 0.14 155)',
            border: '1.5px solid oklch(0.68 0.18 155 / 0.30)',
          }}
        >
          ✅ {activeCount} activo{activeCount !== 1 ? 's' : ''}
        </span>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            background: 'oklch(0.96 0.02 262)',
            color: 'var(--muted-foreground)',
            border: '1.5px solid oklch(0.88 0.05 262)',
          }}
        >
          {vouchers.length - activeCount} inactivo{vouchers.length - activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {vouchers.length === 0 && (
        <div
          className="rounded-2xl px-6 py-8 text-center text-sm font-medium"
          style={{
            background: 'oklch(0.96 0.02 262)',
            color: 'var(--muted-foreground)',
            border: '1.5px dashed oklch(0.82 0.08 262)',
          }}
        >
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
              className="rounded-2xl border-0 shadow"
              style={{
                boxShadow: '0 2px 12px oklch(0.58 0.22 262 / 0.07)',
                opacity: voucher.is_active ? 1 : 0.6,
                transition: 'opacity 0.2s ease',
              }}
            >
              <CardContent className="px-5 py-4 flex items-start gap-4">
                {/* Points badge */}
                <div
                  className="shrink-0 flex flex-col items-center justify-center rounded-2xl text-center"
                  style={{
                    minWidth: 56,
                    height: 56,
                    background: voucher.is_active
                      ? 'oklch(0.94 0.06 95 / 0.35)'
                      : 'oklch(0.96 0.02 262)',
                    border: voucher.is_active
                      ? '1.5px solid oklch(0.75 0.18 90 / 0.35)'
                      : '1.5px solid oklch(0.88 0.05 262)',
                    transition: 'background 0.25s, border-color 0.25s',
                  }}
                >
                  <span className="text-lg leading-none">⭐</span>
                  <span
                    className="text-xs font-bold mt-0.5 leading-none"
                    style={{
                      color: voucher.is_active ? 'oklch(0.38 0.16 90)' : 'var(--muted-foreground)',
                    }}
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
                    <p
                      className="text-xs font-medium leading-snug"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {voucher.description}
                    </p>
                  )}
                  <span
                    className="text-xs font-semibold mt-1 w-fit px-2 py-0.5 rounded-full"
                    style={
                      voucher.is_active
                        ? {
                            background: 'oklch(0.94 0.06 155 / 0.20)',
                            color: 'oklch(0.38 0.14 155)',
                          }
                        : {
                            background: 'oklch(0.96 0.02 262)',
                            color: 'var(--muted-foreground)',
                          }
                    }
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
                        ? 'var(--robi-success, oklch(0.55 0.20 155))'
                        : 'oklch(0.82 0.04 262)',
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
    </div>
  )
}
