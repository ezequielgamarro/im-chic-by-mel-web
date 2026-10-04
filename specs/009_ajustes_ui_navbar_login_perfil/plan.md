# Plan de Implementación — Spec 009: Ajustes de UI (Navbar, Login, Perfil)

## 1. Alcance y Resumen

Tres cambios acotados de UI/UX, sin tocar lógica de negocio:

1. **`src/components/Navbar.jsx`** — eliminar el CTA "Agenda tu turno" (desktop y móvil) y limpiar el código muerto resultante.
2. **`src/pages/LoginPage.jsx`** — compactar el diseño de login.
3. **`src/pages/AccountPage.jsx`** — quitar el campo de texto "URL de avatar" y dejar solo la subida + previsualización.

**Precedentes verificados con `grep`:**
- `useTurno()` se consume además en `HomeServices.jsx` (líneas 8, 69) e `InversionPage.jsx` (líneas 7, 45), y `TurnoProvider` se monta globalmente en `src/main.jsx` (líneas 6, 28, 52). Por lo tanto, quitar `useTurno` **solo** del `Navbar` no rompe el flujo global de turnos (RF-03 / CA-04).
- Los estilos `premium-*` usados por `LoginPage` son globales (`src/styles/premium.css`). Para compactar **no** se editarán esos estilos globales (afectarían a `/cuenta`, `/registro`, etc.); la compactación se logra con overrides locales de Tailwind en `LoginPage.jsx`.

---

## 2. Decisiones Técnicas

| # | Decisión | Justificación |
|---|----------|---------------|
| D1 | **No eliminar el contenedor `<div className="hidden md:flex items-center gap-2">`** del bloque desktop; eliminar únicamente el `<button>` del CTA (Navbar línea ~136-145). | Ese `div` también aloja los botones auth (perfil/Salir/Panel Admin). Borrar el contenedor completo rompería la Navbar. |
| D2 | En móvil, eliminar el bloque `<div className="pt-4 flex flex-col items-stretch gap-2.5">` completo (Navbar línea ~228-237), ya que solo contiene el CTA. | Evita dejar un `div` vacío. El bloque de auth móvil (`pt-2 border-t`) se conserva. |
| D3 | **Limpieza de imports/handler**: quitar `handleOpenTurno` (líneas 46-49), quitar `Calendar` del import de `lucide-react` (línea 4) y quitar `import { useTurno }` + `const { open: openTurno } = useTurno();` (líneas 5, 11). | Si no se limpia, `eslint`/build pueden advertir y el código queda engañoso. Se preservan `Menu, X, ChevronRight, User, LogIn, LogOut`. |
| D4 | **No tocar `useTurno` global ni `TurnoContext`.** | `HomeServices`/`InversionPage` y `main.jsx` mantienen el provider y el modal activos. |
| D5 | **Compactación de login vía clases locales** (no editando `premium.css`). | Evita efecto colateral en otras páginas que reutilizan `premium-card`/`premium-chip`. |
| D6 | **Label único en `AccountPage`**: renombrar el `id` del input file a `avatar-file` y el `htmlFor` del overlay a `avatar-file`; agregar un `<span className="sr-only">` (p. ej. "Cambiar foto de perfil") dentro del label. Eliminar el segundo `<label htmlFor="avatarUrl">` junto con su `<input type="url">`. | Corrige el `id` duplicado actual (`avatarUrl` aparece en el file y en el url) y da nombre accesible al input file, que hoy toma su nombre del label de texto eliminado. |
| D7 | **Persistencia sin cambios de lógica**: conservar `avatarUrl` en `formData`, su inicialización desde `user.user_metadata.avatar_url`, el `FileReader` → data URL y el `updateProfile({ ..., avatar_url: formData.avatarUrl.trim() })`. | El avatar subido se sigue guardando al pulsar "Guardar cambios" (RF-10). Solo cambia lo visible. |
| D8 | **Simplificar el layout del avatar**: el contenedor `flex items-center gap-4` pasa a contener solo el bloque del avatar (se elimina el `<div className="flex-1">`). Puede conservarse el `flex` o dejarse el avatar solo. | Se elimina el hueco que ocupaba el input de URL. |

---

## 3. Enfoque por Archivo

### 3.1 `src/components/Navbar.jsx`

**Estado actual:** CTA desktop en `hidden md:flex items-center gap-2` (136-145) + CTA móvil (228-237); handler `handleOpenTurno` (46-49); import `Calendar` (4); `useTurno`/`openTurno` (5, 11).

**Cambios:**
- Eliminar el `<button>` del CTA desktop, dejando `<div className="hidden md:flex items-center gap-2">` con los botones auth.
- Eliminar el `<div className="pt-4 ...">` completo de móvil.
- Eliminar `handleOpenTurno`.
- Eliminar `Calendar` del import de `lucide-react` y el import `useTurno` + su destructuring.
- No tocar logo, links, barra de anuncios, hamburguesa, ni bloque auth (desktop/móvil).

**Riesgo:** bajo. Verificar que `openTurno` no tenga más referencias en el archivo (`grep openTurno src/components/Navbar.jsx` → 0).

### 3.2 `src/pages/LoginPage.jsx`

**Estado actual:** `main` `max-w-md p-6 sm:p-8`; chip `mb-4`; icono `w-16 h-16` con `size={28}` y `mb-4`; `h1` `text-2xl sm:text-3xl mb-2`; párrafo `text-sm`; form `gap-4`; separador `my-5`; footer `mt-6`.

**Cambios propuestos (valores de referencia, ajustables en revisión):**
- `main`: `max-w-md p-6 sm:p-8` → `max-w-sm p-5 sm:p-6`.
- Header: `mb-6` → `mb-4`; chip `mb-4` → `mb-3`.
- Icono: `w-16 h-16 mb-4` → `w-12 h-12 mb-3`; `LogIn size={28}` → `size={22}`.
- `h1`: `text-2xl sm:text-3xl mb-2` → `text-xl sm:text-2xl mb-1.5`.
- Párrafo: `text-sm` → `text-xs sm:text-sm`.
- Form: `gap-4` → `gap-3.5`.
- Separador `my-5` → `my-4`; footer `mt-6` → `mt-5`.
- **Intactos:** `min-h-[44px]` en inputs y botón, `htmlFor`/`id` de email/password, colores de marca, `role="alert"`, spinner, `GoogleButton`.

**Riesgo:** bajo. El objetivo es percepción de tamaño, no romper touch-targets.

### 3.3 `src/pages/AccountPage.jsx`

**Estado actual (121-166):** avatar con `label htmlFor="avatarUrl"` (overlay) que contiene `<input id="avatarUrl" type="file">`; y un segundo bloque `<div className="flex-1">` con `label htmlFor="avatarUrl"` + `<input type="url" id="avatarUrl">`. Hay **dos** elementos con `id="avatarUrl"`.

**Cambios:**
- Eliminar el `<div className="flex-1">` completo (label "URL de avatar (o subí una imagen)" + input url).
- En el overlay: cambiar `htmlFor="avatarUrl"` → `htmlFor="avatar-file"`; cambiar `id="avatarUrl"` → `id="avatar-file"` en el input file; agregar `<span className="sr-only">Cambiar foto de perfil</span>` dentro del label (el icono `Image` ya es `aria-hidden`).
- El contenedor del avatar deja de necesitar `flex-1`; se puede mantener `flex items-center gap-4` con un solo hijo o simplificar.
- **Sin cambios:** `formData.avatarUrl`, `useEffect` de carga, `FileReader` y `updateProfile({ avatar_url })`.

**Riesgo:** bajo. Punto de atención: no dejar el input file sin nombre accesible ni reintroducir `id` duplicado.

---

## 4. Orden de Implementación

1. **T1** — Navbar: quitar CTA desktop.
2. **T2** — Navbar: quitar CTA móvil + limpieza de handler/imports.
3. **T3** — LoginPage: compactar.
4. **T4** — AccountPage: quitar URL de avatar + corregir label.
5. **T5** — Verificación: `npm run build` + regresión visual/manual + actualizar `MEMORY.md`.

---

## 5. Estrategia de Verificación

- **Compilación:** `npm run build` (obligatorio, sin errores ni warnings nuevos).
- **Búsqueda de código muerto:** `grep -n "openTurno\|handleOpenTurno\|Calendar\|useTurno" src/components/Navbar.jsx` → solo deben aparecer referencias legítimas (ninguna) tras T1-T2.
- **Flujo de turnos:** smoke manual en `/` y `/servicios` → botón de agendar abre el modal.
- **Login:** inspección visual móvil (≤ 390px) y escritorio; verificar touch targets (DevTools > Layout) y contraste AA.
- **Perfil:** subir una imagen → previsualización cambia → "Guardar cambios" → recargar `/cuenta` → el avatar persiste; verificar con lector de pantalla/DevTools que el input file tiene nombre accesible y no hay `id` duplicado.
- **No regresión:** navegar `/`, `/servicios`, `/inversion`, `/cursos`, `/tienda`, `/contacto`.

---

## 6. Referencias

- Spec: `specs/009_ajustes_ui_navbar_login_perfil/spec.md`
- Tareas: `specs/009_ajustes_ui_navbar_login_perfil/tasks.md`
- Constitución: `docs/constitution.md`
- Memoria: `MEMORY.md`
- Contexto de turnos: `src/context/TurnoContext.jsx`, `src/main.jsx`, `HomeServices.jsx`, `InversionPage.jsx`
- Estilos globales (no se editan): `src/styles/premium.css`
