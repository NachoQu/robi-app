# Robi — Landing de marketing

**Fecha:** 2026-06-20
**Estado:** Aprobado (diseño) — pendiente plan de implementación
**Alcance:** Landing de marketing pública para visitantes sin sesión. Usa el sistema de diseño Robi ya aplicado (verde teal, Nunito, tokens). Construida con componentes en `components/landing/`.

---

## 1. Contexto y objetivo

La app ya tiene su sistema de diseño aplicado (rama mergeada + pasada de consistencia). Falta la **cara pública**: hoy `app/page.tsx` redirige a `/login` cuando no hay sesión, así que un visitante nunca ve una presentación del producto. Este trabajo agrega una landing de marketing que explica qué es Robi y lleva a registro/login.

**Decisiones de alcance (confirmadas):**
- **Solo la landing.** El login NO se rediseña en esta fase (queda como está, ya re-skineado verde).
- **Sin login social.** No hay OAuth configurado en Supabase; no se agregan botones Google/Apple.
- **Precios = coming-soon** (placeholder "Gratis" + "Premium próximamente", coherente con el dialog Premium existente). Sin pagos reales.
- Sin cambios de backend ni dependencias nuevas (framer-motion, lucide-react ya están).

## 2. Routing

`app/page.tsx` es un Server Component. Cambio:
- **Sin sesión** (`!user`): en vez de `redirect('/login')`, renderiza `<Landing />`.
- **Con sesión:** se mantiene el flujo actual exacto (sin perfiles → `redirect('/onboarding')`; con perfiles → `<HomeClient />`).

Esto preserva todos los deep links y el comportamiento autenticado. CTAs de la landing: "Ingresar" → `/login`, "Comenzar gratis" → `/signup`.

## 3. Estructura de componentes

Todo bajo `components/landing/`, una sección por archivo (responsabilidad única, fáciles de componer/testear):

- `landing.tsx` — ensambla las secciones en orden; provee el contenedor y el fondo.
- `landing-nav.tsx` — barra superior: logo Robi + tagline "Aprende. Juega. Gana.", links ancla (Cómo funciona · Para padres · Beneficios · Precios), botón "Ingresar" → `/login`. Client component (smooth-scroll a anclas; sticky).
- `landing-hero.tsx` — título con palabra "aprendizaje" destacada (subrayado verde), subtítulo, CTAs ("Comenzar gratis" → `/signup`; "Ver cómo funciona" → ancla `#como-funciona`). Ilustración: `<Robi mood="idle" />` (mascota animada existente) + tarjeta de quiz mock + acentos decorativos. Animaciones de entrada con framer-motion.
- `landing-how.tsx` — sección `id="como-funciona"`: 5 pasos numerados con ícono lucide (1 Elegí un video · 2 Robi crea la actividad · 3 Jugá y aprendé · 4 Ganá puntos y badges · 5 Canjeá premios).
- `landing-benefits.tsx` — sección `id="beneficios"`: 3 cards (Para los niños · Para los padres · Para todos), cada una con ícono y copy breve.
- `landing-pricing.tsx` — sección `id="precios"`: dos planes — "Gratis" (1 perfil, lo de hoy) y "Premium" marcado "Próximamente" (deshabilitado). Sin checkout.
- `landing-footer.tsx` — © 2026 Robi · Privacidad · Términos (links placeholder).

`landing.tsx` puede ser Server Component; los hijos que necesitan interactividad (`landing-nav`, `landing-hero`) son `'use client'`. El resto puede ser estático.

## 4. Diseño visual

- Paleta y tipografía del sistema (tokens; primary `#2DBE9E`, accent `#FFC447`, etc.; Nunito). Sin literales de color fuera de tokens.
- Fondo cálido `bg-background`; secciones con buen ritmo de espaciado; cards con `bg-card` + borde/sombra suaves del sistema.
- Ilustración del hero: **aproximación on-brand** (no pixel-perfect del mockup). Compuesta con el `Robi` SVG real + una tarjeta de quiz estilada ("¿Qué sale de un volcán?" con 4 opciones, la correcta "Lava" marcada) + acentos (estrellas, trofeo) con lucide/emoji y formas SVG. Las "colinas verdes" del pie del mockup se aproximan con un SVG decorativo simple.
- **Responsive:** mobile-first; en desktop el hero es a dos columnas (texto izquierda / ilustración derecha), en mobile apila. Nav colapsa los links en pantallas chicas (los anclas pueden ocultarse < `md`, dejando logo + "Ingresar").
- Respeta `prefers-reduced-motion` en las animaciones.
- Copy en español rioplatense, consistente con la app.

## 5. Testing y verificación

- **Build/types:** `npx tsc --noEmit` exit 0; `npm run build` pasa (Landing renderiza en `/` sin sesión).
- **Verificación visual:** correr la app sin sesión y revisar `/` contra el mockup (hero, secciones, responsive desktop+mobile).
- **Regresión de routing:** con sesión, `/` sigue llevando a onboarding/selector según corresponda (no romper el flujo autenticado).
- Sin tests unitarios nuevos obligatorios (es UI presentacional estática); los anclas y CTAs se verifican visualmente.

## 6. Fuera de alcance

- Rediseño pixel-perfect del login (split con panel ilustrado) y login social (Google/Apple) → fase futura.
- Pagos / planes reales.
- Ilustración pixel-exacta del mockup (se aproxima on-brand).
- Cambios de backend, esquema o lógica de auth.
