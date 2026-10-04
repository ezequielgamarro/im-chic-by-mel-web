# Plan de Implementación — Spec 010: Carrito Persistente Global, Favoritos e Historial de Compras

## 1. Resumen y alcance

Convertir el carrito local de `MaryKayStore` en un estado global (`CartContext`), persistente por usuario en `cart_items`, visible desde la `Navbar` y desde `/cuenta`; sumar `FavoritesContext`, `orders`/`order_items` y un sistema de pestañas accesible en `/cuenta`. Todo sin romper la app cuando las tablas nuevas todavía no existan.

**Precedentes verificados por lectura:**
- `MaryKayStore.jsx` define `cart`/`isCartOpen` como `useState` local (líneas 539–540), `addToCart`/`removeFromCart`/`updateQuantity` (584–609), `cartTotal`/`cartItemCount` (611–617), `generateWhatsAppCheckoutLink` (619–632), drawer (672–762), botón flotante (764–789) y render `<ProductCard ... addToCart ... formatPrice>` (939–946). El `Navbar` se monta dentro de `MaryKayStore` (línea 791).
- `AuthContext.jsx` tiene `syncCart` (104–137) leyendo la clave muerta `'cart'`, exportado en el value (153) y documentado en el JSDoc (15). `AccountPage` lo importa sin usarlo (línea 13).
- `supabase/migrations/20261002140000_spec_008_users_calendar.sql` ya creó `cart_items` con RLS self, `updated_at` + trigger e índice en `user_id`; **no se toca**.
- `public.set_updated_at()` e `is_admin()` ya existen (`20261002120000_create_products_table.sql`).
- El catálogo de respaldo tiene ids numéricos 1..31; los de Supabase son UUID (`mapProduct`, líneas 438–448).
- Los docs legales ya mencionan `imchic_cart` (`src/components/legal/CookiesContent.jsx`), así que se unifica en esa clave.

## 2. Decisiones Técnicas

| # | Decisión | Justificación |
|---|----------|---------------|
| D1 | **Carrito en `CartContext` global** con items completos en memoria y persistencia `localStorage` ↔ `cart_items`. | Un solo origen de verdad para Navbar, drawer global, `/tienda` y `/cuenta`; elimina estado duplicado. |
| D2 | **`CartProvider` y `FavoritesProvider` dentro de `AuthProvider`** y `CartDrawer` montado una vez en `main.jsx`. | Ambos contextos dependen de `useAuth()` (sesión); el drawer debe existir en todas las rutas. |
| D3 | **Favoritos en `FavoritesContext` separado** (no dentro de `CartContext`). | Responsabilidades y tablas distintas; evita re-render del carrito al togglear un corazón. Mantiene `isFavorite` fuera del carrito (el usuario lo dejó como "pueden ir aparte"). |
| D4 | **Clave única `imchic_cart`** con migración transparente desde `'cart'`. | Coincide con lo ya publicado en legales; no rompe carritos existentes de usuarios previos. |
| D5 | **Sincronización solo de ids UUID**; los ítems numéricos quedan local-only. | `cart_items.product_id` es `uuid`; insertar un número falla. Se documenta como limitación. |
| D6 | **`favorites` requiere sesión**; invitado ve aviso inline (`role="status"`) + link a `/login`. | Evita tabla sin dueño y decisiones de fusión de favoritos; UX clara sin romper. |
| D7 | **Orden se registra antes de abrir WhatsApp** para logueados; invitado solo abre WhatsApp. | Cumple el requisito de historial; el fallo de inserción no bloquea la apertura (degradación). |
| D8 | **No vaciar el carrito automáticamente**; botón "Vaciar carrito". | Evita perder el pedido si el WhatsApp no se concreta; decisión del usuario. |
| D9 | **`order_items.product_id` nullable + snapshot `product_name`/`unit_price`.** | El historial no debe mutar si el producto cambia/elimina, y admite ítems no-UUID. |
| D10 | **RLS con `(select auth.uid())`** y subconsulta en `order_items`. | Buenas prácticas Supabase/Postgres (evita evaluación por fila); toda RLS nueva se indexa. |
| D11 | **Degradación grácil**: todo query a tablas nuevas captura error y expone `unavailable`/`syncError`. | La migración se aplica manualmente; el front debe funcionar antes. |
| D12 | **Tabs de `/cuenta` con `role=tablist/tab/tabpanel` + navegación por flechas/Home/End.** | Accesibilidad WCAG; mobile-first con `overflow-x-auto` y snap. |
| D13 | **Sin nuevo campo de esquema en `cart_items`.** | Ya existe con RLS y trigger; se reutiliza tal cual. |
| D14 | **`src/lib/format.js`** con `formatPrice` (es-AR) y `isUuid`. | Evita duplicar formateo/validación entre store, drawer y tabs. |

## 3. Enfoque por Archivo

### 3.1 `supabase/migrations/20261003120000_spec_010_favorites_orders.sql` (nuevo)

- Cabecera con instrucciones: `supabase db push` **o** SQL Editor (aplicación manual), y nota de que el MCP no puede aplicarla.
- `create table if not exists` de `favorites`, `orders`, `order_items` con FKs y checks (ver spec §5).
- Índices FK: `favorites(user_id)`, `favorites(product_id)`, `orders(user_id, created_at desc)`, `order_items(order_id)`, `order_items(product_id)`.
- Trigger `orders_set_updated_at` → `public.set_updated_at()`.
- RLS enable + policies self con `(select auth.uid())`; grants mínimos a `authenticated`.
- `comment on table/column` para documentación.
- Idempotencia: `if not exists` / `drop trigger if exists` / `drop policy if exists` antes de crear.
- **No** se modifica `cart_items`.

### 3.2 `src/lib/format.js` (nuevo)

- `formatPrice(value)` (movido desde `MaryKayStore`), `isUuid(value)` (`/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`), `formatDateEs(value)` para Mis Compras.

### 3.3 `src/context/CartContext.jsx` (nuevo)

- `CartProvider` + `useCart`.
- Estado: `items`, `loading`, `isOpen`, `syncError`, `isSyncing`; derivados `itemCount`, `total` (`useMemo`).
- `addToCart` (suma 1 y `openCart`), `removeFromCart`, `updateQuantity(id, delta)` (mínimo 1), `setQuantity(id, qty)`, `clearCart`, `openCart`, `closeCart`.
- Persistencia:
  - `useEffect` de arranque: hidrata desde `imchic_cart` (migrando `'cart'` una vez).
  - `useEffect` que observa `user?.id` + `loading` de `useAuth`: si hay sesión → `mergeWithSupabase()`; si pasa a null (logout) → exporta a `imchic_cart`.
  - `mergeWithSupabase()`: lee `cart_items` (con `products(*)` para reconstruir el ítem), suma cantidades con el carrito local para ids UUID, upsert por `(user_id, product_id)`, limpia de local los UUID persistidos. Guard con `useRef` por `user.id`.
  - `persistItem`/`removeItem`/`clearItems`: operaciones a `cart_items` con UI optimista y rollback ante error.
  - Helper `runSafely(promise)` que detecta errores de tabla inexistente (códigos `42P01`/`PGRST205`) y setea `syncError` sin lanzar.
- `CartProvider` no debe crashear si no hay `AuthProvider` (usar `useAuth` con try/catch o asumir contrato documentado; `main.jsx` garantiza el orden).

### 3.4 `src/context/FavoritesContext.jsx` (nuevo)

- `FavoritesProvider` + `useFavorites` con `{ favorites, isFavorite, toggleFavorite, loading, unavailable, error }`.
- Carga `favorites.select('product_id')` al haber sesión; `unavailable` si la tabla no existe.
- `toggleFavorite(product)`: si no hay usuario → no hace nada y setea `requiresAuth`/aviso (consumido por la card); si hay → insert/delete optimista con rollback.
- Reacciona a `user?.id`; limpia estado al logout.

### 3.5 `src/components/CartDrawer.jsx` (nuevo)

- Extrae el drawer de `MaryKayStore` (672–762) a componente global que consume `useCart()`.
- Maneja `isOpen`, `Escape`, backdrop, bloqueo de scroll, foco al cerrar (`AnimatePresence`/`motion`).
- CTA "Enviar Pedido por WhatsApp": botón async que (1) construye mensaje, (2) si hay sesión registra `orders` + `order_items` (snapshot), (3) abre `window.open(waLink, '_blank', 'noopener')`; estado "Registrando…"; error no bloqueante.
- Botón "Vaciar carrito" (secondary) cuando hay ítems.
- Muestra `syncError` como aviso `role="status"` no bloqueante.

### 3.6 `src/main.jsx` (modificado)

- Envolver: `<AuthProvider><CartProvider><FavoritesProvider><TurnoProvider>`.
- Renderizar `<CartDrawer />` una vez (junto a `<Routes>`), dentro de los providers.
- Mantener `ErrorBoundary`, `BrowserRouter` y todas las rutas.

### 3.7 `src/components/Navbar.jsx` (modificado)

- Importar `ShoppingCart` y `useCart`.
- Botón icono con wrapper `relative`, badge de `itemCount` (`absolute`, oculto si 0), `aria-label` dinámico, `min-w/min-h 44px`.
- Ubicarlo: en desktop antes de los botones auth (o al inicio del bloque derecho); en móvil como acción visible en la fila superior + una entrada en el menú desplegable. **No** tocar logo, links, barra de anuncios ni auth.
- `onClick={openCart}`.

### 3.8 `MaryKayStore.jsx` (modificado)

- Eliminar `cart`, `isCartOpen`, `addToCart`, `removeFromCart`, `updateQuantity`, `cartTotal`, `cartItemCount`, `generateWhatsAppCheckoutLink` y el JSX del drawer + backdrop.
- Usar `const { addToCart, openCart, itemCount } = useCart();`.
- Importar `formatPrice` desde `src/lib/format.js` (quitar la definición local) y `Heart` de `lucide-react`; quitar imports que queden sin uso (`ShoppingBag`, `Trash2`, `Plus`, `Minus` si ya no se usan).
- Botón flotante de `/tienda` (opcional, se mantiene): conectado a `openCart` y `itemCount`.
- `ProductCard`: nuevas props `isFavorite`, `onToggleFavorite`; botón corazón (`aria-pressed`, `aria-label`, ≥44px) sobre la imagen; si no hay sesión, el handler muestra aviso inline con link a `/login`.
- Pasar a `ProductCard` los valores de `useFavorites` en el render (939–946).

### 3.9 `src/pages/AccountPage.jsx` (modificado)

- Quitar `syncCart` del destructuring de `useAuth`.
- Conservar encabezado, "Cerrar sesión" y el formulario de perfil íntegro.
- Agregar tablist accesible con 4 tabs y sus paneles:
  - **Mi Perfil**: formulario actual.
  - **Mi Carrito**: `CartPanel` (nuevo, `src/components/account/CartPanel.jsx`) que consume `useCart` (lista, +/-/eliminar, total, CTA WhatsApp, vaciar).
  - **Favoritos**: `FavoritesPanel` (nuevo, `src/components/account/FavoritesPanel.jsx`) con join `favorites → products`, "Agregar al carrito" y "Quitar".
  - **Mis Compras**: `OrdersPanel` (nuevo, `src/components/account/OrdersPanel.jsx`) con `orders.select('*, order_items(*)')`.
- Mantener "Mis Turnos"/"Mis Cursos" como sección persistente fuera de los tabs (siempre visible) o dentro de "Mi Perfil"; se decide **fuera/encima** para no perderlos al cambiar de pestaña.
- Navegación teclado: `onKeyDown` en tabs (`ArrowLeft/Right/Home/End`), `tabIndex` roving, `aria-controls`/`aria-labelledby`; opcional `?tab=`/hash para deep-link.

### 3.10 `src/context/AuthContext.jsx` (modificado)

- Eliminar `syncCart` (104–137), su entrada del value (153) y la mención del JSDoc (15). Nada más cambia.

## 4. Orden de Implementación

```
T1 (migración) ─┬─> T9 (registro de compra) ─> T13 (Mis Compras)
                └─> T3 (FavoritesContext) ───> T8 (corazón) ─> T12 (Favoritos)
T2 (CartContext + lib) ─> T4 (CartDrawer) ─> T5 (main.jsx) ─> T6 (Navbar)
                       └─> T7 (MaryKayStore) ─> T11 (Mi Carrito)
T10 (tabs shell) depende de T2/T3/T9
T14 (limpieza AuthContext) paralela
T15 (build + verificación + MEMORY.md) cierra
```

## 5. Estrategia de Verificación

1. **Compilación:** `npm run build` sin errores ni warnings nuevos (gate final).
2. **Degradación sin tablas (pre-migración):** con el proyecto real sin `favorites`/`orders`/`order_items`, navegar `/cuenta` y `/tienda`: no debe crashear; deben verse avisos `role="status"` y el carrito debe seguir operando en `localStorage`.
3. **Invitado:** agregar/quitar/cambiar cantidades → recargar → persiste desde `imchic_cart`; abrir drawer desde Navbar en varias rutas; verificar badge, `Escape`, scroll bloqueado y foco.
4. **Login/merge:** con ítems locales UUID y filas previas en `cart_items`, iniciar sesión → verificar suma de cantidades y ausencia de duplicados (`unique(user_id, product_id)`), y que los ítems numéricos sigan visibles.
5. **Logout:** cerrar sesión → el carrito sigue disponible (`imchic_cart`).
6. **Favoritos:** logueado togglear corazón (persistencia y `aria-pressed`); invitado toca corazón → aviso + link a `/login`; pestaña Favoritos agrega/quita.
7. **Compras:** logueado enviar pedido → fila en `orders` + `order_items` con snapshot y `status='enviado_whatsapp'` antes de abrir WhatsApp; carrito intacto; invitado no registra. Pestaña "Mis Compras" muestra fecha es-AR, estado, ítems y total.
8. **Tabs:** clic + `ArrowLeft/ArrowRight/Home/End`; `aria-selected` correcto; un solo panel visible; perfil y accesos intactos.
9. **Accesibilidad/visual:** viewport 360–390px y ≥1024px; touch targets ≥44px; contraste AA; un `<h1>` por página.
10. **Limpiar control:** `grep -rn "syncCart" src/` → 0 resultados; `grep -n "cart\b" MaryKayStore.jsx` confirma que ya no hay carrito local.
11. **Migración:** tras aplicarla manualmente (SQL Editor / `supabase db push`), repetir pasos 4/6/7 con `VITE_SUPABASE_ANON_KEY` y navegador distinto; probar RLS con dos usuarios (uno no debe ver `orders`/`order_items`/`favorites` ajenos).

## 6. Riesgos y Mitigaciones (resumen)

- Sin migración aplicada → degradación grácil + avisos (R1). 
- Ids numéricos no persistibles → filtrado UUID, local-only (R2). 
- RLS en `order_items` → subconsulta indexada + prueba multi-usuario (R3). 
- Doble sync en StrictMode → ref por `user.id` + idempotencia (R4/R5). 
- Ancho Navbar móvil → icono compacto y validación 360–390px (R6). 
- Registro de orden demora WhatsApp → `try/catch` abre igual (R7).

## 7. Referencias

- Spec: `specs/010_carrito_persistente_favoritos_compras/spec.md`
- Tareas: `specs/010_carrito_persistente_favoritos_compras/tasks.md`
- Constitución: `docs/constitution.md` · Memoria: `MEMORY.md`
- Migración previa: `supabase/migrations/20261002140000_spec_008_users_calendar.sql`
- Helpers SQL: `supabase/migrations/20261002120000_create_products_table.sql`
- Contextos: `src/context/AuthContext.jsx`, `src/context/TurnoContext.jsx`
- Tienda: `MaryKayStore.jsx`, `src/components/Navbar.jsx`, `src/pages/AccountPage.jsx`
