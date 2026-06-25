'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, Video, Gift, UserCircle, Home, LogOut, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell, type NavItem } from '@/components/shell/app-shell'
import { signOut } from '@/actions/auth'

function UserDropdown({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-card shadow-sm px-3 py-2 hover:bg-muted transition-colors active:scale-95"
      >
        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User size={14} className="text-primary" />
        </span>
        <span className="text-sm font-semibold text-foreground">{userEmail}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-12 z-50 bg-card border border-border rounded-2xl shadow-xl min-w-[220px] overflow-hidden"
            >
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors text-left"
                >
                  <span className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <LogOut size={15} className="text-red-500 dark:text-red-400" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">Cerrar sesión</span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ParentShell({ children, userEmail }: { children: ReactNode; userEmail: string }) {
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
    <AppShell nav={nav} headerRight={<UserDropdown userEmail={userEmail} />}>
      {children}
    </AppShell>
  )
}
