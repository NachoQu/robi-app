'use client'

import type { ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, Video, Gift, LogOut, UserCircle, Home } from 'lucide-react'
import { AppShell, type NavItem } from '@/components/shell/app-shell'
import { signOut } from '@/actions/auth'

function LogoutForm() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex items-center gap-2 w-full px-2 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </form>
  )
}

export function ParentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const fromVideos = pathname === '/parent/add-video' && searchParams.get('from') === 'videos'

  const nav: NavItem[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/parent', label: 'Panel', icon: LayoutDashboard },
    {
      href: '/parent/videos',
      label: 'Biblioteca',
      icon: Video,
      matchPaths: fromVideos ? ['/parent/add-video'] : undefined,
    },
    { href: '/parent/vouchers', label: 'Premios', icon: Gift },
    { href: '/parent/account', label: 'Cuenta', icon: UserCircle },
  ]

  return (
    <AppShell nav={nav} footer={<LogoutForm />}>
      {children}
    </AppShell>
  )
}
