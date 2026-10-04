-- =============================================================================
-- Spec 010 — Carrito Persistente Global, Favoritos e Historial de Compras (T1)
-- -----------------------------------------------------------------------------
-- Crea las tablas nuevas: public.favorites, public.orders, public.order_items.
--
-- *** APLICACIÓN MANUAL REQUERIDA ***
-- Este archivo NO se aplica automáticamente desde el agente: el MCP de Supabase
-- disponible pertenece a otra organización y no tiene permisos sobre el proyecto
-- real de "Im Chic by Mel". Aplicar manualmente con UNA de estas opciones:
--   1) Supabase CLI:      supabase db push
--   2) SQL Editor del dashboard: pegar y ejecutar este archivo completo.
--
-- Reglas de diseño (alineadas a supabase-postgres-best-practices):
--   * RLS self con `(select auth.uid())` (evita evaluación por fila).
--   * Índice explícito en TODA columna de clave foránea (Postgres no lo crea solo).
--   * Least privilege: solo `select, insert, delete`/`select, insert` a authenticated.
--   * Snapshots inmutables en order_items (`product_id` nullable; nombre y precio
--     quedan congelados aunque el producto cambie o se elimine).
--   * Idempotente: `if not exists` / `drop ... if exists` antes de crear.
--
-- NO se modifica `public.cart_items` (ya existe desde spec 008).
-- Reutiliza `public.set_updated_at()` (definida en spec 007).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. public.favorites — favoritos por usuario (requieren sesión)
-- -----------------------------------------------------------------------------
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_unique_user_product unique (user_id, product_id)
);

-- Índices de columnas FK (cascadas y joins rápidos).
create index if not exists favorites_user_id_idx    on public.favorites (user_id);
create index if not exists favorites_product_id_idx on public.favorites (product_id);

-- -----------------------------------------------------------------------------
-- 2. public.orders — pedidos enviados por WhatsApp
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           text not null default 'enviado_whatsapp'
                     check (status in ('enviado_whatsapp', 'confirmado', 'entregado', 'cancelado')),
  total            numeric(10, 2) not null default 0 check (total >= 0),
  whatsapp_message text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Índice compuesto para el historial del usuario (más recientes primero).
create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

-- Trigger updated_at reutilizando la función existente.
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. public.order_items — detalle/snapshot histórico de cada orden
-- -----------------------------------------------------------------------------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price   numeric(10, 2) not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  created_at   timestamptz not null default now()
);

-- Índices de columnas FK.
create index if not exists order_items_order_id_idx   on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

-- -----------------------------------------------------------------------------
-- 4. Row Level Security (self, con `(select auth.uid())`)
-- -----------------------------------------------------------------------------
alter table public.favorites   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- 4a. favorites: el usuario ve y gestiona solo sus favoritos.
drop policy if exists "favorites_self_select" on public.favorites;
create policy "favorites_self_select"
  on public.favorites
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "favorites_self_insert" on public.favorites;
create policy "favorites_self_insert"
  on public.favorites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "favorites_self_delete" on public.favorites;
create policy "favorites_self_delete"
  on public.favorites
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 4b. orders: el usuario ve y crea solo sus órdenes (sin update/delete self).
drop policy if exists "orders_self_select" on public.orders;
create policy "orders_self_select"
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "orders_self_insert" on public.orders;
create policy "orders_self_insert"
  on public.orders
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 4c. order_items: solo se ven/crean ítems cuya orden pertenece al usuario.
--     Subconsulta indexada por order_items_order_id_idx.
drop policy if exists "order_items_self_select" on public.order_items;
create policy "order_items_self_select"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.user_id = (select auth.uid())
    )
  );

drop policy if exists "order_items_self_insert" on public.order_items;
create policy "order_items_self_insert"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.user_id = (select auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- 5. Privilegios explícitos (mínimos y compatibles con RLS)
-- -----------------------------------------------------------------------------
grant select, insert, delete on public.favorites   to authenticated;
grant select, insert          on public.orders      to authenticated;
grant select, insert          on public.order_items to authenticated;

-- -----------------------------------------------------------------------------
-- 6. Comentarios de documentación
-- -----------------------------------------------------------------------------
comment on table public.favorites is 'Favoritos de productos por usuario (requieren sesión). unique(user_id, product_id).';
comment on column public.favorites.user_id is 'Dueño del favorito (auth.users).';
comment on column public.favorites.product_id is 'Producto favorito (public.products).';

comment on table public.orders is 'Órdenes/pedidos enviados por WhatsApp. status default enviado_whatsapp.';
comment on column public.orders.status is 'Estado del pedido: enviado_whatsapp | confirmado | entregado | cancelado.';
comment on column public.orders.total is 'Total estimado del pedido en ARS (>= 0).';
comment on column public.orders.whatsapp_message is 'Mensaje exacto enviado por WhatsApp (trazabilidad).';

comment on table public.order_items is 'Detalle histórico (snapshot) de cada orden; inmutable ante cambios del producto.';
comment on column public.order_items.product_id is 'Producto original (nullable): se pone NULL si el producto se elimina.';
comment on column public.order_items.product_name is 'Nombre del producto congelado al momento de la compra.';
comment on column public.order_items.unit_price is 'Precio unitario en ARS congelado al momento de la compra.';

-- =============================================================================
-- FIN — Spec 010 T1. Recordatorio: aplicar manualmente (CLI o SQL Editor).
-- =============================================================================
