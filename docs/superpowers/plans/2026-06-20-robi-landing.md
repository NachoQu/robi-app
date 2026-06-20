# Robi Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la landing de marketing pública de Robi y mostrarla en `/` cuando no hay sesión, sin tocar el flujo autenticado.

**Architecture:** Componentes en `components/landing/` (una sección por archivo). `landing.tsx` ensambla; `landing-nav` y `landing-hero` son `'use client'` (interacción/animación), el resto estático. `app/page.tsx` (Server Component) renderiza `<Landing />` cuando `!user`, y mantiene el flujo actual con sesión.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · framer-motion · lucide-react. Todo ya instalado.

## Global Constraints

- Sistema de diseño Robi: tokens (primary `#2DBE9E`, secondary `#7ED957`, accent `#FFC447`, coral `#FF7A59`, blue `#4CA3F7`, fondo `#FAF7F2`), fuente Nunito. NO usar literales de color fuera de tokens (nada de `oklch(...)`/hex crudos en JSX; usar clases `bg-primary`, `text-foreground`, `bg-[var(--robi-accent)]`, etc.). Para alpha usar utilidades Tailwind (`bg-primary/10`) — NUNCA `var(--token)/0.3` ni `hsl(var(--hexToken))`.
- Copy en español rioplatense (voseo).
- Solo landing: NO rediseñar login, NO login social, Precios = coming-soon (sin pagos).
- No agregar dependencias. `npx tsc --noEmit` exit 0 y `npm run build` debe pasar.
- Respetar `prefers-reduced-motion` en animaciones.
- CTAs: "Ingresar" → `/login`, "Comenzar gratis" → `/signup`.
- Trabajar en la rama `feat/consistency-and-landing`.

---

## File Structure

- `components/landing/landing-nav.tsx` — barra superior sticky (client; smooth-scroll a anclas).
- `components/landing/landing-hero.tsx` — hero con Robi + tarjeta de quiz mock + CTAs (client; framer-motion).
- `components/landing/landing-how.tsx` — sección "Cómo funciona" (5 pasos). Estático.
- `components/landing/landing-benefits.tsx` — sección "Beneficios" (3 cards). Estático.
- `components/landing/landing-pricing.tsx` — sección "Precios" (Gratis + Premium próximamente). Estático.
- `components/landing/landing-footer.tsx` — footer. Estático.
- `components/landing/landing.tsx` — ensambla todas las secciones. Server-compatible.
- `app/page.tsx` — modificar: renderizar `<Landing />` si `!user`.

---

### Task 1: Nav de la landing

**Files:**
- Create: `components/landing/landing-nav.tsx`

**Interfaces:**
- Consumes: `Robi` de `@/components/robi/Robi`, `Button` de `@/components/ui/button`, `next/link`.
- Produces: `export function LandingNav()`. Sticky top; links que hacen smooth-scroll a `#como-funciona`, `#beneficios`, `#precios`; botón "Ingresar" → `/login`.

- [ ] **Step 1: Crear el componente**

```tsx
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
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-nav.tsx
git commit -m "feat(landing): nav sticky con smooth-scroll + Ingresar"
```

---

### Task 2: Hero

**Files:**
- Create: `components/landing/landing-hero.tsx`

**Interfaces:**
- Consumes: `Robi`, `Button`, `next/link`, `framer-motion` (`motion`, `useReducedMotion`), `lucide-react` (`Check`, `Play`).
- Produces: `export function LandingHero()`. Hero a 2 columnas (texto / ilustración) con CTAs "Comenzar gratis" → `/signup` y "Ver cómo funciona" (scroll a `#como-funciona`).

- [ ] **Step 1: Crear el componente**

```tsx
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
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-hero.tsx
git commit -m "feat(landing): hero con Robi + tarjeta de quiz + CTAs"
```

---

### Task 3: Cómo funciona

**Files:**
- Create: `components/landing/landing-how.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Link2`, `Bot`, `Gamepad2`, `Star`, `Gift`).
- Produces: `export function LandingHow()`. Sección con `id="como-funciona"` y 5 pasos.

- [ ] **Step 1: Crear el componente**

```tsx
import { Link2, Bot, Gamepad2, Star, Gift, type LucideIcon } from 'lucide-react'

const STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Link2, title: 'Elegí un video', desc: 'Los padres agregan la URL de YouTube que quieren que su hijo aprenda.' },
  { icon: Bot, title: 'Robi crea la actividad', desc: 'Nuestra IA genera un quiz divertido y seguro basado en el contenido del video.' },
  { icon: Gamepad2, title: 'Jugá y aprendé', desc: 'Los chicos ven el video, juegan el quiz y reciben retroalimentación al instante.' },
  { icon: Star, title: 'Ganá puntos y badges', desc: 'Respondiendo bien, ganan puntos y badges coleccionables.' },
  { icon: Gift, title: 'Canjeá premios', desc: 'Los puntos se canjean por experiencias en familia sin costo.' },
]

export function LandingHow() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-card/40 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground">¿Cómo funciona?</h2>
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <li key={title} className="flex flex-col items-center gap-3 text-center">
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <Icon size={28} className="text-primary" />
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ol>
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
git commit -m "feat(landing): seccion Como funciona (5 pasos)"
```

---

### Task 4: Beneficios

**Files:**
- Create: `components/landing/landing-benefits.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Heart`, `ShieldCheck`, `Users`).
- Produces: `export function LandingBenefits()`. Sección con `id="beneficios"` y 3 cards.

- [ ] **Step 1: Crear el componente**

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
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground">Beneficios para toda la familia</h2>
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

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-benefits.tsx
git commit -m "feat(landing): seccion Beneficios (3 cards)"
```

---

### Task 5: Precios (coming-soon)

**Files:**
- Create: `components/landing/landing-pricing.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Check`), `Button`, `next/link`.
- Produces: `export function LandingPricing()`. Sección con `id="precios"`: plan Gratis (CTA → `/signup`) y plan Premium "Próximamente" (deshabilitado).

- [ ] **Step 1: Crear el componente**

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
        <h2 className="mb-10 text-center text-3xl font-extrabold text-foreground">Precios simples</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Gratis */}
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

          {/* Premium — próximamente */}
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

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-pricing.tsx
git commit -m "feat(landing): seccion Precios (Gratis + Premium proximamente)"
```

---

### Task 6: Footer

**Files:**
- Create: `components/landing/landing-footer.tsx`

**Interfaces:**
- Produces: `export function LandingFooter()`.

- [ ] **Step 1: Crear el componente**

```tsx
export function LandingFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row">
        <span>© 2026 Robi. Todos los derechos reservados.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Privacidad</a>
          <a href="#" className="font-semibold transition-colors hover:text-foreground">Términos</a>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/landing/landing-footer.tsx
git commit -m "feat(landing): footer"
```

---

### Task 7: Ensamblar Landing + wire routing

**Files:**
- Create: `components/landing/landing.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `LandingNav`, `LandingHero`, `LandingHow`, `LandingBenefits`, `LandingPricing`, `LandingFooter` (Tasks 1–6).
- Produces: `export function Landing()`. `app/page.tsx` renderiza `<Landing />` cuando `!user`.

- [ ] **Step 1: Crear `components/landing/landing.tsx`**

```tsx
import { LandingNav } from './landing-nav'
import { LandingHero } from './landing-hero'
import { LandingHow } from './landing-how'
import { LandingBenefits } from './landing-benefits'
import { LandingPricing } from './landing-pricing'
import { LandingFooter } from './landing-footer'

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingHow />
        <LandingBenefits />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
```

- [ ] **Step 2: Modificar `app/page.tsx` para mostrar la Landing sin sesión**

Reemplazar la línea `if (!user) redirect('/login')` por el render de la Landing. El archivo queda:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HomeClient } from '@/components/home-client'
import { Landing } from '@/components/landing/landing'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <Landing />

  const [{ data: profiles }, { data: parentSettings }] = await Promise.all([
    supabase
      .from('child_profiles')
      .select('id, name, avatar, total_points')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('parent_settings')
      .select('pin_hash')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!profiles || profiles.length === 0) {
    redirect('/onboarding')
  }

  const hasPin = Boolean(parentSettings?.pin_hash)

  return (
    <HomeClient
      profiles={profiles as { id: string; name: string; avatar: string; total_points: number }[]}
      hasPin={hasPin}
    />
  )
}
```

(Conservar exactamente el resto de la lógica autenticada. `redirect` sigue importado porque lo usa el branch de onboarding.)

- [ ] **Step 3: Verificar typecheck + build**

Run: `cd ~/robi-app && npx tsc --noEmit && npm run build`
Expected: tsc exit 0; build OK (la ruta `/` compila y renderiza estática/dinámica sin error).

- [ ] **Step 4: Verificación visual + routing**

Levantar `npm run dev`. Sin sesión, abrir `/` → debe verse la landing (nav, hero con Robi, cómo funciona, beneficios, precios, footer); probar los anclas del nav (scroll suave) y los CTAs (Ingresar → `/login`, Comenzar gratis → `/signup`). Confirmar responsive (desktop 2 columnas, mobile apilado). Con sesión, `/` debe seguir llevando al selector/onboarding (no romper el flujo autenticado).

- [ ] **Step 5: Commit**

```bash
git add components/landing/landing.tsx app/page.tsx
git commit -m "feat(landing): ensamblar Landing y mostrarla en / sin sesion"
```

---

## Self-Review (cobertura del spec)

- §2 Routing → Task 7 (`app/page.tsx`: `!user` → `<Landing/>`, resto intacto).
- §3 Componentes: nav→T1, hero→T2, how→T3, benefits→T4, pricing→T5, footer→T6, landing→T7. (Nota: el nav usa 3 anclas — Cómo funciona/Beneficios/Precios — y omite el ítem redundante "Para padres" del mockup, ya cubierto por la card "Para los padres" en Beneficios.)
- §4 Diseño visual → tokens en todas las tareas; hero 2 columnas responsive (T2); ilustración on-brand con Robi real + tarjeta quiz (T2); `scroll-mt-20` en secciones para el nav sticky.
- §5 Testing → T7 Step 3 (tsc+build) y Step 4 (visual + regresión de routing).
- §6 Fuera de alcance → respetado (sin login redesign, sin social, Precios placeholder, sin backend).
