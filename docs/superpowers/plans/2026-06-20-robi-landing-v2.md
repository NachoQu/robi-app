# Robi Landing v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la landing (mobile-first, más vistosa, previews del producto por componentes y una sección de fundamento pedagógico) reescribiendo `components/landing/`.

**Architecture:** Previews del producto como componentes (`DeviceFrame` + `PreviewVideo/Quiz/Result`) que sirven de "imágenes". Secciones reescritas + nuevas (`LandingScience`, `LandingFaq`, `LandingCta`). `landing.tsx` ensambla. `app/page.tsx` ya renderiza `<Landing/>` sin sesión (no cambia). Routing `/` público ya resuelto en `proxy.ts`.

**Tech Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · framer-motion · lucide-react. Todo instalado.

## Global Constraints

- Tokens del sistema (primary `#2DBE9E`, secondary `#7ED957`, accent `#FFC447`, coral `#FF7A59`, blue `#4CA3F7`, fondo `#FAF7F2`, inks `--robi-accent-ink`/`--robi-blue-ink`/`--robi-success-ink`). NADA de `oklch(...)`/hex crudos en JSX. Alpha vía utilidades Tailwind (`bg-primary/10`); NUNCA `var(--token)/0.3` ni `hsl(var(--hexToken))`.
- **Mobile-first.** Cada sección legible y sin overflow en viewport chico; el hero apila; cards a 1 columna en mobile.
- **Ciencia sin inventar datos:** principios cualitativos. PROHIBIDO cifras, porcentajes, "está comprobado que X%" o estudios citados.
- Copy en español rioplatense.
- No dependencias nuevas. Respetar `prefers-reduced-motion`. `npx tsc --noEmit` exit 0 y `npm run build` pasa.
- CTAs: "Ingresar" → `/login`; "Comenzar gratis"/"Crear mi cuenta" → `/signup`.
- Rama `feat/landing-v2`.

> **Nota de consolidación (aprobada en el plan):** el spec listaba `device-frame.tsx` + `preview-*.tsx` por separado; se consolidan en un único `components/landing/previews.tsx` por cohesión (son chicos y cambian juntos). Única desviación del spec.

---

## File Structure

- `components/landing/previews.tsx` — NUEVO: `DeviceFrame`, `PreviewVideo`, `PreviewQuiz`, `PreviewResult`.
- `components/landing/landing-nav.tsx` — reescribir (anclas nuevas).
- `components/landing/landing-hero.tsx` — reescribir (previews + colinas).
- `components/landing/landing-how.tsx` — reescribir (Mirá→Jugá→Ganá con previews).
- `components/landing/landing-science.tsx` — NUEVO.
- `components/landing/landing-benefits.tsx` — reescribir (pulido).
- `components/landing/landing-pricing.tsx` — reescribir (pulido).
- `components/landing/landing-faq.tsx` — NUEVO (`<details>`).
- `components/landing/landing-cta.tsx` — NUEVO.
- `components/landing/landing-footer.tsx` — reescribir (logo + tagline).
- `components/landing/landing.tsx` — reescribir (ensamblar 9 secciones).
- `app/page.tsx` — sin cambios (ya importa `Landing`).

---

### Task 1: Previews del producto

**Files:**
- Create: `components/landing/previews.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Play`, `Check`), `AchievementBadge` de `@/components/ui/achievement-badge`, `cn` de `@/lib/utils`.
- Produces: `DeviceFrame({ children, className })`, `PreviewVideo({ className })`, `PreviewQuiz({ className })`, `PreviewResult({ className })`.

- [ ] **Step 1: Crear el archivo**

```tsx
import type { ReactNode } from 'react'
import { Play, Check } from 'lucide-react'
import { AchievementBadge } from '@/components/ui/achievement-badge'
import { cn } from '@/lib/utils'

export function DeviceFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-3xl border border-border bg-card p-2 shadow-xl', className)}>
      <div className="overflow-hidden rounded-2xl bg-background">{children}</div>
    </div>
  )
}

export function PreviewVideo({ className }: { className?: string }) {
  return (
    <DeviceFrame className={className}>
      <div className="relative aspect-video w-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-black/50">
            <Play size={24} className="ml-1 text-white" fill="white" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white">3:20</span>
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-foreground">¿Cómo funcionan los volcanes?</p>
      </div>
    </DeviceFrame>
  )
}

const QUIZ_OPTIONS = ['Lava', 'Agua', 'Aire', 'Hielo']

export function PreviewQuiz({ className }: { className?: string }) {
  return (
    <DeviceFrame className={className}>
      <div className="p-4">
        <p className="mb-3 text-sm font-bold text-foreground">¿Qué sale de un volcán?</p>
        <div className="grid grid-cols-2 gap-2">
          {QUIZ_OPTIONS.map((o, i) => (
            <div
              key={o}
              className={cn(
                'flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-bold',
                i === 0 ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              <span>{o}</span>
              {i === 0 && <Check size={14} />}
            </div>
          ))}
        </div>
      </div>
    </DeviceFrame>
  )
}

export function PreviewResult({ className }: { className?: string }) {
  return (
    <DeviceFrame className={className}>
      <div className="flex flex-col items-center gap-2 p-5 text-center">
        <AchievementBadge kind="star" size={56} />
        <p className="text-base font-extrabold text-primary">¡Excelente!</p>
        <p className="text-2xl font-extrabold text-primary">+25 pts</p>
        <p className="text-xs font-semibold text-muted-foreground">4 de 5 correctas</p>
      </div>
    </DeviceFrame>
  )
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/previews.tsx
git commit -m "feat(landing): previews del producto (DeviceFrame + video/quiz/result)"
```

---

### Task 2: Nav v2

**Files:**
- Modify (reescribir): `components/landing/landing-nav.tsx`

**Interfaces:**
- Consumes: `Robi`, `Button`, `next/link`.
- Produces: `LandingNav()` con anclas `como-funciona`, `por-que-funciona`, `beneficios`, `precios`, `faq`.

- [ ] **Step 1: Reescribir el archivo**

```tsx
'use client'

import Link from 'next/link'
import { Robi } from '@/components/robi/Robi'
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
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Robi size={36} />
          <span className="flex flex-col leading-none">
            <span className="text-xl font-bold text-primary">Robi</span>
            <span className="text-[10px] font-semibold text-muted-foreground">Aprende. Juega. Gana.</span>
          </span>
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
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-nav.tsx
git commit -m "feat(landing): nav v2 con anclas nuevas"
```

---

### Task 3: Hero v2

**Files:**
- Modify (reescribir): `components/landing/landing-hero.tsx`

**Interfaces:**
- Consumes: `Robi`, `Button`, `next/link`, `framer-motion`, `lucide-react` (`Play`), `PreviewVideo`/`PreviewQuiz` de `./previews`.
- Produces: `LandingHero()`.

- [ ] **Step 1: Reescribir el archivo**

```tsx
'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import { Robi } from '@/components/robi/Robi'
import { Button } from '@/components/ui/button'
import { PreviewVideo, PreviewQuiz } from './previews'

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

        {/* Ilustración: previews + Robi */}
        <motion.div
          {...(reduced ? {} : { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.6, delay: 0.1 } })}
          className="relative mx-auto w-full max-w-sm pb-10"
        >
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-secondary/20 blur-2xl" aria-hidden />
          <PreviewVideo />
          <div className="absolute -bottom-2 -right-3 w-40 sm:w-48">
            <PreviewQuiz />
          </div>
          <motion.div
            animate={reduced ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-4 -top-8"
          >
            <Robi size={80} mood="idle" />
          </motion.div>
        </motion.div>
      </div>

      {/* Colinas decorativas */}
      <svg className="block w-full text-secondary/25" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
        <path fill="currentColor" d="M0,64 C240,120 480,16 720,48 C960,80 1200,120 1440,72 L1440,120 L0,120 Z" />
      </svg>
    </section>
  )
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-hero.tsx
git commit -m "feat(landing): hero v2 con previews del producto + colinas"
```

---

### Task 4: Cómo funciona (Mirá → Jugá → Ganá)

**Files:**
- Modify (reescribir): `components/landing/landing-how.tsx`

**Interfaces:**
- Consumes: `PreviewVideo`/`PreviewQuiz`/`PreviewResult` de `./previews`.
- Produces: `LandingHow()` con `id="como-funciona"`.

- [ ] **Step 1: Reescribir el archivo**

```tsx
import { PreviewVideo, PreviewQuiz, PreviewResult } from './previews'

const STEPS = [
  { n: 1, title: 'Mirá', desc: 'Tu hijo mira un video que vos elegís — seguro y apto para su edad.', preview: 'video' as const },
  { n: 2, title: 'Jugá', desc: 'Robi arma un quiz sobre el video. El chico responde y recibe ayuda al instante.', preview: 'quiz' as const },
  { n: 3, title: 'Ganá', desc: 'Suma puntos y badges, y los canjea por premios en familia.', preview: 'result' as const },
]

function Preview({ kind }: { kind: 'video' | 'quiz' | 'result' }) {
  if (kind === 'video') return <PreviewVideo />
  if (kind === 'quiz') return <PreviewQuiz />
  return <PreviewResult />
}

export function LandingHow() {
  return (
    <section id="como-funciona" className="scroll-mt-20 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-3 text-center text-3xl font-extrabold text-foreground md:text-4xl">Mirá, jugá y aprendé</h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-base text-muted-foreground">
          Un ciclo simple que convierte cualquier video en aprendizaje real.
        </p>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-4 text-center">
              <div className="w-full max-w-xs"><Preview kind={s.preview} /></div>
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{s.n}</span>
              <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
              <p className="max-w-xs text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-how.tsx
git commit -m "feat(landing): seccion Mira-Juga-Gana con previews"
```

---

### Task 5: Por qué funciona (ciencia)

**Files:**
- Create: `components/landing/landing-science.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Activity`, `Brain`, `Zap`, `Trophy`).
- Produces: `LandingScience()` con `id="por-que-funciona"`.

- [ ] **Step 1: Crear el archivo**

```tsx
import { Activity, Brain, Zap, Trophy, type LucideIcon } from 'lucide-react'

const PRINCIPLES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Activity, title: 'Aprendizaje activo', desc: 'Participar —no solo mirar— involucra más al cerebro y mejora la comprensión.' },
  { icon: Brain, title: 'Práctica de recuperación', desc: 'Tener que recordar para responder fija lo aprendido mejor que volver a verlo.' },
  { icon: Zap, title: 'Feedback inmediato', desc: 'Robi marca al instante qué se entendió y qué reforzar, mientras el tema está fresco.' },
  { icon: Trophy, title: 'Refuerzo positivo', desc: 'Completar siempre da premio; equivocarse no penaliza, así el chico se anima a intentar.' },
]

export function LandingScience() {
  return (
    <section id="por-que-funciona" className="scroll-mt-20 bg-card/40 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-3 text-center text-3xl font-extrabold text-foreground md:text-4xl">¿Por qué funciona?</h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-base text-muted-foreground">
          Mirar un video está bien. Pero el aprendizaje real pasa cuando el chico{' '}
          <strong className="text-foreground">hace</strong> algo con lo que vio.
        </p>

        {/* Comparación pasivo vs activo */}
        <div className="mx-auto mb-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-1 text-sm font-bold text-muted-foreground">Solo mirar 😴</p>
            <p className="text-sm text-muted-foreground">El video pasa y se olvida. Sin participación, poco queda.</p>
          </div>
          <div className="rounded-2xl border-2 border-primary bg-card p-5">
            <p className="mb-1 text-sm font-bold text-primary">Mirar + hacer 🚀</p>
            <p className="text-sm text-foreground">El chico responde, recuerda y aplica. El conocimiento se fija.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-science.tsx
git commit -m "feat(landing): seccion Por que funciona (enfoque pedagogico)"
```

---

### Task 6: Beneficios + Precios (pulido)

**Files:**
- Modify (reescribir): `components/landing/landing-benefits.tsx`
- Modify (reescribir): `components/landing/landing-pricing.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Heart`, `ShieldCheck`, `Users`, `Check`), `Button`, `next/link`.
- Produces: `LandingBenefits()` (`id="beneficios"`), `LandingPricing()` (`id="precios"`).

- [ ] **Step 1: Reescribir `landing-benefits.tsx`**

```tsx
import { Heart, ShieldCheck, Users, type LucideIcon } from 'lucide-react'

const BENEFITS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Heart, title: 'Para los niños', desc: 'Aprenden jugando, con Robi como su compañero. Desarrollan comprensión y confianza.' },
  { icon: ShieldCheck, title: 'Para los padres', desc: 'Acompañan el aprendizaje de sus hijos de forma fácil y segura, sin esfuerzo adicional.' },
  { icon: Users, title: 'Para todos', desc: 'Más tiempo de calidad juntos y momentos que realmente importan.' },
]

export function LandingBenefits() {
  return (
    <section id="beneficios" className="scroll-mt-20 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground md:text-4xl">Beneficios para toda la familia</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Reescribir `landing-pricing.tsx`**

```tsx
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FREE = ['1 perfil de niño', 'Videos ilimitados', 'Quizzes con IA', 'Puntos y badges']
const PREMIUM = ['Hasta 5 perfiles', 'Catálogo de premios ampliado', 'Reportes para padres', 'Soporte prioritario']

export function LandingPricing() {
  return (
    <section id="precios" className="scroll-mt-20 bg-card/40 py-16">
      <div className="mx-auto w-full max-w-4xl px-4">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground md:text-4xl">Precios simples</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary bg-card p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-foreground">Gratis</h3>
              <p className="text-3xl font-extrabold text-primary">$0</p>
            </div>
            <ul className="flex flex-col gap-2">
              {FREE.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Check size={16} className="text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-auto">
              <Button variant="primary" className="h-11 w-full">Comenzar gratis</Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 opacity-80 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Premium</h3>
                <p className="text-3xl font-extrabold text-muted-foreground">Pronto</p>
              </div>
              <span className="rounded-full bg-[var(--robi-accent)]/20 px-2.5 py-1 text-xs font-bold text-[var(--robi-accent-ink)]">
                Próximamente
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {PREMIUM.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Check size={16} className="text-muted-foreground" /> {f}
                </li>
              ))}
            </ul>
            <Button variant="tertiary" disabled className="mt-auto h-11 w-full">Próximamente</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add components/landing/landing-benefits.tsx components/landing/landing-pricing.tsx
git commit -m "feat(landing): pulido de beneficios y precios"
```

---

### Task 7: FAQ + CTA final

**Files:**
- Create: `components/landing/landing-faq.tsx`
- Create: `components/landing/landing-cta.tsx`

**Interfaces:**
- Consumes: `Button`, `next/link`.
- Produces: `LandingFaq()` (`id="faq"`, acordeón con `<details>`), `LandingCta()`.

- [ ] **Step 1: Crear `landing-faq.tsx`**

```tsx
const FAQS = [
  { q: '¿Es seguro para mi hijo?', a: 'Sí. Vos elegís cada video y Robi revisa el contenido antes de crear la actividad. No hay chat ni contacto con extraños.' },
  { q: '¿Para qué edades es?', a: 'Pensado para chicos de 8 a 10 años, pero funciona con cualquier video que elijas según su nivel.' },
  { q: '¿De dónde salen los videos?', a: 'De YouTube. Pegás la URL del video que querés y Robi arma el quiz a partir de su contenido.' },
  { q: '¿Necesito tarjeta de crédito?', a: 'No. La versión gratuita no pide tarjeta: te registrás y empezás.' },
  { q: '¿Para qué sirven los puntos?', a: 'Se canjean por premios y experiencias en familia que vos definís, sin costo.' },
]

export function LandingFaq() {
  return (
    <section id="faq" className="scroll-mt-20 py-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground md:text-4xl">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-bold text-foreground [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Crear `landing-cta.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LandingCta() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-primary px-6 py-12 text-center">
          <h2 className="text-3xl font-extrabold text-primary-foreground md:text-4xl">Empezá gratis hoy</h2>
          <p className="max-w-md text-base text-primary-foreground/90">
            Convertí el tiempo de pantalla en tiempo de aprendizaje. Sin tarjeta, en minutos.
          </p>
          <Link href="/signup">
            <Button variant="secondary" className="h-12 px-8 text-base">Crear mi cuenta</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add components/landing/landing-faq.tsx components/landing/landing-cta.tsx
git commit -m "feat(landing): FAQ (details) + CTA final"
```

---

### Task 8: Footer v2 + ensamblar + verificación

**Files:**
- Modify (reescribir): `components/landing/landing-footer.tsx`
- Modify (reescribir): `components/landing/landing.tsx`

**Interfaces:**
- Consumes: `Robi`; las 8 secciones (Tasks 2–7).
- Produces: `LandingFooter()`, `Landing()` ensamblando las 9 secciones en orden.

- [ ] **Step 1: Reescribir `landing-footer.tsx`**

```tsx
import { Robi } from '@/components/robi/Robi'

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <Robi size={28} />
          <span className="text-sm font-bold text-primary">Robi</span>
        </div>
        <span className="text-sm text-muted-foreground">© 2026 Robi. Todos los derechos reservados.</span>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Privacidad</a>
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Términos</a>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Reescribir `landing.tsx`**

```tsx
import { LandingNav } from './landing-nav'
import { LandingHero } from './landing-hero'
import { LandingHow } from './landing-how'
import { LandingScience } from './landing-science'
import { LandingBenefits } from './landing-benefits'
import { LandingPricing } from './landing-pricing'
import { LandingFaq } from './landing-faq'
import { LandingCta } from './landing-cta'
import { LandingFooter } from './landing-footer'

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingHow />
        <LandingScience />
        <LandingBenefits />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
```

- [ ] **Step 3: Verificar typecheck + build**

Run: `cd ~/robi-app && npx tsc --noEmit && npm run build`
Expected: tsc exit 0; build OK.

- [ ] **Step 4: Verificación visual (mobile + desktop)**

Levantar `npm run dev`, sin sesión abrir `/`. Revisar en **viewport mobile** (≤390px) y **desktop**:
- Hero: texto + previews sin overflow/clipping; el quiz preview y Robi no tapan el texto en mobile (en mobile la ilustración va debajo del texto).
- Anclas del nav (desktop) hacen scroll suave a cada sección.
- "Cómo funciona": las 3 cards con sus previews en columna (mobile) / fila (desktop).
- "Por qué funciona": comparación + 4 principios.
- FAQ: abrir/cerrar cada `<details>`.
- CTAs: Ingresar → `/login`, Comenzar gratis / Crear mi cuenta → `/signup`.
- Con sesión, `/` sigue llevando a la app.

- [ ] **Step 5: Commit**

```bash
git add components/landing/landing-footer.tsx components/landing/landing.tsx
git commit -m "feat(landing): footer v2 + ensamblar landing v2"
```

---

## Self-Review (cobertura del spec)

- §2 Previews → Task 1. Nav→T2, Hero→T3, How→T4, Science→T5, Benefits/Pricing→T6, Faq/Cta→T7, Footer/landing→T8.
- §3 Contenido ciencia → Task 5 (4 principios cualitativos, sin cifras/estudios; intro "ver → hacer"; comparación pasivo/activo).
- §4 Diseño visual → tokens en todas; mobile-first (grids 1-col en mobile, hero apila, `max-w` en previews); ritmo de fondos alternados (how=background, science=card/40, benefits=background, pricing=card/40, faq=background, cta=banda primary); `scroll-mt-20` en secciones con ancla.
- §5 Testing → T8 Step 3 (tsc+build) y Step 4 (visual mobile+desktop + regresión routing).
- §6 Fuera de alcance → respetado (sin login redesign/social, sin imágenes raster/IA, sin cifras en ciencia, sin pagos, sin backend).
