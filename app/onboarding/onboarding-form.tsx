'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { createProfile } from '@/actions/profiles'

const AVATARS = ['🦊', '🐼', '🦄', '🚀', '🐯', '🐙', '🌟', '🦖', '🐬', '🦋', '🐸', '🦁']

export default function OnboardingForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!avatar) {
      setError('Elegí un avatar para tu hijo/a 🎨')
      return
    }
    setError(null)
    setLoading(true)
    const result = await createProfile({ name: name.trim(), avatar })
    if (!result.ok) {
      setError(result.reason ?? 'Ocurrió un error. Intentá de nuevo.')
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* Header */}
              <div className="flex flex-col items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                  transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
                >
                  <RobiPlaceholder size={80} />
                </motion.div>
                <h1 className="text-3xl font-extrabold tracking-tight text-center text-primary">
                  ¡Creemos el perfil de tu hijo/a!
                </h1>
                <p className="text-base text-muted-foreground text-center font-medium">
                  Hola, soy Robi 🤖 Vamos a configurar tu primer perfil para empezar a aprender y ganar puntos
                </p>
              </div>

              {/* Card with form */}
              <Card className="rounded-3xl bg-card shadow-sm border border-border">
                <CardHeader className="pb-2 pt-6 px-8">
                  <h2 className="text-xl font-bold text-center text-foreground">
                    Nuevo perfil
                  </h2>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="text-sm font-semibold text-foreground">
                        Nombre del/la niño/a
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Ej: Luca, Sofía…"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={32}
                        className="h-12 rounded-xl text-base border-2 focus-visible:ring-0 focus-visible:border-primary"
                        autoComplete="off"
                      />
                    </div>

                    {/* Avatar picker */}
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        Elegí un avatar
                      </span>
                      <div className="grid grid-cols-6 gap-2">
                        {AVATARS.map((emoji) => (
                          <motion.button
                            key={emoji}
                            type="button"
                            whileTap={{ scale: 0.88 }}
                            whileHover={{ scale: 1.12 }}
                            onClick={() => setAvatar(emoji)}
                            className={`flex items-center justify-center rounded-2xl text-2xl aspect-square transition-all duration-150 cursor-pointer select-none border-2 ${
                              avatar === emoji
                                ? 'bg-primary/10 border-primary'
                                : 'bg-muted border-transparent'
                            }`}
                            aria-label={`Avatar ${emoji}`}
                            aria-pressed={avatar === emoji}
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                      {!avatar && (
                        <p className="text-xs text-muted-foreground font-medium">
                          Tocá un emoji para elegir el avatar
                        </p>
                      )}
                    </div>

                    {/* Error */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl px-4 py-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/30"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}

                    {/* Submit */}
                    <motion.div whileTap={{ scale: 0.97 }} className="mt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="w-full h-12 text-base font-bold"
                      >
                        {loading ? '⏳ Creando perfil…' : '🎉 ¡Crear perfil!'}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
                🌟 Podés agregar más perfiles con el plan premium
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Success state */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <motion.div
                  animate={{ y: [0, -10, 0, -5, 0] }}
                  transition={{ duration: 1.2, ease: 'easeInOut', repeat: 1 }}
                >
                  <RobiPlaceholder size={96} />
                </motion.div>
                <div className="text-5xl">🎉</div>
                <h1 className="text-3xl font-extrabold tracking-tight text-center text-primary">
                  ¡Perfil creado!
                </h1>
                <p className="text-base text-muted-foreground text-center font-medium">
                  ¡Ahora cargá el primer video para que {name} empiece a aprender y ganar puntos con Robi!
                </p>
              </div>

              <Card className="rounded-3xl bg-card shadow-sm border border-border">
                <CardContent className="px-8 py-8 flex flex-col gap-4 items-center">
                  <div className="w-full rounded-2xl px-5 py-4 text-center font-semibold text-base bg-primary/10 text-primary border border-primary/30">
                    🎬 Cargá un video de YouTube para que {name} aprenda y gane puntos
                  </div>

                  <motion.div whileTap={{ scale: 0.97 }} className="w-full">
                    <Button
                      variant="primary"
                      onClick={() => router.push('/parent/add-video')}
                      className="w-full h-12 text-base font-bold"
                    >
                      🎬 Cargar primer video
                    </Button>
                  </motion.div>

                  <button
                    onClick={() => router.push('/')}
                    className="text-sm font-semibold text-muted-foreground hover:underline transition-all"
                  >
                    Saltear por ahora →
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
