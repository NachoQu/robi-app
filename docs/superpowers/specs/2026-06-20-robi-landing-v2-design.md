# Robi — Landing v2 (revamp + enfoque pedagógico)

**Fecha:** 2026-06-20
**Estado:** Aprobado (diseño) — pendiente plan de implementación
**Alcance:** Rediseño de la landing de marketing existente: mejorar todas las secciones, mobile-first, agregar previews del producto hechas con componentes, y comunicar el enfoque pedagógico/científico (modelo "ver → hacer"). Reemplaza/extiende `components/landing/`.

---

## 1. Contexto y objetivo

La landing v1 (en `main`) funciona pero "necesita muchas mejoras": secciones planas, mobile flojo, falta riqueza visual y falta comunicar **por qué** el método funciona (mirás un video → después hacés una actividad; aprendizaje activo). Esta v2 sube el nivel estético, es mobile-first, usa **previews del producto** como imágenes, y suma una sección de fundamento de aprendizaje.

**Decisiones (confirmadas):**
- **Imágenes = previews del producto con componentes** (marcos tipo dispositivo que muestran video → quiz → resultado). Sin assets externos ni imágenes raster.
- **Ciencia = conceptos sólidos, sin citas.** Principios reales de aprendizaje en lenguaje para padres. **Prohibido inventar estadísticas, porcentajes o estudios.** Tono cualitativo.
- **Secciones:** revamp de las actuales + "¿Por qué funciona?" (ciencia) + CTA final + FAQ.
- Mobile-first. Sin cambios de backend/auth. Sin dependencias nuevas. Mismo routing (landing en `/` sin sesión, ya resuelto).

## 2. Estructura de componentes

Bajo `components/landing/`. Se reescriben las secciones existentes y se agregan nuevas + primitivos de preview.

**Primitivos de preview (nuevos):**
- `device-frame.tsx` — `DeviceFrame({ children, className })`: marco reutilizable (bezel redondeado, sombra) que envuelve un "screen". Estático.
- `preview-video.tsx` — `PreviewVideo()`: mock de un video (bloque con gradiente + botón play + título), dentro de un DeviceFrame.
- `preview-quiz.tsx` — `PreviewQuiz()`: la tarjeta de quiz ("¿Qué sale de un volcán?", Lava correcta) — extraída a su propio componente (hoy está inline en el hero).
- `preview-result.tsx` — `PreviewResult()`: mock del resultado (AchievementBadge + "+25 pts" + "4 de 5").

**Secciones:**
- `landing-nav.tsx` — reescrita: anclas (Cómo funciona · Por qué funciona · Beneficios · Precios · FAQ), botón "Ingresar" → `/login` y "Comenzar gratis" → `/signup`. Mobile: logo + "Comenzar gratis" (anclas ocultas < `md`). `'use client'` (smooth-scroll).
- `landing-hero.tsx` — reescrita: titular + subhead + doble CTA + `DeviceFrame`/`PreviewVideo`+`PreviewQuiz` + Robi + decorativo (colinas SVG, formas). `'use client'` (framer-motion).
- `landing-how.tsx` — reescrita como loop **Mirá → Jugá → Ganá**: 3 cards, cada una con su preview (`PreviewVideo` / `PreviewQuiz` / `PreviewResult`) + título + descripción. `id="como-funciona"`.
- `landing-science.tsx` — NUEVA. `id="por-que-funciona"`. Intro + comparación "ver pasivo ❌ vs ver + hacer ✅" + 4 cards de principios (Aprendizaje activo, Práctica de recuperación, Feedback inmediato, Refuerzo positivo). Copy cualitativo, sin cifras.
- `landing-benefits.tsx` — mejorada (3 cards niños/padres/todos). `id="beneficios"`.
- `landing-pricing.tsx` — mejorada (Gratis + Premium próximamente). `id="precios"`.
- `landing-faq.tsx` — NUEVA. `id="faq"`. Acordeón con `FaqItem` (usar `<details>`/`<summary>` nativo para no necesitar estado; estático). 5 preguntas: ¿Es seguro para mi hijo? · ¿Para qué edades? · ¿De dónde salen los videos? · ¿Necesito tarjeta de crédito? · ¿Para qué sirven los puntos?
- `landing-cta.tsx` — NUEVA. Franja final con título + "Comenzar gratis" → `/signup`.
- `landing-footer.tsx` — mejorada.
- `landing.tsx` — ensambla en orden: Nav · Hero · How · Science · Benefits · Pricing · Faq · Cta · Footer.

`landing.tsx` y las secciones estáticas pueden ser Server Components; `landing-nav` y `landing-hero` son `'use client'`. `FaqItem` con `<details>` evita JS.

## 3. Contenido de la sección "¿Por qué funciona?" (sin inventar datos)

Intro breve: "Mirar un video está bien. Pero el aprendizaje real pasa cuando el chico **hace** algo con lo que vio." Luego 4 principios (texto cualitativo, sin números ni papers):
- **Aprendizaje activo:** participar — no solo mirar — involucra más al cerebro.
- **Práctica de recuperación:** tener que recordar para responder ayuda a fijar lo aprendido mejor que releer/re-ver.
- **Feedback inmediato:** Robi marca al instante qué se entendió y qué reforzar, mientras el tema está fresco.
- **Refuerzo positivo:** completar siempre da premio; equivocarse no penaliza, así el chico se anima a intentar.

Estas afirmaciones son generales y defendibles; NO se citan estudios, porcentajes ni "está comprobado que X%". Si en el futuro se quieren datos, se agregan con fuentes reales.

## 4. Diseño visual

- Tokens del sistema (verde teal, Nunito, inks). Sin literales de color fuera de tokens. Para alpha, utilidades Tailwind (`bg-primary/10`) — nunca `var(--x)/0.3` ni `hsl(var(--hexToken))`.
- **Mobile-first:** cada sección legible y bien espaciada en pantallas chicas; el hero apila (texto arriba, preview abajo); las cards pasan a 1 columna; los previews escalan sin tapar contenido.
- Ritmo visual: alternar fondos (`bg-background` / `bg-card/40`) entre secciones, buena jerarquía tipográfica (H2 grandes, subheads muted), sombras suaves del sistema, `scroll-mt-20` para los anclas con nav sticky.
- Decorativo on-brand: colinas SVG, formas/estrellas sutiles (sin recargar). Respeta `prefers-reduced-motion`.
- Copy en español rioplatense.

## 5. Testing y verificación

- `npx tsc --noEmit` exit 0; `npm run build` pasa.
- **Verificación visual obligatoria en mobile y desktop** (es el foco): correr la app sin sesión, revisar `/` en viewport chico y grande, todos los anclas, los CTAs (Ingresar/Comenzar gratis), el acordeón FAQ, y que los previews no tapen contenido.
- Regresión de routing: con sesión, `/` sigue llevando a la app.
- Sin tests unitarios nuevos obligatorios (UI presentacional); verificación visual.

## 6. Fuera de alcance

- Login pixel-perfect / social (fase futura).
- Imágenes raster / ilustraciones generadas con IA (se usan previews por componentes).
- Estadísticas o estudios citados en la sección de ciencia.
- Pagos / Premium real.
- Cambios de backend, auth o esquema.
