# Plan de implementación — Spec 005 (SEO / Agentic)

Implementa `specs/005_seo_robots_llms/spec.md`.

## Archivos a crear (estáticos, sin tocar .jsx)
1. `public/robots.txt`
2. `public/sitemap.xml`
3. `public/llms.txt`

## Validación
1. `npm run build` (copia `public/` a `dist/`).
2. Chrome DevTools MCP: `GET /robots.txt` y `/llms.txt` → `text/plain`.
3. Lighthouse móvil en `/`: `robots-txt` y `llms-txt` en score 1; SEO y Agentic suben.
