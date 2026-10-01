# Spec 005 — SEO y Agentic (robots.txt / llms.txt / sitemap)

- **ID:** 005
- **Estado:** Aprobada / en implementación
- **Fecha:** 2026-10-01
- **Dominio canónico:** `https://im-chic-by-mel-web.pages.dev/`
- **Constitución de referencia:** `docs/constitution.md`

## 1. Contexto

Lighthouse móvil reporta fallos en `robots-txt` y `llms-txt` en todas las rutas:
el dev server (y el host) devolvían `index.html` en `/robots.txt` y `/llms.txt`.
SEO = 92 y Agentic Browsing = 67.

## 2. Objetivo

Publicar archivos estáticos válidos para buscadores y agentes, sin tocar componentes `.jsx`.

## 3. Alcance

- `public/robots.txt`: permitir el rastreo general y declarar el sitemap.
- `public/sitemap.xml`: URLs de las 5 rutas.
- `public/llms.txt`: formato estándar (H1 + resumen en blockquote + enlaces).

## 4. Fuera de alcance

- Metadatos por ruta (títulos/descripciones dinámicos) y `sitemap` dinámico.
- Cambios en componentes o rutas.

## 5. Requisitos no funcionales

- Archivos estáticos servidos desde `public/` (dev y build).
- `npm run build` copia los archivos a `dist/`.

## 6. Criterios de aceptación

- [ ] CA-1: `GET /robots.txt` devuelve `text/plain` válido.
- [ ] CA-2: `GET /llms.txt` devuelve `text/plain` en formato llms.txt.
- [ ] CA-3: Lighthouse móvil: `robots-txt` y `llms-txt` pasan (score 1) en `/`.
- [ ] CA-4: `npm run build` OK.
