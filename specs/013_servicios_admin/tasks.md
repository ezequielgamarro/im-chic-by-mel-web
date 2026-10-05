# Tareas de Implementación — Spec 013: Etiquetas legibles de categorías + Pestaña "Servicios" (CRUD + integración pública)

> Orden sugerido: T1 → T2 → T3 → T4 → T5 → T6 → T7.
> Cada tarea es discreta y verificable. Las tareas de UI requieren validación visual (constitución §4).
> **No editar**: `TurnoModal.jsx`, `CalendarAvailability.jsx`, `SERVICE_OPTIONS`/`SERVICE_KEY_MAP` de módulo en `TurnoModalEnhanced.jsx`, ni el flujo de turnos (calendario/WhatsApp/`user_appointments`).

---

## T1 (PARTE A): Etiquetas legibles en TurnSettingsTab

**Archivo afectado:** `src/components/admin/TurnSettingsTab.jsx`

**Cambio:**
- Agregar junto a `CATEGORIAS_SERVICIOS` (línea 5) el mapa:
  ```js
  const CAT_LABELS = { unas: 'Uñas', cabello: 'Cabello', maquillaje: 'Maquillaje', packs: 'Packs' };
  ```
- En el render de la sección "Duración de Servicios" (líneas 266–285): el `<label>` (líneas 269–270) pasa de `{cat}` con clase `capitalize` a `{CAT_LABELS[cat] || cat}` **sin** la clase `capitalize`.
- No tocar `htmlFor={"dur-" + cat}`, `id`, `serviceDurations[cat]`, `handleDurationChange` ni el upsert de `admin_settings`.

**Criterio de hecho:**
- [ ] La sección muestra "Uñas", "Cabello", "Maquillaje", "Packs" (nunca "Unas").
- [ ] `serviceDurations` sigue persistiendo con claves crudas (`unas`, etc.).

**Verificación:**
- `npm run build` OK. En `/admin` → Config. Turnos, escribir 45 en "Uñas", guardar, recargar: el valor persiste bajo `admin_settings.service_durations.unas`.

**Dependencias:** — (independiente).

---

## T2 (PARTE B): Migración SQL `public.services`

**Archivo afectado:** `supabase/migrations/20261004000000_spec_013_services.sql` (nuevo)

**Cambio:**
- Cabecera con nota de **APLICACIÓN MANUAL** (SQL Editor o `supabase db push`; el MCP no puede aplicarla), criterios de diseño (RLS `(select …)`, least privilege, idempotencia) y reutilización de `public.set_updated_at()`.
- `create table if not exists public.services` con el schema de spec §6 (incl. `constraint services_unique_name unique (name)`, `check (duration_minutes > 0)`, `check (price >= 0)`, defaults `'general'`/`60`/`0`/`true`).
- Índices `services_category_idx (category)` y `services_sort_order_idx (sort_order)`.
- Trigger `services_set_updated_at` (`drop trigger if exists` + `create trigger` → `public.set_updated_at()`).
- RLS: `enable row level security`; policies `services_public_select` (`to anon, authenticated`, `using (is_active)`) y `services_admin_select/insert/update/delete` (`to authenticated`, `using`/`with check ((select public.is_admin()))`); todas con `drop policy if exists` previo.
- Grants: `grant select on public.services to anon, authenticated;` + `grant insert, update, delete on public.services to authenticated;`.
- Seed `insert … on conflict (name) do nothing` con los **10 nombres exactos** de `SERVICE_OPTIONS`, categorías `'Uñas'`/`'Cabello'`/`'Maquillaje'` según prefijo, `sort_order` 1..10, `duration_minutes` estimados (plan §2.1), `price = null`, `is_active = true`.
- `comment on table` y en columnas clave.

**Criterio de hecho:**
- [ ] El archivo existe, es sintácticamente válido y sigue el patrón de `20261003120000_spec_010_favorites_orders.sql`.
- [ ] Schema, índices, trigger, RLS (público solo `is_active=true`; admin CRUD), grants y seed presentes según RF-B1…RF-B4.
- [ ] Seed idempotente (`on conflict (name) do nothing`) con nombres exactos verificados contra `SERVICE_OPTIONS`.

**Verificación:**
- Revisión experta contra la skill `supabase-postgres-best-practices` y el plan §2.
- Tras aplicación manual: `select name, category, sort_order from public.services order by sort_order;` devuelve las 10 filas; como anon (nueva pestaña incógnito con la anon key): solo ve `is_active = true`.

**Dependencias:** — (bloquea la verificación real de T3/T4/T5, no su desarrollo).

---

## T3 (PARTE B): Componente `ServicesTab.jsx`

**Archivo afectado:** `src/components/admin/ServicesTab.jsx` (nuevo)

**Cambio:**
- CRUD espejo de `TurnosTab` + `ProductForm` (plan §3): fetch `services` (`order('sort_order')`), estados loading (`role="status"`) / error (`role="alert"`, con hint de migración pendiente para `42P01`/`PGRST205`) / vacío.
- Formulario crear/editar: `name*`, `category` (select `'Uñas'|'Cabello'|'Maquillaje'|'packs'|general` + valor libre si el servicio en edición trae otra), `description`, `duration_minutes*` (entero > 0), `price` (vacío → `null`; si se informa ≥ 0), `sort_order` (≥ 0), `is_active` (checkbox). Validación cliente con errores `role="alert"`; manejo de `23505` → "Ya existe un servicio con ese nombre."
- Acciones por fila: Editar (precarga form), Eliminar (`window.confirm` + delete), Visible/Oculto (`update is_active` + refetch). Botón "Actualizar" en el header.
- UI: mobile-first, paleta de marca, `min-h-[44px]`, foco visible, labels asociados; badge "oculto" para `is_active=false`; precio es-AR (`Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`) o "Consultar" si `null`.

**Criterio de hecho:**
- [ ] Lista, crear, editar, eliminar y alternar `is_active` funcionan contra `public.services` (con migración aplicada).
- [ ] Estados loading/error/vacío accesibles; controles ≥ 44px; mobile-first.

**Verificación:**
- `npm run build` OK. Con migración: alta de un servicio, edición de duración, toggle oculto (desaparece del TurnoModal), eliminación con confirmación. Sin migración: el estado de error de migración se muestra con mensaje claro.

**Dependencias:** T2 (para verificación con datos; el componente se compila igual sin ella).

---

## T4 (PARTE B): Pestaña "Servicios" en AdminPage

**Archivo afectado:** `src/pages/AdminPage.jsx`

**Cambio:**
- Importar `ServicesTab` (`../components/admin/ServicesTab`) e icono `Scissors` desde `lucide-react`.
- Agregar botón de pestaña "Servicios" en el `<nav>` existente (patrón idéntico a las otras: active gradiente borgoña, `min-h-[44px]`, `aria-hidden` en el ícono), `setActiveTab('services')`.
- Encadenar en `<main>`: `activeTab === 'services' ? <ServicesTab />` antes del `else` de `TurnSettingsTab`; actualizar el comentario del estado `activeTab`.

**Criterio de hecho:**
- [ ] `/admin` muestra 4 pestañas (Productos, Turnos, Servicios, Config. Turnos) y "Servicios" renderiza `<ServicesTab />`.
- [ ] Las 3 pestañas existentes funcionan sin cambios.

**Verificación:**
- `npm run build` OK. Cambiar entre las 4 pestañas sin errores; en 320px el nav no se rompe (si hace wrap, evaluar `flex-wrap` en el nav — verificación visual T6).

**Dependencias:** T3.

---

## T5 (PARTE B): Integración pública en TurnoModalEnhanced

**Archivo afectado:** `src/components/TurnoModalEnhanced.jsx`

**Cambio:**
- Estados nuevos: `serviceOptions` (init `SERVICE_OPTIONS`) y `dbCategoryByService` (init `{}`).
- Efecto `[isOpen]`: `supabase.from('services').select('name, category, duration_minutes, is_active').eq('is_active', true).order('sort_order', { ascending: true })`; con guard `mounted`; si error (`42P01`/`PGRST205`) o vacío → fallback silencioso (`console.warn`); si hay datos → `setServiceOptions(names)` + `setDbCategoryByService(map name→category)`.
- `<select>` del paso calendario y la lógica de default iteran `serviceOptions` (búsqueda `find` por `includes` sobre `initialService` idéntica a la actual).
- Carrera open→carga: re-aplicar el default solo si `selectedService` está vacío o ya no existe en `serviceOptions` (no pisar elección del usuario).
- `getCategoryKey(displayName, durations, categoryByService = {})`: primero resuelve la categoría DB (normalizada sin acentos a minúsculas: `'Uñas'→'unas'`; acepta si está en `durations` o en `[unas, cabello, maquillaje, packs]`); si no, fallback a la lógica actual de texto (sin cambios). Actualizar los 2 call sites (`selectedService` y `getNormalizedDurations` de `CalendarAvailability`).

**Criterio de hecho:**
- [ ] Sin migración: el TurnoModal muestra exactamente las 10 opciones actuales; flujo calendario → WhatsApp → `user_appointments` intacto.
- [ ] Con migración: muestra los servicios activos de la DB por `sort_order`; ocultar uno lo remueve del select.
- [ ] `getCategoryKey` prefiere la categoría DB y cae al texto como fallback; `service_key` guardado sigue siendo la clave de categoría.

**Verificación:**
- `npm run build` OK. Smoke en ambos escenarios (con/sin migración): abrir desde HomeServices ("Uñas") e InversionPage ("Cabello"/"Maquillaje"), elegir servicio, tomar turno logueado y como invitado; verificar `user_appointments.service_key` y mensaje de WhatsApp sin cambios de formato.

**Dependencias:** T2 (para el escenario "con migración"; el fallback se prueba sin ella).

---

## T6: Build final + validación visual (ambos escenarios)

**Archivos afectados:** verificación global (sin cambios de código salvo hallazgos menores puntuales).

**Cambio:** Ninguno (solo verificación); si el nav de 4 pestañas rompe en 320px, agregar `flex-wrap` al `<nav>` de AdminPage.

**Criterio de hecho:**
- [ ] `npm run build` exit 0, sin warnings introducidos.
- [ ] CA-01…CA-10 de la spec verificados manualmente (Parte A, pestaña admin, TurnoModal con y sin migración, accesibilidad, 320px).

**Verificación:** checklist de CA + Chrome DevTools móvil/desktop.

**Dependencias:** T1–T5.

---

## T7: Actualizar `MEMORY.md`

**Archivo afectado:** `MEMORY.md`

**Cambio:** Agregar sección `## Spec 013 — Etiquetas de categorías + Pestaña Servicios (IMPLEMENTADA, 2026-10-XX)` con: corrección "Unas"→"Uñas" (mapa `CAT_LABELS`), tabla `public.services` + RLS/seed (migración **pendiente de aplicación manual**, junto a la 010), pestaña Servicios en /admin, TurnoModal con servicios dinámicos + fallback a `SERVICE_OPTIONS` (front funcional sin migración). Mantener límite de 50 líneas.

**Criterio de hecho:**
- [ ] `MEMORY.md` incluye la sección de la spec 013 y el estado de la migración pendiente.

**Verificación:** Leer `MEMORY.md` y confirmar sección presente.

**Dependencias:** T6.
