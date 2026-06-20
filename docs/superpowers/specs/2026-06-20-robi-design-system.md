# Robi — Aplicación del sistema de diseño

**Fecha:** 2026-06-20
**Estado:** Aprobado (diseño) — pendiente plan de implementación
**Alcance:** Rebuild completo de las pantallas in-app según el sistema de diseño Robi, responsive (desktop + mobile).

---

## 1. Contexto y objetivo

La app hoy usa una paleta **azul** (sky-indigo, hue 262) con estilos `style={{ oklch(...) }}` inline distribuidos por todas las pantallas, layout **mobile-first** y un Robi SVG en azul. El nuevo sistema de diseño define una identidad **verde teal** con layouts **desktop/tablet con sidebar**.

El objetivo es aplicar ese sistema de diseño construyendo una **capa real de design system** (tokens + primitivos reutilizables) y reconstruyendo las pantallas componiendo esos primitivos, en lugar de re-stylear inline pantalla por pantalla.

**Decisiones de alcance (confirmadas):**
- Enfoque: **A — Design system + primitivos** (con criterio YAGNI: solo extraer lo que se repite).
- Responsive: **desktop + mobile** (sidebar en `lg+`, colapsa a bottom-nav/drawer en mobile).
- Pantallas: **foundation + todo in-app** (kid + parent) + sus hermanas. Auth solo re-skin de tokens/primitivos.
- **Fuera de alcance (próxima fase):** landing de marketing + login pixel-perfect (Google/Apple). Sin cambios de backend/datos. Canje de premios sigue mock.

---

## 2. Sistema de diseño (fuente de verdad)

### 2.1 Colores

| Token | Hex | Uso |
|---|---|---|
| `--robi-primary` | `#2DBE9E` | botón primario, headings, foco, Robi |
| `--robi-secondary` | `#7ED957` | botón secundario, progreso, estado "completado" |
| `--robi-accent` | `#FFC447` | chip "Nuevo", badge estrella, destacados |
| `--robi-coral` | `#FF7A59` | errores/alertas suaves, highlights |
| `--robi-blue` | `#4CA3F7` | chip "En progreso", badge gema |
| `--background` | `#FAF7F2` | fondo cálido global |
| `--foreground` | slate oscuro (`#243B36`-ish) | texto principal |

Cada color tiene su `*-foreground` para contraste. Los semánticos de shadcn (`--primary`, `--secondary`, `--accent`, `--destructive`, `--ring`, `--card`, `--border`, `--input`, charts, sidebar) se mapean a estos valores. Radio generoso: `--radius: 1rem`. Modo dark con la misma traducción tonal.

### 2.2 Tipografía

**Nunito Rounded** ≙ la familia **Nunito** ya cargada en `app/layout.tsx` (Nunito es la variante humanista redondeada). **No cambia la fuente.** Se formaliza la escala:

| Nivel | Tamaño | Peso |
|---|---|---|
| H1 | 28px | Bold (700) |
| H2 | 22px | Bold (700) |
| H3 | 18px | Semi Bold (600) |
| Body | 16px | Regular (400) |
| Small | 14px | Regular (400) |

Se aplica vía clases Tailwind consistentes (no se inventan utilidades nuevas salvo necesidad).

### 2.3 Estados y badges

- **Chips de estado:** `nuevo` (amarillo/accent), `en-progreso` (azul), `completado` (verde/secondary). Fondo suave + punto + label.
- **Badges de logro:** estrella (gold/accent), escudo (verde), gema (azul). Estados ganado/bloqueado.

---

## 3. Foundation (P0)

### 3.1 `app/globals.css`
Reescribir el bloque `:root` y `.dark` con los tokens de §2.1, manteniendo la estructura `@theme inline` existente. Agregar variables `--robi-secondary`, `--robi-blue` y sus `*-foreground`.

### 3.2 Robi SVG — `components/robi/Robi.tsx`
Recolorear de hue 262 (azul) a teal/verde:
- Cabeza y cuerpo: crema (`#F5F3EE`-ish) con contorno teal.
- Pantalla interna: teal oscuro.
- Ojos y sonrisa: verde (`--robi-secondary`).
- Antena, orejas, brazos, piernas: teal-verde.
- Pecho: **estrella verde** (reemplaza las 3 luces de estado).

Moods mapeados al sistema (4 personalidades): `idle` = **¡Hola!** (saludo), `thinking` = **¡Mmm!**, `celebrate` = **¡Genial!**, y nuevo `encourage` = **¡Casi!** (respuesta errada, gesto alentador). Respeta `prefers-reduced-motion`.

### 3.3 Primitivos — `components/ui` y `components/robi`
- **`Button`** (`ui/button.tsx`): variantes `primary` (verde sólido, texto blanco, flecha trailing opcional), `secondary` (verde claro, texto verde oscuro), `tertiary` (outline verde, fondo transparente). Vía `cva`. Mantener compat con usos actuales.
- **`StatusChip`** (nuevo): prop `status: 'nuevo' | 'en-progreso' | 'completado'`.
- **`AchievementBadge`** (nuevo): prop `kind: 'star' | 'shield' | 'gem'`, `locked?: boolean`.
- **`ProgressBar`** (`ui/progress.tsx`): restyle track verde.
- **`StatCard`** (nuevo): número grande + label + ícono.
- **`RewardCard`** (nuevo): ícono/emoji, nombre, puntos, botón Canjear.
- **`VideoCard`** (nuevo): thumbnail, duración, título, `StatusChip`.
- **Íconos:** usar `lucide-react` (ya instalado, `^1.21.0`) para el chrome (home, play, trophy, star, gift, user, heart, book, settings). Emojis solo para avatares de chicos.

### 3.4 `AppShell` — `components/shell/`
Layout responsive con sidebar. Dos configuraciones:
- **`KidShell`**: nav = Inicio · Biblioteca · Premios · Perfil; footer = switcher de perfil (avatar + nivel). Mobile → **bottom tab bar**.
- **`ParentShell`**: nav = Panel · Videos · Hijos · Ajustes; footer = Cerrar sesión. Reemplaza el header actual de `app/parent/layout.tsx`. Mobile → **top bar + drawer**.

Sidebar fijo en `lg+`; colapsa en pantallas chicas. Conserva el gate por PIN existente del parent layout.

---

## 4. Pantallas

### 4.1 Kid (P1)
- **Biblioteca** (`app/kid/[profileId]/page.tsx`): `KidShell` + header (avatar, "¡Hola, {nombre}!", nivel, `ProgressBar` 60%, pill de puntos, botón "Ver premios") + "Tus videos" grid de `VideoCard` con `StatusChip`. Conserva la lógica de carga de videos/actividades.
- **Quiz** (`app/kid/[profileId]/quiz/[videoId]`): dots de progreso (N/total), Robi guía a un lado ("¡Piénsalo bien!"), pregunta H2, grid 2×2 de opciones con check en seleccionada, fondo cielo/colina. Lógica de scoring intacta.
- **Resultados** (`app/kid/[profileId]/result`): confeti, `AchievementBadge`, "¡Excelente!", "+N pts", "X de Y correctas", Robi `celebrate`, dos botones (Seguir aprendiendo = primary, Ver premios = tertiary).
- **Álbum** (`app/kid/[profileId]/album`): grid de `AchievementBadge` (ganados/bloqueados).
- **Premios kid** (`app/kid/[profileId]/rewards`): header de puntos, tabs Catálogo/Mis canjes, grid de `RewardCard`. Canje mock.
- **Watch** (`app/kid/[profileId]/watch/[videoId]`): restyle del reproductor + botón de finalización.
- **Home / selector de perfil** (`components/home-client.tsx`): restyle a la nueva paleta y primitivos.

### 4.2 Parent (P2)
- **Dashboard** (`app/parent/page.tsx`): `ParentShell` + "Resumen general" con `StatCard` (Hijos, Videos asignados, Puntos totales) + "Progreso por hijo" (avatar, nivel, `ProgressBar`, videos completados, puntos, chevron) + botón "Agregar video". Conserva la lógica de carga.
- **add-video** (`app/parent/add-video`): restyle del formulario.
- **vouchers** (`app/parent/vouchers`): restyle de gestión de premios.

### 4.3 Auth — solo re-skin (P3)
`login`, `signup`, `onboarding`: swap a tokens verdes + nuevos `Button`/`Input`, manteniendo layout actual. (Landing y login pixel-perfect = próxima fase.)

---

## 5. Fases de implementación

- **P0 Foundation:** tokens, Robi recolor, primitivos, `AppShell`, íconos.
- **P1 Kid:** biblioteca, quiz, resultados, álbum, premios, watch, home.
- **P2 Parent:** dashboard, add-video, vouchers.
- **P3 Auth re-skin:** login, signup, onboarding.

Cada fase es verificable de forma independiente (la P0 habilita el resto).

---

## 6. Testing y verificación

- **Unit (vitest):** `Button` renderiza cada variante; `StatusChip` mapea status→estilo; `scoring` y server actions quedan sin cambios funcionales.
- **Visual:** correr la app y comparar cada pantalla contra el mockup vía screenshots.
- **Regresión:** la lógica de quiz/scoring, carga de datos y gate de PIN no cambia de comportamiento.

---

## 7. Fuera de alcance

- Landing de marketing y login pixel-perfect (Google/Apple) → próxima fase.
- Cambios de backend, esquema de datos o lógica de IA.
- Canje real de premios (sigue siendo mock).
- Nuevas dependencias (todo lo necesario ya está instalado).
