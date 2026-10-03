-- =============================================================================
-- Spec 008 — Google Calendar Integration (T2 Spike): admin_settings table
-- -----------------------------------------------------------------------------
-- Single-row table to store encrypted Google Calendar OAuth tokens and config.
-- Only accessible by admin users (RLS + is_admin()).
-- =============================================================================

-- 1. Create admin_settings table with single-row constraint
create table if not exists public.admin_settings (
  id integer primary key default 1 check (id = 1), -- Enforces single row
  google_calendar jsonb not null default '{
    "access_token_enc": "",
    "refresh_token_enc": "",
    "calendar_id": "primary",
    "token_expires_at": 0
  }'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Trigger para mantener updated_at
drop trigger if exists admin_settings_set_updated_at on public.admin_settings;
create trigger admin_settings_set_updated_at
  before update on public.admin_settings
  for each row
  execute function public.set_updated_at();

-- 3. Row Level Security
alter table public.admin_settings enable row level security;

-- 3a. Lectura solo admin
create policy "admin_settings_admin_select"
  on public.admin_settings
  for select
  to authenticated
  using ((select public.is_admin()));

-- 3b. Escritura solo admin
create policy "admin_settings_admin_upsert"
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

-- 4. Privilegios explícitos
grant select, insert, update on public.admin_settings to authenticated;

-- 5. Insert initial row (id=1) if not exists
insert into public.admin_settings (id, google_calendar)
values (1, '{
  "access_token_enc": "",
  "refresh_token_enc": "",
  "calendar_id": "primary",
  "token_expires_at": 0
}'::jsonb)
on conflict (id) do nothing;

-- =============================================================================
-- NOTAS:
-- - Los tokens se almacenan ENCRYPTADOS (AES-GCM) usando ENCRYPTION_KEY del entorno.
-- - El formato encriptado es: "iv_base64.ciphertext_base64" (IV de 12 bytes, AES-GCM).
-- - token_expires_at = Unix timestamp (segundos) de expiración del access_token.
-- - calendar_id por defecto "primary" (calendario principal del usuario).
-- =============================================================================