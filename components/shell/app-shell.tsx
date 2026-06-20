'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavItem = { href: string; label: string; icon: LucideIcon }

export function AppShell({
  nav,
  footer,
  children,
}: { nav: NavItem[]; footer?: ReactNode; children: ReactNode }) {
  const pathname = usePathname()
  // Most-specific match wins: among the nav hrefs that match the current
  // path (exact or as a path prefix), the longest one is the active item.
  // This keeps a parent item ("/parent") from lighting up on a child route
  // ("/parent/add-video"), and prevents an "/" href from matching everything.
  const activeHref = nav
    .filter(({ href }) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
  const isActive = (href: string) => href === activeHref

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 px-2 text-2xl font-bold text-primary">Robi</Link>
        <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive(href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
        {footer && <div className="mt-4 border-t border-border pt-4">{footer}</div>}
      </aside>

      {/* Main */}
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 lg:pb-8">{children}</main>
      </div>

      {/* Bottom nav — mobile */}
      <nav aria-label="Navegación inferior" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card lg:hidden">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            aria-current={isActive(href) ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold',
              isActive(href) ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
