# Tareas de Implementación — Spec 010: Carrito Persistente Global, Favoritos e Historial de Compras

> Orden sugerido: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12 → T13 → T14 → T15.
> Cada tarea es discreta y verificable. Las tareas de UI requieren además validación visual (constitución §4).
> **No editar**: `cart_items` (ya existe) ni el flujo de turnos.

---

## T1: Migración SQL — favorites, orders, order_items

**Archivo afectado:** `supabase/migrations/20261003120000_spec_010_favorites_orders.sql` (nuevo).

**Cambio:**
- Crear `public.favorites` (`id`, `user_id → auth.users on delete cascade`, `product_id → public.products on delete cascade`, `created_at`, `unique(user_id, product_id)`) + índices `favorites_user_id_idx`, `favorites_product_id_idx`.
- Crear `public.orders` (`id`, `user_id → auth.users on delete cascade`, `status` default `'enviado_whatsapp'` con check, `total numeric(10,2)`, `whatsapp_message`, `created_at`, `updated_at`) + índice `orders_user_id_created_at_idx (user_id, created_at desc)` + trigger `set_updated_at`.
- Crear `public.order_items` (`id`, `order_id → public.orders on delete cascade`, `product_id → public.products on delete set null` nullable, `product_name`, `unit_price`, `quantity`, `created_at`) + índices `order_items_order_id_idx`, `order_items_product_id_idx`.
- RLS enable + policies self con `(select auth.uid())`: `favorites` select/insert/delete; `orders` select/insert; `order_items` select/insert con `exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))`.
- Grants: `select,insert,delete` en `favorites`; `select,insert` en `orders` y `order_items` para `authenticated`.
- Cabecera con nota de **aplicación manual** (SQL Editor o `supabase db push`) y que el MCP no puede aplicarla.
- `comment on table/column`; usar `if not exists` / `drop ... if exists` para idempotencia.

**Criterio de hecho:**
- [ ] El archivo existe y es sintácticamente válido (revisión con `psql --dry-run`/linter o lectura experta; no se aplica vía MCP).
- [ ] Las tres tablas tienen FK, checks e índice en cada columna FK.
- [ ] RLS self y grants mínimos definidos; `order_items` validado contra `orders` propios.
- [ ] `cart_items` no aparece modificada.

**Verificación:**
- Revisión de SQL contra la guía `supabase-postgres-best-practices` (FK indexadas, RLS con `(select auth.uid())`, least privilege).
- Tras aplicación manual: `select tablename from pg_tables where schemaname='public';` muestra las 3 tablas.

**NO romper:** `cart_items`, `products`, `is_admin()` y `set_updated_at()` existentes.

**Dependencias:** — (bloquea T9, T12, T13 para verificación real).

---

## T2: `CartContext` + util de formato

**Archivos afectados:** `src/context/CartContext.jsx` (nuevo), `src/lib/format.js` (nuevo).

**Cambio:**
- `src/lib/format.js`: mover `formatPrice` (es-AR) desde `MaryKayStore`; agregar `isUuid(value)` y `formatDateEs(value)`.
- `CartProvider` + `useCart` con `{ items, loading, isOpen, openCart, closeCart, addToCart, removeFromCart, updateQuantity, setQuantity, clearCart, itemCount, total, syncError, isSyncing }`.
- `addToCart`: suma 1 si existe (match por `id`), si no agrega `quantity:1`; luego `openCart`.
- Persistencia invitado: hidratar/guardar en `localStorage['imchic_cart']`; migración única desde `'cart'`.
- Sync logueado: al cambiar `user?.id` (y `loading=false`) hacer merge con `cart_items` (sumar cantidades por `product_id` UUID), pasar a fuente de verdad, limpiar UUID de local; al logout exportar a `imchic_cart`.
- `add/update/remove/clear` reflejan en `cart_items` con UI optimista y rollback.
- Solo persistir ids UUID (`isUuid`); los numéricos quedan local-only.
- Capturar errores de tabla inexistente (`42P01`/`PGRST205`) en `syncError` sin lanzar.

**Criterio de hecho:**
- [ ] `useCart` funciona en cualquier ruta (provider global).
- [ ] Invitado: recargar mantiene items desde `imchic_cart`.
- [ ] Login: merge suma cantidades sin duplicar; logout exporta a local.
- [ ] `addToCart` abre el drawer; `itemCount`/`total` correctos.
- [ ] Ítems numéricos no generan error de Supabase.

**Verificación:**
- `npm run build`; smoke manual de add/remove/update y recarga.
- DevTools → Application → Local Storage: clave `imchic_cart`; con sesión, filas en `cart_items`.

**NO romper:** `AuthContext`; no mutar `cart_items` si no hay sesión.

**Dependencias:** — (T4, T5, T7 y T11 dependen de esta).

---

## T3: `FavoritesContext`

**Archivo afectado:** `src/context/FavoritesContext.jsx` (nuevo).

**Cambio:**
- `FavoritesProvider` + `useFavorites` con `{ favorites, isFavorite, toggleFavorite, loading, unavailable, error, requiresAuth }`.
- Cargar `favorites.select('product_id')` al haber sesión; limpiar al logout.
- `toggleFavorite(product)`: sin sesión → no alterna y setea `requiresAuth` (aviso); con sesión → insert/delete optimista con rollback.
- `unavailable=true` si la tabla no existe/falla (degradación).

**Criterio de hecho:**
- [ ] `isFavorite(id)` refleja el estado; toggle persiste en `favorites` cuando hay sesión.
- [ ] Invitado no inserta y expone `requiresAuth`.
- [ ] Sin tabla `favorites`, `unavailable=true` y la app no rompe.

**Verificación:**
- Smoke con sesión (fila en `favorites`) y sin sesión (sin fila, `requiresAuth`).

**NO romper:** no debe afectar al carrito ni provocar queries en invitados.

**Dependencias:** — (T8 y T12 dependen de esta).

---

## T4: `CartDrawer` global

**Archivo afectado:** `src/components/CartDrawer.jsx` (nuevo).

**Cambio:**
- Extraer drawer de `MaryKayStore` (672–762) a componente que consume `useCart()`.
- `isOpen/openCart/closeCart`, cierre con backdrop/X/`Escape`, bloqueo de scroll y gestión de foco.
- Mostrar items, +/-/eliminar, total es-AR, CTA "Enviar Pedido por WhatsApp" y "Vaciar carrito".
- CTA async: construir mensaje → si hay sesión registrar `orders` + `order_items` (snapshot, `status='enviado_whatsapp'`) → abrir `wa.me`; estado "Registrando…"; fallo no bloquea la apertura; `syncError` visible con `role="status"`.
- Aviso si el carrito está vacío.

**Criterio de hecho:**
- [ ] Drawer funcional desde cualquier ruta.
- [ ] Logueado: crea orden antes de abrir WhatsApp; invitado solo abre WhatsApp.
- [ ] El carrito NO se vacía automáticamente; "Vaciar carrito" sí.
- [ ] Accesible (Escape/backdrop/foco, controles ≥44px).

**Verificación:**
- Smoke logueado/invitado; revisar `orders`/`order_items` en Supabase cuando la migración esté aplicada.

**NO romper:** flujo actual de mensaje WhatsApp y total.

**Dependencias:** T2.

---

## T5: `main.jsx` — providers y drawer global

**Archivo afectado:** `src/main.jsx`.

**Cambio:**
- Envolver: `<AuthProvider><CartProvider><FavoritesProvider><TurnoProvider>`.
- Renderizar `<CartDrawer />` una vez dentro de los providers (junto a `<Routes>`).
- Mantener `ErrorBoundary`, `BrowserRouter` y todas las rutas existentes.

**Criterio de hecho:**
- [ ] La jerarquía de providers compila y respeta el orden (Cart/Favorites dentro de Auth).
- [ ] Un solo `<CartDrawer />` en todo el árbol.
- [ ] Rutas intactas.

**Verificación:**
- `npm run build`; navegar rutas y abrir el carrito.

**NO romper:** rutas ni `TurnoProvider` (los turnos siguen igual).

**Dependencias:** T2, T3, T4.

---

## T6: Navbar — icono de carrito con badge

**Archivo afectado:** `src/components/Navbar.jsx`.

**Cambio:**
- Importar `ShoppingCart` y `useCart`; botón con badge (`itemCount`, oculto si 0), `aria-label` dinámico, ≥44px.
- Desktop: junto a los botones auth; móvil: acción visible en la fila superior y entrada en el menú desplegable.
- `onClick={openCart}`.
- **No tocar** logo, links, barra de anuncios ni botones auth.

**Criterio de hecho:**
- [ ] Icono visible y funcional en desktop y móvil; badge correcto y oculto con 0.
- [ ] Sin desbordes a 360–390px; touch target ≥44px; nombre accesible con cantidad.

**Verificación:**
- Smoke móvil/desktop; DevTools medición de touch target y `aria-label`.

**NO romper:** estabilidad estructural de la Navbar (spec 009 ya la ajustó).

**Dependencias:** T2.

---

## T7: MaryKayStore — usar `useCart` y quitar estado/drawer local

**Archivo afectado:** `MaryKayStore.jsx`.

**Cambio:**
- Quitar `cart`, `isCartOpen`, `addToCart`, `removeFromCart`, `updateQuantity`, `cartTotal`, `cartItemCount`, `generateWhatsAppCheckoutLink` y el JSX del drawer/backdrop.
- Consumir `const { addToCart, openCart, itemCount } = useCart();`.
- Importar `formatPrice` desde `src/lib/format.js`; limpiar imports sin uso (`ShoppingBag`, `Trash2`, `Plus`, `Minus` si corresponde) y agregar `Heart`.
- Botón flotante de `/tienda` conectado a `openCart`/`itemCount` (se mantiene).

**Criterio de hecho:**
- [ ] `/tienda` compila y agrega al mismo carrito global que la Navbar/cuenta.
- [ ] No queda estado de carrito local ni referencias a la clave `'cart'`.
- [ ] El botón flotante sigue funcionando.

**Verificación:**
- `grep -n "setCart\|isCartOpen\|generateWhatsAppCheckoutLink" MaryKayStore.jsx` → 0.
- Smoke: agregar desde `/tienda` y abrir desde Navbar.

**NO romper:** buscador, categorías, catálogo Supabase/fallback y `ProductCard`.

**Dependencias:** T2 (y T4/T5 para ver el drawer).

---

## T8: ProductCard — botón corazón de favoritos

**Archivo afectado:** `MaryKayStore.jsx` (`ProductCard`, ~454–533 y render ~939–946).

**Cambio:**
- Props nuevas: `isFavorite`, `onToggleFavorite`.
- Botón corazón sobre la imagen con `aria-pressed`, `aria-label` ("Agregar a favoritos"/"Quitar de favoritos"), ≥44px, feedback visual.
- Sin sesión: al pulsar, mostrar aviso inline accesible (`role="status"`) "Iniciá sesión para guardar favoritos" con link a `/login`; no alterna.
- Pasar `useFavorites()` desde `MaryKayStore`.

**Criterio de hecho:**
- [ ] Logueado: alterna y persiste; `aria-pressed` correcto.
- [ ] Invitado: aviso + link a `/login`, sin errores.
- [ ] El botón no interfiere con "Agregar al carrito".

**Verificación:**
- Smoke con/sin sesión; recargar y verificar persistencia.

**NO romper:** toggle "Ver más/Ver menos" ni layout de la card.

**Dependencias:** T3, T7.

---

## T9: Registrar orden al enviar pedido por WhatsApp

**Archivo afectado:** `src/components/CartDrawer.jsx` (lógica de checkout).

**Cambio:**
- En el CTA: si hay sesión, insertar `orders` (`status='enviado_whatsapp'`, `total`, `whatsapp_message`) y `order_items` (snapshot: `product_name`, `unit_price`, `quantity`, `product_id` solo si UUID) **antes** de abrir WhatsApp.
- Invitado: no insertar.
- Si falla (tabla ausente/error), abrir WhatsApp igual y mostrar aviso no bloqueante.
- No vaciar el carrito; ofrecer "Vaciar carrito".

**Criterio de hecho:**
- [ ] Logueado genera 1 orden + N ítems con snapshot correcto, abriendo WhatsApp después.
- [ ] Invitado no genera filas.
- [ ] Fallo de inserción no bloquea WhatsApp.

**Verificación:**
- Smoke logueado y consulta a `orders`/`order_items`; prueba sin migración (degradación).

**NO romper:** mensaje de WhatsApp ni carrito.

**Dependencias:** T1 (real), T4.

---

## T10: `/cuenta` — sistema de pestañas accesible

**Archivo afectado:** `src/pages/AccountPage.jsx`.

**Cambio:**
- `role="tablist"` con 4 `role="tab"` ("Mi Perfil", "Mi Carrito", "Favoritos", "Mis Compras") + paneles `role="tabpanel"`.
- `aria-selected`, `aria-controls`, `aria-labelledby`, roving `tabIndex`; teclado `ArrowLeft/Right/Home/End`.
- Mobile-first: tablist con scroll horizontal y touch targets ≥44px.
- Conservar encabezado, "Cerrar sesión", formulario de perfil y accesos "Mis Turnos"/"Mis Cursos" (fuera de los tabs).
- Quitar `syncCart` del destructuring de `useAuth`.

**Criterio de hecho:**
- [ ] 4 tabs navegables por clic y teclado; un único panel visible.
- [ ] Perfil y accesos rápidos intactos.
- [ ] Sin errores de axe/Lighthouse AA en `/cuenta`.

**Verificación:**
- Smoke teclado + lector de pantalla; Lighthouse Accessibility.

**NO romper:** guardado de perfil, avatar, links a turnos/cursos.

**Dependencias:** T2, T3 (paneles).

---

## T11: Pestaña "Mi Carrito"

**Archivo afectado:** `src/components/account/CartPanel.jsx` (nuevo) + montaje en `AccountPage.jsx`.

**Cambio:**
- Consumir `useCart()` (misma fuente de verdad que el drawer): lista, +/-/eliminar, total es-AR, CTA WhatsApp (reutilizar la lógica de T9), "Vaciar carrito", estado vacío.

**Criterio de hecho:**
- [ ] Cambios en la pestaña se reflejan en el drawer de la Navbar y viceversa.
- [ ] Estado vacío claro; precios es-AR.

**Verificación:**
- Smoke cruzado Navbar ↔ `/cuenta#micarrito`.

**NO romper:** drawer global.

**Dependencias:** T2, T9, T10.

---

## T12: Pestaña "Favoritos"

**Archivo afectado:** `src/components/account/FavoritesPanel.jsx` (nuevo) + montaje en `AccountPage.jsx`.

**Cambio:**
- Cargar `favorites` con join a `products` (`.select('product_id, created_at, products(*)')`); mapear a la forma de la tienda; fallback si el producto no está.
- Mostrar imagen, nombre, precio es-AR, "Agregar al carrito" (`addToCart`) y "Quitar" (`toggleFavorite`).
- Estado vacío y aviso si `favorites` no existe (`unavailable`).

**Criterio de hecho:**
- [ ] Lista los favoritos del usuario; agregar/quitar funcionan.
- [ ] Sin sesión o sin tabla: mensaje claro, sin romper.

**Verificación:**
- Smoke; comparar con el corazón de `ProductCard`.

**NO romper:** carga de `/cuenta`.

**Dependencias:** T1 (real), T3, T10.

---

## T13: Pestaña "Mis Compras"

**Archivo afectado:** `src/components/account/OrdersPanel.jsx` (nuevo) + montaje en `AccountPage.jsx`.

**Cambio:**
- Cargar `orders` con `order_items` (`.select('*, order_items(*)').order('created_at', { ascending: false })`).
- Renderizar fecha es-AR (`formatDateEs`), estado legible, ítems (nombre × cantidad, precio unitario) y total es-AR.
- Estado vacío y aviso si las tablas no existen.

**Criterio de hecho:**
- [ ] Lista órdenes propias, más recientes primero, con fecha/estado/ítems/total.
- [ ] Estado vacío claro; degradación sin tablas.

**Verificación:**
- Smoke tras registrar una orden (T9); revisar con dos usuarios que RLS aísla.

**NO romper:** privacidad (un usuario no ve órdenes ajenas).

**Dependencias:** T1 (real), T9, T10.

---

## T14: Limpieza de `syncCart` en AuthContext

**Archivos afectados:** `src/context/AuthContext.jsx`, `src/pages/AccountPage.jsx`.

**Cambio:**
- Eliminar la función `syncCart` (104–137), su entrada en el value (153) y su mención en el JSDoc (15).
- Quitar `syncCart` del destructuring de `useAuth` en `AccountPage`.

**Criterio de hecho:**
- [ ] `grep -rn "syncCart" src/` → 0 resultados.
- [ ] `AuthContext` sigue proveyendo sesión, rol admin, signIn/signOut/register/updateProfile.

**Verificación:**
- `npm run build`; smoke de login/logout.

**NO romper:** autenticación ni `ProtectedRoute`.

**Dependencias:** — (independiente; hacer tras T2 para evitar doble persistencia).

---

## T15: Verificación final (build + regresión + MEMORY.md)

**Archivos/Áreas:** todo el proyecto + `MEMORY.md`.

**Criterio de hecho:**
- [ ] `npm run build` sin errores ni warnings nuevos.
- [ ] CA-01..CA-22 validados (degradación sin tablas + con tablas aplicadas).
- [ ] Sin regresión en `/`, `/servicios`, `/inversion`, `/cursos`, `/tienda`, `/contacto`, `/cuenta`.
- [ ] RLS multi-usuario verificado (favoritos y órdenes ajenas invisibles).
- [ ] `MEMORY.md` actualizado (carrito global/persistente, favoritos, compras y migración pendiente de aplicación manual) respetando el límite de 50 líneas.

**Verificación:**
- `npm run build`; recorrido manual de rutas y flujos; `grep` de control de `syncCart` y del carrito local.

**NO romper:** nada — esta tarea valida que nada se rompió.

**Dependencias:** T1–T14.

---

## Resumen de Tareas

| ID | Título | Archivo(s) | Dependencias |
|----|--------|-----------|--------------|
| T1 | Migración SQL (favorites, orders, order_items) | `supabase/migrations/20261003120000_spec_010_favorites_orders.sql` | — |
| T2 | `CartContext` + `lib/format` | `src/context/CartContext.jsx`, `src/lib/format.js` | — |
| T3 | `FavoritesContext` | `src/context/FavoritesContext.jsx` | — |
| T4 | `CartDrawer` global | `src/components/CartDrawer.jsx` | T2 |
| T5 | Providers + drawer en `main.jsx` | `src/main.jsx` | T2, T3, T4 |
| T6 | Navbar: icono carrito + badge | `src/components/Navbar.jsx` | T2 |
| T7 | MaryKayStore usa `useCart` | `MaryKayStore.jsx` | T2 |
| T8 | ProductCard: corazón favoritos | `MaryKayStore.jsx` | T3, T7 |
| T9 | Registrar orden al enviar WhatsApp | `src/components/CartDrawer.jsx` | T1, T4 |
| T10 | `/cuenta`: tabs accesibles | `src/pages/AccountPage.jsx` | T2, T3 |
| T11 | Pestaña "Mi Carrito" | `src/components/account/CartPanel.jsx`, `AccountPage.jsx` | T2, T9, T10 |
| T12 | Pestaña "Favoritos" | `src/components/account/FavoritesPanel.jsx`, `AccountPage.jsx` | T1, T3, T10 |
| T13 | Pestaña "Mis Compras" | `src/components/account/OrdersPanel.jsx`, `AccountPage.jsx` | T1, T9, T10 |
| T14 | Limpieza `syncCart` | `src/context/AuthContext.jsx`, `AccountPage.jsx` | — |
| T15 | Build + verificación + `MEMORY.md` | Varios | T1–T14 |

**Orden crítico:** T1 → T2 → T3 → T4 → T5 (base) → T6/T7/T8/T9 (UI carrito/favoritos) → T10 → T11/T12/T13 (paneles) → T14 → T15.
