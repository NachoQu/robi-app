'use client'

import Link from 'next/link'
import { Robi } from '@/components/robi/Robi'
import { Button } from '@/components/ui/button'

const LINKS = [
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'beneficios', label: 'Beneficios' },
  { id: 'precios', label: 'Precios' },
]

export function LandingNav() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Robi size={36} />
          <span className="flex flex-col leading-none">
            <span className="text-xl font-bold text-primary">Robi</span>
            <span className="text-[10px] font-semibold text-muted-foreground">Aprende. Juega. Gana.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </button>
          ))}
        </div>

        <Link href="/login">
          <Button variant="primary" className="h-9 px-5">Ingresar</Button>
        </Link>
      </nav>
    </header>
  )
}
