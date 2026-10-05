# Spec 013 — Etiquetas legibles de categorías + Pestaña "Servicios" en el Admin (CRUD + integración pública)

## 1. Objetivo

Dos partes:

- **Parte A — Corrección de "Uñas":** en `TurnSettingsTab.jsx` (Config. Turnos), la sección "Duración de Servicios" muestra hoy las claves crudas `['unas', 'cabello', 'maquillaje', 'packs']` con la clase `capitalize`, lo que produce **"Unas"** (incorrecto; falta la tilde). Debe mostrar las **etiquetas legibles** "Uñas", "Cabello", "Maquillaje", "Packs" sin alterar la lógica de guardado.
- **Parte B — Pestaña "Servicios":** los servicios de turnos están **hardcodeados** en `TurnoModalEnhanced.jsx` (`SERVICE_OPTIONS`, 10 servicios) y no se pueden editar. Se crea la tabla `public.services` (migración SQL manual), una pestaña admin "Servicios" (CRUD) y la integración pública en el TurnoModal, con **degradación grácil** al `SERVICE_OPTIONS` actual si la tabla no existe o está vacía (el front debe funcionar SIN la migración aplicada).

## 2. Alcance

### 2.1 Incluye

- `src/components/admin/TurnSettingsTab.jsx`: mapa clave→etiqueta (`unas→Uñas`, `cabello→Cabello`, `maquillaje→Maquillaje`, `packs→Packs`) aplicado **solo al texto visible** (label y `htmlFor` conservan la clave; el estado/guardado sigue usando `serviceDurations[cat]` con claves crudas).
- `supabase/migrations/20261004000000_spec_013_services.sql` (nuevo): tabla `public.services`, índices, trigger `updated_at` reutilizando `public.set_updated_at()`, RLS (lectura pública solo `is_active=true`; CRUD admin-only vía `(select public.is_admin())`), grants mínimos y seed idempotente de los 10 servicios actuales. **Aplicación manual** (SQL Editor o `supabase db push`).
- `src/components/admin/ServicesTab.jsx` (nuevo): CRUD de servicios (lista con badge "oculto", formulario crear/editar, editar, eliminar con `window.confirm`, alternar `is_active`), estados loading/error/vacío, mobile-first, paleta de marca, `min-h-[44px]`, roles ARIA, precios es-AR.
- `src/pages/AdminPage.jsx`: 4ª pestaña "Servicios" (icono `Scissors` de lucide-react) en el nav existente, renderizando `<ServicesTab />` para esa clave; las 3 pestañas actuales quedan intactas.
- `src/components/TurnoModalEnhanced.jsx`: al abrir el modal, cargar servicios desde `public.services` (`select name, category, duration_minutes, is_active` `where is_active` `order by sort_order`); opciones del `<select>` construidas desde esa lista; fallback a `SERVICE_OPTIONS` si la tabla no existe (`42P01`/`PGRST205`) o está vacía; `getCategoryKey` prefiere la `category` del servicio cargado (normalizada a clave: minúsculas sin acentos) y mantiene la lógica actual como fallback. Flujo de turnos (calendario, WhatsApp, `user_appointments`) intacto.
- Documentación SDD: esta spec, `plan.md`, `tasks.md` (incluye build final y actualización de `MEMORY.md`).

### 2.2 Excluye

- Instalación de dependencias nuevas (solo Tailwind vía CDN + lucide-react ya presente).
- Modificar `SERVICE_OPTIONS`, `SERVICE_KEY_MAP`, `TurnoModalForm` (código sin uso) ni `TurnoModal.jsx` (legado).
- Cambios en `CalendarAvailability.jsx`, Edge Functions (`calendar-availability`, `calendar-create-event`), `user_appointments`, `admin_settings` ni su vista `admin_settings_public`.
- Cambiar el significado de `slot.service` / `service_key` guardado (hoy = clave de categoría: `unas|cabello|maquillaje`; `formatServiceName` lo resuelve en TurnosTab y Mis Turnos).
- Rediseño de HomeServices/InversionPage (archivos en la **raíz** del repo, no en `src/`; no se tocan).
- Aplicar la migración vía MCP (no es posible: el MCP pertenece a otra organización).

## 3. Requisitos EARS

### 3.1 Parte A — Etiquetas legibles (TurnSettingsTab)

**RF-A1 (Ubicuo)**
EL SISTEMA renderizará en la sección "Duración de Servicios" de `TurnSettingsTab.jsx` las etiquetas legibles de categoría —"Uñas", "Cabello", "Maquillaje", "Packs"— mediante un mapa clave→etiqueta, en lugar de las claves crudas con clase `capitalize` (que producen "Unas").

**RF-A2 (Restricción)**
MIENTRAS se corrija la etiqueta visible, EL SISTEMA conservará las claves crudas (`'unas'`, `'cabello'`, `'maquillaje'`, `'packs'`) para `htmlFor`, `id`, el estado `serviceDurations` y el upsert en `admin_settings`; no se modifica la lógica de guardado.

### 3.2 Parte B — Base de datos (migración)

**RF-B1 (Ubicuo)**
EL SISTEMA de datos proveerá la tabla `public.services` con: `id uuid pk default gen_random_uuid()`, `name text not null`, `category text not null default 'general'`, `description text`, `duration_minutes int not null default 60 check (duration_minutes > 0)`, `price numeric(10,2) check (price >= 0)`, `sort_order int not null default 0`, `is_active boolean not null default true`, `created_at`, `updated_at`, y `constraint services_unique_name unique (name)`.

**RF-B2 (Ubicuo)**
EL SISTEMA mantendrá índices `services_category_idx` en `(category)` y `services_sort_order_idx` en `(sort_order)`, y el trigger `services_set_updated_at` reutilizando `public.set_updated_at()`.

**RF-B3 (Restricción de seguridad)**
MIENTRAS RLS esté habilitado en `public.services`, EL SISTEMA permitirá `select` a `anon` y `authenticated` **solo** sobre filas `is_active = true`; y `select/insert/update/delete` adicionales (que incluyen filas ocultas) **solo** a usuarios admin, vía `(select public.is_admin())`, con grants mínimos (`select` a `anon, authenticated`; `insert, update, delete` a `authenticated`).

**RF-B4 (De evento, idempotencia)**
CUANDO se ejecute la migración, EL SISTEMA sembrará con `insert ... on conflict (name) do nothing` los 10 servicios actuales (nombres **exactos** de `SERVICE_OPTIONS`; categorías `'Uñas' | 'Cabello' | 'Maquillaje'` según el prefijo; duraciones estimadas; `price = null`), de modo que el admin parta de la lista actual.

**RF-B5 (De evento, degradación)**
CUANDO la migración no esté aplicada (tabla inexistente: error `42P01` de Postgres o `PGRST205` de PostgREST) o la tabla esté vacía, EL SISTEMA usará en el front la lista hardcodeada `SERVICE_OPTIONS` actual, sin errores visibles ni roturas del flujo de turnos.

### 3.3 Parte B — Pestaña admin "Servicios"

**RF-B6 (Ubicuo)**
EL SISTEMA mostrará en `/admin` una 4ª pestaña "Servicios" (icono `Scissors`) que renderiza `<ServicesTab />`, sin alterar las pestañas Productos, Turnos ni Config. Turnos.

**RF-B7 (Ubicuo)**
EL SISTEMA permitirá en `ServicesTab` cargar todos los servicios (admin ve también los ocultos, con badge "oculto"), crear, editar, eliminar (con `window.confirm`) y alternar `is_active` (visible/oculto), persistiendo en `public.services`.

**RF-B8 (De evento)**
CUANDO el formulario se envíe, EL SISTEMA validará `name` (obligatorio, no vacío), `duration_minutes` (entero > 0), `price` (vacío → `null`; si se informa, número ≥ 0) y `sort_order` (entero ≥ 0), mostrando errores `role="alert"` y estado de envío ("Guardando…").

**RF-B9 (Restricción de accesibilidad y diseño)**
MIENTRAS se renderice la pestaña, EL SISTEMA usará exclusivamente clases Tailwind con la paleta de marca (`#5A0B22`, `#7A1333`, `#D4AF37`, `#FFC9D6`, `#FFF0F3`), mobile-first, controles con `min-h-[44px]`, foco visible, labels asociados (`htmlFor`/`id`) y estados `role="status"` (loading/vacío) y `role="alert"` (errores). Precios, si se muestran, en formato es-AR.

### 3.4 Parte B — Integración pública (TurnoModalEnhanced)

**RF-B10 (Ubicuo)**
EL SISTEMA, al abrir `TurnoModalEnhanced`, cargará los servicios visibles desde `public.services` (`select name, category, duration_minutes, is_active`, `where is_active = true`, `order by sort_order`) y poblará el `<select>` "Servicio a Realizar" con esa lista; si falla o está vacía, usará `SERVICE_OPTIONS` (RF-B5).

**RF-B11 (Ubicuo)**
EL SISTEMA resolverá la categoría para duración/disponibilidad (`getCategoryKey`) **prefiriendo** la `category` del servicio cargado desde la DB (normalizada: minúsculas, sin acentos: `'Uñas'→'unas'`, `'Cabello'→'cabello'`, `'Maquillaje'→'maquillaje'`, `'packs'→'packs'`; `'general'` no matchea → fallback), manteniendo la lógica actual de coincidencia por texto (`uña`/`cabello`/`maquillaje`/`makeup`/`pack`) como fallback.

**RF-B12 (Restricción)**
MIENTRAS se integre la lista dinámica, EL SISTEMA mantendrá intacto el flujo de turnos: el servicio inicial (`initialService` de HomeServices/InversionPage: "Uñas"/"Cabello"/"Maquillaje") sigue matcheando por `includes` contra la lista cargada; `slot.service` y el `service_key` guardado en `user_appointments` siguen siendo la clave de categoría; el mensaje de WhatsApp y `formatServiceName` no cambian.

**RF-B13 (De evento, verificación)**
CUANDO el implementador ejecute `npm run build`, EL SISTEMA compilará sin errores ni advertencias introducidos por estos cambios, y el front funcionará sin la migración aplicada (fallback).

## 4. Restricciones y Constitución

- **Mobile-first** (§1): `ServicesTab` y el cambio en `TurnSettingsTab` se validan primero en 320px+.
- **Estabilidad estructural** (§2): `TurnoModalEnhanced` es un componente protegido; su cambio queda cubierto por esta spec (SDD previo). No se modifica `TurnoModal.jsx`, `CalendarAvailability.jsx`, Navbar ni `TurnoContext`.
- **Estética consistente** (§3): solo Tailwind vía CDN + paleta de marca; sin dependencias nuevas.
- **Validación visual** (§4): toda tarea de UI se verifica en navegador antes de darse por terminada.
- **SDD** (§5): esta spec + `plan.md` + `tasks.md` preceden cualquier edición de código.

## 5. Criterios de Aceptación (CA)

| ID | Criterio |
|----|----------|
| CA-01 | La sección "Duración de Servicios" muestra "Uñas", "Cabello", "Maquillaje", "Packs" (sin "Unas"); `htmlFor`/`id`/estado/guardado conservan las claves crudas. |
| CA-02 | Existe `supabase/migrations/20261004000000_spec_013_services.sql` con cabecera de aplicación manual, `public.services` (schema RF-B1), índices, trigger `set_updated_at`, RLS (RF-B3), grants mínimos y seed de los 10 servicios (nombres exactos de `SERVICE_OPTIONS`). |
| CA-03 | `/admin` muestra la pestaña "Servicios" (icono Scissors) junto a Productos/Turnos/Config. Turnos, sin romper las 3 existentes. |
| CA-04 | `ServicesTab` lista servicios, crea, edita, elimina (con `window.confirm`) y alterna `is_active`; badge "oculto" visible para `is_active=false`. |
| CA-05 | `ServicesTab` muestra estados loading (`role="status"`), error (`role="alert"`), vacío; controles ≥ 44px; foco visible; labels asociados; mobile-first. |
| CA-06 | Sin la migración aplicada (o con tabla vacía), el TurnoModal muestra exactamente las 10 opciones actuales (`SERVICE_OPTIONS`) sin errores en consola/UI. |
| CA-07 | Con la migración aplicada, el TurnoModal muestra los servicios activos de la DB ordenados por `sort_order`; ocultar un servicio (`is_active=false`) lo remueve del select público. |
| CA-08 | `getCategoryKey` prefiere la `category` DB del servicio elegido y cae al texto actual como fallback; la duración sigue resolviéndose contra `admin_settings_public.service_durations`. |
| CA-09 | El flujo de turnos queda intacto: calendario, WhatsApp y guardado en `user_appointments` (`service_key` = clave de categoría) funcionan igual que hoy. |
| CA-10 | `npm run build` sin errores; sin dependencias nuevas; solo Tailwind + paleta de marca. |
| CA-11 | `MEMORY.md` actualizado al cierre. |

## 6. Modelo de datos (resumen)

### `public.services`

| Columna | Tipo | Restricción / default |
|---------|------|------------------------|
| `id` | uuid | pk, `default gen_random_uuid()` |
| `name` | text | `not null`, `unique (name)` → `services_unique_name` |
| `category` | text | `not null default 'general'` (valores usados: `'Uñas'`, `'Cabello'`, `'Maquillaje'`, `'packs'`, `'general'`) |
| `description` | text | nullable |
| `duration_minutes` | integer | `not null default 60`, `check (> 0)` |
| `price` | numeric(10,2) | nullable, `check (>= 0)` |
| `sort_order` | integer | `not null default 0` |
| `is_active` | boolean | `not null default true` |
| `created_at` / `updated_at` | timestamptz | `not null default now()`; trigger `services_set_updated_at` → `public.set_updated_at()` |

- Índices: `services_category_idx (category)`, `services_sort_order_idx (sort_order)`.
- RLS: `services_public_select` (`to anon, authenticated`, `using (is_active)`); `services_admin_select/insert/update/delete` (`to authenticated`, `using`/`with check ((select public.is_admin()))`).
- Grants: `select` a `anon, authenticated`; `insert, update, delete` a `authenticated`.
- Seed (10 filas, `on conflict (name) do nothing`): nombres exactos de `SERVICE_OPTIONS`; `category` = prefijo del nombre (`'Uñas'`×4, `'Cabello'`×3, `'Maquillaje'`×3); `sort_order` 1..10; `duration_minutes` estimados (ver plan §2); `price = null`; `is_active = true`.

### `admin_settings.service_durations` (sin cambios)

Claves `unas|cabello|maquillaje|packs` → minutos. La Parte A solo cambia la **etiqueta visible** en Config. Turnos.

### `user_appointments.service_key` (sin cambios)

Sigue guardando la clave de categoría (derivada vía `getCategoryKey`); `formatServiceName` la resuelve a texto legible.

## 7. Observaciones / Riesgos

- **Migración manual:** el MCP de Supabase no puede aplicarla (otra organización). El front **debe** funcionar sin ella (CA-06/RF-B5): `ServicesTab` mostrará su estado de error amigable ("no se pudo cargar… ¿se aplicó la migración?") y el TurnoModal caerá a `SERVICE_OPTIONS`.
- **Orden de aplicación:** independiente de la migración 010 (pendiente); son tablas distintas y no hay FK entre ellas.
- **`unique(name)`:** crear un nombre duplicado devolverá error `23505`; `ServicesTab` debe traducirlo a un mensaje amigable.
- **Carrera open→carga async:** el efecto de apertura del modal setea el servicio por defecto desde la lista (inicialmente fallback). Al llegar la lista de DB, si el usuario aún no eligió, se re-aplica la misma lógica de match (`initialService` → primero); no se pisa una elección del usuario.
- **Categoría `'general'`:** no matchea `service_durations`; cae al fallback actual (primera clave disponible o `'unas'`). Comportamiento aceptado (ya es el fallback hoy).
- **Código preexistente sin uso:** `TurnoModalForm` y el `SERVICE_KEY_MAP`/`getServiceKey` duplicado dentro del componente no se tocan (fuera de alcance).
- **Ubicación de HomeServices/InversionPage:** viven en la **raíz** del repo (importadas así desde `src/main.jsx`); se listan aquí solo como contexto, no se modifican.
- **`capitalize` residual:** al eliminar la clase `capitalize` del label, verificar que no quede aplicada a otros textos de esa sección (no los hay con claves crudas).

## 8. Estado

- **Estado**: Borrador listo para revisión y aprobación.
- **Fecha**: 2026-10-04
- **Autor**: Planner SDD
