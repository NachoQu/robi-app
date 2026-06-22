'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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

interface AssignedVideo {
  assignmentId: string
  videoId: string
  title: string | null
  childProfileId: string
}

interface QuizQuestion {
  question_text: string
  options: string[]
  position: number
}

type PageState = 'form' | 'loading' | 'error' | 'success'

export default function AddVideoPage() {
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('profileId')

  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeChildId, setActiveChildId] = useState<string | null>(null)
  const [assignedVideos, setAssignedVideos] = useState<AssignedVideo[]>([])
  const [url, setUrl] = useState('')
  const [checked, setChecked] = useState(false)
  const [pageState, setPageState] = useState<PageState>('form')
  const [errorReason, setErrorReason] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loadingDots, setLoadingDots] = useState('.')

  const supabase = createClient()

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profilesData }, { data: assignmentsData }] = await Promise.all([
      supabase.from('child_profiles').select('id, name, avatar').eq('user_id', user.id).order('name'),
      supabase
        .from('video_assignments')
        .select('id, video_id, child_profile_id, videos(title)')
        .order('created_at', { ascending: false }),
    ])

    const loadedProfiles = profilesData ?? []
    setProfiles(loadedProfiles)

    if (selectedIds.length === 0) {
      if (preselectedId) {
        setSelectedIds([preselectedId])
      } else if (loadedProfiles.length === 1) {
        setSelectedIds([loadedProfiles[0].id])
      }
    }

    if (!activeChildId && loadedProfiles.length > 0) {
      setActiveChildId(loadedProfiles[0].id)
    }

    setAssignedVideos(
      ((assignmentsData ?? []) as any[]).map((a) => ({
        assignmentId: a.id,
        videoId: a.video_id,
        title: a.videos?.title ?? null,
        childProfileId: a.child_profile_id,
      }))
    )
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

  const videosByChild = profiles.map((p) => ({
    profile: p,
    videos: assignedVideos.filter((v) => v.childProfileId === p.id),
  }))

  const activeChild = videosByChild.find((g) => g.profile.id === activeChildId) ?? null

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-8">
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
              <h2 className="text-2xl font-extrabold text-primary">¡Video cargado con éxito!</h2>
              <p className="text-base text-muted-foreground font-medium">
                El quiz está listo. {selectedIds.length > 1 ? 'Los niños ya pueden verlo.' : 'Tu hijo/a ya puede verlo y contestar las preguntas.'}
              </p>
            </div>

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

            <Button variant="primary" size="lg" onClick={handleCargarOtro} className="w-full text-base font-bold">
              Cargar otro video
            </Button>
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
            <div className="flex flex-col items-center gap-3 text-center pt-4">
              <RobiPlaceholder size={64} />
              <h1 className="text-2xl font-extrabold tracking-tight text-primary">Cargar video educativo</h1>
              <p className="text-sm text-muted-foreground font-medium max-w-sm">
                Buscá un video de YouTube apto para tu hijo/a y pegá el link acá. Robi va a crear un quiz automáticamente.
              </p>
            </div>

            {pageState === 'error' && errorReason && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl px-5 py-4 flex flex-col gap-1 bg-destructive/10 text-destructive border border-destructive/30"
              >
                <p className="text-sm font-bold">⚠️ No pudimos procesar el video</p>
                <p className="text-sm font-medium">{errorReason}</p>
              </motion.div>
            )}

            <Card className="rounded-3xl border border-border shadow-sm bg-card">
              <CardContent className="px-8 py-7">
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
                  </div>

                  {/* Mandatory checkbox */}
                  <label
                    className={[
                      'flex items-start gap-3 cursor-pointer select-none rounded-2xl px-4 py-3 transition-colors',
                      checked
                        ? 'bg-[var(--robi-secondary)]/15 border border-[var(--robi-secondary)]/40'
                        : 'bg-muted border border-border',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="mt-0.5 w-5 h-5 accent-secondary shrink-0 cursor-pointer"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── VIDEOS ASIGNADOS ─── */}
      {pageState !== 'loading' && profiles.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-[22px] font-bold text-foreground">Videos asignados</h2>

          {/* Chips con scroll horizontal */}
          <div className="overflow-x-auto -mx-1 scrollbar-hide">
            <div className="flex gap-2 px-1 w-max">
              {videosByChild.map(({ profile, videos }) => {
                const active = activeChildId === profile.id
                return (
                  <button
                    key={profile.id}
                    onClick={() => setActiveChildId(profile.id)}
                    className={[
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition-colors whitespace-nowrap',
                      active
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-card border-border text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    <span className="text-base">{profile.avatar}</span>
                    {profile.name}
                    <span className={[
                      'text-[11px] rounded-full px-1.5 py-0.5 font-bold',
                      active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                    ].join(' ')}>
                      {videos.length}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lista del hijo activo */}
          {activeChild && (
            activeChild.videos.length === 0 ? (
              <div className="rounded-2xl bg-card border border-border px-6 py-6 flex flex-col items-start gap-1">
                <p className="text-sm font-bold text-foreground">Sin videos asignados</p>
                <p className="text-xs text-muted-foreground font-medium">
                  Cargá un video arriba para asignárselo a {activeChild.profile.name}.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activeChild.videos.map((v) => (
                  <div
                    key={v.assignmentId}
                    className="rounded-2xl bg-card border border-border px-4 py-3"
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {v.title ?? 'Sin título aún'}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      )}
    </div>
  )
}
