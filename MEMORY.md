## Estado actual
SDD activo: AGENTS.md, docs/constitution.md (5 principios), specs/ y MEMORY.md. MCP Chrome DevTools + skill "frontend-design".
Dominio canónico: https://im-chic-by-mel-web.pages.dev/
Home (/) = HomeServices.jsx con su diseño alternado original + arreglos (ErrorBoundary, H1, 44px, contraste).
Pestaña Servicios (/servicios, /inversion) = InversionPage.jsx con 3 categorías + botón "Agendar turno" c/u.
Specs 001–007 implementadas: 001 global/accesibilidad, 002 Navbar + TurnoModal centralizado, 003 buscador tienda, 004 heading-order tienda, 005 SEO/agentic, 006 inscripción por WhatsApp en /cursos, 007 Panel de Administración.
/cursos: botón "Quiero Inscribirme Ahora" abre WhatsApp con curso + valor (Masterclass $65.000 / Formación Integral $130.000 por mes).
TurnoModal: selector "Servicio a Realizar" con 10 opciones (solo Uñas, Cabello, Maquillaje).
Navbar: solo CTA "Agenda tu turno". Footer: WhatsApp + Instagram en 5 rutas.
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
