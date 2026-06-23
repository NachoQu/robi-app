'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { RewardCard } from '@/components/ui/reward-card'
import { redeemVoucher } from '@/actions/vouchers'

interface Voucher {
  id: string
  title: string
  description: string | null
  points_cost: number
}

interface Redemption {
  id: string
  voucher_id: string
  redeemed_at: string
  voucher_title: string
  voucher_points_cost: number
}

interface RewardsClientProps {
  profileId: string
  profileName: string
  profileAvatar: string
  totalPoints: number
  vouchers: Voucher[]
  redemptions: Redemption[]
}

function ConfettiParticle({ color, x, delay }: { color: string; x: number; delay: number }) {
  return (
    <motion.div
      className="absolute top-0 rounded-sm pointer-events-none"
      style={{ left: `${x}%`, width: 8, height: 8, background: color }}
      initial={{ y: -10, opacity: 1, rotate: 0 }}
      animate={{ y: 220, opacity: [1, 1, 0], rotate: [0, 360 * (x > 50 ? 1 : -1) * 2] }}
      transition={{ duration: 1.8 + delay, delay: delay * 0.4, ease: 'easeIn' }}
    />
  )
}

const CONFETTI_COLORS = [
  'var(--robi-primary)',
  'var(--robi-accent)',
  'var(--robi-secondary)',
  'var(--robi-coral)',
  'var(--robi-secondary)',
  'var(--robi-blue)',
]

const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  x: (i / 18) * 96 + 2,
  delay: i * 0.08,
}))

const PRIZE_ICONS = ['🎁', '🏆', '🎉', '🎊', '🌟', '🎀', '🥳', '🎈']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function RewardsClient({
  profileId,
  profileName,
  profileAvatar,
  totalPoints,
  vouchers,
  redemptions,
}: RewardsClientProps) {
  const [currentPoints, setCurrentPoints] = useState(totalPoints)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'catalogo' | 'canjes'>('catalogo')
  const [localRedemptions, setLocalRedemptions] = useState<Redemption[]>(redemptions)

  async function handleRedeem(voucher: Voucher) {
    setPending(true)
    setRedeemError(null)
    const result = await redeemVoucher(profileId, voucher.id)
    setPending(false)
    if (!result.ok) {
      setRedeemError(result.error ?? 'No se pudo canjear el premio')
      return
    }
    const newPoints = result.newPoints ?? currentPoints - voucher.points_cost
    setCurrentPoints(newPoints)
    setLocalRedemptions((prev) => [
      {
        id: crypto.randomUUID(),
        voucher_id: voucher.id,
        redeemed_at: new Date().toISOString(),
        voucher_title: voucher.title,
        voucher_points_cost: voucher.points_cost,
      },
      ...prev,
    ])
    setSelectedVoucher(voucher)
    setDialogOpen(true)
  }

  function handleCloseDialog() {
    setDialogOpen(false)
    setTimeout(() => setSelectedVoucher(null), 300)
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 bg-background">
      {/* Header area */}
      <div className="flex flex-col items-center gap-3 mb-6 w-full max-w-lg mx-auto">
        <div className="w-full">
          <Link
            href={`/kid/${profileId}`}
            className="text-sm font-bold flex items-center gap-1"
            style={{ color: 'var(--robi-primary)' }}
          >
            ← Volver
          </Link>
        </div>

        {/* Profile / title card */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-2 rounded-3xl px-8 py-5 w-full shadow-lg bg-card border border-border"
        >
          <span className="text-5xl select-none" role="img" aria-label={`Avatar de ${profileName}`}>
            {profileAvatar}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--robi-coral)' }}>
            🏆 Mis Premios
          </h1>

          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
            className="flex items-center gap-1.5 text-xl font-extrabold rounded-full px-5 py-2"
            style={{
              background: 'color-mix(in oklch, var(--robi-accent) 20%, transparent)',
              color: 'var(--foreground)',
            }}
          >
            ⭐ Tenés {currentPoints.toLocaleString('es-AR')} puntos
          </motion.span>
        </motion.div>

        {/* Robi tip bubble */}
        <div
          className="flex items-center gap-3 rounded-3xl px-5 py-3 w-full"
          style={{ background: 'color-mix(in oklch, var(--robi-primary) 12%, transparent)' }}
        >
          <RobiPlaceholder size={44} />
          <p className="text-sm font-bold text-foreground">
            {vouchers.length === 0
              ? '¡Mamá o papá todavía no cargaron premios. ¡Pediselos! 🎁'
              : '¡Canjeá tus puntos por premios geniales! 🎉'}
          </p>
        </div>

        {/* Error inline */}
        {redeemError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-center"
            style={{
              background: 'color-mix(in oklch, var(--robi-coral) 15%, transparent)',
              color: 'var(--robi-coral)',
            }}
          >
            {redeemError}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex w-full rounded-2xl overflow-hidden border border-border bg-muted/40">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              activeTab === 'catalogo'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => setActiveTab('canjes')}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              activeTab === 'canjes'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mis canjes {localRedemptions.length > 0 && `(${localRedemptions.length})`}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="w-full max-w-lg mx-auto flex-1">
        {activeTab === 'canjes' ? (
          localRedemptions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4 rounded-3xl px-6 py-12 text-center bg-card border border-border shadow-sm"
            >
              <span className="text-5xl select-none">🎀</span>
              <p className="text-lg font-extrabold text-foreground">Todavía no canjeaste premios</p>
              <p className="text-sm font-semibold text-muted-foreground">
                Cuando canjees un premio, va a aparecer acá.
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {localRedemptions.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  className="flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3 shadow-sm"
                >
                  <span className="text-2xl select-none">🎁</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{r.voucher_title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.redeemed_at)}</p>
                  </div>
                  <span
                    className="text-xs font-bold rounded-full px-2.5 py-1 shrink-0"
                    style={{
                      background: 'color-mix(in oklch, var(--robi-accent) 20%, transparent)',
                      color: 'var(--robi-accent-ink)',
                    }}
                  >
                    ⭐ {r.voucher_points_cost.toLocaleString('es-AR')} pts
                  </span>
                </motion.div>
              ))}
            </div>
          )
        ) : vouchers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4 rounded-3xl px-6 py-12 text-center bg-card border border-border shadow-sm"
          >
            <span className="text-6xl select-none">🎁</span>
            <p className="text-xl font-extrabold text-foreground">No hay premios disponibles</p>
            <p className="text-base font-semibold text-muted-foreground">
              ¡Pedile a mamá o papá que carguen premios para vos!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {vouchers.map((voucher, i) => {
              const canRedeem = currentPoints >= voucher.points_cost
              const missing = voucher.points_cost - currentPoints

              return (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i, type: 'spring', stiffness: 240, damping: 20 }}
                >
                  <RewardCard
                    title={voucher.title}
                    points={voucher.points_cost}
                    icon={PRIZE_ICONS[i % PRIZE_ICONS.length]}
                    locked={!canRedeem}
                    missing={missing}
                    disabled={pending}
                    onRedeem={() => handleRedeem(voucher)}
                  />
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Redeem Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog() }}>
        <DialogContent
          showCloseButton={false}
          className="overflow-hidden rounded-3xl bg-card border-2 border-border"
        >
          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <AnimatePresence>
              {dialogOpen &&
                CONFETTI.map((p) => (
                  <ConfettiParticle key={p.id} color={p.color} x={p.x} delay={p.delay} />
                ))}
            </AnimatePresence>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4 pt-2 pb-1">
            {/* Robi bouncing */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              >
                <RobiPlaceholder size={80} />
              </motion.div>
            </motion.div>

            <DialogHeader className="items-center text-center">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <DialogTitle
                  className="text-xl font-extrabold text-center leading-snug"
                  style={{ color: 'var(--robi-primary)' }}
                >
                  ¡Genial! 🎉
                </DialogTitle>
              </motion.div>
            </DialogHeader>

            {/* Prize info */}
            {selectedVoucher && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 240, damping: 20 }}
                className="w-full rounded-2xl px-5 py-4 flex flex-col items-center gap-1 text-center bg-muted/60 border border-border"
              >
                <span className="text-4xl">🎁</span>
                <p className="text-base font-extrabold text-foreground">{selectedVoucher.title}</p>
                {selectedVoucher.description && (
                  <p className="text-xs font-semibold text-muted-foreground">{selectedVoucher.description}</p>
                )}
                <p className="text-xs font-bold mt-1" style={{ color: 'var(--robi-accent-ink)' }}>
                  Te quedan ⭐ {currentPoints.toLocaleString('es-AR')} pts
                </p>
              </motion.div>
            )}

            {/* Instruction */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-sm font-bold text-center px-2 text-foreground"
            >
              Mostrale este premio a mamá o papá 👨‍👩‍👧
            </motion.p>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              onClick={handleCloseDialog}
              className="w-full rounded-2xl py-3.5 font-extrabold text-white transition-all active:scale-95 hover:brightness-110"
              style={{ background: 'var(--robi-primary)' }}
            >
              ¡Entendido! 🚀
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
