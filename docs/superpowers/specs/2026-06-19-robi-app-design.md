# Robi — App de aprendizaje gamificado con videos de YouTube · Design Spec

**Fecha:** 2026-06-19
**Origen:** PRD Hackathon v1.0 (`PRD_hackathon_app_aprendizaje.pdf`)
**Alcance de esta sesión:** MVP end-to-end completo del scope hackathon, construido por capas.

---

## 1. Resumen

App web donde un **padre** carga la URL de un video de YouTube al perfil de su **hijo (8-10 años)**, una IA genera automáticamente un quiz de comprensión de 5 preguntas, y el niño lo juega guiado por la mascota **Robi**, acumulando puntos y badges canjeables por vales de experiencias familiares.

El foco es el **aprendizaje, no la evaluación**: no hay aprobado ni reprobado. Completar siempre otorga premio (10 pts base + 1 badge); los aciertos suman puntos extra (+5 c/u).

**Criterio de demo:** Padre carga URL → niño ve video → juega quiz → acumula puntos.

**Criterio de corte (del PRD):** si un feature no es visible en la demo del flujo padre→niño, no entra.

---

## 2. Stack y decisiones técnicas

| Componente | Herramienta | Notas |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | Deploy continuo en Vercel desde GitHub |
| UI | Tailwind CSS + shadcn/ui + Framer Motion | Estética playful/colorida; Framer para celebraciones de Robi |
| Auth + DB | Supabase | Auth email/password (padre) + Postgres con RLS |
| Lógica sensible | Server Actions / Route Handlers | Las API keys nunca llegan al cliente |
| IA (quiz + filtro) | Claude `claude-sonnet-4-6` por defecto | **Abstraída** detrás de `lib/ai/` — intercambiable por otra IA |
| Transcripción | Supadata API | Extracción confiable de transcripción desde Vercel (decisión vs librería gratuita por riesgo de bloqueo) |
| Reproductor | YouTube IFrame Player API | Detecta fin del video → muestra botón "¡Listo!" |
| Texto a voz (Robi) | Web Speech API (browser) | Nativo, sin costo; opcional/activable |

### Decisión clave — Capa de IA intercambiable

Todo el contacto con el LLM vive en `lib/ai/` detrás de una interfaz única:

```ts
interface AIProvider {
  filterContent(transcript: string): Promise<{ safe: boolean; reason?: string }>
  generateQuiz(transcript: string): Promise<QuizQuestion[]>
}
```

El default es un `ClaudeProvider` (modelo `claude-sonnet-4-6`). Cambiar de proveedor = implementar la interfaz en un archivo nuevo y cambiar una línea de wiring. Ningún componente de UI ni server action conoce el proveedor concreto.

### Decisión clave — Modelo de sesión y seguridad

- El **padre** se autentica con Supabase Auth (email + contraseña).
- Los **perfiles de hijos NO tienen login propio**: son filas que se seleccionan en el cliente dentro de la sesión ya autenticada del padre.
- Esto mantiene **RLS activo siempre**, con todas las tablas scopeadas a `auth.uid()`. Es la opción más segura y simple para 2 días.
- El **PIN del adulto** es una barrera de UI para entrar al panel de gestión (`/parent`), no una segunda capa de auth. Se guarda hasheado.

### Decisión clave — Botón al finalizar el video (no detección automática)

El botón "¡Listo! Hacer la actividad" aparece cuando el reproductor reporta fin de video, pero **la acción la toma el niño**. Evita problemas con pausas, outros y la pantalla de sugeridos de YouTube.

---

## 3. Modelo de datos (Supabase)

Todas las tablas con **RLS** restringido a `user_id = auth.uid()` (directa o vía join a `child_profiles`/`videos`).

| Tabla | Campos principales | Notas |
|---|---|---|
| `child_profiles` | id, user_id, name, avatar, age, total_points, created_at | Pertenece al padre autenticado |
| `videos` | id, user_id, youtube_url, youtube_id, title, status, transcript, created_at | `status`: `processing` \| `ready` \| `rejected`. Se procesa **una sola vez** por (user_id, youtube_id) |
| `video_assignments` | id, video_id, child_profile_id, assigned_at | M:N. Un video se asigna a varios hijos sin reprocesar |
| `quiz_questions` | id, video_id, question_text, options (jsonb: string[4]), correct_index (0-3), source_quote | Generadas por IA; `source_quote` = fragmento literal del transcript para validar anclaje |
| `activities` | id, child_profile_id, video_id, base_points, bonus_points, answers (jsonb), completed_at | Una fila por sesión de quiz completada |
| `badges` | id, child_profile_id, video_id, earned_at | Un badge por video completado |
| `vouchers` | id, user_id, title, description, points_cost, is_active | Catálogo de vales del padre (seed predefinido) |
| `redemptions` | id, child_profile_id, voucher_id, redeemed_at | La tabla existe; **el canje es mock en hackathon** (ver §6) |
| `parent_settings` | user_id (PK), pin_hash | PIN del panel del adulto, hasheado |

`email`/`password` los maneja Supabase Auth — no se replica una tabla `users`.

### Límites free tier (palanca de conversión del PRD)
- **1 perfil de hijo** por cuenta. Agregar un 2º requiere versión paga (se muestra CTA, no se implementa pago).
- **5 videos por perfil**, sin posibilidad de eliminar para liberar espacio.
- Ambos límites se validan en el **server** antes de insertar.

---

## 4. Pipeline de procesamiento de video

Ejecutado en un Server Action al cargar una URL. El video pasa por estados `processing → ready | rejected`.

```
1. Validar URL y extraer youtube_id.
2. ¿Existe ya un video con (user_id, youtube_id)?
   SÍ y status=ready → solo crear video_assignment (no reprocesar, no llamar APIs). FIN.
3. Crear video con status=processing.
4. Supadata: obtener transcripción.
   Sin transcripción → status=rejected, mensaje "Este video no tiene subtítulos, probá con otro".
5. Claude #1 (filtro de contenido) sobre el transcript.
   Inapropiado → status=rejected, mensaje claro al padre.
6. Claude #2 (generación de quiz): 5 preguntas opción múltiple (1 correcta + 3 incorrectas),
   cada una con source_quote = fragmento literal del transcript.
7. Validación de anclaje: cada source_quote debe encontrarse (normalizado) dentro del transcript.
   Falla → re-generar 1 vez; si vuelve a fallar → status=rejected con aviso.
8. status=ready, persistir quiz_questions, crear video_assignment.
```

Durante el procesamiento, el padre ve un **estado de carga con Robi animado** (mitiga el Riesgo 4: latencia de la IA percibida como error).

El paso 2 implementa la decisión "videos entre hermanos": un video se procesa una vez y se reasigna por la tabla intermedia.

### Mitigación de riesgos del PRD
- **R1 (alucinaciones de transcripción):** filtro de contenido (Claude #1) **antes** de generar el quiz. Se construye desde el día 1.
- **R2 (sin transcripción):** rechazo explícito + para la demo se prepara un set de URLs verificadas.
- **R3 (calidad de preguntas):** validación de anclaje + se valida el prompt con 3-5 videos reales antes de la demo.
- **R4 (latencia):** loader con Robi animado.

---

## 5. Pantallas y flujos

```
/login, /signup ............... auth del padre (Supabase)
/onboarding ................... crear 1er perfil (obligatorio) → cargar 1er video (sugerido, salteable)
/ (home) ...................... selección de perfiles: tarjetas (avatar + nombre + puntos) + acceso PIN al panel adulto
/kid/[profileId] .............. panel del niño: biblioteca (estado visto/no visto), puntos, accesos a álbum y premios
/kid/[profileId]/watch/[videoId] .. reproductor YouTube → botón "¡Listo! Hacer la actividad" al finalizar
/kid/[profileId]/quiz/[videoId] ... quiz con Robi: 5 preguntas, feedback inmediato, barra de progreso, TTS opcional
/kid/[profileId]/result ........... resultado: badge obtenido + puntos ganados + total acumulado + Robi celebra
/kid/[profileId]/album ............ colección visual de badges (tipo álbum)
/kid/[profileId]/rewards .......... catálogo de vales + canje (MOCK)
/parent (tras PIN) ............ dashboard del adulto: gestión de perfiles, asignar videos, progreso por hijo, gestión de vales
```

### Flujo del padre
1. Registro (email + contraseña) → cuenta familiar.
2. Onboarding obligatorio: crear primer perfil de hijo (nombre + avatar).
3. Desde `/parent` (tras PIN): selecciona perfil, pega URL, confirma explícitamente que revisó el video y es apto.
4. Corre el pipeline (§4). Preview opcional de preguntas (no bloqueante).
5. El video queda en la biblioteca del perfil. Hasta 5 por perfil.

### Flujo del niño
1. Toca su avatar en la home (sin contraseña).
2. Ve su biblioteca con estado visual visto/no visto.
3. Elige un video y lo reproduce.
4. Al finalizar → botón "¡Listo! Hacer la actividad".
5. Responde el quiz guiado por Robi (progreso preguntas respondidas/total, feedback inmediato).
6. Al completar: premio garantizado (badge + 10 pts) + puntos por aciertos.
7. Robi celebra en la pantalla de resultado; ve su total acumulado.
8. Vuelve a la biblioteca o al álbum/premios.

---

## 6. Gamificación

Lógica centralizada en `lib/scoring.ts`.

- **Badge coleccionable:** 1 por video completado, **siempre** (por ver el video y terminar el quiz, sin importar aciertos). Vinculado al tema del video. Se suma al álbum.
- **Puntos:** 10 base **siempre** por completar + 5 por cada respuesta correcta.
- **5 preguntas por quiz.** Rango por video: **mín 10 pts + 1 badge / máx 35 pts + 1 badge**.
- Al completar: insertar `activities`, insertar `badge`, actualizar `child_profiles.total_points` (operación atómica vía función RPC de Postgres para evitar condiciones de carrera).

### Canje de vales — MOCK en hackathon
- Pantalla de premios completa: catálogo de vales (`vouchers` seed) + puntos acumulados del niño.
- Botón de canje **funcional a nivel UI**: se ve, se toca, muestra confirmación visual animada.
- **No** escribe `redemptions` ni descuenta puntos. La lógica real (confirmación del padre, historial, descuento, vales personalizados) es segunda etapa.

---

## 7. Robi (mascota)

- Renderizado como **ilustración SVG** con estados de ánimo (idle, pensando/cargando, celebrando, animando). Animaciones con Framer Motion / CSS.
- Aparece en: loader de procesamiento, guía del quiz, y pantalla de resultado (celebración).
- **TTS opcional:** Web Speech API lee preguntas y opciones en voz alta; activable con un toggle, no obligatorio.
- Generación de los assets de Robi: a definir en implementación (ilustración SVG propia o generada). No bloqueante para la lógica.

---

## 8. Manejo de errores

| Caso | Comportamiento |
|---|---|
| URL inválida / no es YouTube | Validación inmediata, mensaje al padre |
| Video sin transcripción | `status=rejected`, "Este video no tiene subtítulos, probá con otro" |
| Contenido inapropiado | `status=rejected`, mensaje claro |
| Quiz sin anclaje válido | Re-generar 1 vez; si falla, `rejected` con aviso |
| Falla de Supadata o IA (red/timeout) | Reintento; estado de error amable con Robi, opción de reintentar (no romper demo) |
| Límite free tier alcanzado | Bloquear con CTA a versión paga |

---

## 9. Fuera de alcance (segunda etapa)

Modo voz (niño le explica a Robi oralmente), quiz interactivo durante la reproducción, freemium con pagos reales, vales personalizados por el padre, multi-idioma, transcripción propia desde audio, notificaciones al padre, métricas avanzadas, lógica real de canje.

---

## 10. Estructura de proyecto (propuesta)

```
app/
  (auth)/login, signup
  onboarding/
  (home)/page.tsx                 # selección de perfiles
  kid/[profileId]/...             # mundo del niño
  parent/...                      # panel del adulto (tras PIN)
lib/
  ai/                             # interfaz AIProvider + ClaudeProvider (intercambiable)
  supabase/                       # clientes server/client + tipos
  youtube/                        # parse de URL, transcripción (Supadata)
  scoring.ts                      # lógica de puntos/badges
components/
  robi/                           # mascota + estados de ánimo
  ui/                             # shadcn
supabase/
  migrations/                     # schema + RLS + RPC de puntos + seed de vouchers
```
