'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingHero() {
  const reduced = useReducedMotion() ?? false
  const rise = (delay: number) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay } }

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-12 md:py-20 lg:grid-cols-2">
        {/* Texto */}
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
          <motion.p {...rise(0.1)} className="max-w-md text-base font-medium text-muted-foreground md:text-lg">
            Robi usa inteligencia artificial para crear actividades a partir de videos de YouTube.
            Tu hijo mira, juega y aprende de verdad — ganando premios reales.
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

        {/* Ilustración hero */}
        <motion.div
          {...(reduced ? {} : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.6, delay: 0.1 } })}
          className="relative mx-auto w-full max-w-lg"
        >
          <motion.div
            animate={reduced ? {} : { y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image
              src="/robi-hero2.png"
              alt="Robi convierte videos en aprendizaje"
              width={640}
              height={640}
              priority
              className="h-auto w-full object-contain drop-shadow-xl"
            />
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}
