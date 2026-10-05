# Tareas de Implementación — Spec 014: Botón "Guardar en mi Calendario" (Google Calendar) en Mis Turnos

> Orden sugerido: T1 → T2 → T3 → T4.
> Cada tarea es discreta y verificable. Las tareas de UI requieren validación visual (constitución §4).
> **No editar**: `fetchAppointments`, `handleCancel`, estados `loading`/`error`/vacío, header/`<h1>` de `MyAppointmentsPage.jsx`; `AppointmentCard` y `appointmentCards` (código muerto documentado, NO se elimina en 014); `package.json`; ningún componente protegido (Navbar, TurnoModal).

---

## T1: Componente `AddToCalendarButton.jsx`

**Archivo afectado:** `src/components/AddToCalendarButton.jsx` (nuevo)

**Cambio:**
- Export default `AddToCalendarButton` con props `serviceName`, `scheduledAt`, `durationMinutes = 60`, `notes = ''`; sin dependencias (solo React `useState`).
- Guarda de render: `scheduledAt` null/vacío/inválido (`new Date(...)` → `Invalid Date`) ⇒ `return null` (RF-09).
- Helpers puros `toGCalUTC(date)` (`YYYYMMDDTHHmmssZ` UTC con getters `getUTC*` + `padStart(2,'0')`) y `buildGCalUrl({serviceName, scheduledAt, durationMinutes, notes})` (spec §6.2): base `https://calendar.google.com/calendar/render?action=TEMPLATE`; `text` = `` `Turno: ${serviceName} — Im Chic by Mel` ``; `dates` = `${toGCalUTC(start)}/${toGCalUTC(end)}` (sin encodear; `end = start + durationMinutes*60000`); `details` = líneas `[Servicio, Fecha y hora (es-AR legible), Notas si no vacías, 'Im Chic by Mel']` unidas con `\n`; `text`/`details` con `encodeURIComponent`.
- Bloque `<style>` local namespaced `imchic-gcal-btn`: `::before` con `background:#7A1333` y `transform: translateX(-110%) skewX(-45deg)`; `:hover::before`/`:focus-visible::before` con `animation: slope 0.4s ease forwards`; `@keyframes slope` (from `translateX(-110%) skewX(-45deg)` → to `translateX(110%) skewX(-45deg)`); `.imchic-gcal-btn > * { z-index: 1 }`; bloque `@media (prefers-reduced-motion: reduce)` desactivando transición/animación (spec §6.3).
- JSX: `<button type="button">` con clase `imchic-gcal-btn inline-flex w-full items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-[20px] bg-[#5A0B22] hover:bg-[#7A1333] text-white text-sm font-semibold cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]`; ícono SVG calendario inline (`fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap="round"`, `rect` rx=2 + 5 `line`s, `aria-hidden="true"`); `<span>Guardar en mi Calendario</span>`.
- `aria-label` descriptivo: `"Guardar en mi Calendario: ${serviceName}, ${fecha legible es-AR} a las ${hora es-AR}"` (RF-07).
- `handleClick` **síncrono**: `buildGCalUrl` → `window.open(url, '_blank', 'noopener,noreferrer')` como primera acción (sin `await` ni setState previo). Si retorna falsy: `try/catch` con `<a>` temporal (`href`, `target='_blank'`, `rel='noopener noreferrer'`), `appendChild` → `click()` → `remove()`, y estado `fallbackMsg` renderizado en `<p role="status">` con mensaje + enlace visible manual (RF-06). Si `window.open` funciona: limpiar `fallbackMsg`.

**Criterio de hecho:**
- [ ] El archivo existe, compila y no importa nada fuera de React.
- [ ] `toGCalUTC(new Date('2026-10-10T15:00:00-03:00'))` devuelve `20261010T180000Z` (15:00 ART = 18:00 UTC).
- [ ] `buildGCalUrl` con `serviceName='Uñas: Semipermanente & Capping'`, `scheduledAt='2026-10-10T15:00:00-03:00'`, `durationMinutes=60`, `notes='Traer diseño de referencia'` produce `dates=20261010T180000Z/20261010T190000Z` y `details` con las 4 líneas (servicio, fecha/hora, notas, marca); sin notas ⇒ 3 líneas.
- [ ] Con `scheduledAt` null/inválido retorna `null` (sin render ni errores).
- [ ] Visual: fondo `#5A0B22`, hover `#7A1333` + sweep diagonal "slope", `rounded-[20px]`, `min-h-[44px]`, ícono SVG stroke blanco, label exacto "Guardar en mi Calendario".

**Verificación:**
- `npm run build` OK. Prueba unitaria en consola del navegador (importar helpers o replicarlos) con el ejemplo de arriba. Con `AddToCalendarButton` montado temporalmente (o en T2): clic → pestaña Google Calendar con evento precargado; con bloqueador de popups → fallback `<a>` + mensaje `role="status"`; `prefers-reduced-motion` emulado ⇒ sin sweep.

**Dependencias:** — (independiente; bloquea T2).

---

## T2: Integración en `MyAppointmentsPage.jsx`

**Archivo afectado:** `src/pages/MyAppointmentsPage.jsx`

**Cambio:**
- Import nuevo junto a los existentes: `import AddToCalendarButton from '../components/AddToCalendarButton';`.
- **Solo en el `.map` inline real** (bloque que se pinta, líneas ~234–284): dentro de `{apt.status === 'confirmado' && …}` (líneas ~269–280), el `div` envolvente pasa a `className="pt-2 border-t border-[#5A0B22]/10 grid grid-cols-1 sm:grid-cols-2 gap-2"`; el botón "Cancelar turno" conserva sus clases y se le agrega `min-h-[44px]`; se agrega debajo (como segunda celda del grid):
  ```jsx
  <AddToCalendarButton
    serviceName={formatServiceName(apt.service_key || apt.service)}
    scheduledAt={apt.scheduled_at}
    notes={apt.notes || ''}
  />
  ```
- **No se toca**: condición `apt.status === 'confirmado'`, `fetchAppointments`, `handleCancel`, `STATUS_LABELS`, `formatDate`/`formatTime`, estados loading/error/vacío, header/`<h1>`; **no se propaga el botón** a `AppointmentCard` ni `appointmentCards` (código muerto, intacto — spec §7).

**Criterio de hecho:**
- [ ] Turno `confirmado`: dos acciones en fila (`sm`+) / apiladas con `gap-2` (móvil): "Cancelar turno" + "Guardar en mi Calendario".
- [ ] Turnos `solicitado`/`cancelado`/`completado`: sin botón de calendario (solo aparece lo de siempre, es decir nada de acciones salvo el caso ya existente).
- [ ] El nombre del evento en Google Calendar coincide con el título visible de la tarjeta (mismo `formatServiceName(...)` con fallback `apt.service_key || apt.service`).

**Verificación:**
- `npm run build` OK. Smoke en `/cuenta` → Mis Turnos: con turnos de cada estado, verificar render condicional; clic en el botón → evento precargado en Google Calendar; "Cancelar turno" sigue funcionando (confirm → update → refetch).

**Dependencias:** T1.

---

## T3: Build final + validación visual y funcional (constitución §4)

**Archivo afectado:** verificación global (sin cambios de código salvo hallazgos menores puntuales; si algo rompe, se corrige en T1/T2 con este feedback).

**Cambio:** Ninguno (solo verificación); si la validación revela un problema visual/accesible (p. ej. outline de foco poco visible ⇒ `outline-white`), el ajuste es mínimo y documentado.

**Criterio de hecho:**
- [ ] `npm run build` exit 0, sin warnings introducidos; `package.json` sin dependencias nuevas (RF-10).
- [ ] CA-01…CA-09 de la spec verificados manualmente (ver checklist §6 de plan).
- [ ] Página intacta: fetch (loading/error/vacío), cancelar turno, un solo `<h1>`, sin errores en consola.

**Verificación (checklist):**
1. Móvil 390px (y 320px): grid 1 columna, áreas táctiles ≥44px, `gap-2` entre acciones, label del botón legible.
2. Desktop: 2 columnas en el bloque de acciones; hover con sweep "slope" (color + diagonal); foco por teclado con outline dorado visible; `prefers-reduced-motion` ⇒ sin sweep.
3. Funcional: clic abre Google Calendar con `text`/`dates`/`details` correctos (comparar `START/END` UTC con la fecha/hora local del turno); con popup bloqueado ⇒ fallback accesible (`role="status"`).
4. Render condicional: el botón solo existe en turnos `confirmado`.
5. Sin `scheduled_at` válido (si hay fila de prueba): tarjeta normal, sin botón ni errores.

**Dependencias:** T1, T2.

---

## T4: Actualizar `MEMORY.md`

**Archivo afectado:** `MEMORY.md`

**Cambio:** Agregar sección `## Spec 014 — Botón "Guardar en mi Calendario" en Mis Turnos (IMPLEMENTADA, 2026-10-XX)` con: `AddToCalendarButton.jsx` (URL Google Calendar vía `action=TEMPLATE`, fechas UTC, fallback popup accesible, Tailwind + `<style>` local con keyframe `slope`; sin dependencias); integración en `MyAppointmentsPage.jsx` solo en turnos `confirmado` (grid 2 col con Cancelar); **código muerto preexistente documentado y no eliminado** (`AppointmentCard` + `appointmentCards` en MyAppointmentsPage, candidato a limpieza futura); `durationMinutes` default 60 (la tabla no tiene duración). Mantener límite de 50 líneas.

**Criterio de hecho:**
- [ ] `MEMORY.md` incluye la sección de la spec 014 con las decisiones clave (sin dependencias; código muerto documentado; default 60 min).

**Verificación:** Leer `MEMORY.md` y confirmar sección presente; comprobar que no excede el límite de 50 líneas.

**Dependencias:** T3.
