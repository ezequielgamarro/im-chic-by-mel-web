# Spec 014 — Botón "Guardar en mi Calendario" (Google Calendar) en Mis Turnos

## 1. Objetivo

Agregar, en `src/pages/MyAppointmentsPage.jsx`, un botón que permita al cliente **guardar un turno confirmado en su Google Calendar**. El botón se renderiza **únicamente** cuando `apt.status === 'confirmado'`, junto al botón existente "Cancelar turno".

La visual es una réplica exacta del componente de referencia adjunto (styled-components: fondo `#5A0B22`, hover `#7A1333`, animación "slope" diagonal, ícono SVG de calendario, border-radius 20px, label "Agendar Turno"), con dos diferencias deliberadas y documentadas:

- El label pasa de "Agendar Turno" a **"Guardar en mi Calendario"** (petición literal del usuario).
- El código se implementa como **`src/components/AddToCalendarButton.jsx` con clases Tailwind + un bloque `<style>` local** para el keyframe `slope` (constitución §3: el proyecto NO usa styled-components; prohibido instalarlo o cualquier dependencia).

## 2. Alcance

### 2.1 Incluye

- `src/components/AddToCalendarButton.jsx` (nuevo): componente de botón que genera la URL de Google Calendar y la abre en pestaña nueva con fallback seguro. Props: `serviceName` (string), `scheduledAt` (ISO string|null), `durationMinutes` (opcional, default 60), `notes` (opcional).
- `src/pages/MyAppointmentsPage.jsx`: import del componente e integración **solo en el bloque que realmente se pinta** (el `.map` inline de líneas ~234–284, dentro del bloque `{apt.status === 'confirmado' && …}`), en un layout `grid grid-cols-1 sm:grid-cols-2 gap-2` junto a "Cancelar turno".
- Bloque `<style>` local dentro de `AddToCalendarButton.jsx` con `@keyframes slope`, reglas de hover/foco y `prefers-reduced-motion` (patrón ya aprobado en `LoginPage.jsx`, `DownloadButton.jsx` y `SparkleButton.jsx`).
- Documentación del código muerto preexistente (`AppointmentCard` sin usar, variable `appointmentCards` sin usar) como deuda conocida — **no se elimina en esta spec** (ver §7).
- Documentación SDD: esta spec, `plan.md`, `tasks.md` (incluye build final y actualización de `MEMORY.md`).

### 2.2 Excluye

- Instalación de dependencias (prohibido styled-components o cualquier paquete nuevo; `package.json` intacto).
- Modificar `fetchAppointments`, `handleCancel`, estados `loading`/`error`/vacío, el `<h1>` único de la página o cualquier otra lógica de `MyAppointmentsPage.jsx`.
- Eliminar el código muerto (`AppointmentCard`, `appointmentCards`): queda documentado para una futura spec de limpieza.
- Modificar `TurnoModal.jsx`, `TurnoModalEnhanced.jsx`, `CalendarAvailability.jsx`, `Navbar.jsx` ni ningún componente protegido.
- Cambios en la BD (`user_appointments` no tiene columna de duración; se usa el default 60 min, ver §7).
- Rediseño de la tarjeta de turno (título, badge de estado, fecha/hora/notas se mantienen idénticos).

## 3. Requisitos EARS

### 3.1 Renderizado del botón

**RF-01 (Ubicuo)**
EL SISTEMA renderizará en la tarjeta de cada turno con `status === 'confirmado'` el componente `AddToCalendarButton`, integrado en el área de acciones junto al botón "Cancelar turno", dentro de un layout `grid grid-cols-1 sm:grid-cols-2 gap-2` (1 columna en móvil, 2 en `sm`+).

**RF-02 (Restricción)**
MIENTRAS el turno tenga estado `solicitado`, `cancelado` o `completado`, EL SISTEMA **no** renderizará el botón de calendario; el bloque de acciones solo aparece (como hoy) para `confirmado`.

**RF-03 (Ubicuo)**
EL SISTEMA renderizará el botón con la visual del componente de referencia: fondo `#5A0B22`, hover `#7A1333` con efecto de animación "slope" (barrido diagonal), border-radius 20px, texto blanco, ícono SVG de calendario (líneas rectas, stroke blanco), label visible **"Guardar en mi Calendario"** — usando exclusivamente clases Tailwind + un bloque `<style>` local (patrón LoginPage/DownloadButton).

### 3.2 Generación de la URL de Google Calendar

**RF-04 (Ubicuo)**
EL SISTEMA generará por evento la URL `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=START/END&details=…` donde:

- `START` se formatea desde `new Date(scheduledAt)` como `YYYYMMDDTHHmmssZ` (UTC) y `END = START + durationMinutes` (default 60) en el mismo formato;
- `text` incluye el nombre del servicio y la marca (ej. `"Turno: {serviceName} — Im Chic by Mel"`);
- `details` incluye el servicio, la fecha y hora en formato local (`es-AR` legible) y las notas **si existen** (sin línea vacía de notas cuando no hay);
- `text` y `details` se codifican con `encodeURIComponent`; `dates` va sin codificar (formato ISO compacto compatible).

**RF-05 (De evento)**
CUANDO el usuario haga clic en el botón, EL SISTEMA abrirá la URL generada en una pestaña nueva mediante `window.open(url, '_blank', 'noopener,noreferrer')` **de forma síncrona dentro del handler** (sin `await` ni operaciones asíncronas previas), para no ser bloqueado como popup.

**RF-06 (De evento, degradación)**
SI `window.open` retorna `null`/falsy (popup bloqueado o fallo), EL SISTEMA creará un `<a>` temporal (`href=url`, `target="_blank"`, `rel="noopener noreferrer"`) en el `document.body`, disparará `click()` programático y removerá el nodo; además mostrará un mensaje accesible (`role="status"`) con un enlace visible para abrir Google Calendar manualmente. El componente **no** debe lanzar errores en consola en ningún caso.

### 3.3 Accesibilidad y restricciones

**RF-07 (Restricción de accesibilidad)**
MIENTRAS se renderice el botón, EL SISTEMA garantizará: `aria-label` descriptivo que incluye la acción, el servicio y la fecha legible (ej. `"Guardar en mi Calendario: Uñas Semipermanente, viernes 10 de octubre de 2026 a las 15:00"`); área táctil `min-h-[44px]` y `w-full` dentro de su celda de grid; foco visible (`focus-visible` con outline de la paleta de marca); contraste AA (texto blanco sobre `#5A0B22` ≈ 14:1); ícono `aria-hidden="true"`.

**RF-08 (Restricción, motion)**
MIENTRAS se aplique la animación "slope" al hover/focus, EL SISTEMA respetará `prefers-reduced-motion: reduce` (animación desactivada; el cambio de color de hover se mantiene vía Tailwind sin movimiento).

**RF-09 (De evento, degradación)**
SI `scheduledAt` es `null`, vacío o inválido (`new Date(...)` → `Invalid Date`), EL SISTEMA hará que `AddToCalendarButton` retorne `null` (no renderiza nada), sin errores en consola ni en el layout de la tarjeta.

**RF-10 (Restricción de arquitectura)**
MIENTRAS se implemente, EL SISTEMA usará exclusivamente Tailwind vía CDN + un bloque `<style>` local para el keyframe `slope`; está **prohibido** instalar styled-components o cualquier dependencia; `package.json` no cambia. Los selectores del bloque `<style>` se namespacenán (prefijo `imchic-gcal-btn`) para no colisionar con CSS global.

**RF-11 (De evento, verificación)**
CUANDO el implementador ejecute `npm run build`, EL SISTEMA compilará sin errores ni advertencias introducidos por estos cambios; `fetchAppointments`, `handleCancel` (incl. `window.confirm` y refetch), los estados loading/error/vacío y el único `<h1>` de la página quedarán intactos.

## 4. Restricciones y Constitución

- **Mobile-first** (§1): el botón se valida primero a 320–390 px (1 columna, texto puede envolver; el label se mantiene en una línea con `text-sm` y padding acorde); recién después en `sm`+.
- **Estabilidad estructural** (§2): el cambio en `MyAppointmentsPage.jsx` es quirúrgico (import + bloque de acciones del `.map` inline); no se reestructura la página. `Navbar`, `TurnoModal` y demás protegidos intactos.
- **Estética consistente** (§3): paleta de marca (`#5A0B22`, `#7A1333`, `#D4AF37` para el outline de foco); réplica visual del botón de referencia con Tailwind; **prohibido styled-components**.
- **Validación visual** (§4): toda tarea de UI se verifica en navegador (build + Chrome DevTools móvil/desktop) antes de darse por terminada.
- **SDD** (§5): esta spec + `plan.md` + `tasks.md` preceden cualquier edición de código.

## 5. Criterios de Aceptación (CA)

| ID | Criterio |
|----|----------|
| CA-01 | El botón "Guardar en mi Calendario" aparece **solo** en tarjetas de turnos `confirmado`, junto a "Cancelar turno", en `grid grid-cols-1 sm:grid-cols-2 gap-2`; en `solicitado`/`cancelado`/`completado` no hay rastro del botón. |
| CA-02 | La URL de Google Calendar es correcta: `action=TEMPLATE`, `dates=START/END` en `YYYYMMDDTHHmmssZ` UTC, `END = START + 60 min` (default), `text`/`details` con `encodeURIComponent`, `details` con servicio + fecha/hora local + notas (si existen); ejemplo de §7 verificado en consola/navegador. |
| CA-03 | La visual replica la referencia: fondo `#5A0B22`, hover `#7A1333` con barrido diagonal "slope" (keyframe local), border-radius 20px, ícono SVG de calendario con stroke blanco, label exacto **"Guardar en mi Calendario"**. |
| CA-04 | El clic abre Google Calendar en pestaña nueva (síncrono, `noopener,noreferrer`); con popup bloqueado, funciona el fallback (`<a>` temporal + mensaje `role="status"` con enlace manual); sin errores en consola. |
| CA-05 | Accesibilidad: `aria-label` descriptivo (acción + servicio + fecha), `min-h-[44px]`, foco visible, contraste AA, `prefers-reduced-motion` respetado (sin animación slope). |
| CA-06 | Con `scheduledAt` null/inválido, el componente no renderiza nada (retorna `null`) y la tarjeta se ve normal. |
| CA-07 | Sin dependencias nuevas (`package.json` sin cambios); solo Tailwind + `<style>` local namespaced; selectores sin colisiones con CSS global. |
| CA-08 | La página funciona igual que antes: fetch de turnos, cancelar turno (confirm + update + refetch), loading/error/vacío, un solo `<h1>` "Mis Turnos". |
| CA-09 | Código muerto preexistente (`AppointmentCard`, `appointmentCards`) **documentado** (spec §7 + MEMORY) y **no eliminado** en esta spec. |
| CA-10 | `npm run build` exit 0, sin warnings introducidos; `MEMORY.md` actualizado al cierre. |

## 6. Diseño del componente (referencia de implementación)

### 6.1 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `serviceName` | string | — | Nombre legible del servicio (el caller pasa `formatServiceName(apt.service_key \|\| apt.service)`). |
| `scheduledAt` | string \| null | — | ISO 8601 de `user_appointments.scheduled_at`. Si es null/inválido → retorna `null`. |
| `durationMinutes` | number | `60` | Duración para `END`. `user_appointments` no tiene duración (ver §7); default documentado. |
| `notes` | string | `''` | Notas del turno; solo se agregan a `details` si no están vacías. |

### 6.2 Helpers (puros, testables en consola)

```js
// 'YYYYMMDDTHHmmssZ' (UTC)
const toGCalUTC = (date) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}` +
         `T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`;
};

const buildGCalUrl = ({ serviceName, scheduledAt, durationMinutes = 60, notes }) => {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const text = `Turno: ${serviceName} — Im Chic by Mel`;
  const details = [
    `Servicio: ${serviceName}`,
    `Fecha y hora: ${start.toLocaleString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    notes ? `Notas: ${notes}` : null,
    'Im Chic by Mel',
  ].filter(Boolean).join('\n');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
         `&text=${encodeURIComponent(text)}` +
         `&dates=${toGCalUTC(start)}/${toGCalUTC(end)}` +
         `&details=${encodeURIComponent(details)}`;
};
```

### 6.3 Estructura JSX

```
<>
  <style>{ /* @keyframes slope + .imchic-gcal-btn hover/focus + prefers-reduced-motion */ }</style>
  <button type="button" onClick={handleClick} aria-label={ariaLabel} className="imchic-gcal-btn …">
    <svg aria-hidden="true" stroke="currentColor">… calendario: rect + líneas rectas …</svg>
    <span>Guardar en mi Calendario</span>
  </button>
  {fallbackMsg && <p role="status">… <a href={url} target="_blank" rel="noopener noreferrer">…</a></p>}
</>
```

- `className` del botón (Tailwind): `imchic-gcal-btn inline-flex w-full items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-[20px] bg-[#5A0B22] hover:bg-[#7A1333] text-white text-sm font-semibold cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]`.
- SVG ícono: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"` (= blanco por `text-white`), `strokeWidth="2"`, `strokeLinecap="round"`; cuerpo `rect` (rx=2) + `line`s rectas: pestañas superiores (2 verticales), línea de encabezado y 2 líneas internas. `aria-hidden="true"`.
- Bloque `<style>` (namespaced):

```css
.imchic-gcal-btn { position: relative; overflow: hidden; }
.imchic-gcal-btn::before {
  content: '';
  position: absolute; inset: 0;
  background: #7A1333;
  transform: translateX(-110%) skewX(-45deg);
  transition: transform 0.35s ease;
  z-index: 0; pointer-events: none;
}
.imchic-gcal-btn:hover::before,
.imchic-gcal-btn:focus-visible::before {
  animation: slope 0.4s ease forwards;
}
.imchic-gcal-btn > * { position: relative; z-index: 1; }
@keyframes slope {
  from { transform: translateX(-110%) skewX(-45deg); }
  to   { transform: translateX(110%) skewX(-45deg); }
}
@media (prefers-reduced-motion: reduce) {
  .imchic-gcal-btn::before { transition: none; animation: none; transform: translateX(-110%) skewX(-45deg); }
}
```

(El `hover:bg-[#7A1333]` de Tailwind garantiza el cambio de color aunque el sweep esté desactivado por reduced-motion.)

### 6.4 Handler de clic (síncrono + fallback)

```js
const handleClick = () => {
  const url = buildGCalUrl({ serviceName, scheduledAt, durationMinutes, notes }); // síncrono, sin await
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (win) { setFallbackMsg(''); return; }
  // Fallback: <a> temporal
  try {
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); a.remove();
    setFallbackMsg('Si no se abrió Google Calendar en una pestaña nueva, hacé click aquí.');
  } catch {
    setFallbackMsg('No pudimos abrir Google Calendar. Abrí este enlace manualmente:');
  }
};
```

## 7. Observaciones / Riesgos

- **Código muerto preexistente (decisión: documentar, no eliminar):** `AppointmentCard` (líneas 27–78) y la variable `appointmentCards` (líneas 138–187) no se usan nunca (la página pinta el `.map` inline de líneas ~234–284). La integración de este botón se hace **solo en el bloque inline real**. No se toca el código muerto en esta spec (estabilidad estructural §2); queda anotado aquí y en MEMORY como candidato a limpieza en una futura spec menor. Riesgo de dejarlo: confusión al mantener (dos renderizados del mismo diseño); mitigación: esta documentación explícita.
- **Duración del evento:** `user_appointments` no tiene columna de duración; se usa `durationMinutes=60` (default del TurnoModal para la mayoría de servicios). Futura mejora (fuera de alcance): leer `admin_settings_public.service_durations` para personalizar END por categoría.
- **`window.open` y popups:** bloqueadores modernos interceptan `window.open` invocado fuera de un gesto directo; por eso el `window.open` es **lo primero** en el handler (sin `await`). El fallback `<a>` + `role="status"` cubre el resto (CA-04).
- **Formato de `scheduled_at`:** Supabase devuelve ISO con offset (`+00:00` o `-03:00`); `new Date()` lo parsea bien y `toGCalUTC` convierte a UTC-Z. Un valor corrupto → RF-09 (retorna `null`).
- **Colisión de estilos:** el `<style>` local usa prefijo `imchic-gcal-btn`; no hay colisiones con `premium.css` ni con los keyframes de Login/Download/Sparkle.
- **Contraste del outline de foco:** `#D4AF37` (dorado) sobre `#5A0B22` da ~4.6:1 — visible y de marca. Si la validación visual muestra poca visibilidad, alternativa `outline-white`.
- **`StatusIcon` no usado en el bloque inline** (línea ~236 se declara y se usa `status.icon` directo en el JSX): hallazgo menor preexistente, fuera de alcance; no tocar para no alterar el bloque.
- **Orden de datos:** la tarjeta pasa `formatServiceName(apt.service_key || apt.service)` (mismo fallback del título) para que el evento en el calendario use el nombre legible, igual que en la UI.

## 8. Estado

- **Estado**: Borrador listo para revisión y aprobación.
- **Fecha**: 2026-10-04
- **Autor**: Planner SDD
