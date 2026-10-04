# Tareas de Implementación — Spec 009: Ajustes de UI (Navbar, Login, Perfil)

> Orden sugerido: T1 → T2 → T3 → T4 → T5.
> Cada tarea es discreta y verificable. Las tareas de UI requieren además validación visual (constitución §4).

---

## T1: Navbar — quitar CTA "Agenda tu turno" (desktop)

**Archivo afectado:** `src/components/Navbar.jsx` (bloque desktop, líneas ~136-145).

**Cambio:**
- Eliminar únicamente el `<button type="button" onClick={handleOpenTurno} ...>` con el icono `<Calendar>` y `<span>Agenda tu turno</span>`.
- **No** eliminar el contenedor `<div className="hidden md:flex items-center gap-2">`, que aloja los botones auth.

**Criterio de hecho:**
- [ ] En viewport ≥ md no existe el botón CTA; los botones `Ingresar` / `Panel Admin` / perfil / `Salir` siguen intactos.
- [ ] El resto de la Navbar (logo, links, barra de anuncios) no cambió.

**Verificación:**
- `npm run dev` → abrir escritorio → inspeccionar header.
- `grep -n "Agenda tu turno" src/components/Navbar.jsx` → 0 resultados (tras T1+T2).

**NO romper:** barra de anuncios, logo, links de navegación, botones auth desktop.

---

## T2: Navbar — quitar CTA móvil + limpiar código muerto

**Archivo afectado:** `src/components/Navbar.jsx` (móvil, líneas ~228-237; handler ~46-49; imports ~4-5, 11).

**Cambios:**
- Eliminar el `<div className="pt-4 flex flex-col items-stretch gap-2.5">` completo (solo contiene el CTA móvil).
- Eliminar la función `handleOpenTurno`.
- Eliminar `Calendar` del import de `lucide-react`.
- Eliminar `import { useTurno } from '../context/TurnoContext';` y `const { open: openTurno } = useTurno();`.
- Conservar imports usados: `Menu, X, ChevronRight, User, LogIn, LogOut`.

**Criterio de hecho:**
- [ ] Menú móvil sin CTA "Agenda tu turno"; secciones de links y auth móvil intactas.
- [ ] Sin referencias a `handleOpenTurno`, `openTurno`, `useTurno` ni `Calendar` en el archivo.
- [ ] `useAuth` y sus botones siguen funcionando (Ingresar / cerrar sesión).

**Verificación:**
- `grep -n "openTurno\|handleOpenTurno\|Calendar\|useTurno" src/components/Navbar.jsx` → sin resultados.
- `grep -rn "useTurno" src HomeServices.jsx InversionPage.jsx` → confirma que el flujo de turnos sigue consumiéndose en `HomeServices`/`InversionPage`.
- Smoke manual: en `/` y `/servicios`, el botón "Agendar turno" abre el modal.

**NO romper:** flujo global de turnos (`TurnoProvider`/`TurnoModalEnhanced`), menú móvil, cierre con Escape, bloqueo de scroll.

---

## T3: LoginPage — diseño más compacto

**Archivo afectado:** `src/pages/LoginPage.jsx`.

**Cambios de referencia (ajustables):**
- `main`: `max-w-md p-6 sm:p-8` → `max-w-sm p-5 sm:p-6`.
- Header `mb-6` → `mb-4`; chip `mb-4` → `mb-3`.
- Icono `w-16 h-16 mb-4` → `w-12 h-12 mb-3`; `LogIn size={28}` → `size={22}`.
- `h1` `text-2xl sm:text-3xl mb-2` → `text-xl sm:text-2xl mb-1.5`.
- Párrafo `text-sm` → `text-xs sm:text-sm`.
- Form `gap-4` → `gap-3.5`; separador `my-5` → `my-4`; footer `mt-6` → `mt-5`.
- Mantener `min-h-[44px]` en inputs y botón, `htmlFor`/`id`, colores de marca y `role="alert"`.

**Criterio de hecho:**
- [ ] La tarjeta se ve claramente más pequeña en móvil y escritorio.
- [ ] Inputs y botón conservan área táctil ≥ 44px; labels siguen asociados; un solo `<h1>`.
- [ ] Contraste AA en textos y placeholders.

**Verificación:**
- `npm run dev` → `/login` en viewport 375px y 1280px.
- DevTools > Accessibility/Contrast y medición de touch targets.

**NO romper:** envío del formulario, validación, `GoogleButton`, link "¿Olvidé mi contraseña?", redirección a `/admin`.

---

## T4: AccountPage — quitar "URL de avatar" y corregir label

**Archivo afectado:** `src/pages/AccountPage.jsx` (líneas ~121-166).

**Cambios:**
- Eliminar el `<div className="flex-1">` con el label "URL de avatar (o subí una imagen)" y el `<input type="url" id="avatarUrl">`.
- En el overlay de subida: `htmlFor="avatarUrl"` → `htmlFor="avatar-file"`; en el input file `id="avatarUrl"` → `id="avatar-file"`.
- Agregar nombre accesible dentro del label, p. ej. `<span className="sr-only">Cambiar foto de perfil</span>`.
- Conservar `formData.avatarUrl`, la carga inicial, el `FileReader` (data URL) y `updateProfile({ avatar_url: formData.avatarUrl.trim() })`.

**Criterio de hecho:**
- [ ] `/cuenta` no muestra ningún label ni input de "URL de avatar".
- [ ] El overlay/botón de subir imagen y la previsualización del avatar siguen presentes.
- [ ] Existe un único `id` asociado al input file y el input tiene nombre accesible.
- [ ] Subir imagen actualiza previsualización; guardar y recargar persiste el avatar.

**Verificación:**
- `grep -n "URL de avatar\|type=\"url\"\|htmlFor=\|id=\"avatar" src/pages/AccountPage.jsx` → sin duplicados de `avatarUrl`.
- Smoke manual: subir imagen → previsualización → "Guardar cambios" → recargar `/cuenta`.
- Chequeo de accesibilidad: el input file anuncia "Cambiar foto de perfil".

**NO romper:** guardado de `fullName`/`phone`, secciones "Mis Turnos"/"Mis Cursos", botón "Cerrar sesión", estados de error/éxito.

---

## T5: Verificación final (build + regresión + memoria)

**Archivos/Áreas:** todo el proyecto + `MEMORY.md`.

**Criterio de hecho:**
- [ ] `npm run build` pasa sin errores ni warnings nuevos.
- [ ] CA-01..CA-11 validados (smoke manual).
- [ ] Sin regresión en `/`, `/servicios`, `/inversion`, `/cursos`, `/tienda`, `/contacto`.
- [ ] `MEMORY.md` actualizado (quitar el CTA del Navbar; cambios de login y perfil) respetando el límite de 50 líneas.

**Verificación:**
- `npm run build`
- Recorrido manual de rutas y del flujo de turnos.
- `grep` de control sobre `Navbar.jsx` y `AccountPage.jsx`.

**NO romper:** nada — esta tarea valida que nada se rompió.

---

## Resumen de Tareas

| ID | Título | Archivo | Dependencias |
|----|--------|---------|--------------|
| T1 | Navbar: quitar CTA desktop | `src/components/Navbar.jsx` | — |
| T2 | Navbar: quitar CTA móvil + limpieza | `src/components/Navbar.jsx` | T1 |
| T3 | Login compacto | `src/pages/LoginPage.jsx` | — |
| T4 | Perfil: quitar URL de avatar + label único | `src/pages/AccountPage.jsx` | — |
| T5 | Verificación build + regresión + `MEMORY.md` | Varios | T1–T4 |

**Orden crítico:** T1 → T2 → (T3, T4 en paralelo) → T5.
