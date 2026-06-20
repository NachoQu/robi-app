'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Play } from 'lucide-react'
import { Robi } from '@/components/robi/Robi'
import { Button } from '@/components/ui/button'

const OPTIONS = ['Lava', 'Agua', 'Aire', 'Hielo']

export function LandingHero() {
  const reduced = useReducedMotion() ?? false
  const rise = (delay: number) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay } }

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        {/* Columna texto */}
        <div className="flex flex-col gap-6">
          <motion.span
            {...rise(0)}
            className="w-fit rounded-full bg-secondary/30 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--robi-success-ink)]"
          >
            Nueva app para familias
          </motion.span>
          <motion.h1 {...rise(0.05)} className="text-4xl font-extrabold leading-tight text-foreground md:text-5xl">
            Convertí cualquier video en{' '}
            <span className="relative text-primary">
              aprendizaje
              <span className="absolute inset-x-0 -bottom-1 h-1.5 rounded-full bg-accent" />
            </span>{' '}
            y diversión
          </motion.h1>
          <motion.p {...rise(0.1)} className="max-w-md text-base font-medium text-muted-foreground">
            Robi usa inteligencia artificial para crear actividades increíbles a partir de videos de YouTube.
            Los chicos aprenden jugando y ganan premios reales.
          </motion.p>
          <motion.div {...rise(0.15)} className="flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button variant="primary" className="h-12 px-6 text-base">Comenzar gratis</Button>
            </Link>
            <button
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-primary px-5 text-base font-bold text-primary transition-colors hover:bg-primary/10"
            >
              <Play size={18} fill="currentColor" /> Ver cómo funciona
            </button>
          </motion.div>
        </div>

        {/* Columna ilustración */}
        <motion.div
          {...(reduced ? {} : { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.6, delay: 0.1 } })}
          className="relative flex items-center justify-center"
        >
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-secondary/20 blur-2xl" aria-hidden />
          <motion.div animate={reduced ? {} : { y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
            <Robi size={180} mood="idle" />
          </motion.div>

          {/* Tarjeta de quiz mock */}
          <div className="absolute -bottom-2 right-0 w-56 rounded-2xl border border-border bg-card p-4 shadow-lg md:right-2">
            <p className="mb-2 text-sm font-bold text-foreground">¿Qué sale de un volcán?</p>
            <div className="flex flex-col gap-1.5">
              {OPTIONS.map((o, i) => (
                <div
                  key={o}
                  className={[
                    'flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-bold',
                    i === 0 ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground',
                  ].join(' ')}
                >
                  <span>{String.fromCharCode(65 + i)}. {o}</span>
                  {i === 0 && <Check size={14} />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
