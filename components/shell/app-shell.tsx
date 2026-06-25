'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export type NavItem = { href: string; label: string; icon: LucideIcon; matchPaths?: string[]; sidebarOnly?: boolean }

export function AppShell({
  nav,
  footer,
  headerRight,
  children,
}: { nav: NavItem[]; footer?: ReactNode; headerRight?: ReactNode; children: ReactNode }) {
  const pathname = usePathname()

  function itemMatches({ href, matchPaths }: NavItem) {
    if (pathname === href || pathname.startsWith(href + '/')) return true
    return matchPaths?.some((p) => pathname === p || pathname.startsWith(p + '/')) ?? false
  }

  const activeHref = nav
    .filter(itemMatches)
    .sort((a, b) => {
      const lenA = Math.max(a.href.length, ...(a.matchPaths?.map((p) => p.length) ?? [0]))
      const lenB = Math.max(b.href.length, ...(b.matchPaths?.map((p) => p.length) ?? [0]))
      return lenB - lenA
    })[0]?.href
  const isActive = (href: string) => href === activeHref

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 flex items-center px-2">
          <Image src="/robi-logo.png" alt="Robi" width={100} height={40} className="h-10 w-auto" />
        </Link>
        <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-150',
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
        {headerRight && (
          <div className="flex justify-end px-4 py-4">
            {headerRight}
          </div>
        )}
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 lg:pb-8" style={{ paddingTop: headerRight ? '0' : '1.5rem' }}>
          {children}
          {footer && <div className="mt-8 border-t border-border pt-6 lg:hidden">{footer}</div>}
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav aria-label="Navegación inferior" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card lg:hidden">
        {nav.filter((item) => !item.sidebarOnly).map(({ href, label, icon: Icon }) => (
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
