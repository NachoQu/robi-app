'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { createProfile } from '@/actions/profiles'
import { processVideo } from '@/actions/videos'
import { parseYoutubeId } from '@/lib/youtube/parse-url'

const AVATARS = ['🦊', '🐼', '🦄', '🚀', '🐯', '🐙', '🌟', '🦖', '🐬', '🦋', '🐸', '🦁']

type Step = 'profile' | 'video' | 'video-loading' | 'video-success'

export default function OnboardingForm() {
  const router = useRouter()

  // Paso 1
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  // Paso 2
  const [url, setUrl] = useState('')
  const [checked, setChecked] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState<string | null>(null)

  const [step, setStep] = useState<Step>('profile')

  const youtubeId = parseYoutubeId(url)
  const thumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null

  const [dots, setDots] = useState('.')
  useEffect(() => {
    if (step !== 'video-loading') return
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 500)
    return () => clearInterval(id)
  }, [step])

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!avatar) {
      setProfileError('Elegí un avatar para tu hijo/a 🎨')
      return
    }
    setProfileError(null)
    setProfileLoading(true)
    const result = await createProfile({ name: name.trim(), avatar })
    if (!result.ok) {
      setProfileError(result.reason ?? 'Ocurrió un error. Intentá de nuevo.')
      setProfileLoading(false)
      return
    }
    setProfileId(result.profileId!)
    setProfileLoading(false)
    setStep('video')
  }

  async function handleVideoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!youtubeId || !checked || !profileId) return
    setVideoError(null)
    setStep('video-loading')
    const result = await processVideo({ url, childProfileId: profileId })
    if (!result.ok) {
      setVideoError(result.reason ?? 'No pudimos procesar el video. Probá con otro.')
      setStep('video')
      return
    }
    setVideoTitle(null)
    setStep('video-success')
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

          {/* ── PASO 1: Crear perfil ── */}
          {step === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-2 mb-8">
                <p className="text-xs font-semibold text-muted-foreground">Paso 2 de 3</p>
                <div className="flex gap-1.5">
                  <div className="h-1.5 w-8 rounded-full" style={{ background: 'var(--robi-primary)' }} />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: 'var(--robi-primary)' }} />
                  <div className="h-1.5 w-8 rounded-full bg-muted" />
                </div>
              </div>

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
                  Hola, soy Robi 🤖 Vamos a configurar el primer perfil para empezar a aprender y ganar puntos
                </p>
              </div>

              <Card className="rounded-3xl bg-card shadow-sm border border-border">
                <CardHeader className="pb-2 pt-6 px-8">
                  <h2 className="text-xl font-bold text-center text-foreground">Nuevo perfil</h2>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
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

                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-foreground">Elegí un avatar</span>
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

                    {profileError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl px-4 py-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/30"
                      >
                        ⚠️ {profileError}
                      </motion.div>
                    )}

                    <motion.div whileTap={{ scale: 0.97 }} className="mt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={profileLoading}
                        className="w-full h-12 text-base font-bold"
                      >
                        {profileLoading ? '⏳ Creando perfil…' : '🎉 ¡Crear perfil!'}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
                🌟 Podés agregar más perfiles con el plan premium
              </p>
            </motion.div>
          )}

          {/* ── PASO 2: Cargar video ── */}
          {step === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-2 mb-8">
                <p className="text-xs font-semibold text-muted-foreground">Paso 3 de 3</p>
                <div className="flex gap-1.5">
                  <div className="h-1.5 w-8 rounded-full" style={{ background: 'var(--robi-primary)' }} />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: 'var(--robi-primary)' }} />
                  <div className="h-1.5 w-8 rounded-full" style={{ background: 'var(--robi-primary)' }} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 mb-6">
                <RobiPlaceholder size={80} />
                <h1 className="text-3xl font-extrabold tracking-tight text-center text-primary">
                  ¡Cargá el primer video!
                </h1>
                <p className="text-base text-muted-foreground text-center font-medium">
                  Pegá un link de YouTube para que {name} empiece a aprender 🎬
                </p>
              </div>

              <Card className="rounded-3xl bg-card shadow-sm border border-border">
                <CardContent className="px-8 py-8">
                  <form onSubmit={handleVideoSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="url" className="text-sm font-semibold text-foreground">
                        Link de YouTube
                      </label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 rounded-xl text-base border-2 focus-visible:ring-0 focus-visible:border-primary"
                        autoComplete="off"
                      />
                    </div>

                    {thumbnail && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl overflow-hidden border border-border"
                      >
                        <img
                          src={thumbnail}
                          alt="Vista previa del video"
                          className="w-full object-cover"
                        />
                      </motion.div>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground leading-snug">
                        Revisé el video y es apto para {name}
                      </span>
                    </label>

                    {videoError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl px-4 py-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/30"
                      >
                        ⚠️ {videoError}
                      </motion.div>
                    )}

                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={!youtubeId || !checked}
                        className="w-full h-12 text-base font-bold"
                      >
                        🎬 Cargar video
                      </Button>
                    </motion.div>
                  </form>

                  <button
                    onClick={() => router.push('/')}
                    className="w-full text-center text-sm font-semibold text-muted-foreground hover:underline transition-all mt-4"
                  >
                    Saltar por ahora →
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── LOADING ── */}
          {step === 'video-loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-6 py-12"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <RobiPlaceholder size={96} mood="thinking" />
              </motion.div>
              <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-2xl font-extrabold text-foreground">
                  Robi está preparando la actividad{dots}
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Estoy leyendo el video, revisando el contenido y armando las preguntas.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── ÉXITO ── */}
          {step === 'video-success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="flex flex-col items-center gap-4 mb-6">
                <motion.div
                  animate={{ y: [0, -10, 0, -5, 0] }}
                  transition={{ duration: 1.2, ease: 'easeInOut', repeat: 1 }}
                >
                  <RobiPlaceholder size={96} />
                </motion.div>
                <h1 className="text-3xl font-extrabold tracking-tight text-center text-primary">
                  ¡El primer video está listo!
                </h1>
                <p className="text-base text-muted-foreground text-center font-medium">
                  {name} ya puede ver el video y hacer su primera actividad con Robi
                </p>
              </div>

              {thumbnail && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl overflow-hidden border border-border mb-6 shadow-sm"
                >
                  <img src={thumbnail} alt="Video cargado" className="w-full object-cover" />
                </motion.div>
              )}

              <Card className="rounded-3xl bg-card shadow-sm border border-border">
                <CardContent className="px-8 py-8 flex flex-col gap-4">
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="primary"
                      onClick={() => router.push(`/kid/${profileId}`)}
                      className="w-full h-12 text-base font-bold"
                    >
                      ¡Que empiece a aprender! 🚀
                    </Button>
                  </motion.div>

                  <button
                    onClick={() => router.push('/')}
                    className="text-center text-sm font-semibold text-muted-foreground hover:underline transition-all"
                  >
                    Ir al inicio →
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
