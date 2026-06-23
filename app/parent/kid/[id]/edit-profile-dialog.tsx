'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { updateChildProfile, deleteChildProfile } from '@/actions/profiles'

const AVATARS = ['🦊', '🐼', '🦄', '🚀', '🐯', '🐙', '🌟', '🦖', '🐬', '🦋', '🐸', '🦁']

type Step = 'edit' | 'confirm-delete'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string
  initialName: string
  initialAvatar: string
}

export function EditProfileDialog({ open, onOpenChange, profileId, initialName, initialAvatar }: EditProfileDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('edit')
  const [name, setName] = useState(initialName)
  const [avatar, setAvatar] = useState(initialAvatar)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setStep('edit')
      setName(initialName)
      setAvatar(initialAvatar)
      setError(null)
    }
  }, [open, initialName, initialAvatar])

  async function handleSave() {
    if (!name.trim()) { setError('Ingresá un nombre'); return }
    setLoading(true)
    setError(null)
    const result = await updateChildProfile(profileId, { name: name.trim(), avatar })
    setLoading(false)
    if (result.ok) {
      onOpenChange(false)
      router.refresh()
    } else {
      setError('No pudimos guardar los cambios. Intentá de nuevo.')
    }
  }

  async function handleDelete() {
    setLoading(true)
    const result = await deleteChildProfile(profileId)
    setLoading(false)
    if (result.ok) {
      onOpenChange(false)
      router.push('/parent')
    } else {
      setError('No pudimos eliminar el perfil. Intentá de nuevo.')
      setStep('edit')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-0 shadow-2xl max-w-sm w-full">

        {step === 'edit' && (
          <>
            <DialogHeader className="pt-2 pb-0">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl select-none">{avatar}</span>
                <DialogTitle className="text-xl font-extrabold text-center" style={{ color: 'var(--robi-primary)' }}>
                  Editar perfil
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-5 py-4 px-1">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  disabled={loading}
                  maxLength={30}
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      disabled={loading}
                      className={`flex items-center justify-center rounded-2xl text-2xl aspect-square transition-all duration-150 cursor-pointer select-none border-2 ${
                        avatar === emoji ? 'bg-primary/10 border-primary' : 'bg-muted border-transparent'
                      }`}
                      aria-label={`Avatar ${emoji}`}
                      aria-pressed={avatar === emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-2.5 text-sm font-semibold text-center bg-destructive/10 text-destructive border border-destructive/30">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-2xl h-12 font-bold">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !name.trim()}
                  className="flex-1 text-base font-bold rounded-2xl h-12"
                  style={{ background: 'var(--robi-primary)', color: 'white', opacity: !name.trim() ? 0.55 : 1 }}
                >
                  {loading ? 'Guardando…' : 'Guardar'}
                </Button>
              </div>

              <button
                onClick={() => { setError(null); setStep('confirm-delete') }}
                disabled={loading}
                className="text-xs font-semibold text-destructive/70 hover:text-destructive transition-colors text-center"
              >
                Eliminar perfil
              </button>
            </div>
          </>
        )}

        {step === 'confirm-delete' && (
          <>
            <DialogHeader className="pt-2 pb-0">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl select-none">⚠️</span>
                <DialogTitle className="text-xl font-extrabold text-center text-destructive">
                  ¿Eliminar a {initialName}?
                </DialogTitle>
                <p className="text-sm text-muted-foreground text-center font-medium px-2">
                  Se eliminarán todos sus videos asignados e historial. Esta acción no se puede deshacer.
                </p>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-5 px-1">
              {error && (
                <div className="rounded-xl px-4 py-2.5 text-sm font-semibold text-center bg-destructive/10 text-destructive border border-destructive/30">
                  ⚠️ {error}
                </div>
              )}
              <Button
                onClick={handleDelete}
                disabled={loading}
                className="w-full font-bold rounded-2xl h-12"
                style={{ background: 'var(--destructive)', color: 'white' }}
              >
                {loading ? 'Eliminando…' : 'Sí, eliminar perfil'}
              </Button>
              <Button variant="outline" onClick={() => setStep('edit')} className="w-full rounded-2xl h-12 font-bold">
                Cancelar
              </Button>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  )
}
