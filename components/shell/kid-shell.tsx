'use client'

import type { ReactNode } from 'react'
import { Home, Gift, BookOpen } from 'lucide-react'
import { AppShell, type NavItem } from '@/components/shell/app-shell'

interface KidShellProps {
  profileId: string
  profileName: string
  profileAvatar: string
  points: number
  children: ReactNode
}

export function KidShell({
  profileId,
  profileName,
  profileAvatar,
  points,
  children,
}: KidShellProps) {
  const nav: NavItem[] = [
    { href: `/kid/${profileId}`, label: 'Inicio', icon: Home },
    { href: `/kid/${profileId}/album`, label: 'Mi álbum', icon: BookOpen },
    { href: `/kid/${profileId}/rewards`, label: 'Premios', icon: Gift },
  ]

  const footer = (
    <div className="flex items-center gap-3 px-2">
      <span className="text-3xl select-none" role="img" aria-label={`Avatar de ${profileName}`}>
        {profileAvatar}
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-bold text-foreground truncate">{profileName}</span>
        <span className="text-xs text-muted-foreground">⭐ {points.toLocaleString('es-AR')} pts</span>
      </div>
    </div>
  )

  return (
    <AppShell nav={nav} footer={footer}>
      {children}
    </AppShell>
  )
}
