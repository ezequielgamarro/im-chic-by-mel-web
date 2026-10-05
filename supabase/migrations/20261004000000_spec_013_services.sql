-- =============================================================================
-- Spec 013 — Etiquetas legibles + Pestaña "Servicios" en el Admin (T2)
-- -----------------------------------------------------------------------------
-- Crea la tabla pública de servicios de turnos (hoy hardcodeados en el front)
-- con RLS (lectura pública solo `is_active = true`; CRUD solo admin), índices,
-- trigger `updated_at`, grants mínimos y seed idempotente de los 10 servicios
-- actuales.
--
-- *** APLICACIÓN MANUAL REQUERIDA ***
-- Este archivo NO se aplica automáticamente desde el agente: el MCP de Supabase
-- disponible pertenece a otra organización y no tiene permisos sobre el proyecto
-- real de "Im Chic by Mel". Aplicar manualmente con UNA de estas opciones:
--   1) Supabase CLI:      supabase db push
--   2) SQL Editor del dashboard: pegar y ejecutar este archivo completo.
--
-- Reglas de diseño (alineadas a supabase-postgres-best-practices):
--   * RLS con `(select public.is_admin())` (la función se evalúa una sola vez,
--     no por fila).
--   * Least privilege: `select` a anon + authenticated; `insert, update, delete`
--     solo a authenticated (RLS restringe a admins).
--   * Idempotente: `if not exists` / `drop ... if exists` antes de crear.
--   * Índices en las columnas filtradas/ordenadas (category, sort_order).
--   * Reutiliza `public.is_admin()` y `public.set_updated_at()` (spec 007);
--     NO redefine ninguna de las dos.
--
-- NO se modifica `admin_settings.service_durations` (clave cruda `unas|cabello|…`)
-- ni `user_appointments.service_key`; el seed solo replica lo que hoy muestra el
-- TurnoModal (SERVICE_OPTIONS de TurnoModalEnhanced.jsx).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. public.services — catálogo editable de servicios de turnos
-- -----------------------------------------------------------------------------
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         text not null default 'general',
  description      text,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  price            numeric(10, 2) check (price >= 0),
  sort_order       integer not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint services_unique_name unique (name)
);

-- Índices en las columnas filtradas (category) y ordenadas (sort_order).
create index if not exists services_category_idx   on public.services (category);
create index if not exists services_sort_order_idx on public.services (sort_order);

-- Trigger updated_at reutilizando la función existente (spec 007).
drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.services enable row level security;

-- 2a. Lectura pública: solo servicios activos (anon + authenticated).
--     Un admin logueado además ve el conjunto de la política admin (todas las filas).
drop policy if exists "services_public_select" on public.services;
create policy "services_public_select"
  on public.services
  for select
  to anon, authenticated
  using (is_active);

-- 2b. Admin: ve TODO (incluye ocultos) y hace CRUD, vía claim app_metadata.role.
drop policy if exists "services_admin_select" on public.services;
create policy "services_admin_select"
  on public.services
  for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "services_admin_insert" on public.services;
create policy "services_admin_insert"
  on public.services
  for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "services_admin_update" on public.services;
create policy "services_admin_update"
  on public.services
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "services_admin_delete" on public.services;
create policy "services_admin_delete"
  on public.services
  for delete
  to authenticated
  using ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- 3. Privilegios explícitos (mínimos y compatibles con RLS).
--    Nota: Supabase ya concede acceso en el esquema public por defecto, pero esto
--    documenta la intención y es seguro; los privilegios NO saltan RLS.
-- -----------------------------------------------------------------------------
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;

-- -----------------------------------------------------------------------------
-- 4. Seed idempotente — los 10 servicios actuales del TurnoModal.
--    Nombres EXACTOS de SERVICE_OPTIONS (TurnoModalEnhanced.jsx); categorías
--    'Uñas' | 'Cabello' | 'Maquillaje' según el prefijo del nombre;
--    duraciones estimadas (45–120 min; el admin puede ajustarlas luego);
--    price = null (dato informativo; el TurnoModal no muestra precios).
--    Se ejecuta como postgres desde el SQL Editor (sin RLS forzada) y es
--    re-ejecutable gracias a `on conflict (name) do nothing`.
-- -----------------------------------------------------------------------------
insert into public.services (name, category, duration_minutes, sort_order, price, is_active)
values
  ('Uñas: Semipermanente & Capping',        'Uñas',       60,  1,  null, true),
  ('Uñas: Esculpidas en Gel / Acrigel',     'Uñas',       90,  2,  null, true),
  ('Uñas: Soft Gel Tips de Autor',          'Uñas',       90,  3,  null, true),
  ('Uñas: Nail Art & Pedrería',             'Uñas',       60,  4,  null, true),
  ('Cabello: Alisado Espejo / Plastificado', 'Cabello',    120, 5,  null, true),
  ('Cabello: Nutrición & Shock de Keratina', 'Cabello',    90,  6,  null, true),
  ('Cabello: Peinado Social & Styling',      'Cabello',    45,  7,  null, true),
  ('Maquillaje: MakeUp Social Glam',         'Maquillaje', 60,  8,  null, true),
  ('Maquillaje: MakeUp Noche Piel Blindada', 'Maquillaje', 75,  9,  null, true),
  ('Maquillaje: Novias & Quinceañeras HD',   'Maquillaje', 90,  10, null, true)
on conflict (name) do nothing;

-- -----------------------------------------------------------------------------
-- 5. Comentarios de documentación
-- -----------------------------------------------------------------------------
comment on table public.services is 'Catálogo editable de servicios de turnos (spec 013). Lectura pública solo is_active=true; CRUD admin-only vía public.is_admin().';

comment on column public.services.name is 'Nombre visible del servicio (único; services_unique_name).';
comment on column public.services.category is 'Categoría del servicio: Uñas | Cabello | Maquillaje | packs | general (default general).';
comment on column public.services.description is 'Descripción opcional del servicio (puede ser NULL).';
comment on column public.services.duration_minutes is 'Duración estimada en minutos (entero > 0; default 60).';
comment on column public.services.price is 'Precio en ARS (nullable; NULL = "Consultar"). check >= 0.';
comment on column public.services.sort_order is 'Orden de aparición en el TurnoModal (default 0).';
comment on column public.services.is_active is 'Si es false, el servicio NO aparece en el TurnoModal público (solo lo ve el admin).';

-- =============================================================================
-- FIN — Spec 013 T2. Recordatorio: aplicar manualmente (CLI o SQL Editor).
-- =============================================================================
