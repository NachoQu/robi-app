'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { processVideo } from '@/actions/videos'
import { createClient } from '@/lib/supabase/client'

interface ChildProfile {
  id: string
  name: string
  avatar: string
}

interface QuizQuestion {
  question_text: string
  options: string[]
  position: number
}

type PageState = 'form' | 'loading' | 'error' | 'success'

export default function AddVideoPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [url, setUrl] = useState('')
  const [checked, setChecked] = useState(false)
  const [pageState, setPageState] = useState<PageState>('form')
  const [errorReason, setErrorReason] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loadingDots, setLoadingDots] = useState('.')

  // Load profiles
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('child_profiles')
        .select('id, name, avatar')
        .eq('user_id', user.id)
        .order('name')
        .then(({ data }) => {
          if (data && data.length > 0) {
            setProfiles(data)
            if (data.length === 1) setSelectedProfileId(data[0].id)
          }
        })
    })
  }, [])

  // Animated loading dots
  useEffect(() => {
    if (pageState !== 'loading') return
    const interval = setInterval(() => {
      setLoadingDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [pageState])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProfileId || !url.trim() || !checked) return

    setPageState('loading')
    setErrorReason(null)

    const result = await processVideo({ url: url.trim(), childProfileId: selectedProfileId })

    if (!result.ok) {
      setErrorReason(result.reason ?? 'Ocurrió un error. Intentá de nuevo.')
      setPageState('error')
      return
    }

    const newVideoId = result.videoId!
    setVideoId(newVideoId)

    // Non-blocking: fetch quiz questions for preview
    const supabase = createClient()
    const { data: qs } = await supabase
      .from('quiz_questions')
      .select('question_text, options, position')
      .eq('video_id', newVideoId)
      .order('position')
    setQuestions(qs ?? [])
    setPageState('success')
  }

  function handleRetry() {
    setPageState('form')
    setErrorReason(null)
  }

  const canSubmit = !!selectedProfileId && url.trim().length > 0 && checked

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {/* ─── LOADING STATE ─── */}
        {pageState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6 py-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -12, 0, -6, 0] }}
              transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
            >
              <RobiPlaceholder size={96} mood="thinking" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-extrabold mb-2 text-robi-primary">
                Robi está preparando la actividad{loadingDots}
              </h2>
              <p className="text-base text-muted-foreground font-medium">
                Estoy leyendo el video, revisando el contenido y armando las preguntas.
                <br />
                <span className="text-sm">Esto puede tardar unos segundos ✨</span>
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="inline-block w-3 h-3 rounded-full bg-robi-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── SUCCESS STATE ─── */}
        {pageState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col items-center gap-3 text-center py-6">
              <motion.div
                animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                transition={{ duration: 1.0, ease: 'easeInOut' }}
              >
                <RobiPlaceholder size={80} />
              </motion.div>
              <div className="text-4xl">🎉</div>
              <h2 className="text-2xl font-extrabold text-robi-primary">
                ¡Video cargado con éxito!
              </h2>
              <p className="text-base text-muted-foreground font-medium">
                El quiz está listo. Tu hijo/a ya puede verlo y contestar las preguntas.
              </p>
            </div>

            {/* Optional questions preview */}
            {questions.length > 0 && (
              <Card className="rounded-3xl border border-border shadow-sm">
                <CardHeader className="px-6 pt-5 pb-2">
                  <h3 className="text-base font-bold text-foreground">
                    Vista previa de las preguntas ({questions.length})
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Estas son las preguntas que Robi generó — solo vos las ves acá.
                  </p>
                </CardHeader>
                <CardContent className="px-6 pb-6 flex flex-col gap-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {idx + 1}. {q.question_text}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(q.options as string[]).map((opt, oi) => (
                          <span
                            key={oi}
                            className="text-xs rounded-xl px-3 py-2 font-medium bg-muted text-foreground"
                          >
                            {String.fromCharCode(65 + oi)}. {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/parent')}
                className="w-full text-base font-bold"
              >
                Listo →
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ─── FORM / ERROR STATE ─── */}
        {(pageState === 'form' || pageState === 'error') && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center pt-4">
              <RobiPlaceholder size={64} />
              <h1 className="text-2xl font-extrabold tracking-tight text-robi-primary">
                Cargar video educativo
              </h1>
              <p className="text-sm text-muted-foreground font-medium max-w-sm">
                Buscá un video de YouTube apto para tu hijo/a y pegá el link acá. Robi va a crear un quiz automáticamente.
              </p>
            </div>

            {/* Error card */}
            {pageState === 'error' && errorReason && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl px-5 py-4 flex flex-col gap-1"
                style={{
                  background: 'oklch(0.97 0.05 27)',
                  color: 'oklch(0.45 0.20 27)',
                  border: '1.5px solid oklch(0.85 0.12 27)',
                }}
              >
                <p className="text-sm font-bold">⚠️ No pudimos procesar el video</p>
                <p className="text-sm font-medium">{errorReason}</p>
              </motion.div>
            )}

            <Card className="rounded-3xl border border-border shadow-sm bg-card">
              <CardContent className="px-8 py-7">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Profile selector */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="profile"
                      className="text-sm font-semibold text-foreground"
                    >
                      Perfil del niño/a
                    </label>
                    {profiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground font-medium">Cargando perfiles…</p>
                    ) : profiles.length === 1 ? (
                      <div className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-sm bg-muted border border-border text-foreground">
                        <span className="text-2xl">{profiles[0].avatar}</span>
                        <span>{profiles[0].name}</span>
                      </div>
                    ) : (
                      <select
                        id="profile"
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        required
                        className="h-12 rounded-xl text-sm font-semibold px-4 border-2 border-border bg-card text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="">Elegí un perfil…</option>
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.avatar} {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* URL input */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="url"
                      className="text-sm font-semibold text-foreground"
                    >
                      Link del video de YouTube
                    </label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      className="h-12 rounded-xl text-sm border-2 border-border focus-visible:ring-0 focus-visible:border-primary"
                      autoComplete="off"
                    />
                  </div>

                  {/* Mandatory checkbox */}
                  <label
                    className={[
                      'flex items-start gap-3 cursor-pointer select-none rounded-2xl px-4 py-3 transition-colors',
                      checked
                        ? 'border border-transparent'
                        : 'bg-muted border border-border',
                    ].join(' ')}
                    style={
                      checked
                        ? {
                            background: 'oklch(0.94 0.06 155 / 0.18)',
                            border: '1.5px solid oklch(0.68 0.18 155 / 0.40)',
                          }
                        : undefined
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="mt-0.5 w-5 h-5 accent-robi-secondary shrink-0 cursor-pointer"
                    />
                    <span className="text-sm font-semibold leading-snug text-foreground">
                      Revisé el video y es apto para mi hijo/a
                    </span>
                  </label>

                  {/* Submit */}
                  <motion.div whileTap={{ scale: 0.97 }} className="mt-1">
                    <Button
                      variant="primary"
                      size="lg"
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full text-base font-bold"
                    >
                      🎬 Cargar video
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
