# Plan 014 — Botón "Guardar en mi Calendario" (Google Calendar) en Mis Turnos

## 1. Diagnóstico verificado

- `MyAppointmentsPage.jsx` pinta las tarjetas en el bloque **inline** del `.map` dentro de `return` (líneas ~234–284). El bloque `{apt.status === 'confirmado' && …}` (líneas ~269–280) ya contiene el botón "Cancelar turno": es el punto de inserción.
- **Código muerto preexistente:** `AppointmentCard` (líneas 27–78, componente declarado pero nunca renderizado) y `appointmentCards` (líneas 138–187, variable calculada tras los early-returns pero jamás usada en el JSX). **No se tocan** (decisión en spec §7); solo se documentan.
- La página ya tiene un único `<h1>` ("Mis Turnos", línea ~206) y `formatServiceName` importado (línea 5): el botón recibe el servicio ya formateado desde el caller.
- Referencia visual: botón styled-components (fondo `#5A0B22`, hover `#7a1333`, radius 20px, alto 40px, ícono SVG calendario stroke blanco, animación "slope" en hover, label "Agendar Turno"). **Restricción crítica constitución §3:** replicar 100% con Tailwind + `<style>` local; prohibido styled-components o dependencias.
- Precedente de `<style>` local en el proyecto: `LoginPage.jsx` (keyframes bounce + `prefers-reduced-motion`), `DownloadButton.jsx` y `SparkleButton.jsx` (keyframes con selectores propios). El patrón está aprobado.

## 2. Enfoque de implementación y orden

Orden: **T1 (componente) → T2 (integración) → T3 (build + validación visual) → T4 (MEMORY)**. T2 depende de T1 (import); T3 de T1+T2; T4 de T3.

## 3. `src/components/AddToCalendarButton.jsx` (nuevo)

Export default `AddToCalendarButton`. Sin dependencias: solo React (`useState`).

### 3.1 Props y guardas

- `serviceName` (string, requerido para la URL/aria), `scheduledAt` (ISO string|null), `durationMinutes` (number, default 60), `notes` (string, default `''`).
- Al inicio del componente: `const start = scheduledAt ? new Date(scheduledAt) : null; if (!start || Number.isNaN(start.getTime())) return null;` (RF-09). `const end = new Date(start.getTime() + durationMinutes * 60000);`

### 3.2 Helpers puros (en el mismo archivo, arriba del componente)

- `toGCalUTC(date)` → `YYYYMMDDTHHmmssZ` en UTC usando getters `getUTC*` + `padStart(2, '0')` (spec §6.2).
- `buildGCalUrl({ serviceName, scheduledAt, durationMinutes, notes })`:
  - `text` = `` `Turno: ${serviceName} — Im Chic by Mel` ``
  - `dates` = `${toGCalUTC(start)}/${toGCalUTC(end)}` (sin encodear)
  - `details` = líneas `[Servicio, Fecha y hora (es-AR legible), Notas si no vacías, 'Im Chic by Mel']` unidas con `\n`, **sin** línea de notas cuando `notes` está vacío
  - `text` y `details` con `encodeURIComponent`
  - URL base: `https://calendar.google.com/calendar/render?action=TEMPLATE`

**Ejemplo de verificación (CA-02):** `scheduledAt='2026-10-10T15:00:00-03:00'`, `durationMinutes=60`, `serviceName='Uñas: Semipermanente & Capping'`, `notes='Traer diseño de referencia'` →

`START=20261010T180000Z`, `END=20261010T190000Z` (15:00 ART = 18:00 UTC) y la URL completa se lista en spec §7/respuesta del planner; validar que `details` decodificado muestre las 4 líneas.

### 3.3 Bloque `<style>` local (namespaced `imchic-gcal-btn`)

Contenido exacto en spec §6.3: `.imchic-gcal-btn` (relative + overflow-hidden), `::before` con `background:#7A1333` y `transform: translateX(-110%) skewX(-45deg)`, `:hover::before` / `:focus-visible::before` con `animation: slope 0.4s ease forwards`, `@keyframes slope` (from `-110%` → to `110%`, skew -45°), `.imchic-gcal-btn > * { z-index: 1 }` (contenido por encima del sweep), y bloque `@media (prefers-reduced-motion: reduce)` que desactiva transición/animación y deja el `::before` fuera de pantalla (el `hover:bg-[#7A1333]` de Tailwind mantiene el feedback de color).

### 3.4 JSX del botón

- `<button type="button" onClick={handleClick} aria-label={…}>` con la clase Tailwind de spec §6.3 (incluye `min-h-[44px]`, `rounded-[20px]`, `bg-[#5A0B22]`, `hover:bg-[#7A1333]`, `focus-visible:outline-[#D4AF37]`, `w-full` para llenar la celda del grid).
- Ícono SVG inline (patrón "líneas rectas", spec §6.3): `rect` rx=2 + 5 `line`s; `stroke="currentColor"` + `text-white` ⇒ stroke blanco; `aria-hidden="true"`.
- `<span>Guardar en mi Calendario</span>` (label literal).
- `aria-label` descriptivo: `` `Guardar en mi Calendario: ${serviceName}, ${start.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })} a las ${start.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })}` `` (spec RF-07).

### 3.5 Handler y fallback (spec §6.4)

- `handleClick` construye la URL **síncrona** y ejecuta `window.open(url, '_blank', 'noopener,noreferrer')` como primera acción (sin `await`, sin setState previo — anti-popup-blocker).
- Si `win` es falsy: `<a>` temporal (`href`, `target='_blank'`, `rel='noopener noreferrer'`), `appendChild` → `click()` → `remove()`, dentro de `try/catch`; setear estado `fallbackMsg` y renderizar `<p role="status">` con el mensaje + enlace visible al usuario como último recurso.
- Si `win` es truthy: limpiar `fallbackMsg`.

## 4. `src/pages/MyAppointmentsPage.jsx` — integración quirúrgica

### 4.1 Import

Junto a los imports existentes (línea 6): `import AddToCalendarButton from '../components/AddToCalendarButton';`.

### 4.2 Bloque de acciones (solo el `.map` inline real, líneas ~269–280)

Reemplazar el `div` envolvente del botón "Cancelar turno" por el layout de 2 columnas (RF-01):

```jsx
{apt.status === 'confirmado' && (
  <div className="pt-2 border-t border-[#5A0B22]/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() => handleCancel(apt)}
      className="w-full min-h-[44px] py-2 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
    >
      <XCircle size={16} aria-hidden="true" />
      <span>Cancelar turno</span>
    </button>
    <AddToCalendarButton
      serviceName={formatServiceName(apt.service_key || apt.service)}
      scheduledAt={apt.scheduled_at}
      notes={apt.notes || ''}
    />
  </div>
)}
```

Notas del cambio:

- La condición `{apt.status === 'confirmado' && …}` **no cambia** (RF-02): el botón de calendario solo aparece en turnos confirmados; `AddToCalendarButton` ademas retorna `null` si `scheduled_at` es inválido (doble red de seguridad).
- El botón "Cancelar turno" conserva sus clases; se agrega `min-h-[44px]` (hoy tiene py-2 + text-sm ≈ 40px) para igualar la altura del hermano y respetar el mínimo táctil (CA-05); `gap-2` (8px) separa ambas acciones (skill frontend-design).
- `formatServiceName(apt.service_key || apt.service)` repite el fallback del título de la tarjeta: el nombre del evento en Google Calendar coincide con el visible en la UI.
- **No se toca**: `fetchAppointments`, `handleCancel`, `STATUS_LABELS`, `formatDate`/`formatTime`, estados loading/error/vacío, header, `<h1>`, ni el resto del `.map`.

### 4.3 Código muerto (decisión)

`AppointmentCard` (27–78) y `appointmentCards` (138–187) quedan **intactos y documentados** (spec §7, MEMORY): eliminación fuera de alcance de 014 para no arriesgar la página; candidato a micro-spec de limpieza futura. No hay que propagar el botón ahí (no se renderizan).

## 5. Mapeo visual del botón de referencia → clases Tailwind

| Propiedad de la referencia (styled-components) | Equivalente en el proyecto (Tailwind + `<style>` local) |
|---|---|
| `background-color: #5A0B22` (fondo base) | `bg-[#5A0B22]` |
| `&:hover { background-color: #7a1333 }` | `hover:bg-[#7A1333]` (Tailwind) + sweep `::before` con `background:#7A1333` animado por el keyframe (ambos => mismo look en hover) |
| `border-radius: 20px` | `rounded-[20px]` |
| `height: 40px` | `min-h-[44px]` + `py-2 px-4` (sube 4px el área táctil para cumplir el mínimo AA/44px del proyecto; visualmente equivalente) |
| `color: #fff` / texto blanco | `text-white` |
| `font-weight` semibold, tamaño texto-sm | `font-semibold text-sm` |
| `display: inline-flex; align-items: center; justify-content: center; gap` | `inline-flex items-center justify-center gap-2` |
| `width` de contenido al grid | `w-full` (llena la celda `sm:grid-cols-2`) |
| `cursor: pointer` | `cursor-pointer` |
| `transition` de color | `transition-colors` |
| Ícono SVG calendario (stroke blanco, líneas rectas) | `<svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">` con `rect` + 5 `line`s; `text-white` ⇒ stroke blanco; `aria-hidden="true"` |
| Animación **"slope"** en hover (barrido diagonal, skew) | `<style>` local: `@keyframes slope` (translateX -110%→110% con `skewX(-45deg)`) aplicado en `.imchic-gcal-btn:hover::before, :focus-visible::before`; el `::before` es el "slope" (diagonal) que barre el botón |
| Label "Agendar Turno" | `<span>Guardar en mi Calendario</span>` (cambio literal pedido) |
| — (accesibilidad, exigencia del proyecto) | `aria-label` descriptivo, `min-h-[44px]`, `focus-visible:outline-2 outline-offset-2 outline-[#D4AF37]`, `prefers-reduced-motion: reduce` en el `<style>`, `role="status"` en el fallback |
| — (anti-colisión) | Selectores del `<style>` con prefijo `imchic-gcal-btn` (patrón DownloadButton/SparkleButton) |

## 6. Verificación (constitución §4)

1. `npm run build` → exit 0, sin warnings nuevos (CA-10).
2. **Visual (Chrome DevTools, móvil 390px y desktop):** `/cuenta` → Mis Turnos con turnos reales/sembrados:
   - Turno `confirmado`: dos botones en fila ("Cancelar turno" + "Guardar en mi Calendario"); en 320–390px apilan en 1 columna con `gap-2` ≥ 8px.
   - Hover: fondo `#5A0B22` → `#7A1333` + sweep diagonal "slope"; foco por teclado: outline dorado visible; `prefers-reduced-motion` (emulación DevTools): sin sweep, color de hover sí.
   - Turnos `solicitado`/`cancelado`/`completado`: **sin** botón de calendario (RF-02).
3. **Funcional:** clic en "Guardar en mi Calendario" → pestaña con Google Calendar en "crear evento" precargado: título con servicio + marca, `dates` correctas en UTC (comparar con fecha/hora local esperada), detalles con servicio/fecha/notas. Con bloqueador de popups: fallback `<a>` + mensaje `role="status"` visible.
4. **URL unitaria (consola):** ejecutar `toGCalUTC(new Date('2026-10-10T15:00:00-03:00'))` → `20261010T180000Z`; `buildGCalUrl` con el ejemplo de §3.2 → URL que abre el evento correcto.
5. **Regresión de la página:** fetch de turnos (loading/error/vacío intactos), "Cancelar turno" (confirm → update → refetch), un solo `<h1>`, sin errores en consola.
6. **A11y rápido:** tab-order llega a ambos botones; `aria-label` leído por lector; áreas ≥ 44px; contraste blanco sobre `#5A0B22` (~14:1).

## 7. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| `window.open` bloqueado por popup blocker | `window.open` es lo **primero** en el handler (síncrono, sin await/setState previo); fallback `<a>` temporal + `role="status"` con enlace manual (RF-06/CA-04). |
| Dependencia styled-components por imitación literal del código de referencia | Spec §3 y plan §5 mapean cada propiedad a Tailwind + `<style>` local; prohibido en RF-10; T3 verifica `package.json` intacto. |
| Colisiones de CSS con el `<style>` global | Prefijo `imchic-gcal-btn` en todos los selectores (patrón DownloadButton/SparkleButton). |
| Romper la lógica de la página al editar el bloque inline | Cambio limitado al `div` envolvente del botón de acciones (§4.2); fetch/handleCancel/estados intactos; T3 incluye smoke de cancelación. |
| `scheduled_at` null/corrupto | Guarda `Number.isNaN(start.getTime()) → return null` (RF-09); la tarjeta se ve normal. |
| Duración default 60 min difiere de la real del servicio | `durationMinutes` es prop con default 60 (TurnoModal usa 60 para la mayoría); futura mejora: leer `admin_settings_public.service_durations` (fuera de alcance, spec §7). |
| `Intl` con locales no soportados | `toLocaleDateString`/`toLocaleTimeString` con `'es-AR'` ya usados en la propia página (`formatDate`/`formatTime`): mismo comportamiento probado. |
| Animación sin `prefers-reduced-motion` | Bloque `@media` dentro del mismo `<style>` (patrón LoginPage T7); verificado en T3 con emulación DevTools. |
| Botones desalineados en altura (40px vs 44px) | `min-h-[44px]` en ambos (se agrega al de Cancelar); `items-center` en el grid implícito por flex del contenido. |

## 8. Criterios de éxito

- Un turno `confirmado` ofrece "Guardar en mi Calendario" junto a "Cancelar turno"; los demás estados no lo muestran.
- El clic abre Google Calendar con evento precargado (título, fechas UTC correctas, detalles) o degrada con fallback accesible si hay popup bloqueado.
- La visual replica el botón de referencia (color, radius, slope, ícono) **sin una sola dependencia nueva** — solo Tailwind + `<style>` local.
- Build OK, página intacta (fetch/cancel/loading/error), `MEMORY.md` al día.
