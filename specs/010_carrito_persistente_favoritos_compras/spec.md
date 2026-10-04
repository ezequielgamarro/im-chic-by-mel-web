# Spec 010 — Carrito Persistente Global, Favoritos e Historial de Compras

## 1. Objetivo

Unificar el carrito de la tienda en un **contexto global y persistente** (invitado → `localStorage`; logueado → `public.cart_items`), accesible desde la **Navbar de todas las páginas** y desde una pestaña "Mi Carrito" en `/cuenta`. En la misma área de cuenta agregar **Favoritos** (productos guardados, requieren sesión) y **Mis Compras** (historial de pedidos enviados por WhatsApp). Además, retirar el `syncCart()` muerto de `AuthContext` y crear la migración SQL de las tablas nuevas (`favorites`, `orders`, `order_items`) para aplicación manual, con degradación grácil si aún no existen.

## 2. Alcance

### 2.1 Incluye
- Nuevo `src/context/CartContext.jsx` + `useCart` con estado, UI del drawer y persistencia/sincronización `localStorage` ↔ `cart_items`.
- Nuevo `src/context/FavoritesContext.jsx` + `useFavorites` (favoritos de usuario).
- Nuevo `src/components/CartDrawer.jsx` global (extraído de `MaryKayStore`) y renderizado una sola vez en `src/main.jsx`.
- `src/main.jsx`: envolver la app con `CartProvider` y `FavoritesProvider` dentro de `AuthProvider`; montar `<CartDrawer />`.
- `src/components/Navbar.jsx`: icono de carrito con badge en desktop y móvil.
- `MaryKayStore.jsx`: dejar de tener carrito/drawer/flotante locales y consumir `useCart`; botón flotante de `/tienda` conectado al contexto; botón corazón de favoritos en `ProductCard`.
- `src/pages/AccountPage.jsx`: sistema de pestañas accesible ("Mi Perfil", "Mi Carrito", "Favoritos", "Mis Compras") conservando el perfil y los accesos a Mis Turnos / Mis Cursos.
- Registro de orden (snapshot) al enviar pedido por WhatsApp estando logueado.
- Migración SQL `supabase/migrations/*_spec_010_favorites_orders.sql` (creada como archivo, **no aplicada** por el agente).
- Limpieza de `syncCart` en `src/context/AuthContext.jsx` y de sus imports.
- Utilidad compartida de precio es-AR (`src/lib/format.js`).
- Documentación SDD (esta spec, `plan.md`, `tasks.md`) y actualización de `MEMORY.md`.

### 2.2 Excluye
- Pasarela de pago / checkout online, cupones, envíos, cálculo de impuestos.
- Favoritos para invitados (se decide que **requieren sesión**).
- Sincronización bidireccional offline / Service Workers / resolución de conflictos por timestamp.
- Edición/anulación de órdenes por el usuario (solo lectura del historial y creación).
- Migración del `avatar` a Storage (fuera de alcance; spec 009 ya lo acota).
- Rediseño del home, servicios, cursos o contacto.
- Cambios al flujo de turnos (`TurnoProvider` / `TurnoModal`).
- Aplicar la migración al proyecto Supabase real vía MCP (token de otra organización). Queda documentada para aplicación manual.

## 3. Requisitos EARS

### 3.1 Carrito global y UI

**RF-01 (Ubicuo)**  
EL SISTEMA expondrá un `CartProvider` global cuyo hook `useCart` devuelva `{ items, loading, isOpen, openCart, closeCart, addToCart, removeFromCart, updateQuantity, setQuantity, clearCart, itemCount, total, syncError, isSyncing }`.

**RF-02 (De evento)**  
CUANDO se invoque `addToCart(product)`, EL SISTEMA sumará 1 a la cantidad si el producto ya existe (match por `id`) o lo agregará con `quantity: 1`, y abrirá el drawer (`openCart`).

**RF-03 (Ubicuo)**  
EL SISTEMA renderizará `<CartDrawer />` una sola vez en `src/main.jsx`, de modo que el carrito sea accesible desde cualquier ruta y no solo desde `/tienda`.

**RF-04 (Por estado)**  
MIENTRAS el usuario esté en `/tienda`, EL SISTEMA conservará un botón flotante de carrito conectado a `useCart()` (`openCart` / `itemCount`); su visibilidad podrá mantenerse como hoy.

**RF-05 (Ubicuo)**  
EL SISTEMA mostrará en la Navbar un botón de carrito con badge de cantidad (`itemCount`) tanto en el bloque de acciones de escritorio como en el menú móvil; el badge se ocultará cuando `itemCount === 0`.

**RF-06 (Restricción de accesibilidad)**  
MIENTRAS el botón de carrito de la Navbar esté visible, EL SISTEMA garantizará área táctil ≥ 44px y un `aria-label` dinámico ("Abrir carrito, N productos").

**RF-07 (De evento)**  
CUANDO el drawer esté abierto, EL SISTEMA lo cerrará con `Escape`, clic en el backdrop y el botón de cierre; bloqueará el scroll del `body` mientras esté abierto y devolverá el foco al elemento que lo abrió al cerrar.

**RF-08 (Por estado)**  
MIENTRAS el drawer esté visible, EL SISTEMA mostrará estado vacío, ítems con imagen/nombre/precio, controles `+`, `-`, eliminar, total es-AR y el CTA "Enviar Pedido por WhatsApp".

### 3.2 Persistencia y sincronización

**RF-09 (Por estado)**  
MIENTRAS no haya sesión, EL SISTEMA persistirá los ítems en `localStorage` bajo la clave `imchic_cart` (de modo que sobrevivan a una recarga) y migrará una sola vez, de forma transparente, el contenido legado de la clave `cart`.

**RF-10 (De evento)**  
CUANDO el usuario inicie sesión, EL SISTEMA fusionará el carrito local con `public.cart_items` y hará de `cart_items` la fuente de verdad. El merge usa **detección de espejo** mediante el marcador `imchic_cart_owner` (localStorage): si el marcador coincide con el `user.id` (carrito exportado por el mismo usuario), las cantidades UUID ya presentes en remoto se conservan y solo se seedean las ausentes; si NO coincide (carrito de invitado genuino), se suman las cantidades por `product_id`. Los ítems no-UUID se conservan local-only.

**RF-11 (De evento)**  
CUANDO el usuario cierre sesión, EL SISTEMA conservará en `localStorage` (`imchic_cart`) el carrito COMPLETO (incluidos los UUID) para que siga disponible sin cuenta y sin perder datos si un merge falla, y limpiará el estado dependiente de sesión. El marcador `imchic_cart_owner` NO se borra al cerrar sesión (permite detectar el espejo al re-loguear); solo se limpia si el invitado MUTA el carrito, para que vuelva a tratarse como genuino.

**RF-12 (Por estado)**  
MIENTRAS haya sesión, EL SISTEMA reflejará `addToCart`/`updateQuantity`/`removeFromCart`/`clearCart` en `public.cart_items` mediante upsert/delete (con UI optimista y rollback de estado en caso de error).

**RF-13 (Por estado)**  
SI `public.cart_items` no existe o la consulta falla, ENTONCES EL SISTEMA no romperá la tienda: mostrará un aviso no bloqueante (`role="status"`) y operará en modo local.

**RF-14 (Restricción)**  
EL SISTEMA omitirá de la persistencia en Supabase los ítems cuyo `id` no sea un UUID válido (productos del catálogo de respaldo `fallbackProducts`, ids numéricos 1..31), conservándolos en memoria y en `localStorage`; esta limitación quedará documentada.

### 3.3 Favoritos

**RF-15 (De evento)**  
CUANDO se renderice una `ProductCard`, EL SISTEMA mostrará un botón de corazón con `aria-pressed` (estado de favorito) y `aria-label` ("Agregar a favoritos" / "Quitar de favoritos").

**RF-16 (Por estado)**  
MIENTRAS el usuario esté autenticado y pulse el corazón, EL SISTEMA insertará o eliminará la fila en `public.favorites` (UI optimista) y actualizará el estado global vía `useFavorites`.

**RF-17 (Por estado)**  
MIENTRAS el usuario NO esté autenticado y pulse el corazón, EL SISTEMA NO alternará el favorito y mostrará un aviso/CTA accesible (`role="status"`) "Iniciá sesión para guardar favoritos" con enlace a `/login`.

**RF-18 (Ubicuo)**  
EL SISTEMA expondrá `FavoritesContext` + `useFavorites` con `{ favorites, isFavorite(id), toggleFavorite(product), loading, unavailable, error }` y reaccionará al cambio de sesión.

**RF-19 (Por estado)**  
MIENTRAS el usuario vea la pestaña "Favoritos" en `/cuenta`, EL SISTEMA listará los productos favoritos (datos del producto vía relación `favorites.product_id → products.id`, con fallback a los datos de la tienda cuando corresponda) con botón "Agregar al carrito" (usa `addToCart`) y "Quitar".

### 3.4 Mis Compras

**RF-20 (De evento)**  
CUANDO un usuario autenticado pulse "Enviar Pedido por WhatsApp", EL SISTEMA insertará primero una fila en `public.orders` (status `enviado_whatsapp`, `total`, `whatsapp_message`) y sus `public.order_items` (snapshot de `product_name`, `unit_price`, `quantity`, `product_id` nullable) ANTES de abrir `wa.me`.

**RF-21 (De evento)**  
CUANDO se envíe el pedido, EL SISTEMA NO vaciará el carrito automáticamente; ofrecerá un botón "Vaciar carrito" (`clearCart`) como acción explícita.

**RF-22 (Por estado)**  
MIENTRAS el usuario NO esté autenticado, EL SISTEMA no registrará órdenes; solo abrirá WhatsApp con el mensaje actual.

**RF-23 (Por estado)**  
SI `public.orders`/`public.order_items` no existen o la inserción falla, ENTONCES EL SISTEMA igualmente abrirá WhatsApp y mostrará un aviso no bloqueante.

**RF-24 (Por estado)**  
MIENTRAS el usuario vea la pestaña "Mis Compras" en `/cuenta`, EL SISTEMA listará sus órdenes (más recientes primero) con fecha en formato es-AR, estado legible, ítems (nombre × cantidad, precio unitario) y total.

### 3.5 Pestañas de `/cuenta`

**RF-25 (Ubicuo)**  
EL SISTEMA renderizará `/cuenta` con un `role="tablist"` y cuatro pestañas: "Mi Perfil", "Mi Carrito", "Favoritos" y "Mis Compras"; cada pestaña con `role="tab"`, `aria-selected` y `aria-controls`, y cada panel con `role="tabpanel"` y `aria-labelledby`.

**RF-26 (De evento)**  
CUANDO el usuario navegue la tablist, EL SISTEMA permitirá seleccionar con clic y con teclado (`ArrowLeft`, `ArrowRight`, `Home`, `End`), manteniendo un único panel visible.

**RF-27 (Por estado)**  
MIENTRAS el usuario vea `/cuenta`, EL SISTEMA conservará el formulario de perfil actual y los accesos a "Mis Turnos" y "Mis Cursos".

**RF-28 (Por estado)**  
MIENTRAS el usuario vea la pestaña "Mi Carrito", EL SISTEMA reutilizará la misma fuente de verdad y acciones del `CartContext` que el drawer global (sin estado duplicado).

### 3.6 Limpieza e infraestructura

**RF-29 (De código)**  
EL SISTEMA eliminará la función `syncCart` y su entrada en el value de `AuthContext` (y de su JSDoc), y dejará de importarla en `AccountPage`.

**RF-30 (De infraestructura)**  
EL SISTEMA incluirá una migración SQL en `supabase/migrations/` que cree `public.favorites`, `public.orders` y `public.order_items`, con claves foráneas, índices en columnas FK, `unique(user_id, product_id)` en `favorites`, trigger `updated_at` en `orders` (reusando `public.set_updated_at()`), RLS por `auth.uid()` y `grant` explícitos al rol `authenticated`.

**RF-31 (Restricción operativa)**  
EL SISTEMA documentará que la migración se aplica manualmente (SQL Editor del dashboard o `supabase db push`), porque el MCP de Supabase disponible no tiene permisos sobre la organización del proyecto real.

**RF-32 (De verificación)**  
CUANDO el implementador ejecute `npm run build`, EL SISTEMA compilará sin errores ni advertencias nuevas y sin regresión en `/`, `/servicios`, `/inversion`, `/cursos`, `/tienda`, `/contacto`, `/cuenta`.

## 4. Criterios de Aceptación (CA)

| ID | Criterio |
|----|----------|
| CA-01 | El carrito se puede abrir desde la Navbar en cualquier ruta (`/`, `/servicios`, `/cursos`, `/contacto`, `/tienda`, `/cuenta`). |
| CA-02 | El badge de la Navbar refleja `itemCount`; se oculta con 0 y se actualiza al agregar/quitar. |
| CA-03 | Invitado agrega productos, recarga la página y el carrito persiste desde `imchic_cart`. |
| CA-04 | Al iniciar sesión, los ítems locales con `id` UUID se fusionan con `cart_items` sumando cantidades y sin duplicados por `(user_id, product_id)`. |
| CA-05 | Al cerrar sesión, el carrito sigue disponible sin cuenta (exportado a `imchic_cart`). |
| CA-06 | El drawer global funciona fuera de `/tienda`; en `/tienda` el botón flotante abre el mismo drawer. |
| CA-07 | El drawer es accesible: `Escape`/backdrop/botón cierran, scroll bloqueado, foco gestionado, controles con nombre accesible y ≥44px. |
| CA-08 | Ítems con id numérico (respaldo) no generan error de Supabase y permanecen operativos en local. |
| CA-09 | Con las tablas nuevas ausentes, la app no rompe: muestra avisos no bloqueantes y sigue funcionando en modo local. |
| CA-10 | Logueado, el corazón inserta/elimina en `favorites` y `aria-pressed` cambia; persiste al recargar. |
| CA-11 | Invitado que toca el corazón ve "Iniciá sesión para guardar favoritos" con enlace a `/login`, sin error. |
| CA-12 | La pestaña "Favoritos" lista productos con "Agregar al carrito" y "Quitar" funcionales. |
| CA-13 | Logueado, enviar pedido por WhatsApp crea `orders` + `order_items` antes de abrir WhatsApp; el carrito NO se vacía solo. |
| CA-14 | Invitado que envía pedido NO crea filas y sí abre WhatsApp. |
| CA-15 | "Mis Compras" lista las órdenes propias con fecha es-AR, estado, ítems y total; vacío muestra estado vacío claro. |
| CA-16 | `/cuenta` tiene 4 pestañas con `role=tablist/tab/tabpanel`, `aria-selected` correcto y navegación por flechas/Home/End. |
| CA-17 | Perfil, "Mis Turnos" y "Mis Cursos" siguen accesibles y funcionando. |
| CA-18 | `grep` confirma que `syncCart` ya no existe en `AuthContext` ni se importa en `AccountPage`. |
| CA-19 | Existe la migración en `supabase/migrations/` con RLS self, índices FK y grants; incluye nota de aplicación manual. |
| CA-20 | `npm run build` pasa; sin regresión en las rutas listadas en RF-32. |
| CA-21 | Precios en es-AR con `Intl.NumberFormat`; touch targets ≥44px; contraste AA; un solo `<h1>` por página. |
| CA-22 | `MEMORY.md` actualizado al cierre (decisión de carrito global/favoritos/compras y nota de migración pendiente). |

## 5. Modelo de Datos (Supabase)

`public.cart_items` **ya existe** (migración spec 008) y no se modifica: `id`, `user_id → auth.users`, `product_id → public.products`, `quantity > 0`, `created_at`, `updated_at`, `unique(user_id, product_id)`, RLS self y grants `authenticated`.

Tablas nuevas (diseño a implementar en T1; SQL completo en la migración):

```sql
-- Favoritos por usuario
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_unique_user_product unique (user_id, product_id)
);
create index if not exists favorites_user_id_idx on public.favorites (user_id);
create index if not exists favorites_product_id_idx on public.favorites (product_id);

-- Órdenes (pedidos enviados por WhatsApp)
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           text not null default 'enviado_whatsapp'
                     check (status in ('enviado_whatsapp','confirmado','entregado','cancelado')),
  total            numeric(10,2) not null default 0 check (total >= 0),
  whatsapp_message text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

-- Detalle de orden (snapshot histórico)
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price   numeric(10,2) not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  created_at   timestamptz not null default now()
);
create index if not exists order_items_order_id_idx   on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
```

RLS (todas con `(select auth.uid())` para evitar evaluación por fila, alineado a buenas prácticas Postgres):
- `favorites`: select/insert/delete con `user_id = (select auth.uid())`.
- `orders`: select/insert con `user_id = (select auth.uid())`; trigger `set_updated_at`.
- `order_items`: select/insert donde exista la orden propia:
  `exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))`.
- Grants: `grant select, insert, delete on public.favorites to authenticated;`
  `grant select, insert on public.orders to authenticated;`
  `grant select, insert on public.order_items to authenticated;`

**Limitación conocida:** `cart_items` y `favorites` referencian `products(id)` (UUID). Los productos del catálogo de respaldo tienen ids numéricos y **no se persisten** en Supabase (RF-14). `order_items.product_id` es nullable para admitir snapshots de productos no-UUID.

## 6. Restricciones y Constitución

- **Mobile-first** (constitución §1): Navbar, drawer y tabs se validan primero en viewport móvil (≤390px).
- **Estabilidad estructural** (§2): `Navbar`, `MaryKayStore`, `HomeServices`, `InversionPage`, `ContactoPage` y `TurnoModal` son componentes protegidos; **esta spec es la autorización** para modificarlos en el alcance descrito, sin alterar sus flujos no relacionados.
- **Estética consistente** (§3): solo utilidades Tailwind, paleta de marca (`#FFF0F3`, `#5A0B22`, `#7A1333`, `#FFC9D6`, dorado `#D4AF37`) y estilos `premium-*` existentes.
- **Validación visual** (§4) y **prevalencia SDD** (§5): spec → plan → tareas → implementación → validación.
- Áreas táctiles ≥ 44px, contraste WCAG 2.1 AA, un único `<h1>` por página, `Intl.NumberFormat('es-AR')`.
- No se aplican migraciones vía MCP: la migración se entrega como archivo y se documenta para aplicación manual (RF-31).
- El front debe degradar con gracia ante la ausencia de las tablas nuevas (RF-13/RF-23).

## 7. Riesgos

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|--------|-------|---------|------------|
| R1 | Migración no aplicada en el proyecto real (token de otra organización). | Alta | Medio | Degradación grácil + avisos `role="status"`; documentar aplicación manual. |
| R2 | Ids numéricos de `fallbackProducts` no insertables en columnas UUID. | Alta | Bajo | Filtrar por UUID válido; conservar localmente (RF-14). |
| R3 | Recursión/complejidad de RLS en `order_items` (verifica `orders`). | Media | Medio | Subconsulta con `(select auth.uid())` + índice en `order_id`; pruebas con dos usuarios. |
| R4 | Doble merge en React StrictMode al montar/login. | Media | Medio | Guardar con `useRef` el último `user.id` sincronizado; idempotencia por `unique(user_id,product_id)` + upsert. |
| R5 | El login dispara sync antes de que AuthContext hidrate. | Media | Medio | Disparar sync en `useEffect` observando `user?.id` con estado de `loading`. |
| R6 | Ancho de la Navbar en móvil por el nuevo icono (componente protegido). | Media | Bajo | Icono compacto de 44px; revisar 360–390px; no tocar logo/links/barra. |
| R7 | Registrar orden antes de WhatsApp puede demorar la apertura. | Baja | Bajo | Timeout/`try/catch`: si falla, abrir WhatsApp igual (RF-23). |
| R8 | Clave legada `cart` vs `imchic_cart`. | Baja | Bajo | Migración única de clave en el primer arranque. |
| R9 | Aviso de favoritos a invitado sin sistema de toasts. | Baja | Bajo | Mensaje inline accesible (`role="status"`) con enlace a `/login`. |

## 8. Fuera de Alcance

- Checkout con pago online, cupones, envíos y facturación.
- Favoritos para invitados (se requiere sesión).
- Historial compartido o panel admin de órdenes (solo el usuario ve sus órdenes; el admin conserva sus herramientas actuales).
- Edición/cancelación de órdenes desde el front.
- Sincronización offline/eventual o resolución de conflictos por timestamp.
- Migración del avatar a Storage.

## 9. Estado

- **Estado**: Borrador listo para revisión y aprobación.
- **Fecha**: 2026-10-03
- **Autor**: Coordinador SDD
