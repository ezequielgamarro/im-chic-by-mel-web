# Tasks 007 — Panel de Administración

> Cada tarea: pequeña, verificable y secuencial. **En todas aplica: NO romper Navbar,
> TurnoModal ni páginas públicas existentes** (constitución: estabilidad estructural).
> Toda tarea termina con verificación local (dev server + build).

---

## T1 — Setup de cliente Supabase y variables de entorno
- **Objetivo:** instalar `@supabase/supabase-js` y crear el cliente centralizado.
- **Archivos/áreas:** `package.json`, `src/lib/supabase.js` (nuevo), `.env` (nuevo, en `.gitignore`).
- **Aceptación:** `src/lib/supabase.js` exporta el cliente leyendo `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`; dev server levanta sin errores.
- **No romper:** no modificar rutas ni componentes existentes.

## T2 — Esquema de base de datos y RLS
- **Objetivo:** crear tabla `products` (`id`, `title`, `price`, `description`, `image_url`, `stock` default 0, `created_at`) y políticas RLS.
- **Archivos/áreas:** Supabase (SQL/dashboard); documentación en `specs/007_admin_panel/plan.md`.
- **Aceptación:** `SELECT` público permitido; `INSERT/UPDATE/DELETE` solo con claim admin; usuarios anónimos no pueden escribir.
- **No romper:** no tocar código del front todavía.

## T3 — Bucket de Storage y políticas
- **Objetivo:** crear bucket público `productos` con escritura solo admin.
- **Archivos/áreas:** Supabase Storage.
- **Aceptación:** lectura pública OK; upload desde cuenta sin claim admin es rechazado.
- **No romper:** solo configuración de Supabase.

## T4 — AuthContext (sesión + isAdmin)
- **Objetivo:** contexto global de autenticación que escucha `onAuthStateChange`.
- **Archivos/áreas:** `src/context/AuthContext.jsx` (nuevo), `src/main.jsx` (envolver providers, sin cambiar rutas).
- **Aceptación:** `useAuth()` expone `session`, `isAdmin`, `signIn`, `signOut`; sesión persiste al recargar.
- **No romper:** Navbar y TurnoModal siguen funcionando igual.

## T5 — ProtectedRoute + ruta /admin placeholder
- **Objetivo:** proteger `/admin`: sin sesión de admin redirige a `/`.
- **Archivos/áreas:** `src/components/ProtectedRoute.jsx` (nuevo), `src/pages/AdminPage.jsx` (nuevo, placeholder), `src/main.jsx` (agregar ruta).
- **Aceptación:** visitante anónimo en `/admin` termina en `/`; con sesión admin ve el placeholder.
- **No romper:** rutas existentes sin cambios.

## T6 — Página de login /login
- **Objetivo:** formulario email + contraseña que autentica contra Supabase Auth.
- **Archivos/áreas:** `src/pages/LoginPage.jsx` (nuevo), ruta en `src/main.jsx`.
- **Aceptación:** login correcto redirige a `/admin`; credenciales inválidas muestran error inline; botón ≥ 44px; estilo de marca con Tailwind.
- **No romper:** no tocar componentes protegidos.

## T7 — Layout del panel y listado de productos
- **Objetivo:** AdminPage muestra la lista de productos desde Supabase (SELECT público con sesión admin).
- **Archivos/áreas:** `src/pages/AdminPage.jsx`, posible `src/components/admin/ProductList.jsx` (nuevo).
- **Aceptación:** lista título/precio/stock/imagen miniatura; estados loading y vacío; mobile-first.
- **No romper:** solo archivos nuevos.

## T8 — ProductForm con validaciones y subida a Storage
- **Objetivo:** formulario de nuevo producto con validación de campos y de imagen.
- **Archivos/áreas:** `src/components/admin/ProductForm.jsx` (nuevo), integrado en AdminPage.
- **Aceptación:** campos obligatorios validados inline; imagen rechazada si > 2 MB o MIME no permitido (jpg/png/webp); nombre `productos/{timestamp}-{slug}.{ext}`; al guardar, INSERT con `stock = 0` y aparece en la lista.
- **No romper:** no tocar nada fuera de archivos nuevos y AdminPage.

## T9 — Stock en tiempo real (+/−)
- **Objetivo:** controles de stock por producto con persistencia inmediata.
- **Archivos/áreas:** `src/components/admin/StockControls.jsx` (nuevo), AdminPage.
- **Aceptación:** `+` suma, `−` resta; UI se actualiza sin recarga y queda persistido en Supabase; con stock 0 el botón `−` está deshabilitado; nunca negativo.
- **No romper:** solo archivos nuevos e integración en AdminPage.

## T10 — Integrar /tienda con Supabase
- **Objetivo:** MaryKayStore lee productos desde Supabase en lugar de datos estáticos.
- **Archivos/áreas:** `MaryKayStore.jsx` (cambio mínimo en la carga de datos).
- **Aceptación:** producto creado en el panel aparece visible en `/tienda` sin redeploy; estado de carga y vacío manejados.
- **No romper:** no cambiar layout/estilos de la tienda; verificar Navbar/footer/carrusel.

## T11 — Regresión visual y build final
- **Objetivo:** validar el flujo completo y la constitución.
- **Archivos/áreas:** ninguna (solo verificación).
- **Aceptación:** flujo login → subir producto → ajustar stock → editar → eliminar funciona en móvil; Navbar/TurnoModal/Footer/páginas públicas intactas; `npm run build` OK; sin errores de consola.
- **No romper:** si algo se rompió, revertir la tarea responsable antes de cerrar.

## T12 — Editar producto
- **Objetivo:** permitir editar un producto existente desde el panel (precargar ProductForm y persistir cambios).
- **Archivos/áreas:** `src/components/admin/ProductForm.jsx` (modo edición con precarga), `src/pages/AdminPage.jsx`.
- **Aceptación:** al seleccionar "Editar", el formulario se precarga con título, precio, descripción e imagen actuales; al guardar, la fila se actualiza en Supabase; si se reemplaza la imagen, se sube a Storage con las validaciones de T8 y se actualiza `image_url`; la lista del panel refleja el cambio.
- **No romper:** no alterar el modo "nuevo producto" ni el layout existente.

## T13 — Eliminar producto
- **Objetivo:** borrar un producto desde el panel con confirmación explícita.
- **Archivos/áreas:** `src/pages/AdminPage.jsx`, posible `src/components/admin/ProductList.jsx` (botón Eliminar).
- **Aceptación:** botón "Eliminar" por producto con confirmación antes de ejecutar; al confirmar, se borra la fila en la tabla `products` y, si aplica, la imagen correspondiente en Storage; el producto desaparece de la lista del panel y de `/tienda`; `npm run build` OK y sin errores de consola.
- **No romper:** no afectar el control de stock ni la subida de productos; re-verificar regresión de T11 al cierre.
