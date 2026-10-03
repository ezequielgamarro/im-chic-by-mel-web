-- =============================================================================
-- Spec 008 — Users & Calendar (T1): profiles, cart_items, user_courses,
-- user_appointments, admin_settings + RLS + pgcrypto helpers
-- -----------------------------------------------------------------------------
-- Reproducible con Supabase CLI:
--   supabase db push
-- o aplicando este archivo desde el SQL Editor del dashboard de Supabase.
-- =============================================================================

-- 1. Extension pgcrypto (para encrypt/decrypt tokens)
-- NOTA: CREATE EXTENSION no puede ejecutarse dentro de una transacción.
-- Ejecutar por separado antes de aplicar esta migración:
--   create extension if not exists pgcrypto;
-- La extensión ya fue creada manualmente en la BD remota.

-- 2. Tabla profiles (1:1 con auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 3. Tabla cart_items (carrito de compras por usuario)
create table if not exists public.cart_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete cascade,
  quantity     integer not null default 1 check (quantity > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint cart_items_unique_user_product unique (user_id, product_id)
);

-- 4. Tabla user_courses (cursos inscritos por usuario)
create table if not exists public.user_courses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_key   text not null,
  enrolled_at  timestamptz not null default now(),
  status       text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint user_courses_unique_user_course unique (user_id, course_key)
);

-- 5. Tabla user_appointments (citas agendadas por usuario)
create table if not exists public.user_appointments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  service_key       text not null,
  requested_at      timestamptz not null default now(),
  scheduled_at      timestamptz,
  status            text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  google_event_id   text,
  whatsapp_message  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint user_appointments_unique_user_service_time unique (user_id, service_key, scheduled_at)
);

-- 6. Tabla admin_settings (singleton, id=1)
create table if not exists public.admin_settings (
  id                          integer primary key default 1 check (id = 1),
  google_calendar             jsonb not null default '{}'::jsonb,
  service_durations           jsonb not null default '{}'::jsonb,
  business_hours              jsonb not null default '{}'::jsonb,
  slot_granularity_minutes    integer not null default 15 check (slot_granularity_minutes > 0),
  updated_at                  timestamptz not null default now()
);

-- Insertar fila singleton si no existe
insert into public.admin_settings (id) values (1)
on conflict (id) do nothing;

-- 7. Trigger para mantener updated_at al día en cada UPDATE (reutiliza función existente)
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row
  execute function public.set_updated_at();

drop trigger if exists user_courses_set_updated_at on public.user_courses;
create trigger user_courses_set_updated_at
  before update on public.user_courses
  for each row
  execute function public.set_updated_at();

drop trigger if exists user_appointments_set_updated_at on public.user_appointments;
create trigger user_appointments_set_updated_at
  before update on public.user_appointments
  for each row
  execute function public.set_updated_at();

drop trigger if exists admin_settings_set_updated_at on public.admin_settings;
create trigger admin_settings_set_updated_at
  before update on public.admin_settings
  for each row
  execute function public.set_updated_at();

-- 8. Índices
create index if not exists cart_items_user_id_idx on public.cart_items (user_id);
create index if not exists user_appointments_user_id_scheduled_at_idx
  on public.user_appointments (user_id, scheduled_at)
  where scheduled_at is not null;

-- 9. Row Level Security
alter table public.profiles enable row level security;
alter table public.cart_items enable row level security;
alter table public.user_courses enable row level security;
alter table public.user_appointments enable row level security;
alter table public.admin_settings enable row level security;

-- 9a. Profiles: usuario ve y edita su propio perfil
create policy "profiles_self_select"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_self_insert"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 9b. Cart_items: usuario ve y gestiona su carrito
create policy "cart_items_self_select"
  on public.cart_items
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "cart_items_self_insert"
  on public.cart_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "cart_items_self_update"
  on public.cart_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cart_items_self_delete"
  on public.cart_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 9c. User_courses: usuario ve y gestiona sus cursos
create policy "user_courses_self_select"
  on public.user_courses
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_courses_self_insert"
  on public.user_courses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_courses_self_update"
  on public.user_courses
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 9d. User_appointments: usuario ve y gestiona sus citas
create policy "user_appointments_self_select"
  on public.user_appointments
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_appointments_self_insert"
  on public.user_appointments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_appointments_self_update"
  on public.user_appointments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_appointments_self_delete"
  on public.user_appointments
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 9e. Admin_settings: solo admin (claim app_metadata.role = 'admin')
create policy "admin_settings_admin_select"
  on public.admin_settings
  for select
  to authenticated
  using ((select public.is_admin()));

create policy "admin_settings_admin_insert"
  on public.admin_settings
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admin_settings_admin_update"
  on public.admin_settings
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin_settings_admin_delete"
  on public.admin_settings
  for delete
  to authenticated
  using ((select public.is_admin()));

-- 10. Privilegios explícitos (mínimos y compatibles con RLS)
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update on public.user_courses to authenticated;
grant select, insert, update, delete on public.user_appointments to authenticated;
grant select, insert, update on public.admin_settings to authenticated;

-- 11. Helpers pgcrypto para encrypt/decrypt tokens
-- Clave maestra: se pasará como variable de entorno ENCRYPTION_KEY (configurar en Supabase Vault/Env)
-- Uso: select encrypt_text('token_secreto', current_setting('app.encryption_key'));
--      select decrypt_text(ciphertext, current_setting('app.encryption_key'));

create or replace function public.encrypt_text(plaintext text, key text)
returns bytea
language sql
stable
security invoker
set search_path = ''
as $$
  select extensions.pgp_sym_encrypt(plaintext, key);
$$;

create or replace function public.decrypt_text(ciphertext bytea, key text)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select extensions.pgp_sym_decrypt(ciphertext, key);
$$;

-- 12. Comentarios de documentación
comment on table public.profiles is 'Perfil extendido del usuario (1:1 con auth.users)';
comment on table public.cart_items is 'Carrito de compras por usuario';
comment on table public.user_courses is 'Cursos inscritos por usuario';
comment on table public.user_appointments is 'Citas agendadas por usuario (integración Google Calendar + WhatsApp)';
comment on table public.admin_settings is 'Configuración global de la app (singleton id=1)';

comment on function public.encrypt_text(text, text) is 'Encripta texto con pgp_sym_encrypt usando clave simétrica. Clave recomendada: current_setting(''app.encryption_key'') desde Supabase Vault.';
comment on function public.decrypt_text(bytea, text) is 'Desencripta bytea con pgp_sym_decrypt usando clave simétrica.';

-- =============================================================================
-- PASO MANUAL (una sola vez): configurar ENCRYPTION_KEY en Supabase Vault o Env Vars.
-- En SQL Editor o CLI:
--   alter database postgres set app.encryption_key = 'tu_clave_secreta_larga_y_aleatoria';
-- O en Supabase Dashboard > Settings > Vault > Add secret: ENCRYPTION_KEY
-- =============================================================================