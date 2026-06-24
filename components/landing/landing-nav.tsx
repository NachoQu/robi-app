'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const LINKS = [
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'por-que-funciona', label: 'Por qué funciona' },
  { id: 'beneficios', label: 'Beneficios' },
  { id: 'precios', label: 'Precios' },
  { id: 'faq', label: 'FAQ' },
]

export function LandingNav() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center">
          <Image src="/robi-logo.png" alt="Robi" width={120} height={48} className="h-12 w-auto" priority />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
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

        <Link href="/login" className="shrink-0">
          <Button variant="primary" className="h-9 px-5">Ingresar</Button>
        </Link>
      </nav>
    </header>
  )
}
