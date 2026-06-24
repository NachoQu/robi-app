'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ChevronDown, Lock, LogOut, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { PinDialog } from '@/components/pin-dialog'
import { signOut } from '@/actions/auth'

interface ChildProfile {
  id: string
  name: string
  avatar: string
  total_points: number
}

interface HomeClientProps {
  profiles: ChildProfile[]
  hasPin: boolean
  userEmail: string
}

export function HomeClient({ profiles, hasPin, userEmail }: HomeClientProps) {
  const router = useRouter()
  const [pinOpen, setPinOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentHasPin, setCurrentHasPin] = useState(hasPin)

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Top bar — full width */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full px-4 py-4 flex justify-between items-center relative"
      >
        {/* Logo izquierda */}
        <Link href="/" className="flex items-center">
          <Image src="/robi-logo.png" alt="Robi" width={100} height={40} className="h-10 w-auto" />
        </Link>

        {/* Adultos button */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-border bg-card shadow-sm px-3 py-2 hover:bg-muted transition-colors active:scale-95"
          aria-label="Panel de adultos"
        >
          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User size={14} className="text-primary" />
          </span>
          <span className="text-sm font-semibold text-foreground">{userEmail}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-4 top-14 z-50 bg-card border border-border rounded-2xl shadow-xl min-w-[220px] overflow-hidden"
              >
                {/* Panel de adultos */}
                <button
                  onClick={() => { setMenuOpen(false); setPinOpen(true) }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors text-left"
                >
                  <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Lock size={15} className="text-primary" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">Panel de adultos</span>
                    <span className="flex items-center gap-1 mt-0.5">
                      <Shield size={10} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {currentHasPin ? 'Protegido por PIN' : 'Sin PIN activo'}
                      </span>
                      {currentHasPin && <Check size={10} className="text-muted-foreground" />}
                    </span>
                  </div>
                </button>

                {/* Cerrar sesión */}
                <div className="h-px bg-border" />
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors text-left"
                  >
                    <span className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <LogOut size={15} className="text-red-500 dark:text-red-400" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">Cerrar sesión</span>
                    </div>
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="w-full max-w-lg mx-auto px-4 pb-8 flex flex-col flex-1">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex flex-col items-center gap-3 mb-8"
      >
        <motion.div
          animate={{ y: [0, -6, 0, -3, 0] }}
          transition={{ duration: 1.6, delay: 0.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
        >
          <Image src="/robi-welcome.png" alt="Robi" width={96} height={96} className="w-24 h-24 object-contain" priority />
        </motion.div>
        <h1 className="text-3xl font-extrabold tracking-tight text-center text-primary">
          ¡Hola! ¿Quién aprende hoy?
        </h1>
        <p className="text-sm text-muted-foreground text-center font-medium">
          Elegí un perfil para empezar a ganar puntos
        </p>
      </motion.div>

      {/* Profile grid */}
      <div className="flex-1 flex flex-col items-center w-full gap-6">
        <div className="grid grid-cols-2 gap-4 w-full sm:grid-cols-3">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.id}
              className="h-full"
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: 'easeOut' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link href={`/kid/${profile.id}`} className="block h-full">
                <Card className="rounded-3xl bg-card shadow-sm border border-border cursor-pointer transition-shadow hover:shadow-xl h-full">
                  <CardContent className="flex flex-col items-center gap-2 py-6 px-4">
                    <span className="text-5xl select-none" role="img" aria-label={`Avatar de ${profile.name}`}>
                      {profile.avatar}
                    </span>
                    <span className="text-base font-extrabold text-center leading-tight text-foreground">
                      {profile.name}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold rounded-full px-3 py-1 bg-[var(--robi-accent)]/20 text-[var(--robi-accent-ink)]">
                      ⭐ {profile.total_points.toLocaleString('es-AR')}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}

          {/* Add profile button */}
          <motion.div
            className="h-full"
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
              className="w-full h-full"
            >
              <Card className="rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 cursor-pointer transition-all hover:shadow-md h-full">
                <CardContent className="flex flex-col items-center justify-center gap-2 py-6 px-4 h-full">
                  <span className="text-4xl select-none">➕</span>
                  <span className="text-sm font-bold text-center text-primary">
                    Agregar perfil
                  </span>
                </CardContent>
              </Card>
            </button>
          </motion.div>
        </div>

        {/* Hint pill — solo cuando no hay PIN */}
        {!hasPin && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex items-center gap-2.5 bg-muted border border-border rounded-full px-4 py-2.5 max-w-sm"
          >
            <span className="text-base select-none">💡</span>
            <span className="text-xs text-muted-foreground font-medium">
              Desde el panel de adultos podés gestionar videos, puntos y más.
            </span>
          </motion.div>
        )}
      </div>

      {/* PIN Dialog */}
      </div>

      {/* Landscape footer */}
      <div className="w-full mt-auto">
        <Image
          src="/montana-bg.png"
          alt=""
          width={2172}
          height={498}
          className="w-full h-auto object-cover block"
          priority={false}
        />
      </div>

      <PinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        isFirstTime={!currentHasPin}
        onPinChanged={(nowHasPin) => setCurrentHasPin(nowHasPin)}
      />

      {/* Upgrade CTA Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="rounded-3xl border border-border shadow-2xl max-w-sm w-full bg-card">
          <DialogHeader className="pt-2">
            <div className="flex flex-col items-center gap-3">
              <img src="/cohete-icon.png" alt="cohete" className="w-14 h-14 select-none" />
              <DialogTitle className="text-xl font-extrabold text-center text-primary">
                ¡Más perfiles con Premium!
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-4 pb-4 px-2 text-center">
            <p className="text-base text-muted-foreground font-medium">
              La versión gratuita incluye 1 perfil. Con <strong className="text-primary">Robi Premium</strong> podés agregar hasta 5 perfiles para toda la familia.
            </p>
            <div className="rounded-2xl px-4 py-3 text-sm font-semibold bg-[var(--robi-accent)]/20 text-[var(--robi-accent-ink)] border border-[var(--robi-accent)]/40">
              ⭐ Próximamente disponible
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setUpgradeOpen(false)}
              className="rounded-2xl font-bold h-12"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
