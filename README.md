# 🤖 Robi — App de aprendizaje gamificado con videos de YouTube

App web donde un **padre/madre** carga la URL de un video de YouTube al perfil de su hijo/a (8–10 años), una **IA genera automáticamente un quiz** de comprensión, y el niño/a lo juega guiado por la mascota **Robi**, acumulando puntos y badges canjeables por vales de experiencias familiares.

El foco es el **aprendizaje, no la evaluación**: no hay aprobado ni reprobado. Completar siempre da premio (10 pts + 1 badge); los aciertos suman puntos extra.

> Proyecto de hackathon (2 días). Toda la UI está en **español**.

---

## 📋 TL;DR para un colega nuevo

1. Cloná el repo y corré `npm install`.
2. Copiá `.env.local.example` → `.env.local` y completá las keys (ver [Variables de entorno](#-variables-de-entorno)).
3. `npm run dev` → http://localhost:3000
4. La base de datos ya está creada en Supabase (proyecto `vcb2026`). El schema vive en `supabase/migrations/`.
5. **Antes de tocar código, leé el spec y el plan**: `docs/superpowers/specs/` y `docs/superpowers/plans/`. Ahí está TODO el diseño y la descomposición en tareas.

---

## 🎯 El flujo (criterio de demo)

**Padre carga URL → niño ve el video → juega el quiz → acumula puntos.**

- **Padre:** se registra → crea el perfil del hijo (onboarding obligatorio) → desde el panel (protegido por PIN) pega una URL de YouTube y confirma que es apta → el sistema genera el quiz.
- **Niño:** toca su avatar (sin contraseña) → ve su biblioteca → mira el video → al terminar toca "¡Listo! Hacer la actividad" → responde 5 preguntas con Robi → gana badge + puntos → los canjea por vales (mock en hackathon).

---

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) |
| UI | Tailwind CSS v4 + shadcn/ui + Framer Motion + lucide-react |
| Diseño | Sistema de diseño Robi (tokens verde teal + primitivos) — ver abajo |
| Auth + DB | **Supabase** (Auth email/password + Postgres con RLS) |
| IA (quiz + filtro) | **OpenRouter** (modelos gratis; default `openai/gpt-oss-120b:free`) — detrás de una capa intercambiable |
| Transcripción YouTube | **Supadata API** |
| Texto a voz (Robi) | Web Speech API del browser |
| Reproductor | YouTube IFrame Player API |
| Deploy | **Vercel** |
| Tests | Vitest |

---

## 🏗️ Arquitectura — decisiones clave

### Capa de IA intercambiable (`lib/ai/`)
Todo el acceso al LLM pasa por la interfaz `AIProvider` (`filterContent` + `generateQuiz`). **`lib/ai/index.ts` es el ÚNICO punto de swap.** Hoy usa `OpenRouterProvider` (modelos free) con una **cadena de fallback** (si un modelo da 429/404, prueba el siguiente). `ClaudeProvider` sigue en el repo por si se quiere volver a Anthropic — se cambia una línea. Cambiar de IA = tocar un solo archivo.

### Modelo de sesión / seguridad
- El **padre** se autentica con Supabase Auth.
- Los **perfiles de hijos NO tienen login propio**: son filas que se seleccionan dentro de la sesión del padre. Esto mantiene **RLS activo siempre** (todo scopeado a `auth.uid()`).
- El **PIN del adulto** es una barrera de UI para entrar al panel `/parent` (se guarda hasheado con SHA-256, cookie `parent_unlocked` httpOnly de 30 min). No es una segunda capa de auth.

### Pipeline de procesamiento de video (`actions/videos.ts`)
`processVideo()` orquesta: validar URL → de-dupe (un video se procesa **una sola vez**, se reasigna a otros perfiles vía `video_assignments`) → transcripción (Supadata) → filtro de contenido (IA) → generar quiz (IA) → **validar anclaje** (cada pregunta debe citar un fragmento literal del transcript) → reintento → guardar. Manejo de errores robusto: ningún video queda colgado en `processing`; si algo falla se marca `rejected` con mensaje amable.

### Gamificación
10 pts base **siempre** + 5 por acierto (máx 35) + 1 badge por video. La escritura de puntos es atómica vía la función RPC `complete_activity` en Postgres (evita condiciones de carrera). Lógica en `lib/scoring.ts`.

### Sistema de diseño Robi (`app/globals.css` + `components/`)
Identidad **verde teal**, fuente **Nunito**. Todo color sale de **tokens CSS** definidos en `app/globals.css` (no hay literales `oklch`/hex sueltos en los componentes).

- **Paleta:** `--robi-primary` `#2DBE9E` · `--robi-secondary` `#7ED957` · `--robi-accent` `#FFC447` · `--robi-coral` `#FF7A59` · `--robi-blue` `#4CA3F7` · fondo `#FAF7F2`. Mapeados también a los tokens semánticos de shadcn (`--primary`, `--accent`, etc.).
- **Tokens de "tinta":** `--robi-accent-ink` / `--robi-blue-ink` / `--robi-success-ink` para texto oscuro legible sobre fondos tintados claros (chips, pills).
- **Primitivos** (`components/ui/`): `Button` (variantes `primary`/`secondary`/`tertiary`), `StatusChip`, `AchievementBadge`, `StatCard`, `RewardCard`, `VideoCard`, `Progress`.
- **Shell responsive** (`components/shell/`): `AppShell` (sidebar en `lg+`, bottom-nav en mobile) con wrappers client `KidShell` y `ParentShell` (mantienen los íconos lucide dentro del límite client, las páginas Server solo pasan props serializables).
- **Mascota:** `components/robi/Robi.tsx` — SVG animado con moods `idle | thinking | celebrate | talking | encourage` (respeta `prefers-reduced-motion`).
- **Regla de opacidad (Tailwind v4):** usar utilidades (`bg-primary/10`) — compilan a `color-mix` y funcionan con tokens hex. **Nunca** `var(--token)/0.3` ni `hsl(var(--hexToken))` en estilos inline (rompen con tokens hex).

---

## 🔐 Variables de entorno

Copiá `.env.local.example` → `.env.local` y completá:

```bash
NEXT_PUBLIC_SUPABASE_URL=        # URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon/publishable key
SUPABASE_SERVICE_ROLE_KEY=       # (opcional, no se usa: todo va por anon + RLS)
OPENROUTER_API_KEY=              # key de OpenRouter (https://openrouter.ai)
OPENROUTER_MODEL=openai/gpt-oss-120b:free   # modelo free por defecto
SUPADATA_API_KEY=                # key de Supadata (https://supadata.ai) para transcripciones
```

> Las keys de IA y Supadata son **server-only**: nunca se exponen al cliente. En Vercel se cargan en Settings → Environment Variables.

---

## 🚀 Setup local

```bash
npm install
cp .env.local.example .env.local   # y completar las keys
npm run dev                        # http://localhost:3000
npm test                           # corre la suite de Vitest
npm run build                      # build de producción (usa Webpack, ver Gotchas)
```

### Base de datos
El schema, las políticas RLS y la función RPC están en `supabase/migrations/` (`0001`–`0003`). Ya están aplicadas en el proyecto Supabase `vcb2026` (`xzmubytzyubxmhlgpmyd`). Para recrear en otro proyecto, aplicá esos `.sql` en orden y regenerá los tipos:

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > lib/supabase/types.ts
```

> ⚠️ Para que el **signup loguee directo**, hay que **apagar "Confirm email"** en Supabase → Auth → Email.

---

## 📁 Estructura del proyecto

```
app/
  (auth)/login, signup       # auth del padre
  onboarding/                # crear 1er perfil (server-guard: si ya hay perfil, redirige)
  page.tsx                   # / → Landing (sin sesión) | selección de perfiles + gate de PIN (con sesión)
  parent/                    # panel del adulto (ParentShell + cookie de PIN)
  kid/[profileId]/           # mundo del niño (biblioteca, reproductor, quiz, resultado, álbum, premios)
  globals.css                # tokens del sistema de diseño (paleta + inks + shadcn)
actions/                     # Server Actions: auth, profiles, pin, videos, quiz, vouchers
lib/
  ai/                        # AIProvider + OpenRouterProvider + ClaudeProvider + prompts (capa intercambiable)
  supabase/                  # clientes server/client + tipos generados
  youtube/                   # parseo de URL + transcripción (Supadata)
  scoring.ts                 # lógica de puntos/badges
components/
  landing/                   # landing de marketing pública (nav, hero, cómo funciona, beneficios, precios, footer)
  shell/                     # AppShell responsive + KidShell / ParentShell
  robi/Robi.tsx              # mascota SVG animada (moods)
  robi-placeholder.tsx       # wrapper de Robi (compat con call-sites existentes)
  ui/                        # shadcn + primitivos del sistema (Button, StatusChip, AchievementBadge, StatCard, RewardCard, VideoCard, Progress)
proxy.ts                     # auth/route-protection (Next 16: reemplaza middleware, corre en Node runtime)
supabase/migrations/         # schema + RLS + RPC
docs/superpowers/            # 👈 specs de diseño + planes de implementación (LEER PRIMERO)
```

---

## ⚠️ Gotchas (cosas que ya resolvimos — no las re-rompas)

1. **Build con Webpack, no Turbopack.** El script `build` usa `next build --webpack` a propósito. El runtime de Turbopack en Next 16 referencia `__dirname` y **rompe en el serverless de Vercel** (`ReferenceError: __dirname is not defined`). Webpack es el camino estable.
2. **`proxy.ts`, no `middleware.ts`.** Next 16 deprecó `middleware` (corría en Edge runtime, que no tiene `__dirname`) en favor de `proxy`, que corre en **Node.js runtime**. La protección de rutas + refresh de sesión Supabase vive ahí.
3. **`outputFileTracingRoot`** está fijado en `next.config.ts` para que Next no infiera mal el workspace root cuando hay otros `package-lock.json` en directorios padre.

---

## 🌳 Trabajar en una rama

```bash
git checkout -b feat/tu-feature
# ... cambios ...
npm test && npm run build      # dejá la rama verde antes de pushear
git push -u origin feat/tu-feature
```

- `main` es la rama de **producción** (Vercel deploya `main` a la URL de producción).
- Para una preview pública de tu rama hay que tener **Deployment Protection** apagada en Vercel (Settings → Deployment Protection), si no las URLs piden login de Vercel.
- El plan de implementación (`docs/superpowers/plans/`) está descompuesto en tareas numeradas; si retomás trabajo, fijate qué tareas faltan ahí.

---

## 📊 Estado actual

**Terminado y testeado** (suite verde, build limpio):
- ✅ Base de datos completa en Supabase (9 tablas + RLS + RPC de puntos)
- ✅ Capa de IA intercambiable (OpenRouter free + fallback) — verificada en vivo
- ✅ Pipeline de procesamiento de video (transcripción → filtro → quiz → anclaje)
- ✅ Auth (login/signup) + onboarding (crear perfil)
- ✅ Mundo del niño completo: biblioteca + reproductor + quiz con Robi + resultado + álbum + premios (canje mock)
- ✅ Panel del adulto: dashboard con StatCards + progreso por hijo, cargar video, gestión de vales
- ✅ Mascota Robi animada (SVG con moods) — reemplazó el placeholder 🤖
- ✅ **Sistema de diseño Robi** aplicado a toda la app (paleta verde teal, primitivos, AppShell responsive)
- ✅ **Landing de marketing** pública en `/` (sin sesión)
- ✅ Deploy en Vercel funcionando

**Pendiente / próxima fase:**
- ⏳ Login pixel-perfect (layout partido con panel ilustrado, según el primer mockup)
- ⏳ Login social Google/Apple (requiere habilitar OAuth en Supabase)
- ⏳ Premium real (hoy es placeholder "próximamente")
- ⏳ Logout visible en mobile (el footer del `AppShell` hoy solo aparece en el sidebar desktop)

---

## 📚 Documentación de diseño

Specs (el *qué*) y planes (el *cómo*, descompuesto en tareas):

- **App base:** `specs/2026-06-19-robi-app-design.md` · `plans/2026-06-19-robi-app.md`
- **Sistema de diseño:** `specs/2026-06-20-robi-design-system.md` · `plans/2026-06-20-robi-design-system.md`
- **Landing de marketing:** `specs/2026-06-20-robi-landing-design.md` · `plans/2026-06-20-robi-landing.md`

Todos viven en `docs/superpowers/`. Si vas a sumarte al proyecto, empezá por ahí.
