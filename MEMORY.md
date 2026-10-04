## Estado actual
SDD activo: AGENTS.md, docs/constitution.md (5 principios), specs/ y MEMORY.md. MCP Chrome DevTools + skill "frontend-design".
Dominio canónico: https://im-chic-by-mel-web.pages.dev/
Home (/) = HomeServices.jsx con su diseño alternado original + arreglos (ErrorBoundary, H1, 44px, contraste).
Pestaña Servicios (/servicios, /inversion) = InversionPage.jsx con 3 categorías + botón "Agendar turno" c/u.
Specs 001–007 implementadas: 001 global/accesibilidad, 002 Navbar + TurnoModal centralizado, 003 buscador tienda, 004 heading-order tienda, 005 SEO/agentic, 006 inscripción por WhatsApp en /cursos, 007 Panel de Administración.
/cursos: botón "Quiero Inscribirme Ahora" abre WhatsApp con curso + valor (Masterclass $65.000 / Formación Integral $130.000 por mes).
TurnoModal: selector "Servicio a Realizar" con 10 opciones (solo Uñas, Cabello, Maquillaje).
Navbar: logo, links, barra de anuncios y botones auth (Ingresar/Panel Admin/perfil/Salir). Footer: WhatsApp + Instagram en 5 rutas.
SEO: public/robots.txt, public/sitemap.xml y public/llms.txt. Validado: build OK; Lighthouse móvil 100/100/100/100 en /; Accessibility 100 en /servicios y /tienda.

## Spec 007 — Panel de Administración (IMPLEMENTADA, T1–T11 + catálogo migrado)
Supabase REAL y ACTIVO: ref nxviapvgzfdzzyctzokh (la 'z' extra había sido typo). .env con VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY; service_role y PAT solo en uso puntual (no en disco/git).
Tabla public.products: 31 productos migrados (title/price/description/category/badge/stock/image_url); RLS lectura pública, escritura solo admin vía is_admin() leyendo app_metadata.role.
Admin: imchicbymel@gmail.com, role=admin; /login → /admin (ProtectedRoute).
Storage bucket `productos` (público, 2MB, jpg/png/webp) con políticas write solo-admin. Docs corregidos: bucket `productos`, no `products`.
/tienda (MaryKayStore.jsx) lee de Supabase; fallback a catálogo hardcodeado si vacío/error; buscador (spec 003) mantenido.
Front (src/): AuthContext (useAuth), ProtectedRoute, LoginPage, AdminPage con ProductList/ProductCard/ProductForm/StockControls; migración en supabase/migrations/.
Notas: precio es-AR (Intl.NumberFormat); stock UPDATE optimista con rollback (T9); docs M2 corregido.
Hallazgos menores opcionales: L4 imagen huérfana, L5 RPC atómico, L6 feedback no-admin. Sin pendientes críticos; lista para deploy.
T13 (2026-10-02): botón "Eliminar" en ProductCard con confirmación (window.confirm), delete de fila + remove de Storage (ruta extraída de /object/public/productos/), estado "Eliminando…" y error con role=alert; lista se refresca con fetchProducts. Build OK.
T14+T15 (2026-10-02): ProductForm con <select> de categoría (Cuidado de la Piel, Maquillaje, Labios, Accesorios, Productos; default "Productos"; precarga en edición) e INSERT/UPDATE con `category`; ProductCard muestra badge de categoría. /admin rediseñada (AdminPage): secciones Crear producto / Mi catálogo (Productos), header con Cerrar sesión, estados loading/error/vacío/edición preservados, móvil-first, AA. Build OK.

## Spec 009 — Ajustes UI Navbar/Login/Perfil (IMPLEMENTADA, 2026-10-03)
CTA "Agenda tu turno" eliminado de la Navbar (desktop y móvil) con limpieza de `handleOpenTurno`/`useTurno`/`Calendar`; flujo de turnos intacto (HomeServices/InversionPage + TurnoProvider). /login más compacto conservando 44px, labels y un solo h1. /cuenta sin campo "URL de avatar" y con label único `avatar-file` + sr-only. Build OK.

## Spec 010 — Carrito global persistente, Favoritos y Mis Compras (IMPLEMENTADA, 2026-10-03)
Carrito global `CartContext`+`useCart` con `CartDrawer` único en main.jsx, botón+badge en Navbar y pestañas en /cuenta (Mi Perfil/Mi Carrito/Favoritos/Mis Compras, tablist accesible). Invitado persiste en `imchic_cart`; logueado usa `public.cart_items` (upsert onConflict user_id,product_id) con marcador `imchic_cart_owner` y detección de espejo: al login no duplica UUID ya en remoto (los ausentes se seedean) y suma solo si es carrito de invitado genuino; el carrito completo queda en localStorage (no se recorta) → no hay doble conteo en login→logout→login ni en recarga, ni pérdida si falla el merge. Solo ids UUID a Supabase (ids numéricos del respaldo local-only). Favoritos requieren sesión (`favorites`, aviso role="status"+link a /login); checkout registra `orders`+`order_items` (snapshot) antes de abrir wa.me y NO vacía el carrito. Degradación grácil (`42P01`/`PGRST205`) con avisos role="status". `syncCart` eliminado de AuthContext.
Migración `supabase/migrations/20261003120000_spec_010_favorites_orders.sql` **PENDIENTE de aplicación manual** (SQL Editor o `supabase db push`). Pendiente menor no bloqueante: botones auth del Navbar con `min-h-[34px]` (<44px).

## Decisiones arquitectónicas
- SDD obligatorio: leer docs/constitution.md y documentar spec + plan antes de tocar .jsx.
- El home (/) NO se rediseña; mantiene su layout alternado original.
- La pestaña Servicios vive en InversionPage.jsx (3 categorías exactas).
- TurnoModal único y global vía TurnoProvider/useTurno (src/context/TurnoContext.jsx).
- WhatsAppButton: tone ("whatsapp" verde | "brand" marca); open={false} = solo ícono + nombre al hover.
- WhatsApp/Instagram viven en el footer, no en el Navbar. ServiceCarousel centraliza el carrusel accesible.
- Archivos SEO estáticos en public/. Dominio canónico pages.dev.
- Componentes protegidos: Navbar y TurnoModal (no modificar sin spec). ErrorBoundary envuelve el árbol de rutas.
- MCP usa el esquema V2 de OpenCode (mcp.servers, type: local, command como array único).
