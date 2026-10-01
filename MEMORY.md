## Estado actual
SDD activo: AGENTS.md, docs/constitution.md (5 principios), specs/ y MEMORY.md. MCP Chrome DevTools + skill "frontend-design".
Dominio canónico: https://im-chic-by-mel-web.pages.dev/
Home (/) = HomeServices.jsx con su diseño alternado original + arreglos (ErrorBoundary, H1, 44px, contraste).
Pestaña Servicios (/servicios, /inversion) = InversionPage.jsx con 3 categorías + botón "Agendar turno" c/u.
Specs 001–006 implementadas: 001 global/accesibilidad, 002 Navbar + TurnoModal centralizado, 003 buscador tienda, 004 heading-order tienda, 005 SEO/agentic, 006 inscripción por WhatsApp en /cursos + limpieza del selector de turnos.
/cursos: botón "Quiero Inscribirme Ahora" abre WhatsApp con curso + valor (Masterclass $65.000 / Formación Integral $130.000 por mes) y detalles.
TurnoModal: selector "Servicio a Realizar" con 10 opciones (solo Uñas, Cabello, Maquillaje; sin Packs, Cursos ni Asesoría).
Navbar: solo CTA "Agenda tu turno". Footer: WhatsApp + Instagram en 5 rutas, solo ícono y nombre al hover.
/servicios: botón "Pedir Presupuesto WhatsApp" en size md (48px) y paleta de marca.
SEO: public/robots.txt, public/sitemap.xml y public/llms.txt creados y servidos como text/plain / text/xml.
Validado: build OK; Lighthouse móvil 100/100/100/100 (Accessibility, Best Practices, SEO, Agentic) en /; Accessibility 100 en /servicios y /tienda; sin errores de consola.

## Próximos pasos
Sin pendientes críticos. Ideas: títulos/descripciones por ruta, robots/llms por entorno, migración de Tailwind CDN a build.

## Decisiones arquitectónicas
- SDD obligatorio: leer docs/constitution.md y documentar spec + plan antes de tocar .jsx.
- El home (/) NO se rediseña; mantiene su layout alternado original.
- La pestaña Servicios vive en InversionPage.jsx (3 categorías exactas).
- TurnoModal único y global vía TurnoProvider/useTurno (src/context/TurnoContext.jsx).
- WhatsAppButton: tone ("whatsapp" verde por defecto | "brand" marca); open={false} = solo ícono + nombre al hover (igual que InstagramButton).
- WhatsApp/Instagram viven en el footer, no en el Navbar. ServiceCarousel centraliza el carrusel accesible.
- Archivos SEO estáticos en public/ (robots.txt, sitemap.xml, llms.txt); dominio canónico pages.dev.
- Componentes protegidos: Navbar y TurnoModal (no modificar sin spec). ErrorBoundary envuelve el árbol de rutas.
- MCP usa el esquema V2 de OpenCode (mcp.servers, type: local, command como array único).
