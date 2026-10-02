# Spec 007 — Panel de Administración

- **ID:** 007
- **Estado:** Aprobada con observaciones (aplicadas el 2026-10-02) — pendiente de plan
- **Fecha:** 2026-10-02
- **Rutas afectadas:** `/admin` (nueva), `/login` (nueva) + integración con Supabase
- **Constitución de referencia:** `docs/constitution.md`

## 1. Objetivo

Crear un Panel de Administración privado para que la dueña de "Im Chic by Mel" pueda
gestionar los productos de la tienda sin tocar código: subir productos con foto,
título, precio y descripción, y controlar el stock en tiempo real.

## 2. Alcance

### RF-1 — Acceso seguro (EARS: SI ... ENTONCES ...)

SI el usuario no está autenticado como administrador, ENTONCES EL SISTEMA bloqueará
el acceso a la ruta del panel y lo redirigirá al inicio (`/`).

- Autenticación con **Supabase Auth estándar: email + contraseña** (decidido).
- Solo una cuenta (o un listado cerrado de cuentas) tendrá rol de admin.
- No debe haber forma de acceder al panel ni a las funciones de escritura desde la URL
  directa ni desde la consola del navegador (RLS activado en Supabase, ver RF-1b).
- Ruta del panel: **`/admin`** (decidido).

### RF-1a — UI de login (EARS: CUANDO ... ENTONCES ...)

CUANDO el administrador ingrese sus credenciales (email + contraseña) en la ruta de
login, EL SISTEMA autenticará contra Supabase Auth y lo redirigirá a `/admin`.

- Ruta de login: **`/login`** (decidido).
- Formulario con email y contraseña, botón de envío ≥ 44px, mensajes de error claros
  ante credenciales inválidas.
- Al autenticarse con éxito, el administrador accede a `/admin` sin fricción.

### RF-1b — Políticas RLS (detalle)

- Tabla de productos: solo el rol/claim de **administrador** puede `INSERT`, `UPDATE`
  y `DELETE`. La **lectura pública queda permitida para todos** (`SELECT` abierto),
  para que `/tienda` funcione sin sesión.
- Bucket de Storage de fotos: solo el rol/claim de administrador puede subir,
  actualizar o borrar objetos; la lectura pública queda permitida para todos.
- Ninguna política permite escritura a usuarios anónimos o autenticados no-admin.

### RF-2 — Subida de productos (EARS: CUANDO ... ENTONCES ...)

CUANDO el dueño complete el formulario de nuevo producto (foto, título, precio,
descripción), EL SISTEMA lo guardará en la base de datos de Supabase.

- Campos obligatorios: foto, título, precio, descripción.
- La foto se almacena en **Supabase Storage público, subida directa sin compresión
  previa** (decidido), y se guarda su URL pública asociada al producto.
- **Validación de Storage:** tamaño máximo **≤ 2 MB**; tipos MIME permitidos
  **image/jpeg, image/png, image/webp**; convención de nombres `productos/{timestamp}-{slug-titulo}.{ext}`.
  Archivos que no cumplan se rechazan con mensaje de error inline antes de subir.
- Validar precio como número positivo antes de guardar; mostrar errores de validación
  inline en el formulario.
- **Stock inicial de un producto nuevo: 0** (decidido).
- Al guardar con éxito, el producto aparece inmediatamente en la lista del panel y
  **se publica directamente, visible en `/tienda`** (decidido).

### RF-3 — Control de inventario (EARS: MIENTRAS ... EL SISTEMA ...)

MIENTRAS el administrador esté en el panel, EL SISTEMA le permitirá sumar o restar
el stock disponible de cada producto en tiempo real.

- Botones `+` y `−` por producto, con el stock actualizado en la UI de inmediato.
- El stock nunca debe quedar negativo: con **stock en 0, el botón `−` queda
  deshabilitado** (decidido).
- Los cambios se persisten en Supabase sin recargar la página.

## 3. Restricciones / Constitución

1. **Mobile-First:** el panel se usa probablemente desde el celular; todos los controles
   táctiles ≥ 44px y layout apilado en móvil.
2. **Estabilidad estructural:** no modificar Navbar, TurnoModal ni páginas públicas
   existentes salvo integración mínima necesaria (p. ej. link oculto al panel).
3. **Estética de marca:** solo clases utilitarias de Tailwind CDN, paleta y tipografía de la marca.
4. **Validación visual:** ninguna funcionalidad se da por terminada sin probarla en
   navegador (flujo login → subir producto → ajustar stock).
5. **SDD:** este spec es la fuente de verdad; cualquier cambio de alcance requiere
   actualizarlo antes de implementar.

## 4. Criterios de aceptación

- [ ] CA-1: Un visitante sin sesión que entra a `/admin` es redirigido a `/`.
- [ ] CA-2: Con sesión de admin, el panel muestra la lista de productos.
- [ ] CA-3: Completar el formulario con foto, título, precio y descripción guarda el
      producto en Supabase, lo lista en el panel **y aparece visible en `/tienda`**.
- [ ] CA-4: Los botones `+`/`−` actualizan el stock en la UI y en Supabase sin recarga;
      el stock no puede ser negativo y el botón `−` está deshabilitado en stock 0.
- [ ] CA-5: `npm run build` OK y sin errores de consola.
- [ ] CA-6: Interfaz usable en móvil (mobile-first) y consistente con la marca.

## 5. Fuera de alcance

- Roles múltiples de usuarios / panel multiusuario.
- Edición completa y borrado de productos (puede añadirse en spec posterior).
- Pasarela de pagos o gestión de pedidos.
- Migración de Tailwind CDN a build.
- Compresión/resize de imágenes en cliente.

## 6. Decisiones (2026-10-02)

1. **Auth:** Supabase Auth estándar con **email + contraseña**. ✅
2. **Ruta panel:** **`/admin`**; **ruta login:** `/login`. ✅
3. **Fotos:** **Supabase Storage público, subida directa sin compresión**, con
   validación ≤ 2 MB y MIME jpg/png/webp. ✅
4. **Visibilidad:** productos nuevos se **publican directo y visibles en `/tienda`**. ✅
5. **Stock inicial:** 0; boton `−` deshabilitado en stock 0. ✅

Veredicto QA: "Aprobada con observaciones" — observaciones 1–5 aplicadas.
Lista para fase de plan (`plan.md`).
