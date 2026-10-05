# Plan 016 — Duración variable de servicios (`estimated_duration_text` + `block_minutes`)

## 1. Diagnóstico (verificado, sin re-investigar)

- `public.services` hoy (migración 013): `duration_minutes integer not null default 60 check (duration_minutes > 0)`; seed de 10 servicios con 45–120 min. No existe `estimated_duration_text`.
- `CalendarAvailability.jsx` recibe `{ onSlotSelected, selectedService, serviceDurations, businessHours, slotGranularity = 15, disabled }`.
  - `selectedService` es **clave de categoría** (`'unas'`, …) resuelta por `getCategoryKey`; `serviceDurations` es el mapa normalizado `{categoría: minutos}` armado por `getNormalizedDurations`.
  - `generateAvailableHours` (L95–153): guard `!selectedService || !serviceDurations[selectedService]`; `duration = serviceDurations[selectedService] || 60`; `endTime = close − duration`; `slotEnd = slotStart + duration*60000`; solape contra `busySlots`; paso `slotGranularity || 15`.
  - `isDayAvailable` (L207–219): calcula `duration` local (hoy sin uso) y delega en `generateAvailableHours`.
  - Confirmación (L399–407): `onSlotSelected({ service: selectedService, datetime, duration: serviceDurations[selectedService] || 60 })`.
- `TurnoModalEnhanced.jsx`:
  - Efecto `[isOpen]` (L340–365): `.from('services').select('name, category, is_active')…` → `serviceOptions` (nombres) + `dbCategoryByService` (name→category); fallback silencioso a `SERVICE_OPTIONS`.
  - Select de servicio (L621–630) y llamada a `CalendarAvailability` (L633–640): `selectedService={getCategoryKey(...)}`, `serviceDurations={getNormalizedDurations(...)}`, `slotGranularity={adminSettings.slot_granularity_minutes}`.
  - `selectedService` en el estado del modal es el **nombre completo** del servicio (p. ej. `"Uñas: Semipermanente & Capping"`), no la clave de categoría.
- `ServicesTab.jsx`: `EMPTY_FORM.duration_minutes`, `fetchServices` con `select('*')`, validación `duration_minutes > 0` (L124–131), payload `duration_minutes: Number(...)` (L162), campo del form (L333–360), línea de lista `{duration_minutes} min` (L518).
- `admin_settings_public` (`service_durations`, `business_hours`, `slot_granularity_minutes`) sigue usándose; `user_appointments.service_key` = clave de categoría; `formatServiceName` en `serviceNames.js` no cambia.

## 2. Migración `supabase/migrations/20261004000001_spec_016_services_duration.sql`

Reglas de diseño (skill `supabase-postgres-best-practices` + patrón de las 010/013): idempotente (`if not exists` / `drop … if exists` / DO block), least privilege (no se toca RLS/grants), comentarios de columna, orden de aplicación 013 → 016. **Aplicación manual** (SQL Editor o `supabase db push`).

```sql
-- =============================================================================
-- Spec 016 — Duración variable de servicios (estimated_duration_text + block_minutes)
-- -----------------------------------------------------------------------------
-- Reemplaza `duration_minutes` (entero fijo) por dos columnas:
--   * estimated_duration_text (text, nullable): texto visible para el cliente
--     (ej. "1 a 2 hs", "Aprox 45 min").
--   * block_minutes (integer, not null default 60, check > 0): tiempo MÁXIMO
--     real que el sistema bloquea en la agenda para evitar superposiciones
--     (ej. si el estimado es "1 a 2 hs", block_minutes = 120).
--
-- *** APLICACIÓN MANUAL REQUERIDA ***
-- Este archivo NO se aplica automáticamente desde el agente: el MCP de Supabase
-- disponible pertenece a otra organización y no tiene permisos sobre el proyecto
-- real de "Im Chic by Mel". Aplicar manualmente con UNA de estas opciones:
--   1) Supabase CLI:      supabase db push
--   2) SQL Editor del dashboard: pegar y ejecutar este archivo completo.
--
-- ORDEN: requiere la migración 013 (20261004000000_spec_013_services.sql)
-- aplicada previamente (crea la tabla public.services).
--
-- El FRONT funciona SIN esta migración (fallback a admin_settings_public.
-- service_durations / 60); ver specs/016_servicios_duracion_variable/spec.md.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Nuevas columnas (idempotente)
-- -----------------------------------------------------------------------------
alter table public.services
  add column if not exists estimated_duration_text text,
  add column if not exists block_minutes integer;

-- -----------------------------------------------------------------------------
-- 2. Backfill desde duration_minutes (solo filas sin block_minutes).
--    DO block: solo referencia duration_minutes si la columna todavía existe,
--    para que re-ejecutar la migración después del drop no falle.
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'services'
      and column_name  = 'duration_minutes'
  ) then
    update public.services
    set estimated_duration_text = coalesce(estimated_duration_text, 'Aprox ' || duration_minutes || ' min'),
        block_minutes           = coalesce(block_minutes, duration_minutes, 60)
    where block_minutes is null;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Defaults y restricciones de block_minutes
-- -----------------------------------------------------------------------------
alter table public.services
  alter column block_minutes set default 60;

-- Constraint con nombre estable + re-ejecutable
alter table public.services drop constraint if exists services_block_minutes_check;
alter table public.services
  add constraint services_block_minutes_check check (block_minutes > 0);

-- NOT NULL solo después del backfill
alter table public.services
  alter column block_minutes set not null;

-- -----------------------------------------------------------------------------
-- 4. Índice en la columna del nuevo patrón de bloqueo (opcional pero útil si
--    en el futuro se filtra/sorta por block_minutes; costo de escritura mínimo
--    en una tabla de ~10 filas).
-- -----------------------------------------------------------------------------
create index if not exists services_block_minutes_idx
  on public.services (block_minutes);

-- -----------------------------------------------------------------------------
-- 5. Comentarios de documentación
-- -----------------------------------------------------------------------------
comment on column public.services.estimated_duration_text
  is 'Texto de duración estimada visible para el cliente (ej. "1 a 2 hs"). Nullable: NULL = sin texto estimado (el TurnoModal no muestra nada). Spec 016.';

comment on column public.services.block_minutes
  is 'Minutos MÁXIMOS que el sistema bloquea en la agenda para este servicio (evita superposiciones). Entero > 0, default 60. Spec 016. Reemplaza duration_minutes.';

-- -----------------------------------------------------------------------------
-- 6. Drop de la columna vieja (reemplazo real; AL FINAL, tras el backfill)
-- -----------------------------------------------------------------------------
drop column if exists duration_minutes;

-- =============================================================================
-- FIN — Spec 016. Recordatorio: aplicar manualmente (CLI o SQL Editor), después
-- de la migración 013.
-- =============================================================================
```

**Resumen del SQL**: 2 columnas nuevas → backfill idempotente desde `duration_minutes` (texto `'Aprox N min'` + `block_minutes = duration_minutes`) → `default 60` + `check (> 0)` con nombre estable + `not null` → índice `services_block_minutes_idx` → comments → `drop column if exists duration_minutes` al final. No toca RLS, grants ni triggers.

## 3. `src/components/admin/ServicesTab.jsx` (RF-04…RF-07)

### 3.1 Estado y fetch

- `EMPTY_FORM`: `duration_minutes: ''` → `estimated_duration_text: ''`, `block_minutes: ''`.
- `fetchServices`: **sin cambios** (`select('*')` ya trae las columnas nuevas cuando existen).
- `startEdit`: mapear `service.estimated_duration_text ?? ''` y `service.block_minutes` (con el mismo patrón null/undefined → `''` de hoy).
- Hint de error de migración (RF-06): extender el manejo de errores de guardado — si `saveError.code` es `PGRST204`/`42703` (columna inexistente, migración 016 no aplicada), `setSubmitError('Faltan las columnas estimated_duration_text/block_minutes. Aplicá la migración spec 016 (SQL Editor o supabase db push).')`. El `MIGRATION_ERROR_CODES` actual (`42P01`/`PGRST205`) sigue cubriendo la tabla inexistente (013).

### 3.2 Validación (RF-05)

Reemplazar la validación de `duration_minutes` (L124–131) por:

```js
const blockNum = Number(form.block_minutes);
if (form.block_minutes.trim() === '' || !Number.isInteger(blockNum) || blockNum < 15 || blockNum > 720) {
  next.block_minutes = 'Ingresá los minutos a bloquear en la agenda (entero entre 15 y 720).';
}
```

- `estimated_duration_text`: **sin validación obligatoria** (nullable); se trimkea al guardar y `''` → `null`.
- `name`, `price`, `sort_order`: sin cambios.

### 3.3 Payload (RF-05)

```js
const payload = {
  name: form.name.trim(),
  category: form.category,
  description: form.description.trim() || null,
  estimated_duration_text: form.estimated_duration_text.trim() || null,
  block_minutes: Number(form.block_minutes),
  price: form.price.trim() === '' ? null : Number(form.price),
  sort_order: Number(form.sort_order),
  is_active: Boolean(form.is_active),
};
```

- Insert/Update, manejo de `23505` y `cancelEdit`: sin cambios.

### 3.4 Formulario (RF-04)

Reemplazar el bloque del campo `duration_minutes` (L333–360) por dos campos dentro del mismo grid:

- **Texto estimado para el cliente**: `id="service-estimated-duration-text"`, `name="estimated_duration_text"`, `type="text"`, placeholder `'Ej: 1 a 2 hs'`, valor `form.estimated_duration_text`, errores `aria-invalid` + `aria-describedby` → `service-estimated-duration-text-error` (patrón idéntico al actual).
- **Minutos a bloquear en la agenda**: `id="service-block-minutes"`, `name="block_minutes"`, `type="number"`, `inputMode="numeric"`, `min="15"`, `max="720"`, `step="1"`, placeholder `'Ej.: 120'`, valor `form.block_minutes`, error `role="alert"` → `service-block-minutes-error`.

El grid pasa de `sm:grid-cols-3` a disposición que acomode 4 campos (nombre/categoría/descripción arriba; texto estimado + block_minutes + precio + orden en un `grid-cols-1 sm:grid-cols-2` o `sm:grid-cols-4` según quepa en escritorio — decisión visual en T2; mobile-first manda). Labels asociados, `min-h-[44px]`, paleta de marca: sin cambios de estilo.

### 3.5 Lista (RF-07)

Línea de meta (L517–522):

```jsx
<p className="text-xs text-[#5A0B22]/60">
  {service.category || 'general'}
  {' · '}{service.estimated_duration_text || 'sin tiempo estimado'}
  {' · bloquea '}{service.block_minutes ?? '—'}{' min'}
  {service.sort_order !== null && service.sort_order !== undefined ? ` · orden ${service.sort_order}` : ''}
</p>
```

## 4. `src/components/TurnoModalEnhanced.jsx` (RF-08…RF-10)

### 4.1 Carga de servicios (RF-08, mitigación PGRST204)

Cambiar el select del efecto `[isOpen]` (L345) a `select('*')` — **evita PGRST204** si la migración 016 no está aplicada (con columnas explícitas PostgREST fallaría y caeríamos a `SERVICE_OPTIONS`, perdiendo la lista dinámica de la 013). Solo leemos campos por nombre.

Estados nuevos junto a `dbCategoryByService`:

```js
const [dbTextByService, setDbTextByService] = useState({});     // name → estimated_duration_text
const [dbDurationByService, setDbDurationByService] = useState({}); // name → block_minutes
```

En el `.then`, además de los setters actuales:

```js
setDbTextByService(
  Object.fromEntries(data.map((s) => [s.name, s.estimated_duration_text ?? null]))
);
setDbDurationByService(
  Object.fromEntries(data.map((s) => [s.name, s.block_minutes ?? null]))
);
```

Fallback (error/vacío): los maps quedan vacíos (o se resetean a `{}`) → sin 016, `dbDurationByService[...]` es `undefined` → `serviceBlockMinutes = null` → el calendario usa `serviceDurations` (idéntico a hoy). `console.warn` actual intacto.

### 4.2 Texto estimado bajo el select (RF-09)

Debajo del `<select id="enhanced-service">` (después de L630):

```jsx
{selectedService && dbTextByService[selectedService] ? (
  <p
    role="status"
    className="mt-2 text-sm text-[#7A1333] font-medium flex items-center gap-1.5"
  >
    <span aria-hidden="true">⏱️</span>
    <span>Tiempo estimado: {dbTextByService[selectedService]}</span>
  </p>
) : null}
```

- Solo se renderiza si hay servicio seleccionado **y** texto (RF-09/RF-15).
- `role="status"` hace anuncio accesible al cambiar de servicio; sin `aria-live` duplicado.

### 4.3 Prop nuevo a CalendarAvailability (RF-10)

En la llamada (L633–640) agregar:

```jsx
serviceBlockMinutes={dbDurationByService[selectedService] ?? null}
```

`selectedService` (estado del modal) es el **nombre** del servicio, que es la clave de `dbDurationByService`. Los demás props (`selectedService={getCategoryKey(...)}`, `serviceDurations={getNormalizedDurations(...)}`, `businessHours`, `slotGranularity`) quedan **idénticos**: `serviceDurations` sigue siendo el fallback (RF-14/RF-15).

## 5. `src/components/CalendarAvailability.jsx` (RF-11…RF-14)

### 5.1 Props (RF-14)

```js
export function CalendarAvailability({
  onSlotSelected,
  selectedService,
  serviceDurations,
  businessHours,
  serviceBlockMinutes = null,   // NUEVO: block_minutes del servicio (number|null)
  slotGranularity = 15,
  disabled = false
}) { …
```

Interface pública conservada: consumidores que no pasen el nuevo prop funcionan igual (default `null`).

### 5.2 Duración única de bloqueo (RF-11)

Crear un helper de módulo o una constante dentro del componente (se recalcula por render; es barato):

```js
// Duración para bloquear la agenda: EXCLUSIVAMENTE block_minutes del servicio
// si existe; si no, fallback al mapa por categoría (admin_settings_public) y
// por último 60. Ver specs/016 (RF-11).
const duration = serviceBlockMinutes || serviceDurations[selectedService] || 60;
```

Aplicar en:

- `generateAvailableHours` (L95–153): reemplazar los tres usos de `serviceDurations[selectedService] || 60` por `duration`:
  - L116: `endTime.setMinutes(endTime.getMinutes() - duration);`
  - L125: `const slotEnd = new Date(slotStart.getTime() + duration * 60000);`
  - El guard L96 (`!selectedService || !serviceDurations[selectedService]`) se **mantiene** (sigue protegiendo el caso "sin servicio/ sin config"; `serviceDurations` siempre tiene la clave vía `getNormalizedDurations`, que hace fallback a 60). Agregar `serviceBlockMinutes` al array de deps del `useCallback`.
- `isDayAvailable` (L207–219): la variable local `duration` (hoy sin uso) pasa a calcularse con la misma expresión RF-11 (consistencia; el corte real lo hace `generateAvailableHours`, que ya usa `duration`).
- Confirmación (L403–407): emitir el mismo valor:

```js
duration: serviceBlockMinutes || serviceDurations[selectedService] || 60,
```

(En la práctica se emite la variable `duration` del render.)

### 5.3 Decisión: `slotGranularity` solo como paso (RF-13)

- **Se mantiene** `slotGranularity` como prop (default 15) y como **paso** entre inicios candidatos: L149 `current.setMinutes(current.getMinutes() + (slotGranularity || 15));`.
- **Deja de limitar el bloqueo**: la longitud del bloqueo la determina exclusivamente `duration` (block_minutes), no la granularidad. Documentado como decisión de diseño: la granularidad resuelve la *resolución* de los candidatos; `block_minutes` resuelve el *espacio* reservado. Si el admin setea granularidad 60, se ofrecen inicios cada hora pero cada slot bloquea `block_minutes` minutos (p. ej. 120) — correcto y pedido por el usuario.
- **No se toca** `businessHours` (sigue viniendo de `admin_settings_public`) ni la Edge Function `calendar-availability` (los busySlots ya devuelven rangos `start/end` reales; el solape L133 con `slotStart < busyEnd && slotEnd > busyStart` ya es correcto con `duration` variable).

## 6. Orden de implementación y verificación

Orden: **T1 (migración SQL, archivo) → T2 (ServicesTab) → T3 (TurnoModalEnhanced) → T4 (CalendarAvailability) → T5 (build + validación visual, con y sin migración) → T6 (MEMORY)**.

- T3 y T4 se verifican juntos (el prop nuevo nace en T3 y se consume en T4); cada uno compila por separado (prop opcional).
- T2 y T3/T4 degradan sin T1 aplicada (RF-15); T1 solo bloquea la verificación "con datos reales".

Verificación (constitución §4):

1. `npm run build` (exit 0, sin warnings nuevos).
2. **Sin migración 016**: `/admin` → Servicios: crear servicio con los campos nuevos muestra el hint de migración pendiente (si 013 sí está aplicada); TurnoModal sin texto estimado; calendario se comporta idéntico al actual (duración por categoría); flujo completo calendario → WhatsApp → `user_appointments` sin errores.
3. **Con migración 016 aplicada**: `ServicesTab` lista los 10 servicios con texto `'Aprox N min'` y block_minutes 45–120; editar block_minutes a 120 y texto a `'1 a 2 hs'` persiste; TurnoModal muestra `⏱️ Tiempo estimado: 1 a 2 hs` bajo el select; el calendario bloquea 120 min por slot (verificar que un día con un turno de 90 min a las 10:00 deja libre recién a partir de 11:30 — el solape evita slots que crucen ese rango).
4. Granularidad: con `slot_granularity_minutes = 15` y `block_minutes = 120`, los candidatos siguen apareciendo cada 15 min pero cada uno bloquea 120 min.
5. Accesibilidad: `role="status"` del texto estimado anuncia al cambiar de servicio; labels/44px/foco visible en los 2 campos nuevos de ServicesTab; mobile 320px.
6. Flujo intacto: `user_appointments.service_key` sigue siendo la clave de categoría; mensaje de WhatsApp sin cambios de formato.

## 7. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Migración 016 no aplicada y el admin cree que "no anda" | RF-15/CA-10: fallback del calendario a `serviceDurations[categoría] \|\| 60`; TurnoModal sin texto; ServicesTab con hint explícito de migración pendiente (RF-06). |
| `select('…, estimated_duration_text, block_minutes')` sin 016 → PGRST204 → el TurnoModal pierde la lista dinámica de la 013 | §4.1: `select('*')` + lectura por nombre; maps vacíos → fallback silencioso. |
| INSERT/UPDATE de ServicesTab falla sin 016 (columna inexistente) | RF-06: traducir `PGRST204`/`42703` a mensaje "aplicá la migración spec 016". |
| Re-ejecutar la migración tras el `drop column` rompe el backfill | §2: DO block que solo ejecuta el update si `duration_minutes` existe; `add column if not exists` + `drop constraint if exists` + `drop column if exists` = re-ejecutable. |
| Aplicar 016 sin 013 (tabla inexistente) | Header de la migración + spec RF-03: orden obligatorio 013 → 016; el error de Postgres es explícito ("relation does not exist"). |
| `block_minutes` exagerado "come" agenda | Es el criterio del admin; el campo es editable en cualquier momento desde Servicios (mitigación operativa, documentada en spec §7). |
| `estimated_duration_text` NULL en filas viejas | Nullable por diseño; el front no muestra nada (RF-09/RF-15); el backfill lo puebla en la migración. |
| Categoría `'general'` o servicio sin fila DB | `getCategoryKey` cae al fallback actual; `serviceBlockMinutes = null` → `serviceDurations[categoría] \|\| 60` (sin regresión). |
| Cambiar la duración emitida al confirmar altera el bloqueo en Google Calendar | Es exactamente el objetivo (RF-12): el evento se crea con `block_minutes`. El contrato de la Edge Function no cambia. |
| Granularidad admin seteada en un valor grande (p. ej. 60) reduce cantidad de candidatos | Comportamiento aceptado y documentado (RF-13): la granularidad es paso, no límite de bloqueo. |
| Romper la interfaz pública de `CalendarAvailability` | RF-14: nuevo prop opcional con default `null`; props existentes intactas; único consumidor (`TurnoModalEnhanced`) actualizado en la misma spec. |

## 8. Criterios de éxito

- El admin configura, por servicio, el texto que ve el cliente y los minutos que bloquea la agenda, sin tocar código.
- El TurnoModal muestra el tiempo estimado al cliente y el calendario reserva exactamente `block_minutes` por turno (sin depender de la granularidad global).
- Sin la migración aplicada, todo funciona como hoy (fallback); con ella aplicada, el modelo variable queda activo.
- Build OK, sin dependencias nuevas, flujo de turnos intacto, `MEMORY.md` actualizado.
