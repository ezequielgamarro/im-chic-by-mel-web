# Spec 016 — Duración variable de servicios (`estimated_duration_text` + `block_minutes`)

## 1. Objetivo

Reemplazar el esquema de **duración fija** de los servicios de turnos por un modelo de **duración variable**:

1. **BD**: `public.services` deja de tener `duration_minutes` (entero fijo) y pasa a tener:
   - `estimated_duration_text` (texto para el cliente, p. ej. `"1 a 2 hs"`, `"Aprox 45 min"`).
   - `block_minutes` (entero: tiempo **máximo real** que el sistema debe bloquear en la agenda para evitar superposiciones; p. ej. si el estimado es "1 a 2 hs", `block_minutes = 120`).
2. **Panel Admin (Servicios)**: el formulario permite ingresar el texto estimado para el cliente y los minutos a bloquear en la agenda.
3. **UI del cliente (TurnoModal)**: al seleccionar un servicio, se muestra visualmente `⏱️ Tiempo estimado: {estimated_duration_text}`.
4. **Disponibilidad/Calendario**: el cálculo de slots usa **exclusivamente** `block_minutes` del servicio seleccionado para calcular el espacio necesario y bloquear el calendario; `slotGranularity` deja de ser una restricción de bloqueo y queda únicamente como **paso** de generación de candidatos.

Motivo del usuario (literal): *"El enfoque actual de duraciones fijas y 'Granularidad de Slots' es demasiado rígido. Los servicios tienen tiempos variables."*

## 2. Alcance

### 2.1 Incluye

- **A. Migración SQL nueva** `supabase/migrations/20261004000001_spec_016_services_duration.sql`:
  - `alter table public.services add column if not exists estimated_duration_text text;`
  - `add column if not exists block_minutes integer;`
  - Backfill desde `duration_minutes` (texto `'Aprox ' || duration_minutes || ' min'`; `block_minutes = coalesce(duration_minutes, 60)`), guardado contra re-ejecución (DO block que verifica existencia de la columna antes de referenciarla).
  - `block_minutes`: `default 60`, `not null`, `check (block_minutes > 0)` con nombre estable `services_block_minutes_check`.
  - Índice opcional `services_block_minutes_idx (block_minutes)`.
  - `comment on column` en ambas columnas.
  - **`drop column if exists duration_minutes`** al final (reemplazo real, según pidió el usuario).
  - Cabecera con nota de **APLICACIÓN MANUAL** (SQL Editor o `supabase db push`; el MCP no puede aplicarla). Requiere la migración 013 aplicada previamente (crea la tabla).
- **B. `src/components/admin/ServicesTab.jsx`**: reemplazar el campo `duration_minutes` del formulario por DOS campos — `estimated_duration_text` (text, placeholder `'Ej: 1 a 2 hs'`) y `block_minutes` (number, `min 15`, `max 720`, placeholder `'Minutos a bloquear'`). Actualizar fetch, validación, INSERT/UPDATE y lista (mostrar texto estimado + minutos a bloquear). CRUD, manejo de `23505`, estados y accesibilidad se mantienen.
- **C. `src/components/TurnoModalEnhanced.jsx`**:
  - Al cargar `services`, traer también `estimated_duration_text` y `block_minutes` (select completo; ver decisión §5.2).
  - Armar maps `dbTextByService` (name → estimated_duration_text) y `dbDurationByService` (name → block_minutes).
  - Mostrar bajo el `<select>` de servicio, cuando hay servicio seleccionado y texto, un párrafo tipo `⏱️ Tiempo estimado: {estimated_duration_text}` con `role="status"`.
  - Pasar a `CalendarAvailability` el nuevo prop `serviceBlockMinutes = dbDurationByService[selectedService]` (o `null` si no hay). `serviceDurations` se mantiene como fallback.
- **D. `src/components/CalendarAvailability.jsx`**:
  - Nuevo prop opcional `serviceBlockMinutes` (number|null).
  - Duración para bloquear: `const duration = serviceBlockMinutes || serviceDurations[selectedService] || 60;` — **exclusivamente** `block_minutes` del servicio si existe. Usada en `generateAvailableHours` (líneas de `endTime` y `slotEnd`) e `isDayAvailable`.
  - Al confirmar, emitir `duration` = ese mismo valor en `onSlotSelected` (en vez de solo `serviceDurations[selectedService]`).
  - `slotGranularity` se mantiene **solo como paso** de generación de candidatos (default 15), sin que limite el bloqueo (ver decisión §5.3).
  - **No se rompe la interfaz pública** del componente (props existentes conservadas; `serviceBlockMinutes` es opcional).
- **E. Documentación SDD**: esta spec, `plan.md`, `tasks.md` (incluye build y actualización de `MEMORY.md`).

### 2.2 Excluye

- Aplicar la migración vía MCP (no es posible: el MCP pertenece a otra organización; queda **pendiente de aplicación manual**, junto a las 010 y 013).
- `src/components/TurnoModal.jsx` (legado, no usado) — **intacto**.
- Edge Functions `calendar-availability` y `calendar-create-event` (reciben `duration` como hoy; el cambio es qué valor llega, no su contrato).
- `admin_settings_public` (`business_hours`, `service_durations`, `slot_granularity_minutes` siguen existiendo y usándose como fallback).
- `user_appointments` (el `service_key` guardado sigue siendo la clave de categoría; `formatServiceName` no cambia).
- `TurnSettingsTab.jsx` (Config. Turnos sigue editando `admin_settings.service_durations`; es el fallback del sistema).
- Instalación de dependencias nuevas (solo Tailwind vía CDN + lucide-react ya presente; sin styled-components).

## 3. Requisitos EARS

### 3.1 Base de datos (migración)

**RF-01 (Ubicuo)**
EL SISTEMA de datos mantendrá en `public.services` las columnas `estimated_duration_text text` (nullable; texto visible para el cliente) y `block_minutes integer not null default 60 check (block_minutes > 0)` (minutos máximos a bloquear en la agenda), y **eliminará** la columna `duration_minutes`.

**RF-02 (De evento, backfill e idempotencia)**
CUANDO se ejecute la migración, EL SISTEMA poblará `estimated_duration_text = 'Aprox ' || duration_minutes || ' min'` y `block_minutes = coalesce(duration_minutes, 60)` en las filas donde `block_minutes is null`, **antes** de aplicar `set not null` y **antes** de dropear `duration_minutes`; el backfill quedará protegido por un DO block que verifica la existencia de `duration_minutes` para permitir re-ejecución segura.

**RF-03 (Restricción, orden de aplicación)**
MIENTRAS la migración 013 no esté aplicada (la tabla `public.services` no exista), EL SISTEMA no podrá aplicar esta migración; el orden obligatorio será 013 → 016.

### 3.2 Panel Admin (ServicesTab)

**RF-04 (Ubicuo)**
EL SISTEMA permitirá en `ServicesTab` ingresar/editar el "Texto estimado para el cliente" (`estimated_duration_text`, opcional) y los "Minutos a bloquear en la agenda" (`block_minutes`, obligatorio), reemplazando el campo único `duration_minutes`.

**RF-05 (De evento, validación)**
CUANDO el formulario se envíe, EL SISTEMA validará `block_minutes` como entero entre 15 y 720 inclusive (con mensajes `role="alert"`), mantendrá la validación de `name`, `price` y `sort_order`, y persistirá `estimated_duration_text` como `null` si se deja vacío.

**RF-06 (De evento, degradación)**
CUANDO el INSERT/UPDATE falle porque la migración 016 no está aplicada (columna inexistente: `PGRST204` u error `42703`), EL SISTEMA mostrará un mensaje amigable pidiendo aplicar la migración spec 016 (SQL Editor o `supabase db push`), sin romper el resto de la pestaña.

**RF-07 (Ubicuo)**
EL SISTEMA mostrará en la lista de servicios el texto estimado del cliente y los minutos a bloquear (p. ej. `Categoría · Aprox 45 min · bloquea 45 min`), reemplazando la línea `{duration_minutes} min`.

### 3.3 UI del cliente (TurnoModalEnhanced)

**RF-08 (Ubicuo)**
EL SISTEMA, al abrir `TurnoModalEnhanced`, cargará los servicios activos incluyendo `estimated_duration_text` y `block_minutes`, y armará los maps `dbTextByService` y `dbDurationByService` indexados por nombre de servicio.

**RF-09 (Ubicuo)**
EL SISTEMA mostrará bajo el `<select>` de servicio, cuando haya un servicio seleccionado y `estimated_duration_text` no esté vacío, un texto del tipo `⏱️ Tiempo estimado: {estimated_duration_text}` con `role="status"` (accesible, mobile-first); si no hay texto, no se renderiza nada.

**RF-10 (Restricción)**
EL SISTEMA pasará a `CalendarAvailability` el prop `serviceBlockMinutes = dbDurationByService[selectedService] ?? null`, conservando `serviceDurations` (mapa normalizado por categoría desde `admin_settings_public.service_durations`) como fallback para no romper si la migración 016 no está aplicada.

### 3.4 Disponibilidad / Calendario (CalendarAvailability)

**RF-11 (Ubicuo)**
EL SISTEMA calculará la duración para bloquear como `serviceBlockMinutes || serviceDurations[selectedService] || 60` — es decir, **exclusivamente** el `block_minutes` del servicio seleccionado si existe — y usará ese valor en `generateAvailableHours` (cálculo de `endTime` y `slotEnd`, solape contra `busySlots`) e `isDayAvailable`.

**RF-12 (De evento, confirmación)**
CUANDO el usuario confirme un slot, EL SISTEMA emitirá en `onSlotSelected` el mismo valor de duración resuelto en RF-11 (`duration: serviceBlockMinutes || serviceDurations[selectedService] || 60`), que es el que llega a `calendar-create-event` y define el bloqueo en Google Calendar.

**RF-13 (Restricción, granularidad)**
MIENTRAS se generen los candidatos de horario, EL SISTEMA usará `slotGranularity` (default 15) **únicamente como paso** entre inicios candidatos (`current.setMinutes(+granularity)`), sin que limite la longitud del bloqueo; la longitud del bloqueo queda determinada exclusivamente por RF-11.

**RF-14 (Restricción, compatibilidad)**
EL SISTEMA conservará la interfaz pública actual de `CalendarAvailability` (`onSlotSelected`, `selectedService`, `serviceDurations`, `businessHours`, `slotGranularity`, `disabled`); `serviceBlockMinutes` será opcional y con valor `null` por defecto, de modo que cualquier consumidor actual (especialmente `TurnoModalEnhanced`) siga funcionando sin cambios.

### 3.5 Transversal

**RF-15 (Restricción, degradación)**
MIENTRAS la migración 016 no esté aplicada, EL SISTEMA funcionará en el front sin errores visibles: `ServicesTab` mostrará su estado de error/hint correspondiente, el TurnoModal no mostrará el texto estimado y el calendario usará `serviceDurations[categoría] || 60` (comportamiento idéntico al actual).

**RF-16 (Restricción, flujo de turnos)**
EL SISTEMA mantendrá intacto el flujo de turnos: `user_appointments.service_key` sigue guardando la clave de categoría (`unas|cabello|maquillaje`), los mensajes de WhatsApp y `formatServiceName` no cambian, y `admin_settings_public.business_hours` sigue alimentando el calendario.

**RF-17 (De evento, verificación)**
CUANDO el implementador ejecute `npm run build`, EL SISTEMA compilará sin errores ni advertencias introducidos por estos cambios.

## 4. Restricciones y Constitución

- **Mobile-first** (§1): el texto estimado en el TurnoModal y los dos campos nuevos de ServicesTab se validan primero en 320px+.
- **Estabilidad estructural** (§2): `TurnoModalEnhanced` y `CalendarAvailability` son componentes protegidos; su cambio queda cubierto por esta spec (SDD previo). `TurnoModal.jsx` no se modifica.
- **Estética consistente** (§3): solo Tailwind vía CDN + paleta de marca (`#5A0B22`, `#7A1333`, `#D4AF37`, `#FFC9D6`, `#FFF0F3`); sin dependencias nuevas (no styled-components).
- **Validación visual** (§4): toda tarea de UI se verifica en navegador antes de darse por terminada.
- **SDD** (§5): esta spec + `plan.md` + `tasks.md` preceden cualquier edición de código.

## 5. Criterios de Aceptación (CA)

| ID | Criterio |
|----|----------|
| CA-01 | Existe `supabase/migrations/20261004000001_spec_016_services_duration.sql` con cabecera de aplicación manual, orden 013→016, `add column` idempotentes, backfill guardado (DO block), `block_minutes` default 60 / not null / check > 0, índice, comments y `drop column if exists duration_minutes` al final. |
| CA-02 | Tras aplicar la migración: `select name, estimated_duration_text, block_minutes from public.services;` muestra los 10 servicios sembrados con texto `'Aprox N min'` y `block_minutes` igual al ex-`duration_minutes` (45–120); la columna `duration_minutes` ya no existe. |
| CA-03 | `ServicesTab` muestra en el formulario los campos "Texto estimado para el cliente" (text, placeholder `'Ej: 1 a 2 hs'`) y "Minutos a bloquear en la agenda" (number, min 15, max 720); ya no existe el campo `duration_minutes`. |
| CA-04 | Crear/editar un servicio persiste `estimated_duration_text` y `block_minutes`; `block_minutes` fuera de 15–720 muestra error `role="alert"`; texto vacío persiste `null`; `23505` sigue traduciéndose a mensaje amigable. |
| CA-05 | La lista de servicios muestra el texto estimado y los minutos a bloquear; CRUD (crear/editar/eliminar/toggle) y estados accesibles siguen intactos. |
| CA-06 | Sin migración 016 aplicada, guardar un servicio en `ServicesTab` muestra un mensaje claro de "migración spec 016 pendiente"; el resto de la pestaña no se rompe. |
| CA-07 | Con migración 016 aplicada, el TurnoModal muestra debajo del select `⏱️ Tiempo estimado: {texto}` (`role="status"`) al elegir un servicio con texto; sin texto, no se muestra nada. |
| CA-08 | `CalendarAvailability` usa `serviceBlockMinutes` para `endTime`, `slotEnd`, `isDayAvailable` y el `duration` emitido en `onSlotSelected` (prioridad: block_minutes del servicio → `serviceDurations[categoría]` → 60). |
| CA-09 | `slotGranularity` sigue existiendo como prop (default 15) pero solo como paso de candidatos: con `block_minutes = 120`, un día de 8 hs ofrece slots que bloquean 120 minutos aunque la granularidad sea 15. |
| CA-10 | Sin migración 016 (fallback), el calendario se comporta **idéntico** al actual (duración desde `serviceDurations[categoría] || 60`) y el flujo de turnos completo (calendario → WhatsApp → `user_appointments`) funciona sin errores. |
| CA-11 | El flujo de turnos queda intacto: `service_key` = clave de categoría, mensajes WhatsApp y `formatServiceName` sin cambios; `admin_settings_public.business_hours` sigue alimentando el calendario. |
| CA-12 | `npm run build` sin errores; sin dependencias nuevas; solo Tailwind + paleta de marca. |
| CA-13 | `MEMORY.md` actualizado al cierre. |

## 6. Modelo de datos (resumen)

### `public.services` — DESPUÉS de la migración 016

| Columna | Tipo | Restricción / default | Origen |
|---------|------|------------------------|--------|
| `id` | uuid | pk, `default gen_random_uuid()` | spec 013 (sin cambios) |
| `name` | text | `not null`, `unique (name)` → `services_unique_name` | spec 013 (sin cambios) |
| `category` | text | `not null default 'general'` | spec 013 (sin cambios) |
| `description` | text | nullable | spec 013 (sin cambios) |
| `estimated_duration_text` | text | **nullable** (NULL = sin texto estimado; el front no muestra nada) | **nuevo (016)** |
| `block_minutes` | integer | `not null default 60`, `check (block_minutes > 0)` → `services_block_minutes_check`; índice `services_block_minutes_idx` | **nuevo (016)** |
| ~~`duration_minutes`~~ | ~~integer~~ | **ELIMINADA** por la migración 016 | spec 013 |
| `price` | numeric(10,2) | nullable, `check (>= 0)` | spec 013 (sin cambios) |
| `sort_order` | integer | `not null default 0` | spec 013 (sin cambios) |
| `is_active` | boolean | `not null default true` | spec 013 (sin cambios) |
| `created_at` / `updated_at` | timestamptz | `not null default now()`; trigger `services_set_updated_at` → `public.set_updated_at()` | spec 013 (sin cambios) |

- RLS y grants **sin cambios** (la migración 016 no toca políticas).
- Backfill: `estimated_duration_text = 'Aprox ' || duration_minutes || ' min'` y `block_minutes = coalesce(duration_minutes, 60)` (solo filas con `block_minutes is null`). Con los datos sembrados por 013: textos `Aprox 45 min` … `Aprox 120 min` y block_minutes 45–120 (el admin puede ajustarlos luego desde la pestaña Servicios).

### `admin_settings.service_durations` / `admin_settings_public` (sin cambios estructurales)

Sigue siendo el **fallback** del sistema (claves `unas|cabello|maquillaje|packs` → minutos). `business_hours` sigue alimentando el calendario y `slot_granularity_minutes` queda reducido a "paso de candidatos" (RF-13).

### `user_appointments.service_key` (sin cambios)

Sigue guardando la clave de categoría derivada vía `getCategoryKey`; `formatServiceName` la resuelve a texto legible. El `duration` emitido al confirmar (RF-12) viaja a la Edge Function `calendar-create-event` (Google Calendar) y define el bloqueo real, pero no cambia el contrato de la función.

## 7. Observaciones / Riesgos

- **Migración manual y orden**: 016 requiere 013 aplicada (crea la tabla). El front **debe** funcionar sin 016 (RF-15/CA-10): fallback a `serviceDurations[categoría] || 60`.
- **Riesgo PGRST204 en TurnoModal**: si se hiciera `select('…, estimated_duration_text, block_minutes')` sin 016 aplicada, PostgREST devolvería error y el modal caería a `SERVICE_OPTIONS` (perdiendo la lista dinámica de la 013). Mitigación (§5.2 del plan): usar `select('*')` y leer campos por nombre; si no existen, los maps quedan vacíos y el fallback activa sin errores.
- **Riesgo PGRST204/42703 en ServicesTab al guardar**: el INSERT/UPDATE con las columnas nuevas falla sin 016. Mitigación RF-06: traducir a mensaje "aplicá la migración spec 016".
- **Backfill re-ejecutable**: el DO block evita que re-correr la migración falle al no existir ya `duration_minutes`.
- **`estimated_duration_text` nullable**: es intencional (texto informativo); el front muestra solo si hay texto (RF-09).
- **`block_minutes` mínimo 15 en front vs check `> 0` en BD**: la BD es laxa a propósito (admitir valores atípicos sin romper el schema); el front aplica la política 15–720 del usuario. Documentado como decisión.
- **Bloqueo más largo que el servicio real**: con `block_minutes` alto (p. ej. 120 para "1 a 2 hs"), Google Calendar bloquea 120 min — es exactamente lo pedido (evitar superposiciones). Riesgo de "sobre-bloqueo" si el admin pone valores exagerados: mitigable editando el servicio desde el admin.
- **Categoría `'general'` o servicio sin fila en DB**: `getCategoryKey` cae al fallback actual y `dbDurationByService[...]` es `undefined` → `serviceBlockMinutes = null` → se usa `serviceDurations[categoría] || 60` (sin regresión).
- **`isDayAvailable`**: hoy calcula una variable local `duration` que no usa (delega en `generateAvailableHours`); se actualiza la expresión por consistencia (RF-11) sin cambiar comportamiento.
- **Código preexistente sin uso** (`TurnoModalForm`, `SERVICE_KEY_MAP`/`getServiceKey` internos del componente, `TIME_SLOTS`): fuera de alcance, no se toca.

## 8. Estado

- **Estado**: Borrador listo para revisión y aprobación.
- **Fecha**: 2026-10-04
- **Autor**: Planner SDD
