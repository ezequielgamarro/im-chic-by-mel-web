-- =============================================================================
-- Spec 007 — Panel de Administración (T2): tabla `products` + Row Level Security
-- -----------------------------------------------------------------------------
-- Reproducible con Supabase CLI:
--   supabase db push
-- o aplicando este archivo desde el SQL Editor del dashboard de Supabase.
--
-- Reglas de negocio (spec RF-1b / RF-2):
--   * SELECT público (anon + authenticated) para que /tienda liste sin sesión.
--   * INSERT / UPDATE / DELETE solo para usuarios con claim app_metadata.role = 'admin'.
--   * stock nunca negativo (default 0); precio positivo.
-- =============================================================================

-- 1. Helper is_admin(): lee el claim del JWT actual.
--    security invoker + search_path vacío => sin riesgo de SQL injection vía search_path.
--    Solo consulta el JWT (no tablas), por lo que no requiere security definer.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- 2. Tabla de productos.
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  price       numeric(10, 2) not null check (price > 0),
  description text not null,
  image_url   text not null,
  stock       integer not null default 0 check (stock >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3. Índice para el listado de la tienda (más recientes primero).
create index if not exists products_created_at_idx
  on public.products (created_at desc);

-- 4. Trigger para mantener updated_at al día en cada UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- 5. Row Level Security.
alter table public.products enable row level security;

-- 5a. Lectura pública (anon + authenticated).
create policy "products_public_select"
  on public.products
  for select
  to anon, authenticated
  using (true);

-- 5b. Escritura solo admin (claim app_metadata.role = 'admin').
create policy "products_admin_insert"
  on public.products
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "products_admin_update"
  on public.products
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "products_admin_delete"
  on public.products
  for delete
  to authenticated
  using ((select public.is_admin()));

-- 6. Privilegios explícitos (mínimos y compatibles con RLS).
--    Nota: Supabase ya concede acceso en el esquema public por defecto, pero esto
--    documenta la intención y es seguro; los privilegios NO saltan RLS.
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- =============================================================================
-- PASO MANUAL (una sola vez): otorgar el claim admin a la cuenta de la dueña.
-- Sustituir el email por el real y ejecutar en el SQL Editor:
--
--   update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
--   where email = 'mel@example.com';
--
-- =============================================================================
