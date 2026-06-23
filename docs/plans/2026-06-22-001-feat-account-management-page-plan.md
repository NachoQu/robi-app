---
title: "feat: Página de gestión de cuenta del panel adulto"
date: 2026-06-22
type: feat
depth: Standard
---

# feat: Página de gestión de cuenta del panel adulto

**Resumen:** Crear `/parent/account` con tres secciones: gestión de perfiles de niños (editar nombre/avatar, eliminar), gestión del PIN del panel adulto, y acciones de cuenta (email, cambiar contraseña, cerrar sesión).

---

## Contexto del problema

Actualmente el panel adulto no tiene un lugar centralizado para gestionar la configuración. El PIN se puede gestionar desde un dropdown en el header, los perfiles de niños no son editables una vez creados, y el cierre de sesión vive suelto en el sidebar. La página `/parent/account` consolida todo esto en un lugar lógico y esperado.

---

## Requisitos

- R1: El adulto puede editar nombre y avatar de un perfil de niño existente.
- R2: El adulto puede eliminar un perfil de niño (con confirmación).
- R3: El adulto puede gestionar el PIN (crear, cambiar, eliminar) desde esta página.
- R4: La página muestra el email de la cuenta (solo lectura).
- R5: El adulto puede solicitar un email de cambio de contraseña.
- R6: El adulto puede cerrar sesión desde esta página.
- R7: La página es accesible desde la nav del panel adulto.

---

## Decisiones técnicas clave

**Edición de perfil de niño como dialog inline:** Se usa un `Dialog` (ya existe en `components/ui/dialog.tsx`) con un input de nombre y un picker de avatar (emojis). Evita navegar a otra página para una edición simple.

**Reutilización de `ManagePinDialog`:** El componente `components/manage-pin-dialog.tsx` ya implementa el flujo completo de PIN (verificar contraseña → menú → cambiar/eliminar). Se reutiliza directamente desde la página de cuenta, sin duplicar lógica.

**`/parent/account` como Server Component con Client Islands:** La página carga datos en el servidor (perfiles, email, estado del PIN) y pasa props a componentes client para los dialogs y acciones interactivas.

**Cambio de contraseña vía Supabase reset email:** Se llama a `supabase.auth.resetPasswordForEmail()` con el email del usuario. No requiere formulario inline — un server action dispara el envío y muestra un toast de confirmación.

**Eliminar perfil:** Se necesita decidir si la eliminación en cascada de `video_assignments` y `activities` la maneja la DB (FK con `ON DELETE CASCADE`) o el server action. Se verifica en implementación.

---

## Scope

**Incluido:**
- Página `/parent/account` con las tres secciones del mockup
- Dialog de edición de perfil (nombre + avatar picker)
- Dialog de confirmación de eliminación de perfil
- Integración del `ManagePinDialog` existente
- Link "Cuenta" en la nav del panel adulto
- Server actions para update/delete de perfil y reset de contraseña

**Fuera de scope:**
- Editar el email de la cuenta
- Subir foto de perfil (solo emojis como avatares)
- Eliminar la cuenta completa

---

## Unidades de implementación

### U1. Server actions para gestión de perfiles de niños

**Goal:** Agregar las acciones de servidor `updateChildProfile` y `deleteChildProfile`.

**Requirements:** R1, R2

**Dependencies:** ninguna

**Files:**
- `actions/child-profiles.ts` (nuevo)

**Approach:**
- `updateChildProfile(profileId, { name, avatar })`: valida que el perfil pertenece al usuario autenticado antes de actualizar.
- `deleteChildProfile(profileId)`: valida ownership, elimina el registro. Si la DB no tiene cascada, eliminar primero `video_assignments` y `activities` del perfil.
- Ambas retornan `{ ok: boolean; error?: string }`.

**Patterns to follow:** `actions/pin.ts` — misma estructura de retorno y validación de usuario.

**Test scenarios:**
- `updateChildProfile` con datos válidos actualiza nombre y avatar en la DB.
- `updateChildProfile` con un `profileId` de otro usuario retorna `{ ok: false }` (no actualiza).
- `deleteChildProfile` con `profileId` válido elimina el perfil y sus datos relacionados.
- `deleteChildProfile` con `profileId` de otro usuario retorna `{ ok: false }`.

**Verification:** Las acciones pueden testearse con Supabase local o probando manualmente desde la UI en U3.

---

### U2. Server action para reset de contraseña

**Goal:** Agregar `sendPasswordResetEmail` que dispara el email de Supabase.

**Requirements:** R5

**Dependencies:** ninguna

**Files:**
- `actions/auth.ts` (agregar función, ya existe el archivo)

**Approach:**
- Llama a `supabase.auth.resetPasswordForEmail(userEmail, { redirectTo })`.
- Retorna `{ ok: boolean }`.
- Se invoca desde un botón en la UI que muestra un toast de confirmación con `sonner`.

**Patterns to follow:** Patrón de `signOut` en `actions/auth.ts`.

**Test scenarios:**
- Con usuario autenticado, la acción dispara el envío y retorna `{ ok: true }`.
- El email recibido contiene un link de reset funcional.

**Verification:** Probar manualmente con cuenta real o cuenta de Supabase local.

---

### U3. Componente `AccountPageClient` con dialogs de perfiles

**Goal:** Componente client que renderiza la sección de perfiles con los dialogs de edición y eliminación.

**Requirements:** R1, R2

**Dependencies:** U1

**Files:**
- `app/parent/account/account-page-client.tsx` (nuevo)

**Approach:**
- Recibe `profiles: ChildProfile[]` como prop.
- Estado local: `editingProfile | null` y `deletingProfile | null` para controlar qué dialog está abierto.
- Dialog de edición: input de nombre + grid de emojis para elegir avatar. Al guardar, llama a `updateChildProfile` y usa `router.refresh()` para sincronizar.
- Dialog de eliminación: confirmación simple. Al confirmar, llama a `deleteChildProfile` y `router.refresh()`.
- Muestra toasts de éxito/error con `sonner`.

**Patterns to follow:**
- `ManagePinDialog` para estructura de dialog multi-paso.
- `components/ui/dialog.tsx` para el wrapper.
- Avatar picker: grid de emojis 4×N, mismo set que usa el onboarding.

**Test scenarios:**
- Al hacer click en editar, se abre el dialog con los datos actuales del perfil precargados.
- Cambiar nombre y guardar actualiza el nombre en la lista sin recargar la página completa.
- Cambiar avatar y guardar actualiza el emoji visible.
- Al hacer click en eliminar, se muestra el dialog de confirmación con el nombre del niño.
- Confirmar eliminación remueve el perfil de la lista.
- Cancelar eliminación no hace cambios.

**Verification:** Flujo manual completo: editar → guardar → verificar cambio. Eliminar → confirmar → verificar que desaparece.

---

### U4. Página `/parent/account`

**Goal:** Server Component que carga los datos y renderiza la página completa con todas las secciones.

**Requirements:** R1–R7

**Dependencies:** U1, U2, U3

**Files:**
- `app/parent/account/page.tsx` (nuevo)

**Approach:**
- Carga en el servidor: `childProfiles`, `user.email`, estado del PIN (`parent_settings.pin_hash`).
- Renderiza tres secciones:
  1. **Perfiles de niños**: `<AccountPageClient profiles={...} />` + botón "Agregar perfil" (redirige al onboarding o a un formulario existente — resolver en implementación).
  2. **Seguridad**: botón que abre `ManagePinDialog`, con badge "Activo" / "Sin PIN".
  3. **Cuenta**: email (texto), botón cambiar contraseña (llama U2), `LogoutForm` existente.
- El `ManagePinDialog` se integra con estado local en un pequeño wrapper client.

**Patterns to follow:**
- `app/parent/page.tsx` para estructura de Server Component con carga de datos.
- `components/shell/parent-shell.tsx` para el logout form reutilizable.

**Test scenarios:**
- La página carga correctamente con usuario autenticado.
- El badge del PIN muestra "Activo" cuando `pin_hash` existe, "Sin PIN" cuando no.
- El email del usuario se muestra correctamente.
- Hacer click en "Cambiar contraseña" dispara el toast de confirmación de envío.
- Sin perfiles, la sección muestra solo el botón de agregar.

**Verification:** Navegar a `/parent/account`, verificar que todas las secciones renderizan con datos reales.

---

### U5. Link "Cuenta" en la navegación del panel adulto

**Goal:** Agregar el ítem de nav que lleva a `/parent/account` desde el sidebar/bottom nav del panel adulto.

**Requirements:** R7

**Dependencies:** U4

**Files:**
- `components/shell/parent-shell.tsx`

**Approach:**
- Agregar `{ href: '/parent/account', label: 'Cuenta', icon: UserCircle }` al array `nav`.
- El ícono `UserCircle` de lucide-react encaja con el concepto de perfil/cuenta.

**Test scenarios:**
- El link "Cuenta" aparece en la navegación del panel adulto.
- Navegar a él lleva a `/parent/account`.
- El ítem se marca como activo cuando la ruta actual es `/parent/account`.

**Verification:** Visual en desktop y mobile.

---

## Preguntas abiertas

- **Agregar perfil desde Cuenta:** ¿Redirige al onboarding existente o hay un formulario inline en esta página? Resolver en implementación según lo que exista.
- **Cascada en DB:** Verificar si `child_profiles` tiene `ON DELETE CASCADE` configurado en Supabase para `video_assignments` y `activities`. Si no, el server action debe eliminarlo manualmente.

---

## Riesgos

- **Eliminación de perfil sin cascada:** Si la DB no tiene cascada y el server action no limpia las tablas relacionadas, quedará data huérfana. Bajo riesgo si se verifica antes de implementar U1.
- **Avatar picker sin consenso:** El set de emojis debe ser el mismo que usa el onboarding para consistencia. Identificar el listado antes de implementar U3.
