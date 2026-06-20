# Robi Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar el sistema de diseño Robi (paleta verde teal, Nunito Rounded, primitivos reutilizables y layouts con sidebar responsive) a todas las pantallas in-app, reemplazando la identidad azul actual.

**Architecture:** Capa de design system basada en tokens (`globals.css`) + primitivos en `components/ui` y un `AppShell` responsive en `components/shell`. Las pantallas se reconstruyen **componiendo** primitivos y conservando intacta toda la lógica server-side (carga de datos, server actions, scoring, gate de PIN). Enfoque por fases: P0 Foundation → P1 Kid → P2 Parent → P3 Auth re-skin.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn / @base-ui/react · class-variance-authority · framer-motion · lucide-react · vitest + @testing-library/react.

## Global Constraints

- Paleta (hex exactos del sistema): primary `#2DBE9E` · secondary `#7ED957` · accent `#FFC447` · coral `#FF7A59` · blue `#4CA3F7` · background `#FAF7F2`.
- Tipografía: **Nunito** (ya cargada en `app/layout.tsx`) = "Nunito Rounded". No agregar fuentes.
- Escala tipográfica: H1 28/700 · H2 22/700 · H3 18/600 · Body 16/400 · Small 14/400.
- Idioma de la UI: español rioplatense (voseo) — conservar el tono existente.
- **No** modificar lógica de datos, server actions, scoring, esquema Supabase, ni el comportamiento del gate de PIN.
- **No** agregar dependencias nuevas (todo lo necesario ya está en `package.json`).
- Canje de premios permanece **mock** (sin writes a DB).
- Tests: vitest con `globals: true`, entorno `jsdom`, **sin** jest-dom. Usar aserciones planas (`expect(x).toBeTruthy()`), imports vía alias `@/`. Tests en `tests/`.
- Responsive: sidebar en `lg+`, bottom-nav en mobile. Respetar `prefers-reduced-motion` en animaciones.
- Commits frecuentes, uno por tarea. Trabajar en la rama `feat/design-system`.

---

## File Structure

**Foundation (P0):**
- `app/globals.css` — modificar tokens `:root` / `.dark`.
- `components/robi/Robi.tsx` — recolor SVG azul→teal/verde + mood `encourage`.
- `components/ui/button.tsx` — agregar variantes `primary`, `tertiary`; redefinir `secondary`.
- `components/ui/progress.tsx` — track/indicator verde (vía tokens; sin cambios estructurales necesarios).
- `components/ui/status-chip.tsx` — nuevo.
- `components/ui/achievement-badge.tsx` — nuevo.
- `components/ui/stat-card.tsx` — nuevo.
- `components/ui/reward-card.tsx` — nuevo.
- `components/ui/video-card.tsx` — nuevo.
- `components/shell/app-shell.tsx` — nuevo (sidebar desktop + bottom-nav mobile).
- `tests/status-chip.test.tsx`, `tests/button-variants.test.tsx`, `tests/achievement-badge.test.tsx` — nuevos.

**Kid (P1):** `components/home-client.tsx`, `app/kid/[profileId]/page.tsx`, `app/kid/[profileId]/quiz/[videoId]/page.tsx`, `app/kid/[profileId]/result/page.tsx`, `app/kid/[profileId]/album/album-client.tsx`, `app/kid/[profileId]/rewards/rewards-client.tsx`, `app/kid/[profileId]/watch/[videoId]/*`.

**Parent (P2):** `app/parent/layout.tsx`, `app/parent/page.tsx`, `app/parent/add-video/page.tsx`, `app/parent/vouchers/*`.

**Auth (P3):** `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/onboarding/*`.

> **Nota de simplificación (aprobada en el plan):** el `AppShell` usa **un solo patrón responsive** — sidebar en `lg+` y bottom-nav en mobile — para kid y parent. El spec mencionaba "drawer" para parent en mobile; se reemplaza por bottom-nav para tener un único componente bien testeado. Es la única desviación respecto del spec.

---

## Phase 0 — Foundation

### Task 1: Tokens de color (paleta verde teal)

**Files:**
- Modify: `app/globals.css` (bloques `:root` líneas 64–107 y `.dark` 109–149)

**Interfaces:**
- Produces: variables CSS `--robi-primary|secondary|accent|coral|blue` (+ `*-foreground`), y los semánticos shadcn (`--primary`, `--secondary`, `--accent`, `--background`, `--foreground`, `--card`, `--muted`, `--border`, `--input`, `--ring`, `--destructive`) remapeados a la paleta Robi. Consumidas por todas las tareas siguientes vía clases Tailwind (`bg-primary`, `text-foreground`, etc.) y `var(--robi-*)`.

- [ ] **Step 1: Agregar tokens secundario/azul al bloque `@theme inline`**

En `app/globals.css`, dentro del bloque `@theme inline` (después de la línea 61, junto a los otros `--color-robi-*`), agregar:

```css
  --color-robi-secondary: var(--robi-secondary);
  --color-robi-secondary-foreground: var(--robi-secondary-foreground);
  --color-robi-blue: var(--robi-blue);
  --color-robi-blue-foreground: var(--robi-blue-foreground);
```

- [ ] **Step 2: Reemplazar el bloque `:root` con la paleta Robi**

Reemplazar las variables de color dentro de `:root` (líneas 65–97, desde `--robi-primary` hasta `--chart-5`) por:

```css
  /* Robi palette */
  --robi-primary: #2DBE9E;
  --robi-primary-foreground: #FFFFFF;
  --robi-secondary: #7ED957;
  --robi-secondary-foreground: #1F5117;
  --robi-accent: #FFC447;
  --robi-accent-foreground: #4A3500;
  --robi-coral: #FF7A59;
  --robi-coral-foreground: #FFFFFF;
  --robi-blue: #4CA3F7;
  --robi-blue-foreground: #FFFFFF;

  /* shadcn base — mapeado a la paleta Robi */
  --background: #FAF7F2;
  --foreground: #26312E;
  --card: #FFFFFF;
  --card-foreground: #26312E;
  --popover: #FFFFFF;
  --popover-foreground: #26312E;
  --primary: #2DBE9E;
  --primary-foreground: #FFFFFF;
  --secondary: #7ED957;
  --secondary-foreground: #1F5117;
  --muted: #F1EDE6;
  --muted-foreground: #6B746F;
  --accent: #FFC447;
  --accent-foreground: #4A3500;
  --destructive: #E5604A;
  --border: #E8E3DA;
  --input: #E8E3DA;
  --ring: #2DBE9E;
  --chart-1: #2DBE9E;
  --chart-2: #FFC447;
  --chart-3: #7ED957;
  --chart-4: #FF7A59;
  --chart-5: #4CA3F7;
```

Dejar intactas las líneas `--radius`, `--sidebar*` salvo color: cambiar `--sidebar` a `#FFFFFF`, `--sidebar-foreground` a `#26312E`, `--sidebar-primary` a `#2DBE9E`, `--sidebar-primary-foreground` a `#FFFFFF`, `--sidebar-accent` a `#EAF7F2`, `--sidebar-accent-foreground` a `#1B7A66`, `--sidebar-border` a `#E8E3DA`, `--sidebar-ring` a `#2DBE9E`.

- [ ] **Step 3: Reemplazar los colores del bloque `.dark`**

En `.dark` (líneas 109–149) usar la traducción tonal:

```css
  --background: #15211D;
  --foreground: #ECF3EF;
  --card: #1E2C27;
  --card-foreground: #ECF3EF;
  --popover: #1E2C27;
  --popover-foreground: #ECF3EF;
  --primary: #3FD3B0;
  --primary-foreground: #08201A;
  --secondary: #2E5B22;
  --secondary-foreground: #DDF3CF;
  --muted: #273730;
  --muted-foreground: #9DB0A6;
  --accent: #FFC447;
  --accent-foreground: #2A1E00;
  --destructive: #FF7A59;
  --border: rgba(255,255,255,0.10);
  --input: rgba(255,255,255,0.15);
  --ring: #3FD3B0;
  --chart-1: #3FD3B0;
  --chart-2: #FFC447;
  --chart-3: #7ED957;
  --chart-4: #FF7A59;
  --chart-5: #4CA3F7;
```

Y los `--robi-*` del dark: `--robi-primary: #3FD3B0; --robi-primary-foreground: #08201A; --robi-secondary: #7ED957; --robi-secondary-foreground: #102A0A; --robi-accent: #FFC447; --robi-accent-foreground: #2A1E00; --robi-coral: #FF7A59; --robi-coral-foreground: #2A0E06; --robi-blue: #4CA3F7; --robi-blue-foreground: #07223D;`. Ajustar `--sidebar*` del dark a tonos análogos (`--sidebar: #1E2C27`, etc.).

- [ ] **Step 4: Verificar build**

Run: `cd ~/robi-app && npm run build`
Expected: build OK, sin errores de CSS.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat(ds): paleta verde teal en tokens globales (light + dark)"
```

---

### Task 2: Recolor del mascota Robi

**Files:**
- Modify: `components/robi/Robi.tsx`

**Interfaces:**
- Consumes: tokens de Task 1.
- Produces: tipo `RobiMood = 'idle' | 'thinking' | 'celebrate' | 'talking' | 'encourage'`. Robi recoloreado a teal/verde. Consumido por todas las pantallas vía `RobiPlaceholder`.

- [ ] **Step 1: Recolorear los fills hardcodeados azul→teal/verde**

En `components/robi/Robi.tsx`, reemplazar los colores `oklch(... 262)` (azules) por la paleta teal/verde. Reemplazos exactos:
- Cabeza (`rect` línea ~201): `fill="oklch(0.96 0.01 95)"` (crema), `stroke="#1F8B76"`.
- Pantalla interna (línea ~217): `fill="#0F2E28"`, `stroke="#1F8B76"`.
- Ojos (`Eye`, línea 29): `fill="var(--robi-secondary)"`.
- Orejas (líneas ~213–214): `fill="#9BE3D2"`, `stroke="#1F8B76"`.
- Antena stem (línea ~178): `fill="#7FCBBA"`.
- Cuerpo (línea ~287): `fill="oklch(0.97 0.01 95)"` (crema), `stroke="#1F8B76"`.
- Brazos (líneas ~331, ~352): `fill="#9BE3D2"`, `stroke="#1F8B76"`.
- Piernas (líneas ~375–376): `fill="#7FCBBA"`, `stroke="#1F8B76"`.

- [ ] **Step 2: Reemplazar las 3 luces del pecho por una estrella verde**

Reemplazar el `rect` del chest badge (líneas ~299–308) y el bloque de 3 `motion.circle` (líneas ~310–328) por una estrella:

```tsx
{/* ── Chest star badge ─────────────────────────────────────── */}
<motion.path
  d="M100 138 l5.3 10.7 11.8 1.7 -8.5 8.3 2 11.8 -10.6 -5.6 -10.6 5.6 2 -11.8 -8.5 -8.3 11.8 -1.7 Z"
  fill="var(--robi-secondary)"
  stroke="#1F8B76"
  strokeWidth={1.5}
  strokeLinejoin="round"
  animate={reduced ? {} : mood === 'celebrate' ? { scale: [1, 1.25, 1] } : { scale: [1, 1.06, 1] }}
  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
  style={{ originX: '100px', originY: '155px' }}
/>
```

- [ ] **Step 3: Agregar el mood `encourage`**

En la línea 11 cambiar el tipo a:

```tsx
export type RobiMood = 'idle' | 'thinking' | 'celebrate' | 'talking' | 'encourage'
```

En `bodyVariants` agregar la entrada `encourage` (gesto suave de aliento):

```tsx
    encourage: reduced
      ? {}
      : {
          rotate: [0, -4, 4, -4, 0],
          transition: { duration: 1.2, ease: 'easeInOut', repeat: Infinity },
        },
```

En la sección de boca, agregar el caso `encourage` (boca recta suave, como `thinking` pero con leve curva hacia arriba):

```tsx
{mood === 'encourage' && (
  <path d="M 84 100 Q 100 104 116 100" stroke="var(--robi-secondary)" strokeWidth={3} strokeLinecap="round" fill="none" />
)}
```

Antenna ball: incluir `encourage` en el `else` que da color accent (ningún cambio necesario; ya cae en el default `var(--robi-accent)`).

- [ ] **Step 4: Verificar typecheck/build**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: sin errores de tipo.

- [ ] **Step 5: Commit**

```bash
git add components/robi/Robi.tsx
git commit -m "feat(ds): recolor Robi a teal/verde + estrella en pecho + mood encourage"
```

---

### Task 3: Variantes de Button

**Files:**
- Modify: `components/ui/button.tsx:6-41`
- Test: `tests/button-variants.test.tsx`

**Interfaces:**
- Consumes: tokens de Task 1.
- Produces: `buttonVariants` con `variant` extendido: `primary`, `secondary` (redefinido a verde claro), `tertiary`. Consumido por pantallas vía `<Button variant="primary">`.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/button-variants.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('primary variant aplica fondo primario y forma pill', () => {
  const { getByRole } = render(<Button variant="primary">Hola</Button>)
  const cls = getByRole('button').className
  expect(cls.includes('bg-primary')).toBe(true)
  expect(cls.includes('rounded-full')).toBe(true)
})

test('tertiary variant es outline transparente', () => {
  const { getByRole } = render(<Button variant="tertiary">Hola</Button>)
  const cls = getByRole('button').className
  expect(cls.includes('border')).toBe(true)
  expect(cls.includes('bg-transparent')).toBe(true)
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd ~/robi-app && npx vitest run tests/button-variants.test.tsx`
Expected: FAIL (variant `primary`/`tertiary` aún no existen → clases ausentes).

- [ ] **Step 3: Agregar las variantes**

En `components/ui/button.tsx`, dentro de `variants.variant`, agregar/redefinir:

```tsx
        primary:
          "rounded-full bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),black_8%)]",
        secondary:
          "rounded-full bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),black_8%)]",
        tertiary:
          "rounded-full border border-primary bg-transparent text-primary hover:bg-primary/10",
```

(Mantener las variantes `default`, `outline`, `ghost`, `destructive`, `link` existentes.)

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd ~/robi-app && npx vitest run tests/button-variants.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/ui/button.tsx tests/button-variants.test.tsx
git commit -m "feat(ds): variantes primary/secondary/tertiary en Button"
```

---

### Task 4: StatusChip

**Files:**
- Create: `components/ui/status-chip.tsx`
- Test: `tests/status-chip.test.tsx`

**Interfaces:**
- Produces: `StatusChip({ status, className })` con `status: 'nuevo' | 'en-progreso' | 'completado'`, y el tipo exportado `StatusKind`. Consumido por `VideoCard` (Task 8) y pantallas.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/status-chip.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { StatusChip } from '@/components/ui/status-chip'

test('muestra el label correcto por estado', () => {
  const { rerender } = render(<StatusChip status="nuevo" />)
  expect(screen.getByText('Nuevo')).toBeTruthy()
  rerender(<StatusChip status="en-progreso" />)
  expect(screen.getByText('En progreso')).toBeTruthy()
  rerender(<StatusChip status="completado" />)
  expect(screen.getByText('Completado')).toBeTruthy()
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd ~/robi-app && npx vitest run tests/status-chip.test.tsx`
Expected: FAIL ("Cannot find module '@/components/ui/status-chip'").

- [ ] **Step 3: Crear el componente**

```tsx
import { cn } from '@/lib/utils'

const STATUS = {
  nuevo: { label: 'Nuevo', dot: 'bg-[var(--robi-accent)]', text: 'text-[#8A6A00]', bg: 'bg-[var(--robi-accent)]/20' },
  'en-progreso': { label: 'En progreso', dot: 'bg-[var(--robi-blue)]', text: 'text-[#1E5FA8]', bg: 'bg-[var(--robi-blue)]/15' },
  completado: { label: 'Completado', dot: 'bg-[var(--robi-primary)]', text: 'text-[#1B7A66]', bg: 'bg-[var(--robi-primary)]/15' },
} as const

export type StatusKind = keyof typeof STATUS

export function StatusChip({ status, className }: { status: StatusKind; className?: string }) {
  const s = STATUS[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', s.bg, s.text, className)}>
      <span className={cn('size-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd ~/robi-app && npx vitest run tests/status-chip.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/status-chip.tsx tests/status-chip.test.tsx
git commit -m "feat(ds): componente StatusChip (nuevo/en-progreso/completado)"
```

---

### Task 5: AchievementBadge

**Files:**
- Create: `components/ui/achievement-badge.tsx`
- Test: `tests/achievement-badge.test.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`Star`, `Shield`, `Gem`).
- Produces: `AchievementBadge({ kind, locked, size, className })` con `kind: 'star' | 'shield' | 'gem'`. Consumido por álbum (P1) y resultados (P1).

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/achievement-badge.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { AchievementBadge } from '@/components/ui/achievement-badge'

test('renderiza un svg para cada kind', () => {
  const { container, rerender } = render(<AchievementBadge kind="star" />)
  expect(container.querySelector('svg')).toBeTruthy()
  rerender(<AchievementBadge kind="shield" />)
  expect(container.querySelector('svg')).toBeTruthy()
  rerender(<AchievementBadge kind="gem" locked />)
  expect(container.querySelector('svg')).toBeTruthy()
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd ~/robi-app && npx vitest run tests/achievement-badge.test.tsx`
Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Crear el componente**

```tsx
import { Star, Shield, Gem, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Kind = 'star' | 'shield' | 'gem'

const KIND: Record<Kind, { Icon: LucideIcon; color: string }> = {
  star: { Icon: Star, color: 'var(--robi-accent)' },
  shield: { Icon: Shield, color: 'var(--robi-primary)' },
  gem: { Icon: Gem, color: 'var(--robi-blue)' },
}

export function AchievementBadge({
  kind,
  locked = false,
  size = 56,
  className,
}: { kind: Kind; locked?: boolean; size?: number; className?: string }) {
  const { Icon, color } = KIND[kind]
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full shadow-md', className)}
      style={{
        width: size,
        height: size,
        background: locked ? 'var(--muted)' : color,
        opacity: locked ? 0.5 : 1,
      }}
      aria-label={locked ? 'Logro bloqueado' : `Logro ${kind}`}
    >
      <Icon
        size={size * 0.5}
        color={locked ? 'var(--muted-foreground)' : 'white'}
        fill={locked ? 'none' : 'white'}
        strokeWidth={2}
      />
    </span>
  )
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd ~/robi-app && npx vitest run tests/achievement-badge.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/achievement-badge.tsx tests/achievement-badge.test.tsx
git commit -m "feat(ds): componente AchievementBadge (star/shield/gem + locked)"
```

---

### Task 6: StatCard

**Files:**
- Create: `components/ui/stat-card.tsx`

**Interfaces:**
- Consumes: `lucide-react`.
- Produces: `StatCard({ value, label, icon, className })` (icon es un `ReactNode`). Consumido por el dashboard del padre (P2).

- [ ] **Step 1: Crear el componente**

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function StatCard({
  value,
  label,
  icon,
  className,
}: { value: ReactNode; label: string; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-2xl bg-card p-5 shadow-sm border border-border', className)}>
      {icon && <div className="text-primary mb-1">{icon}</div>}
      <span className="text-3xl font-bold leading-none text-foreground tabular-nums">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/ui/stat-card.tsx
git commit -m "feat(ds): componente StatCard para el dashboard"
```

---

### Task 7: RewardCard

**Files:**
- Create: `components/ui/reward-card.tsx`

**Interfaces:**
- Produces: `RewardCard({ title, points, icon, locked, missing, onRedeem, className })`. Consumido por premios kid (P1).

- [ ] **Step 1: Crear el componente**

```tsx
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function RewardCard({
  title,
  points,
  icon,
  locked = false,
  missing,
  onRedeem,
  className,
}: {
  title: string
  points: number
  icon: ReactNode
  locked?: boolean
  missing?: number
  onRedeem?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center shadow-sm border border-border',
        locked && 'opacity-70',
        className,
      )}
    >
      <div className="text-4xl select-none" aria-hidden>{icon}</div>
      <p className="font-bold text-sm leading-snug text-foreground">{title}</p>
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--robi-accent)]/20 px-2.5 py-0.5 text-xs font-bold text-[#8A6A00]">
        ⭐ {points.toLocaleString('es-AR')} pts
      </span>
      {locked ? (
        <span className="text-xs font-semibold text-muted-foreground">
          Te faltan {missing?.toLocaleString('es-AR')} pts
        </span>
      ) : (
        <Button variant="primary" className="h-8 px-4 text-xs" onClick={onRedeem}>
          Canjear
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/ui/reward-card.tsx
git commit -m "feat(ds): componente RewardCard para catálogo de premios"
```

---

### Task 8: VideoCard

**Files:**
- Create: `components/ui/video-card.tsx`

**Interfaces:**
- Consumes: `StatusChip`/`StatusKind` (Task 4), `next/image`, `next/link`.
- Produces: `VideoCard({ href, title, thumbnailUrl, duration, status, className })` con `status?: StatusKind`. Consumido por biblioteca kid (P1).

- [ ] **Step 1: Crear el componente**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { StatusChip, type StatusKind } from '@/components/ui/status-chip'
import { cn } from '@/lib/utils'

export function VideoCard({
  href,
  title,
  thumbnailUrl,
  duration,
  status,
  className,
}: {
  href: string
  title: string
  thumbnailUrl: string
  duration?: string
  status?: StatusKind
  className?: string
}) {
  return (
    <Link href={href} className={cn('group block', className)}>
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm border border-border transition-shadow group-hover:shadow-md">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image src={thumbnailUrl} alt={title} fill className="object-cover" unoptimized />
          <div className="absolute inset-0 flex items-center justify-center opacity-90">
            <span className="flex size-11 items-center justify-center rounded-full bg-black/50">
              <Play size={20} className="ml-0.5 text-white" fill="white" />
            </span>
          </div>
          {duration && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white">
              {duration}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 p-3">
          <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground">{title}</p>
          {status && <StatusChip status={status} />}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/ui/video-card.tsx
git commit -m "feat(ds): componente VideoCard con StatusChip"
```

---

### Task 9: AppShell responsive (sidebar + bottom-nav)

**Files:**
- Create: `components/shell/app-shell.tsx`

**Interfaces:**
- Consumes: `lucide-react`, `next/navigation` (`usePathname`), tokens.
- Produces: `AppShell({ nav, footer, children })` y el tipo `NavItem = { href: string; label: string; icon: LucideIcon }`. Sidebar fija en `lg+`, bottom-nav en mobile. Consumido por biblioteca kid (P1) y layout del padre (P2).

- [ ] **Step 1: Crear el componente**

```tsx
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
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 px-2 text-2xl font-bold text-primary">Robi</Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
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
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card lg:hidden">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
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
```

- [ ] **Step 2: Verificar typecheck/build**

Run: `cd ~/robi-app && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/shell/app-shell.tsx
git commit -m "feat(ds): AppShell responsive (sidebar desktop + bottom-nav mobile)"
```

---

### Task 10: Verificación visual de la foundation

- [ ] **Step 1: Correr toda la suite de tests**

Run: `cd ~/robi-app && npm test`
Expected: PASS (incluyendo los nuevos tests de primitivos y los existentes de scoring/AI/youtube intactos).

- [ ] **Step 2: Build de producción**

Run: `cd ~/robi-app && npm run build`
Expected: build OK.

- [ ] **Step 3: Verificación visual (screenshot)**

Levantar `npm run dev`, abrir `/login` (ya re-skineado por tokens) y confirmar que el primario es verde teal y la fuente sigue Nunito. Comparar contra el sistema de diseño. (Sin commit — solo verificación.)

---

## Phase 1 — Kid flow

> **Patrón para todas las tareas P1/P2/P3:** conservar **toda** la lógica server-side y de cliente (queries, server actions, `submitQuiz`, scoring, sessionStorage, estados). Reemplazar **solo** el JSX presentacional: cambiar `style={{ oklch(...262) }}` por clases con tokens, usar los primitivos nuevos, y aplicar la escala tipográfica. Verificar cada pantalla con screenshot contra el mockup correspondiente.

### Task 11: Biblioteca del niño (pantalla hero)

**Files:**
- Modify: `app/kid/[profileId]/page.tsx`

**Interfaces:**
- Consumes: `AppShell` (Task 9), `VideoCard` (Task 8), `Progress` (Task 1), `RobiPlaceholder`, `lucide-react` (`Home, BookOpen, Gift, User`).

- [ ] **Step 1: Envolver con AppShell**

Conservar todo el bloque de carga de datos (`profile`, `assignments`, `videos`, `watchedSet` — líneas 11–51 actuales, sin cambios). Reemplazar el `return (...)`: como es un Server Component, definir el `nav` para `KidShell` en un wrapper. Crear el array de nav:

```tsx
const nav = [
  { href: `/kid/${profileId}`, label: 'Inicio', icon: Home },
  { href: `/kid/${profileId}/album`, label: 'Biblioteca', icon: BookOpen },
  { href: `/kid/${profileId}/rewards`, label: 'Premios', icon: Gift },
  { href: `/kid/${profileId}`, label: 'Perfil', icon: User },
]
```

Envolver el contenido en `<AppShell nav={nav} footer={<ProfileFooter name={profile.name} avatar={profile.avatar} />}>`. (`AppShell` es client; recibe props serializables + el footer como JSX server-rendered — OK porque no pasa funciones.)

- [ ] **Step 2: Header con saludo, nivel, progreso y puntos**

Dentro del shell, reemplazar el header actual (líneas 60–112) por una card:

```tsx
<header className="mb-6 flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-sm border border-border sm:flex-row sm:items-center sm:justify-between">
  <div className="flex items-center gap-4">
    <span className="text-5xl" role="img" aria-label={`Avatar de ${profile.name}`}>{profile.avatar}</span>
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[28px] font-bold leading-none text-foreground">¡Hola, {profile.name}!</h1>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">⭐ {profile.total_points.toLocaleString('es-AR')} pts</span>
      </div>
    </div>
  </div>
  <Link href={`/kid/${profileId}/rewards`}>
    <Button variant="primary" className="h-10 px-5"><Gift size={18} /> Ver premios</Button>
  </Link>
</header>
```

- [ ] **Step 3: Grid de videos con VideoCard**

Reemplazar el grid actual (líneas 168–246) por:

```tsx
<h2 className="mb-4 text-[22px] font-bold text-foreground">Tus videos</h2>
{videos.length === 0 ? (
  /* conservar el empty state, restyleado con bg-card/text-muted-foreground */
) : (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
    {videos.map((a) => (
      <VideoCard
        key={a.videos.id}
        href={`/kid/${profileId}/watch/${a.videos.id}`}
        title={a.videos.title ?? 'Video educativo'}
        thumbnailUrl={`https://img.youtube.com/vi/${a.videos.youtube_id}/hqdefault.jpg`}
        status={watchedSet.has(a.videos.id) ? 'completado' : 'nuevo'}
      />
    ))}
  </div>
)}
```

- [ ] **Step 4: Componente ProfileFooter (en el mismo archivo o `components/shell`)**

Pequeño bloque para el footer del sidebar: avatar + nombre + "Nivel". Definirlo como función local server-safe (sin hooks).

- [ ] **Step 5: Verificar build + screenshot**

Run: `cd ~/robi-app && npm run build` → OK. Levantar dev, abrir `/kid/<id>` y comparar con el mockup "Desktop — Biblioteca" (desktop y mobile).

- [ ] **Step 6: Commit**

```bash
git add app/kid/[profileId]/page.tsx components/shell
git commit -m "feat(kid): biblioteca con AppShell + VideoCard segun mockup"
```

---

### Task 12: Quiz

**Files:**
- Modify: `app/kid/[profileId]/quiz/[videoId]/page.tsx`

**Interfaces:**
- Consumes: `RobiPlaceholder` (moods), tokens, `Progress`.

- [ ] **Step 1: Re-skin sin tocar lógica**

Conservar todo el estado y handlers (líneas 32–190: carga de preguntas, TTS, `handleSelectOption`, `handleNext`, `submitQuiz`, sessionStorage). Reemplazar solo estilos:
- Fondo: `bg-background` (quitar el gradiente azul de las líneas 165, 196).
- Barra de progreso (líneas 216–227): usar el primitivo `Progress` o un track `bg-muted` con indicador `bg-primary`.
- Burbuja de Robi: bg `bg-primary/10` (idle), `bg-secondary/20` (correct), `bg-[var(--robi-coral)]/15` (incorrect). Mood: `idle`→`talking`; en `incorrect` pasar `mood="encourage"`; en `correct` `mood="celebrate"`.
- Card de pregunta: `bg-card shadow-sm border border-border`, texto `text-foreground`, tamaño H3 (`text-lg font-semibold`).
- Opciones (grid): en `lg+` usar `grid grid-cols-2 gap-3` (2×2 como el mockup); en mobile `flex-col`. Estados: default `bg-card border border-border`; correcto `bg-secondary text-secondary-foreground`; incorrecto-seleccionado `bg-[var(--robi-coral)] text-white`. Checkmark con `<Check>` de lucide en la correcta.
- Botón siguiente: `<Button variant="primary" className="w-full h-12">`.

- [ ] **Step 2: Verificar build + screenshot**

Run: `npm run build` → OK. Comparar con mockup "Tablet — Quiz".

- [ ] **Step 3: Commit**

```bash
git add "app/kid/[profileId]/quiz/[videoId]/page.tsx"
git commit -m "feat(kid): quiz re-skin segun sistema (verde + grid 2x2)"
```

---

### Task 13: Resultados

**Files:**
- Modify: `app/kid/[profileId]/result/page.tsx`

**Interfaces:**
- Consumes: `AchievementBadge` (Task 5), `RobiPlaceholder` (`celebrate`), `Button`.

- [ ] **Step 1: Re-skin sin tocar lógica**

Conservar la lectura de `sessionStorage`, el cálculo de `earned/pct/correctCount` y los headlines (líneas 61–103). Cambios visuales:
- Fondo `bg-background`; confeti: reemplazar los `oklch(...)` literales de `CONFETTI_COLORS` (líneas 50–51) por `var(--robi-blue)` y `var(--robi-secondary)`.
- Reemplazar el emoji 🏅 (línea 173) por `<AchievementBadge kind="star" size={96} />`.
- Headline H1 (`text-[28px] font-bold text-primary`).
- "+N pts": destacar con `text-primary text-3xl font-bold`.
- Card de score: `bg-card shadow-sm border border-border`; barra `bg-muted` + indicador `bg-primary`.
- Botones: "Seguir aprendiendo" `<Button variant="primary">` (→ `/kid/<id>`), "Ver premios" `<Button variant="tertiary">` (→ `/kid/<id>/rewards`). (Reemplaza los 2 Links actuales y alinea con el mockup.)

- [ ] **Step 2: Verificar build + screenshot**

Run: `npm run build` → OK. Comparar con mockup "Tablet — Resultados".

- [ ] **Step 3: Commit**

```bash
git add "app/kid/[profileId]/result/page.tsx"
git commit -m "feat(kid): resultados con AchievementBadge + botones del sistema"
```

---

### Task 14: Álbum, Premios kid y Watch

**Files:**
- Modify: `app/kid/[profileId]/album/album-client.tsx`
- Modify: `app/kid/[profileId]/rewards/rewards-client.tsx`
- Modify: `app/kid/[profileId]/watch/[videoId]/video-player.tsx` (+ `page.tsx` si aplica)

**Interfaces:**
- Consumes: `AchievementBadge`, `RewardCard`, `Button`, tokens.

- [ ] **Step 1: Álbum**

Leer `album-client.tsx` y reemplazar la grilla de badges por `<AchievementBadge kind=... locked=... />` (mapear logros ganados/bloqueados). Fondo `bg-background`, headings con la escala. Conservar la lógica de datos.

- [ ] **Step 2: Premios kid**

En `rewards-client.tsx` conservar `handleRedeem`/dialog mock (líneas 81–93) y la lógica de `canRedeem/missing`. Reemplazar la lista de vouchers (líneas 193–296) por una grilla de `RewardCard` (`onRedeem={() => handleRedeem(voucher)}`, `locked={!canRedeem}`, `missing={missing}`). Agregar el header de puntos + tabs "Catálogo / Mis canjes" (Catálogo activo; "Mis canjes" placeholder visual). Confeti: reemplazar `oklch(...)` de `CONFETTI_COLORS` por tokens. Restylear el dialog con `bg-card`/tokens.

- [ ] **Step 3: Watch**

Re-skin del reproductor: fondo `bg-background`, botón de finalización `<Button variant="primary">`. Conservar el manejo del player de YouTube.

- [ ] **Step 4: Verificar build + screenshots**

Run: `npm run build` → OK. Comparar premios con mockup "Desktop — Premios (mock)".

- [ ] **Step 5: Commit**

```bash
git add "app/kid/[profileId]/album" "app/kid/[profileId]/rewards" "app/kid/[profileId]/watch"
git commit -m "feat(kid): album, premios y watch segun sistema de diseno"
```

---

### Task 15: Home / selector de perfil

**Files:**
- Modify: `components/home-client.tsx`

- [ ] **Step 1: Re-skin**

Conservar estado (`pinOpen`, `upgradeOpen`) y navegación. Reemplazar el gradiente azul (línea 31) por `bg-background`; cards de perfil con `bg-card shadow-sm border border-border`; pill de puntos con `bg-[var(--robi-accent)]/20 text-[#8A6A00]`; títulos `text-primary`; botón "Agregar perfil" y dialog Premium con `<Button variant="primary">` y tokens.

- [ ] **Step 2: Verificar build + screenshot**

Run: `npm run build` → OK.

- [ ] **Step 3: Commit**

```bash
git add components/home-client.tsx
git commit -m "feat(kid): selector de perfil re-skin verde teal"
```

---

## Phase 2 — Parent flow

### Task 16: Layout del padre con ParentShell

**Files:**
- Modify: `app/parent/layout.tsx`

**Interfaces:**
- Consumes: `AppShell` (Task 9), `lucide-react` (`LayoutDashboard, Video, Users, Settings`), `signOut`.

- [ ] **Step 1: Reemplazar el header por AppShell**

Conservar **intacto** todo el gate de PIN (líneas 8–34). Reemplazar el `return` (líneas 36–96): envolver `children` en `<AppShell nav={parentNav} footer={<LogoutButton />}>`, con:

```tsx
const parentNav = [
  { href: '/parent', label: 'Panel', icon: LayoutDashboard },
  { href: '/parent/add-video', label: 'Videos', icon: Video },
  { href: '/parent', label: 'Hijos', icon: Users },
  { href: '/parent', label: 'Ajustes', icon: Settings },
]
```

`LogoutButton`: un `<form action={signOut}>` con `<button>` "Cerrar sesión" (server action — OK dentro de footer porque `AppShell` solo renderiza el nodo).

- [ ] **Step 2: Verificar build + screenshot**

Run: `npm run build` → OK. Confirmar gate de PIN sin cambios (redirección si no `parent_unlocked`).

- [ ] **Step 3: Commit**

```bash
git add app/parent/layout.tsx
git commit -m "feat(parent): ParentShell con sidebar (conserva gate de PIN)"
```

---

### Task 17: Dashboard del padre

**Files:**
- Modify: `app/parent/page.tsx`

**Interfaces:**
- Consumes: `StatCard` (Task 6), `Progress`, tokens, `lucide-react`.

- [ ] **Step 1: Resumen general con StatCards**

Conservar toda la carga de datos (líneas 51–110). Agregar un bloque "Resumen general" con 3 `StatCard`: Hijos (`childProfiles.length`), Videos asignados (suma de `assignmentsByProfile`), Puntos totales (suma de `total_points`):

```tsx
<section className="mb-8">
  <h2 className="mb-4 text-[22px] font-bold text-foreground">Resumen general</h2>
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <StatCard value={childProfiles.length} label="Hijos" icon={<Users size={22} />} />
    <StatCard value={totalAssigned} label="Videos asignados" icon={<Video size={22} />} />
    <StatCard value={totalPoints} label="Puntos totales" icon={<Star size={22} />} />
  </div>
</section>
```

(Calcular `totalAssigned` y `totalPoints` a partir de los datos ya cargados.)

- [ ] **Step 2: Progreso por hijo**

Reemplazar las profile cards actuales (líneas 168–304) por filas "Progreso por hijo": avatar + nombre/nivel + `Progress` (videos completados / asignados) + puntos + chevron (`ChevronRight`). Conservar la lógica de `completedCount`/badges de estado (reusar `StatusChip` para el estado de cada video si se listan).

- [ ] **Step 3: Botón Agregar video**

Header con `<Button variant="primary"><Plus size={18} /> Agregar video</Button>` → `/parent/add-video`.

- [ ] **Step 4: Verificar build + screenshot**

Run: `npm run build` → OK. Comparar con mockup "Desktop — Dashboard del padre".

- [ ] **Step 5: Commit**

```bash
git add app/parent/page.tsx
git commit -m "feat(parent): dashboard con StatCards + progreso por hijo"
```

---

### Task 18: Add-video y Vouchers

**Files:**
- Modify: `app/parent/add-video/page.tsx`
- Modify: `app/parent/vouchers/page.tsx`, `app/parent/vouchers/voucher-list.tsx`

- [ ] **Step 1: Add-video**

Re-skin del formulario: inputs con tokens, botón submit `<Button variant="primary">`, headings con la escala. Conservar la lógica de submit (server action `videos`).

- [ ] **Step 2: Vouchers**

Re-skin de la gestión de premios: cards `bg-card`, toggles, botones `primary`/`tertiary`. Conservar `toggleVoucher` y la lógica de `vouchers`.

- [ ] **Step 3: Verificar build + screenshot**

Run: `npm run build` → OK.

- [ ] **Step 4: Commit**

```bash
git add app/parent/add-video app/parent/vouchers
git commit -m "feat(parent): add-video y vouchers re-skin del sistema"
```

---

## Phase 3 — Auth re-skin

### Task 19: Login, Signup, Onboarding

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/signup/page.tsx`
- Modify: `app/onboarding/onboarding-form.tsx` (+ `page.tsx` si aplica)

**Interfaces:**
- Consumes: `Button` (variantes), `Input`, tokens, `RobiPlaceholder`.

- [ ] **Step 1: Login**

Conservar `handleSubmit`/`signIn` y estados (líneas 23–39). Reemplazar: gradiente azul → `bg-background`; el `RobiPlaceholder` local (líneas 11–21) por `<RobiPlaceholder size={80} />` (Robi real ya verde); card `bg-card shadow-sm border border-border`; inputs con `focus-visible:border-primary`; botón `<Button variant="primary" className="w-full h-12">`; link de registro `text-primary`.

- [ ] **Step 2: Signup**

Mismo tratamiento que login, conservando su lógica de registro.

- [ ] **Step 3: Onboarding**

Re-skin del formulario de creación de perfil con tokens y `Button variant="primary"`. Conservar la lógica de creación (`profiles`).

- [ ] **Step 4: Verificar build + screenshot**

Run: `npm run build` → OK. Confirmar paleta verde y fuente Nunito.

- [ ] **Step 5: Commit**

```bash
git add "app/(auth)" app/onboarding
git commit -m "feat(auth): re-skin de login, signup y onboarding al sistema verde"
```

---

### Task 20: Verificación final y limpieza

- [ ] **Step 1: Grep de azules residuales**

Run: `cd ~/robi-app && grep -rn "262)" app components | grep -v node_modules`
Expected: idealmente sin resultados (todo el `oklch(... 262)` azul migrado). Revisar y migrar los que queden.

- [ ] **Step 2: Suite completa + build**

Run: `cd ~/robi-app && npm test && npm run build`
Expected: todos los tests PASS, build OK.

- [ ] **Step 3: Recorrido visual completo**

Levantar dev y recorrer el flujo kid (home → biblioteca → watch → quiz → resultados → álbum → premios) y parent (dashboard → add-video → vouchers), en desktop y mobile, comparando con los mockups. Anotar discrepancias y corregir.

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "chore(ds): limpieza de colores residuales + verificacion final"
```

---

## Self-Review (cobertura del spec)

- §2.1 Colores → Task 1. §2.2 Tipografía → Global Constraints + aplicada por pantalla. §2.3 Chips/badges → Tasks 4, 5.
- §3.1 globals.css → Task 1. §3.2 Robi → Task 2. §3.3 Primitivos → Tasks 3–8. §3.4 AppShell → Task 9.
- §4.1 Kid → Tasks 11–15. §4.2 Parent → Tasks 16–18. §4.3 Auth → Task 19.
- §5 Fases → P0/P1/P2/P3. §6 Testing → tests por primitivo + verificación visual + Task 20. §7 Fuera de alcance → respetado (sin backend, canje mock, sin landing/login pixel-perfect, sin deps nuevas).
