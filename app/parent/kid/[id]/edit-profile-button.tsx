'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { EditProfileDialog } from './edit-profile-dialog'

interface EditProfileButtonProps {
  profileId: string
  initialName: string
  initialAvatar: string
}

export function EditProfileButton({ profileId, initialName, initialAvatar }: EditProfileButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 shrink-0 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Pencil size={13} />
        Editar perfil
      </button>
      <EditProfileDialog
        open={open}
        onOpenChange={setOpen}
        profileId={profileId}
        initialName={initialName}
        initialAvatar={initialAvatar}
      />
    </>
  )
}
