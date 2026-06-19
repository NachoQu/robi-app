'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { PinDialog } from '@/components/pin-dialog'

interface ChildProfile {
  id: string
  name: string
  avatar: string
  total_points: number
}

interface HomeClientProps {
  profiles: ChildProfile[]
  hasPin: boolean
}

export function HomeClient({ profiles, hasPin }: HomeClientProps) {
  const [pinOpen, setPinOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  return (
    <div
      className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: 'linear-gradient(145deg, oklch(0.94 0.06 262) 0%, oklch(0.96 0.05 95) 100%)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex flex-col items-center gap-3 mb-8"
      >
        <motion.div
          animate={{ y: [0, -6, 0, -3, 0] }}
          transition={{ duration: 1.6, delay: 0.5, ease: 'easeInOut' }}
        >
          <RobiPlaceholder size={72} />
        </motion.div>
        <h1
          className="text-3xl font-extrabold tracking-tight text-center"
          style={{ color: 'var(--robi-primary)' }}
        >
          ¡Hola! ¿Quién aprende hoy?
        </h1>
        <p className="text-sm text-muted-foreground text-center font-medium">
          Elegí un perfil para empezar a ganar puntos 🌟
        </p>
      </motion.div>

      {/* Profile grid */}
      <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto gap-6">
        <div className="grid grid-cols-2 gap-4 w-full sm:grid-cols-3">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: 'easeOut' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link href={`/kid/${profile.id}`} className="block">
                <Card
                  className="rounded-3xl border-0 shadow-lg cursor-pointer transition-shadow hover:shadow-xl"
                  style={{ boxShadow: '0 4px 20px oklch(0.58 0.22 262 / 0.13)' }}
                >
                  <CardContent className="flex flex-col items-center gap-2 py-6 px-4">
                    <span className="text-5xl select-none" role="img" aria-label={`Avatar de ${profile.name}`}>
                      {profile.avatar}
                    </span>
                    <span
                      className="text-base font-extrabold text-center leading-tight"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {profile.name}
                    </span>
                    <span
                      className="flex items-center gap-1 text-sm font-bold rounded-full px-3 py-1"
                      style={{
                        background: 'oklch(0.94 0.06 95)',
                        color: 'oklch(0.45 0.15 80)',
                      }}
                    >
                      ⭐ {profile.total_points.toLocaleString('es-AR')}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}

          {/* Add profile button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: profiles.length * 0.07, ease: 'easeOut' }}
          >
            <button
              onClick={() => {
                if (profiles.length >= 1) {
                  setUpgradeOpen(true)
                } else {
                  window.location.href = '/onboarding'
                }
              }}
              className="w-full"
            >
              <Card
                className="rounded-3xl border-2 border-dashed cursor-pointer transition-all hover:shadow-md"
                style={{
                  borderColor: 'oklch(0.75 0.12 262)',
                  background: 'oklch(0.97 0.03 262 / 0.6)',
                }}
              >
                <CardContent className="flex flex-col items-center gap-2 py-6 px-4">
                  <span className="text-4xl select-none">➕</span>
                  <span
                    className="text-sm font-bold text-center"
                    style={{ color: 'var(--robi-primary)' }}
                  >
                    Agregar perfil
                  </span>
                </CardContent>
              </Card>
            </button>
          </motion.div>
        </div>

        {/* Parent panel button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4"
        >
          <button
            onClick={() => setPinOpen(true)}
            className="text-sm font-semibold text-muted-foreground hover:underline transition-all flex items-center gap-1.5"
            style={{ color: 'oklch(0.55 0.04 262)' }}
          >
            Panel de adultos 🔒
          </button>
        </motion.div>
      </div>

      {/* PIN Dialog */}
      <PinDialog open={pinOpen} onOpenChange={setPinOpen} isFirstTime={!hasPin} />

      {/* Upgrade CTA Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent
          className="rounded-3xl border-0 shadow-2xl max-w-sm w-full"
          style={{ boxShadow: '0 8px 40px oklch(0.58 0.22 262 / 0.18)' }}
        >
          <DialogHeader className="pt-2">
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl select-none">🚀</span>
              <DialogTitle
                className="text-xl font-extrabold text-center"
                style={{ color: 'var(--robi-primary)' }}
              >
                ¡Más perfiles con Premium!
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-4 pb-4 px-2 text-center">
            <p className="text-base text-muted-foreground font-medium">
              La versión gratuita incluye 1 perfil. Con <strong style={{ color: 'var(--robi-primary)' }}>Robi Premium</strong> podés agregar hasta 5 perfiles para toda la familia. 👨‍👩‍👧‍👦
            </p>
            <div
              className="rounded-2xl px-4 py-3 text-sm font-semibold"
              style={{
                background: 'oklch(0.94 0.06 95 / 0.5)',
                color: 'oklch(0.45 0.15 80)',
                border: '1.5px solid oklch(0.82 0.16 95)',
              }}
            >
              ⭐ Próximamente disponible
            </div>
            <Button
              onClick={() => setUpgradeOpen(false)}
              className="rounded-2xl font-bold"
              style={{ background: 'var(--robi-primary)', color: 'white', height: '3rem' }}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
