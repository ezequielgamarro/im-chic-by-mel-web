# Plan 007 — Panel de Administración

- **Spec origen:** `specs/007_admin_panel/spec.md` (aprobada con observaciones, aplicadas 2026-10-02)
- **Fecha:** 2026-10-02
- **Estado:** En planificación

## 1. Alcance

Implementar un panel de administración protegido en `/admin`, con login en `/login`,
subida de productos (foto/título/precio/descripción) a Supabase y control de stock en
tiempo real. Los productos nuevos se publican directamente y se ven en `/tienda`.

Fuera de alcance (ver spec §5): edición/borrado, pagos, compresión de imágenes, migración de Tailwind CDN.

## 2. Decisiones técnicas

### 2.1 Auth
- Supabase Auth estándar con email + contraseña.
- Cliente `@supabase/supabase-js` centralizado en `src/lib/supabase.js` (nueva), leyendo
  `import.meta.env.VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (archivo `.env` local
  + variables en el hosting; `.env` en `.gitignore`).
- `AuthContext` (nuevo, `src/context/AuthContext.jsx`) que expone `session`, `isAdmin`,
  `signIn`, `signOut`. `isAdmin` se deriva del claim/role del usuario (app_metadata.role === 'admin'
  o tabla `admins`); la validación final la impone la RLS, no el cliente.
- `ProtectedRoute` (nuevo componente): rutas `/admin` solo con sesión de admin; si no,
  redirige a `/` (RF-1).

### 2.2 RLS
- Tabla `products`: `SELECT` público (rol `anon` y `authenticated`); `INSERT/UPDATE/DELETE`
  solo para usuarios con claim admin.
- Bucket Storage `productos`: lectura pública; escritura solo admin.
- Las políticas se aplican desde el dashboard de Supabase / SQL, antes de conectar el front.

### 2.2.1 Esquema y RLS implementados (T2) — SQL reproducible
- Migración en `supabase/migrations/20261002120000_create_products_table.sql`.
- Tabla `public.products`: `id` (uuid PK), `title`, `price` (`numeric(10,2)` > 0),
  `description`, `image_url`, `stock` (`integer` default 0, >= 0), `created_at`,
  `updated_at` (timestamptz). Índice en `created_at desc` y trigger de `updated_at`.
- Helper `public.is_admin()` lee `app_metadata.role = 'admin'` del JWT (security invoker,
  search_path vacío).
- Políticas RLS: `products_public_select` (SELECT a `anon`+`authenticated`),
  `products_admin_insert/update/delete` (solo `authenticated` con `is_admin()`).
- Aplicación: `supabase db push` o pegar el SQL en el SQL Editor del dashboard.
- Otorgar claim admin (una sola vez):
  `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb where email = 'imchicbymel@gmail.com';`

### 2.3 Storage
- Bucket público `productos`.
- Validación en cliente antes de subir: ≤ 2 MB; MIME `image/jpeg`, `image/png`, `image/webp`;
  nombre `productos/{timestamp}-{slug-titulo}.{ext}`. Rechazo con error inline.

### 2.4 Estructura de rutas y componentes
- React Router ya presente; se agregan rutas en `src/main.jsx` **sin alterar las rutas existentes**:
  - `/login` → `src/pages/LoginPage.jsx`
  - `/admin` → `src/pages/AdminPage.jsx` (envuelta en `ProtectedRoute`)
- Componentes nuevos (solo archivos nuevos; no modificar Navbar/TurnoModal/páginas públicas salvo lectura):
  - `src/components/ProtectedRoute.jsx`
  - `src/components/admin/ProductForm.jsx` (validación de formulario + upload)
  - `src/components/admin/StockControls.jsx` (`+`/`−`, `−` deshabilitado en 0)
- `MaryKayStore.jsx` (`/tienda`) pasa a leer productos desde Supabase (SELECT público),
  con fallback a estado vacío/loading; cambio mínimo y aislado.

### 2.5 Datos
- Tabla `products`: `id`, `title`, `price`, `description`, `image_url`, `stock` (default 0),
  `created_at`. Stock inicial 0 (spec); los cambios de stock son `UPDATE` puntual.

## 3. Orden de implementación

1. Setup Supabase: cliente, env, tabla `products`, bucket, políticas RLS.
2. AuthContext + ProtectedRoute + ruta `/login` (login real contra Supabase).
3. Ruta `/admin` protegida con layout básico (lista de productos).
4. ProductForm: validaciones de campos + validación de Storage + subida + INSERT (stock 0).
5. StockControls en la lista: `+`/`−` en tiempo real, `−` deshabilitado en 0.
6. Integrar `/tienda` (MaryKayStore) con lectura desde Supabase.
7. Validación visual en navegador (mobile-first) + build sin errores.

## 4. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Exponer service key en el front | Solo `anon key` en el cliente; RLS cierra la escritura a no-admin |
| Romper componentes protegidos (Navbar/TurnoModal) | Tocar solo archivos nuevos + `main.jsx`/`MaryKayStore.jsx` de forma mínima; verificar build y navegación tras cada tarea |
| Imágenes grandes/tipos inválidos | Validación de tamaño y MIME en ProductForm antes del upload |
| Stock negativo o inconsistente | `−` deshabilitado en 0; UPDATE puntual sin recarga; RLS valida rol |
| Sesión expirada a mitad de uso | AuthContext escucha `onAuthStateChange` y redirige a `/login` |

## 5. Definition of Done

- [ ] `/login` autentica email+contraseña contra Supabase y redirige a `/admin`; credenciales inválidas muestran error inline.
- [ ] Sin sesión de admin, `/admin` redirige a `/`.
- [ ] RLS activo: escritura solo admin en `products` y bucket Storage; lectura pública OK.
- [ ] Subir producto (foto ≤2MB jpg/png/webp, título, precio, descripción) lo guarda con `stock = 0` y aparece en el panel y en `/tienda` sin redeploy.
- [ ] `+`/`−` actualiza stock en UI y Supabase sin recarga; `−` deshabilitado en 0; nunca negativo.
- [ ] Navbar, TurnoModal y páginas públicas funcionan igual que antes (regresión visual OK).
- [ ] `npm run build` OK y sin errores de consola.
