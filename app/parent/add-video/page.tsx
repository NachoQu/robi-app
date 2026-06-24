'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RobiPlaceholder } from '@/components/robi-placeholder'
import { processVideo, assignVideoToProfiles } from '@/actions/videos'
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



function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0] || null
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/shorts/')[1].split('?')[0] || null
      return u.searchParams.get('v')
    }
    return null
  } catch {
    return null
  }
}

function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="text-sm font-semibold transition-opacity hover:opacity-70 inline-flex items-center gap-1 w-fit"
      style={{ color: 'var(--robi-primary)' }}
    >
      ← Volver
    </button>
  )
}

function SuccessState({
  multiChild,
  questions,
  onCargarOtro,
}: {
  multiChild: boolean
  questions: QuizQuestion[]
  onCargarOtro: () => void
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {/* Success card */}
      <div className="rounded-3xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-6 py-8 flex flex-col items-center gap-4 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <CheckCircle2 size={56} className="text-green-500 dark:text-green-400" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h2 className="text-2xl font-extrabold text-green-800 dark:text-green-300">¡Listo!</h2>
          <p className="text-sm font-medium text-green-700 dark:text-green-400 mt-1">
            El video fue cargado y el quiz está listo.{' '}
            {multiChild ? 'Los niños ya pueden verlo.' : 'Tu hijo/a ya puede verlo y contestar las preguntas.'}
          </p>
        </div>
      </div>

      {/* Quiz preview — siempre desplegado */}
      {questions.length > 0 && (
        <Card className="rounded-3xl border border-border shadow-sm">
          <CardHeader className="px-6 pt-5 pb-2">
            <h3 className="text-base font-bold text-foreground">
              Quiz generado ({questions.length} preguntas)
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Solo vos podés ver estas preguntas
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
                    <span key={oi} className="text-xs rounded-xl px-3 py-2 font-medium bg-muted text-foreground">
                      {String.fromCharCode(65 + oi)}. {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2 mt-2">
        <Button variant="primary" size="lg" onClick={onCargarOtro} className="w-full text-base font-bold">
          Cargar otro video
        </Button>
        <Link href="/parent/videos" className="w-full">
          <Button variant="outline" size="lg" className="w-full text-base font-semibold">
            Ver biblioteca
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function AddVideoPage() {
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('profileId')
  const preselectedUrl = searchParams.get('url')

  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [url, setUrl] = useState(preselectedUrl ?? '')
  const [checked, setChecked] = useState(false)
  const [pageState, setPageState] = useState<PageState>('form')
  const [errorReason, setErrorReason] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loadingDots, setLoadingDots] = useState('.')

  const supabase = createClient()

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profilesData } = await supabase
      .from('child_profiles').select('id, name, avatar').eq('user_id', user.id).order('name')

    const loadedProfiles = profilesData ?? []
    setProfiles(loadedProfiles)

    if (selectedIds.length === 0) {
      if (preselectedId) {
        setSelectedIds([preselectedId])
      } else if (loadedProfiles.length === 1) {
        setSelectedIds([loadedProfiles[0].id])
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (pageState !== 'loading') return
    const interval = setInterval(() => {
      setLoadingDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [pageState])

  function toggleProfile(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedIds.length === 0 || !url.trim() || !checked) return

    setPageState('loading')
    setErrorReason(null)

    const [firstId, ...restIds] = selectedIds
    const result = await processVideo({ url: url.trim(), childProfileId: firstId })

    if (!result.ok) {
      setErrorReason(result.reason ?? 'Ocurrió un error. Intentá de nuevo.')
      setPageState('error')
      return
    }

    const videoId = result.videoId!

    if (restIds.length > 0) {
      await assignVideoToProfiles({ videoId, childProfileIds: restIds })
    }

    const { data: qs } = await supabase
      .from('quiz_questions')
      .select('question_text, options, position')
      .eq('video_id', videoId)
      .order('position')
    setQuestions(qs ?? [])
    setPageState('success')
    await loadData()
  }

  function handleCargarOtro() {
    setPageState('form')
    setErrorReason(null)
    setUrl('')
    setChecked(false)
    setQuestions([])
  }

  const canSubmit = selectedIds.length > 0 && url.trim().length > 0 && checked

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-8">
      <BackButton />

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
              <h2 className="text-2xl font-extrabold mb-2 text-primary">
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
                  className="inline-block w-3 h-3 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── SUCCESS STATE ─── */}
        {pageState === 'success' && (
          <SuccessState
            multiChild={selectedIds.length > 1}
            questions={questions}
            onCargarOtro={handleCargarOtro}
          />
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
            <div className="flex items-center gap-3 pt-2">
              <RobiPlaceholder size={40} />
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-primary leading-tight">Cargar video educativo</h1>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Pegá un link de YouTube y Robi crea el quiz.
                </p>
              </div>
            </div>

            {pageState === 'error' && errorReason && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl px-5 py-4 flex items-start gap-3 bg-destructive/10 border border-destructive/30"
              >
                <span className="text-xl shrink-0 mt-0.5">❌</span>
                <div>
                  <p className="text-sm font-bold text-destructive">No pudimos procesar el video</p>
                  <p className="text-sm font-medium text-destructive/80 mt-0.5">{errorReason}</p>
                </div>
              </motion.div>
            )}

            <Card className="rounded-3xl border border-border shadow-sm bg-card">
              <CardContent className="px-5 py-5 sm:px-8 sm:py-7">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  {/* Child multi-select */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground">
                      Asignar a
                    </label>
                    {profiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground font-medium">Cargando perfiles…</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profiles.map((p) => {
                          const selected = selectedIds.includes(p.id)
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleProfile(p.id)}
                              className={[
                                'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold border-2 transition-all',
                                selected
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'bg-muted border-transparent text-foreground hover:border-border',
                              ].join(' ')}
                            >
                              <span className="text-lg">{p.avatar}</span>
                              <span>{p.name}</span>
                              {selected && <span className="text-xs">✓</span>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {selectedIds.length === 0 && profiles.length > 0 && (
                      <p className="text-xs text-muted-foreground font-medium">Seleccioná al menos un perfil</p>
                    )}
                  </div>

                  {/* URL input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="url" className="text-sm font-semibold text-foreground">
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
                    {extractYouTubeId(url) && (
                      <div className="relative rounded-2xl overflow-hidden aspect-video w-full">
                        <img
                          src={`https://img.youtube.com/vi/${extractYouTubeId(url)}/mqdefault.jpg`}
                          alt="Vista previa del video"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Mandatory checkbox */}
                  <label
                    className={[
                      'flex items-start gap-3 cursor-pointer select-none rounded-2xl px-4 py-3 transition-colors',
                      checked
                        ? 'bg-[var(--robi-primary)]/15 border border-[var(--robi-primary)]/40'
                        : 'bg-muted border border-border',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="mt-0.5 w-5 h-5 accent-[var(--robi-primary)] shrink-0 cursor-pointer"
                    />
                    <span className="text-sm font-semibold leading-snug text-foreground">
                      Revisé el video y es apto para mi hijo/a
                    </span>
                  </label>

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

            {/* Hint Robi */}
            <div
              className="flex items-start gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'color-mix(in oklch, var(--robi-secondary) 12%, transparent)', border: '1px solid color-mix(in oklch, var(--robi-secondary) 25%, transparent)' }}
            >
              <RobiPlaceholder size={28} className="shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-bold" style={{ color: 'var(--robi-primary)' }}>Consejo de Robi</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Los videos cortos, de menos de 5 minutos, son más fáciles de terminar para los chicos.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
