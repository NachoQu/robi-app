'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MoreVertical, CheckCircle2, UserRound, X, BookOpen, Users, Pencil, Check, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { assignVideoToProfiles, updateVideoTitle, deleteRejectedVideo } from '@/actions/videos'
import { Button } from '@/components/ui/button'

interface VideoRow {
  id: string
  title: string | null
  youtube_id: string | null
  status: 'processing' | 'ready' | 'rejected'
  created_at: string
}

interface AssignedProfile {
  id: string
  name: string
  avatar: string
}

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

type Modal =
  | { kind: 'none' }
  | { kind: 'quiz'; videoId: string; title: string }
  | { kind: 'assign'; videoId: string; title: string; alreadyAssignedIds: string[] }

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function VideoThumbnail({ youtubeId }: { youtubeId: string | null }) {
  if (!youtubeId) {
    return (
      <div className="w-24 h-[60px] rounded-xl bg-muted shrink-0 flex items-center justify-center text-2xl">
        🎬
      </div>
    )
  }
  return (
    <div className="w-24 h-[60px] rounded-xl overflow-hidden shrink-0 bg-muted">
      <img
        src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
        alt=""
        className="w-full h-full object-cover"
      />
    </div>
  )
}

function EditableTitle({ videoId, initialTitle }: { videoId: string; initialTitle: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialTitle)
  const [saved, setSaved] = useState(initialTitle)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  async function handleSave() {
    if (!value.trim() || value.trim() === saved) { setEditing(false); setValue(saved); return }
    setSaving(true)
    const result = await updateVideoTitle({ videoId, title: value.trim() })
    if (result.ok) setSaved(value.trim())
    else setValue(saved)
    setSaving(false)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditing(false); setValue(saved) } }}
          disabled={saving}
          className="w-36 text-sm font-bold bg-transparent border-b border-primary outline-none text-foreground py-0.5"
        />
        <button onClick={handleSave} disabled={saving} className="text-primary hover:opacity-70 shrink-0 p-0.5">
          <Check size={14} />
        </button>
        <button onClick={() => { setEditing(false); setValue(saved) }} className="text-muted-foreground hover:opacity-70 shrink-0 p-0.5">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 group min-w-0">
      <p className="text-sm font-bold text-foreground line-clamp-1 leading-tight min-w-0">{saved}</p>
      <button
        onClick={() => setEditing(true)}
        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-0.5"
        aria-label="Editar título"
      >
        <Pencil size={12} />
      </button>
    </div>
  )
}

function KebabMenu({
  video,
  alreadyAssignedIds,
  onViewQuiz,
  onAssign,
  onDelete,
}: {
  video: VideoRow
  alreadyAssignedIds: string[]
  onViewQuiz: () => void
  onAssign: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Más opciones"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-52 rounded-2xl bg-card border border-border shadow-lg overflow-hidden">
          {video.status === 'ready' && (
            <button
              onClick={() => { setOpen(false); onViewQuiz() }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors text-left"
            >
              <BookOpen size={15} className="text-muted-foreground shrink-0" />
              Ver quiz generado
            </button>
          )}
          {video.status !== 'rejected' && (
            <button
              onClick={() => { setOpen(false); onAssign() }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors text-left"
            >
              <Users size={15} className="text-muted-foreground shrink-0" />
              Asignar a otro hijo
            </button>
          )}
          {video.status === 'rejected' && (
            <button
              onClick={() => { setOpen(false); onDelete() }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
            >
              <Trash2 size={15} className="shrink-0" />
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function QuizModal({
  videoId,
  title,
  onClose,
}: {
  videoId: string
  title: string
  onClose: () => void
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('quiz_questions')
      .select('question_text, options, position')
      .eq('video_id', videoId)
      .order('position')
      .then(({ data }) => {
        setQuestions(data ?? [])
        setLoading(false)
      })
  }, [videoId])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl bg-card border border-border flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Quiz generado</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">{title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {loading ? (
            <p className="text-sm text-muted-foreground font-medium text-center py-6">Cargando preguntas…</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-muted-foreground font-medium text-center py-6">No hay preguntas disponibles.</p>
          ) : (
            questions.map((q, idx) => (
              <div key={idx} className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Pregunta {idx + 1}
                </span>
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {q.question_text}
                </p>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {(q.options as string[]).map((opt, oi) => (
                    <span key={oi} className="text-xs rounded-xl px-3 py-2 font-medium bg-card border border-border text-foreground">
                      {String.fromCharCode(65 + oi)}. {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function AssignModal({
  videoId,
  title,
  alreadyAssignedIds,
  allProfiles,
  onClose,
  onAssigned,
}: {
  videoId: string
  title: string
  alreadyAssignedIds: string[]
  allProfiles: ChildProfile[]
  onClose: () => void
  onAssigned: (newIds: string[]) => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const unassigned = allProfiles.filter((p) => !alreadyAssignedIds.includes(p.id))

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function handleConfirm() {
    if (selected.length === 0) return
    setSaving(true)
    await assignVideoToProfiles({ videoId, childProfileIds: selected })
    onAssigned(selected)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl bg-card border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Asignar a otro hijo</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">{title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-2">
          {unassigned.length === 0 ? (
            <p className="text-sm text-muted-foreground font-medium text-center py-4">
              Este video ya está asignado a todos tus hijos.
            </p>
          ) : (
            unassigned.map((p) => {
              const isSelected = selected.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={[
                    'flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition-all text-left',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted hover:border-border',
                  ].join(' ')}
                >
                  <span className="text-2xl shrink-0">{p.avatar}</span>
                  <span className="text-sm font-semibold text-foreground flex-1">{p.name}</span>
                  {isSelected && <CheckCircle2 size={16} className="text-primary shrink-0" />}
                </button>
              )
            })
          )}
        </div>

        {unassigned.length > 0 && (
          <div className="px-5 pb-5">
            <Button
              variant="primary"
              className="w-full font-bold"
              disabled={selected.length === 0 || saving}
              onClick={handleConfirm}
            >
              {saving ? 'Asignando…' : `Asignar${selected.length > 0 ? ` a ${selected.length} perfil${selected.length > 1 ? 'es' : ''}` : ''}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function VideoListClient({
  videos,
  assignmentsByVideo,
  allProfiles,
}: {
  videos: VideoRow[]
  assignmentsByVideo: Record<string, AssignedProfile[]>
  allProfiles: ChildProfile[]
}) {
  const [modal, setModal] = useState<Modal>({ kind: 'none' })
  const [localAssignments, setLocalAssignments] = useState(assignmentsByVideo)
  const [deletedIds, setDeletedIds] = useState<string[]>([])

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border px-6 py-10 flex flex-col items-center gap-3 text-center">
        <span className="text-4xl">🎬</span>
        <p className="text-sm font-bold text-foreground">Aún no cargaste videos</p>
        <p className="text-xs text-muted-foreground font-medium max-w-xs">
          Usá el campo de arriba para cargar el primer video educativo para tus hijos.
        </p>
      </div>
    )
  }

  async function handleDelete(videoId: string) {
    const result = await deleteRejectedVideo({ videoId })
    if (result.ok) setDeletedIds((prev) => [...prev, videoId])
  }

  function handleAssigned(videoId: string, newIds: string[]) {
    const newProfiles = allProfiles.filter((p) => newIds.includes(p.id))
    setLocalAssignments((prev) => ({
      ...prev,
      [videoId]: [...(prev[videoId] ?? []), ...newProfiles],
    }))
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {videos.filter((v) => !deletedIds.includes(v.id)).map((video) => {
          const assigned = localAssignments[video.id] ?? []

          return (
            <div key={video.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3">
              <VideoThumbnail youtubeId={video.youtube_id} />

              <div className="flex-1 min-w-0">
                <EditableTitle videoId={video.id} initialTitle={video.title ?? 'Video sin título'} />
                {assigned.length > 0 && (
                  <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1 flex-wrap">
                    Asignado a:{' '}
                    {assigned.map((p, i) => (
                      <span key={i} className="inline-flex items-center gap-0.5">
                        <span>{p.avatar}</span>
                        <span className="font-semibold text-foreground">{p.name}</span>
                        {i < assigned.length - 1 && ','}
                      </span>
                    ))}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Agregado el {formatDate(video.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Status badge */}
                {video.status === 'processing' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    ⏳ Procesando
                  </span>
                )}
                {video.status === 'rejected' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    ✕ Rechazado
                  </span>
                )}
                {video.status === 'ready' && assigned.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 size={12} /> Asignado
                  </span>
                )}
                {video.status === 'ready' && assigned.length === 0 && (
                  <Link
                    href="/parent/add-video"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors border border-border"
                  >
                    <UserRound size={12} /> Sin asignar
                  </Link>
                )}

                <KebabMenu
                  video={video}
                  alreadyAssignedIds={(localAssignments[video.id] ?? []).map((p) => p.id)}
                  onDelete={() => handleDelete(video.id)}
                  onViewQuiz={() => setModal({ kind: 'quiz', videoId: video.id, title: video.title ?? 'Video sin título' })}
                  onAssign={() => setModal({
                    kind: 'assign',
                    videoId: video.id,
                    title: video.title ?? 'Video sin título',
                    alreadyAssignedIds: (localAssignments[video.id] ?? []).map((p) => p.id),
                  })}
                />
              </div>
            </div>
          )
        })}
      </div>

      {modal.kind === 'quiz' && (
        <QuizModal
          videoId={modal.videoId}
          title={modal.title}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}

      {modal.kind === 'assign' && (
        <AssignModal
          videoId={modal.videoId}
          title={modal.title}
          alreadyAssignedIds={modal.alreadyAssignedIds}
          allProfiles={allProfiles}
          onClose={() => setModal({ kind: 'none' })}
          onAssigned={(newIds) => handleAssigned(modal.videoId, newIds)}
        />
      )}
    </>
  )
}
