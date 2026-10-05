# Tareas de Implementación — Spec 016: Duración variable de servicios (`estimated_duration_text` + `block_minutes`)

> Orden sugerido: T1 → T2 → T3 → T4 → T5 → T6.
> Cada tarea es discreta y verificable. Las tareas de UI requieren validación visual (constitución §4).
> **No editar**: `TurnoModal.jsx`, `TurnSettingsTab.jsx`, Edge Functions, `admin_settings_public`, `user_appointments` ni `src/utils/serviceNames.js`.

---

## T1: Migración SQL `20261004000001_spec_016_services_duration.sql`

**Archivo afectado:** `supabase/migrations/20261004000001_spec_016_services_duration.sql` (nuevo)

**Cambio:**
- Cabecera con nota de **APLICACIÓN MANUAL** (SQL Editor o `supabase db push`; el MCP no puede aplicarla), orden obligatorio 013 → 016 y referencia a la spec (patrón de las migraciones 010/013).
- `alter table public.services add column if not exists estimated_duration_text text, add column if not exists block_minutes integer;`
- Backfill en DO block (solo si `duration_minutes` existe en `information_schema.columns`): `estimated_duration_text = coalesce(estimated_duration_text, 'Aprox ' || duration_minutes || ' min')`, `block_minutes = coalesce(block_minutes, duration_minutes, 60)`, `where block_minutes is null`.
- `alter column block_minutes set default 60;`
- Constraint estable: `drop constraint if exists services_block_minutes_check;` + `add constraint services_block_minutes_check check (block_minutes > 0);`
- `alter column block_minutes set not null;` (después del backfill).
- Índice `create index if not exists services_block_minutes_idx on public.services (block_minutes);`
- `comment on column` en `estimated_duration_text` y `block_minutes`.
- `drop column if exists duration_minutes;` **al final** (tras el backfill).
- No tocar RLS, grants, triggers ni `admin_settings*`.

**Criterio de hecho:**
- [ ] El archivo existe, es sintácticamente válido y sigue el patrón de `20261004000000_spec_013_services.sql`.
- [ ] Backfill protegido por DO block (re-ejecutable tras el drop); `block_minutes` queda `not null default 60 check (> 0)`; `duration_minutes` dropeada al final.

**Verificación:**
- Revisión experta contra la skill `supabase-postgres-best-practices` y el plan §2.
- Tras aplicación manual: `select name, estimated_duration_text, block_minutes from public.services order by sort_order;` → 10 filas con `'Aprox N min'` y block_minutes 45–120; `select column_name from information_schema.columns where table_name='services';` ya no incluye `duration_minutes`.

**Dependencias:** migración 013 aplicada en el proyecto real (crea la tabla). Bloquea la verificación real de T2/T3/T4, no su desarrollo.

---

## T2: `ServicesTab.jsx` — dos campos de duración variable

**Archivo afectado:** `src/components/admin/ServicesTab.jsx`

**Cambio:**
- `EMPTY_FORM`: reemplazar `duration_minutes: ''` por `estimated_duration_text: ''` y `block_minutes: ''`.
- `startEdit`: mapear `service.estimated_duration_text ?? ''` y `service.block_minutes` (null/undefined → `''`), patrón idéntico al actual.
- Validación (RF-05): `block_minutes` entero entre 15 y 720 (mensaje `role="alert"`); `estimated_duration_text` sin validación (nullable, `''` → `null` al guardar); `name`/`price`/`sort_order` intactos.
- Payload: `estimated_duration_text: form.estimated_duration_text.trim() || null`, `block_minutes: Number(form.block_minutes)`; resto intacto. Insert/Update/`23505`/`cancelEdit` sin cambios.
- Formulario: reemplazar el campo `duration_minutes` (grid ~L333–360) por:
  - "Texto estimado para el cliente": `id="service-estimated-duration-text"`, `type="text"`, placeholder `'Ej: 1 a 2 hs'`, con `aria-invalid`/`aria-describedby` y error `service-estimated-duration-text-error`.
  - "Minutos a bloquear en la agenda": `id="service-block-minutes"`, `type="number"`, `inputMode="numeric"`, `min="15"`, `max="720"`, `step="1"`, placeholder `'Ej.: 120'`, error `service-block-minutes-error`.
  - Reacomodar el grid (p. ej. `grid-cols-1 sm:grid-cols-2` para los 4 campos numéricos/texto); mobile-first, `min-h-[44px]`, paleta de marca.
- Lista (RF-07): línea de meta pasa a `{category} · {estimated_duration_text || 'sin tiempo estimado'} · bloquea {block_minutes ?? '—'} min · orden N`.
- Errores de guardado (RF-06): si `saveError.code` es `PGRST204` o `42703`, mostrar "Faltan las columnas estimated_duration_text/block_minutes. Aplicá la migración spec 016 (SQL Editor o supabase db push)." El manejo actual de `42P01`/`PGRST205` (tabla inexistente, spec 013) queda intacto.

**Criterio de hecho:**
- [ ] El formulario ya no tiene `duration_minutes`; tiene los dos campos nuevos con placeholders pedidos y validación 15–720.
- [ ] Crear/editar persiste ambos campos; lista muestra texto estimado y minutos a bloquear; CRUD, `23505`, estados y accesibilidad intactos.

**Verificación:**
- `npm run build` OK. Con migración aplicada: editar un servicio, poner texto `'1 a 2 hs'` y block_minutes `120`, guardar, recargar → persisten; `block_minutes = 10` muestra error; texto vacío persiste `null`. Sin migración 016: guardar muestra el hint de migración spec 016.

**Dependencias:** T1 (para verificación con datos; el componente compila sin ella).

---

## T3: `TurnoModalEnhanced.jsx` — maps, texto estimado y prop `serviceBlockMinutes`

**Archivo afectado:** `src/components/TurnoModalEnhanced.jsx`

**Cambio:**
- Efecto `[isOpen]` de servicios (L340–365): el select pasa a `.select('*')` (evita PGRST204 sin migración 016; solo se leen campos por nombre). Fallback silencioso intacto.
- Estados nuevos: `dbTextByService` (name → estimated_duration_text) y `dbDurationByService` (name → block_minutes), inicializados en `{}`; poblados en el `.then` con `?? null`. En el fallback, maps vacíos.
- Debajo del `<select id="enhanced-service">` (RF-09): párrafo `role="status"` con `⏱️ Tiempo estimado: {dbTextByService[selectedService]}` — **solo** si `selectedService && dbTextByService[selectedService]`; si no hay texto, no se renderiza nada.
- `CalendarAvailability` (RF-10): agregar `serviceBlockMinutes={dbDurationByService[selectedService] ?? null}`; los demás props (`selectedService={getCategoryKey(...)}`, `serviceDurations={getNormalizedDurations(...)}`, `businessHours`, `slotGranularity`) quedan **idénticos** (`serviceDurations` sigue como fallback).

**Criterio de hecho:**
- [ ] Sin migración 016: el TurnoModal no muestra texto estimado, el calendario se comporta igual que hoy y el flujo completo funciona sin errores.
- [ ] Con migración 016: se muestra `⏱️ Tiempo estimado: …` bajo el select (con `role="status"`) al elegir un servicio con texto; `CalendarAvailability` recibe el `block_minutes` del servicio elegido.

**Verificación:**
- `npm run build` OK. Smoke en ambos escenarios: abrir desde HomeServices ("Uñas") e InversionPage ("Cabello"/"Maquillaje"), cambiar de servicio (el texto estimado cambia/anuncia), tomar turno logueado y como invitado; verificar `user_appointments.service_key` (clave de categoría) y mensaje de WhatsApp sin cambios.

**Dependencias:** T1 (para el escenario "con migración"); T4 se verifica en conjunto (prop consumido allí).

---

## T4: `CalendarAvailability.jsx` — duración de bloqueo = `block_minutes`

**Archivo afectado:** `src/components/CalendarAvailability.jsx`

**Cambio:**
- Props (RF-14): agregar `serviceBlockMinutes = null` junto a `slotGranularity` (default intacto). No se elimina ni renombra ninguna prop existente.
- Duración única (RF-11): `const duration = serviceBlockMinutes || serviceDurations[selectedService] || 60;` usada en:
  - `generateAvailableHours`: `endTime.setMinutes(endTime.getMinutes() - duration)` (L116) y `slotEnd = new Date(slotStart.getTime() + duration * 60000)` (L125); agregar `serviceBlockMinutes` a las deps del `useCallback`. El guard `!selectedService || !serviceDurations[selectedService]` se mantiene.
  - `isDayAvailable`: la variable local `duration` se calcula con la misma expresión RF-11 (consistencia; el corte real lo hace `generateAvailableHours`).
  - Confirmación (RF-12): `onSlotSelected({ service: selectedService, datetime, duration })` emitiendo el mismo valor resuelto.
- Granularidad (RF-13): `slotGranularity` queda **solo** como paso de candidatos (`current.setMinutes(+granularity)` en L149); documentar en comentario de código la decisión (granularidad = resolución de candidatos; `block_minutes` = espacio bloqueado).
- No tocar: fetch de busySlots, solape contra `busySlots`, `businessHours`, grilla del calendario, ni la interfaz de render fuera de lo pedido.

**Criterio de hecho:**
- [ ] Con `serviceBlockMinutes = 120`, los slots bloquean 120 minutos (`endTime`, `slotEnd`, solape e `isDayAvailable` coherentes) aunque `slotGranularity` sea 15.
- [ ] Sin `serviceBlockMinutes` (null), el comportamiento es idéntico al actual (fallback `serviceDurations[categoría] || 60`); el prop `duration` emitido usa la misma prioridad.

**Verificación:**
- `npm run build` OK. Con migración: elegir servicio con block_minutes 120 en un día con un turno ocupado de 10:00 a 11:30 → ningún slot candidato pueda cruzar ese rango (los que empezarían antes de 11:30 y terminarían después quedan ocupados); al confirmar, verificar que el evento de Google Calendar se crea con 120 min. Sin migración: calendario idéntico al actual.

**Dependencias:** T3 (para el escenario con `serviceBlockMinutes`; el componente compila y degrada sin él).

---

## T5: Build final + validación visual (ambos escenarios)

**Archivos afectados:** verificación global (sin cambios de código salvo hallazgos menores puntuales).

**Cambio:** Ninguno (solo verificación).

**Criterio de hecho:**
- [ ] `npm run build` exit 0, sin warnings introducidos.
- [ ] CA-01…CA-12 de la spec verificados manualmente (migración, ServicesTab, TurnoModal con/sin migración, CalendarAvailability, accesibilidad, 320px).

**Verificación:** checklist de CA + Chrome DevTools móvil/desktop (320px y escritorio): texto estimado legible en el modal; campos del admin con 44px y foco visible; `role="status"` anunciado al cambiar de servicio; flujo de turnos completo en ambos escenarios.

**Dependencias:** T1–T4.

---

## T6: Actualizar `MEMORY.md`

**Archivo afectado:** `MEMORY.md`

**Cambio:** Agregar sección `## Spec 016 — Duración variable de servicios (IMPLEMENTADA, 2026-10-XX)` con: reemplazo de `duration_minutes` por `estimated_duration_text` + `block_minutes` (migración `20261004000001_spec_016_services_duration.sql` **PENDIENTE de aplicación manual**, orden 013 → 016), ServicesTab con los dos campos (validación 15–720), TurnoModal con `⏱️ Tiempo estimado` + prop `serviceBlockMinutes`, CalendarAvailability con duración de bloqueo = `block_minutes` (granularidad solo como paso), fallback al `serviceDurations` actual (front funcional sin la migración). Actualizar las secciones "Estado actual" y "Decisiones arquitectónicas" si corresponde. Mantener límite de 50 líneas.

**Criterio de hecho:**
- [ ] `MEMORY.md` incluye la sección de la spec 016 y el estado de la migración pendiente (junto a 010 y 013).

**Verificación:** Leer `MEMORY.md` y confirmar sección presente y límite respetado.

**Dependencias:** T5.
