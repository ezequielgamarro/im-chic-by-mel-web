## Estado actual
SDD activo: AGENTS.md, docs/constitution.md (5 principios), specs/ y MEMORY.md. MCP Chrome DevTools + skill "frontend-design".
Dominio canónico: https://im-chic-by-mel-web.pages.dev/
Home (/) = HomeServices.jsx con diseño alternado original + arreglos (ErrorBoundary, H1, 44px, contraste). Pestaña Servicios (/servicios, /inversion) = InversionPage.jsx con 3 categorías + botón "Agendar turno" c/u.
Specs 001–007 implementadas: 001 global/accesibilidad, 002 Navbar + TurnoModal centralizado, 003 buscador tienda, 004 heading-order tienda, 005 SEO/agentic, 006 inscripción por WhatsApp en /cursos, 007 Panel de Administración.
/cursos: botón "Quiero Inscribirme Ahora" abre WhatsApp con curso + valor (Masterclass $65.000 / Formación Integral $130.000 por mes). TurnoModal: selector "Servicio a Realizar" con 10 opciones (solo Uñas, Cabello, Maquillaje).
Navbar: logo, links, barra de anuncios y botones auth (Ingresar/Panel Admin/perfil/Salir). Footer: WhatsApp + Instagram en 5 rutas.
SEO: public/robots.txt, public/sitemap.xml y public/llms.txt. Validado: build OK; Lighthouse móvil 100/100/100/100 en /; Accessibility 100 en /servicios y /tienda.

## Spec 007 — Panel de Administración (IMPLEMENTADA, T1–T11 + catálogo migrado)
Supabase REAL y ACTIVO: ref nxviapvgzfdzzyctzokh (la 'z' extra había sido typo). .env con VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY; service_role y PAT solo en uso puntual (no en disco/git).
Tabla public.products: 31 productos migrados; RLS lectura pública, escritura solo admin vía is_admin() (app_metadata.role). Admin: imchicbymel@gmail.com; /login → /admin (ProtectedRoute). Storage bucket `productos` (público, 2MB, jpg/png/webp) write solo-admin.
/tienda (MaryKayStore.jsx) lee de Supabase con fallback a catálogo hardcodeado; buscador (spec 003) mantenido. Front: AuthContext, ProtectedRoute, LoginPage, AdminPage con ProductList/ProductCard/ProductForm/StockControls. Precio es-AR; stock UPDATE optimista con rollback (T9).
T13–T15 (2026-10-02): botón "Eliminar" en ProductCard (delete fila + Storage, estado "Eliminando…", error role=alert); ProductForm con select de categoría; /admin rediseñada (header con Cerrar sesión, estados accesibles, móvil-first, AA). Build OK.

## Spec 009 — Ajustes UI Navbar/Login/Perfil (IMPLEMENTADA, 2026-10-03)
CTA "Agenda tu turno" eliminado de la Navbar (desktop y móvil) con limpieza de `handleOpenTurno`/`useTurno`/`Calendar`; flujo de turnos intacto (HomeServices/InversionPage + TurnoProvider). /login más compacto conservando 44px, labels y un solo h1. /cuenta sin campo "URL de avatar" y con label único `avatar-file` + sr-only. Build OK.

## Spec 010 — Carrito global persistente, Favoritos y Mis Compras (IMPLEMENTADA, 2026-10-03)
Carrito global `CartContext`+`useCart` con `CartDrawer` único en main.jsx, botón+badge en Navbar y pestañas en /cuenta (tablist accesible). Invitado persiste en `imchic_cart`; logueado usa `public.cart_items` (upsert onConflict) con marcador `imchic_cart_owner` y detección de espejo (al login no duplica UUIDs ya remotos; suma solo carrito de invitado genuino); localStorage completo sin recorte → sin doble conteo ni pérdida. Favoritos requieren sesión; checkout registra `orders`+`order_items` (snapshot) antes de abrir wa.me y NO vacía el carrito. Degradación grácil (`42P01`/`PGRST205`) con role="status". Migración `20261003120000_spec_010_favorites_orders.sql` **APLICADA** (ya aplicada en el proyecto real, verificado 2026-10-04: tablas favorites/orders/order_items existen con datos). Menor: botones auth Navbar `min-h-[34px]` (<44px).

## Spec 011 — Restyle de Login (IMPLEMENTADA, 2026-10-04)
LoginPage.jsx rediseñada: fondo bg-[#FFF0F3] + destellos rosa/dorado; tarjeta blanca rounded-3xl max-w-[22rem]; logo con onError→"IC" + h1 sr-only; inputs píldora 44px; botón degradado borgoña; keyframes bounce en `<style>` local + prefers-reduced-motion; links /reset-password y /registro. Lógica intacta (useAuth, isAdmin, GoogleButton). Sin dependencias nuevas. Build OK.

## Spec 012 — Botón-logo "volver al inicio" en /admin (IMPLEMENTADA, 2026-10-04)
AdminPage.jsx header: `<Link to="/" aria-label="Volver al inicio">` envuelve círculo blanco 44px con borde rosa border-[#FFC9D6] + img /assets/logo-im-chic.png con onError→"IC" (idéntico a Navbar.jsx:108). Foco visible outline-[#5A0B22]. Texto "Im Chic by Mel" + h1 "Panel de Administración" intactos. Build OK (exit 0).

## Spec 013 — Etiquetas de categorías + Pestaña Servicios (IMPLEMENTADA, 2026-10-04)
TurnSettingsTab: `CAT_LABELS` corrige "Unas"→"Uñas". Pestaña "Servicios" en /admin → `ServicesTab.jsx`: CRUD `public.services` (crear/editar/eliminar/toggle `is_active`; 23505 amigable; hint migración pendiente; estados accesibles; badge "oculto"; 44px + ARIA). TurnoModalEnhanced: `serviceOptions` inicia en `SERVICE_OPTIONS` y al abrir carga servicios activos DB con fallback silencioso; calendario/wa.me/`user_appointments` intactos. Migración `20261004000000_spec_013_services.sql` **APLICADA** (ya aplicada en el proyecto real, verificado 2026-10-04: public.services existe con 10 filas). `TurnoModal.jsx` y `CalendarAvailability.jsx` intactos. Build OK (exit 0).

## Spec 014 — Botón "Guardar en mi Calendario" en Mis Turnos (IMPLEMENTADA, 2026-10-04)
`AddToCalendarButton.jsx` (nuevo): URL Google Calendar vía `action=TEMPLATE` (dates UTC YYYYMMDDTHHmmssZ, verificado en Node), fallback `role="status"` si `window.open` retorna null; Tailwind + `<style>` local namespaced `imchic-gcal-btn` con `@keyframes slope` + prefers-reduced-motion; **NO styled-components** (constitución §3). Integrado en `MyAppointmentsPage.jsx` solo en turnos `confirmado` (grid sm:grid-cols-2 junto a "Cancelar turno", min-h-[44px]). Build OK (exit 0). **Código muerto documentado y NO eliminado**: `AppointmentCard`/`appointmentCards` en MyAppointmentsPage. `durationMinutes` default 60.

## Spec 015 — Navbar admin limpio + CustomCheckbox animado (IMPLEMENTADA, 2026-10-04)
Navbar: link `/cuenta` con nombre del usuario envuelto en `{!isAdmin && (...)}` (desktop y móvil); admin ve solo "Panel Admin" + "Salir". Nuevo `src/components/CustomCheckbox.jsx` (spec 015): réplica del checkbox animado (mismo SVG, colores #6a1b29/#4a0d1c) con Tailwind + `<style>` local namespaced `imchic-cbx-`; a11y (sr-only, foco visible, 44px, aria-hidden svg, prefers-reduced-motion). Reemplaza checkboxes nativos en `TurnSettingsTab.jsx` y `ServicesTab.jsx` (is_active). Spec: `specs/015_admin_navbar_checkbox/spec.md`.

## Spec 016 — Duración variable de servicios (IMPLEMENTADA, 2026-10-04)
`public.services`: `duration_minutes` → `estimated_duration_text` (text nullable, texto visible p/ cliente) + `block_minutes` (integer not null default 60, check > 0; índice `services_block_minutes_idx`; comments). Migración `20261004000001_spec_016_services_duration.sql` **APLICADA** (ya aplicada en el proyecto real, verificado 2026-10-04: services con estimated_duration_text + block_minutes, sin duration_minutes; orden 013 → 016; backfill idempotente 'Aprox N min' vía DO block; drop de `duration_minutes` al final).
`ServicesTab.jsx`: dos campos (texto estimado + minutos a bloquear, validación 15–720); INSERT/UPDATE/lista usan los campos nuevos; degradación sin migración → hint role="status" (PGRST204/42703).
`TurnoModalEnhanced.jsx`: servicios vía `select('*')` + maps `dbTextByService`/`dbDurationByService`; bajo el select muestra `⏱️ Tiempo estimado: {texto}` (role="status") y pasa `serviceBlockMinutes` a CalendarAvailability.
`CalendarAvailability.jsx`: duración de bloqueo = `serviceBlockMinutes || serviceDurations[categoría] || 60` (endTime/slotEnd/isDayAvailable/duration emitido); `slotGranularity` solo paso de candidatos. Sin migración 016: comportamiento idéntico al actual (fallback serviceDurations/60). `TurnoModal.jsx` intacto; flujo turnos (user_appointments/wa.me) sin cambios. Build OK (exit 0).

## Decisiones arquitectónicas
- SDD obligatorio: leer docs/constitution.md y documentar spec + plan antes de tocar .jsx.
- El home (/) NO se rediseña; mantiene su layout alternado original.
- La pestaña Servicios vive en InversionPage.jsx (3 categorías exactas).
- TurnoModal único y global vía TurnoProvider/useTurno (src/context/TurnoContext.jsx); Navbar y TurnoModal son componentes protegidos (no modificar sin spec). ErrorBoundary envuelve el árbol de rutas.
- WhatsAppButton: tone ("whatsapp" verde | "brand" marca); open={false} = solo ícono + nombre al hover. WhatsApp/Instagram en el footer (no Navbar); ServiceCarousel centraliza el carrusel accesible.
- Archivos SEO estáticos en public/. Dominio canónico pages.dev.
- MCP usa el esquema V2 de OpenCode (mcp.servers, type: local, command como array único).
