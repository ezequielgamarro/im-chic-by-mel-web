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
--
-- Reglas de diseño (skill supabase-postgres-best-practices + patrón 010/013):
--   * Idempotente: `if not exists` / `drop ... if exists` / DO block.
--   * Backfill ANTES de `set not null` y ANTES de dropear la columna vieja.
--   * Constraint con nombre estable (re-ejecutable tras el drop de columnas).
--   * NO toca RLS, grants ni triggers (least privilege; sin cambios de acceso).
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
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='services'
               and column_name='duration_minutes') then
    update public.services
    set estimated_duration_text = coalesce(estimated_duration_text, 'Aprox ' || duration_minutes || ' min'),
        block_minutes = coalesce(block_minutes, duration_minutes, 60)
    where block_minutes is null;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Defaults y restricciones de block_minutes
-- -----------------------------------------------------------------------------
alter table public.services alter column block_minutes set default 60;

-- Constraint con nombre estable + re-ejecutable
alter table public.services drop constraint if exists services_block_minutes_check;
alter table public.services add constraint services_block_minutes_check check (block_minutes > 0);

-- NOT NULL solo después del backfill
alter table public.services alter column block_minutes set not null;

-- -----------------------------------------------------------------------------
-- 4. Índice en la columna del nuevo patrón de bloqueo
-- -----------------------------------------------------------------------------
create index if not exists services_block_minutes_idx on public.services (block_minutes);

-- -----------------------------------------------------------------------------
-- 5. Comentarios de documentación
-- -----------------------------------------------------------------------------
comment on column public.services.estimated_duration_text is 'Texto de duración mostrado al cliente (ej: 1 a 2 hs)';
comment on column public.services.block_minutes is 'Minutos máximos a bloquear en la agenda para evitar superposiciones';

-- -----------------------------------------------------------------------------
-- 6. Drop de la columna vieja (reemplazo real; AL FINAL, tras el backfill)
-- -----------------------------------------------------------------------------
alter table public.services drop column if exists duration_minutes;

-- =============================================================================
-- FIN — Spec 016. Recordatorio: aplicar manualmente (CLI o SQL Editor), después
-- de la migración 013.
-- =============================================================================
