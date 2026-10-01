# Spec 004 — Jerarquía de encabezados en Tienda MK

- **ID:** 004
- **Estado:** Aprobada / en implementación
- **Fecha:** 2026-10-01
- **Ruta afectada:** `/tienda` (`MaryKayStore.jsx`)
- **Constitución de referencia:** `docs/constitution.md`

---

## 1. Contexto

Lighthouse móvil de `/tienda` reporta `heading-order` = 0 (fallo), detectado en la Spec 003.
La página **sí tiene `<h1>`** (hero, "Tu Belleza, Elevada."), pero:

- El caption "Consultora de Belleza" usa `<h3>` justo después del `<h1>` → **salta de h1 a h3**.
- Las tarjetas de producto usan `<h4>` bajo el `<h2>` "Tienda Mary Kay" → **salta de h2 a h4**.

## 2. Objetivo

Dejar una jerarquía de encabezados secuencial (`h1 → h2 → h3`) sin alterar el diseño visual.

## 3. Alcance

### RF-1 — Caption del hero
- El texto "Consultora de Belleza" (caption sobre la imagen) deja de ser encabezado
  y pasa a `<p>` manteniendo exactamente sus clases visuales.

### RF-2 — Nombre del producto
- La tarjeta de producto (`ProductCard`) cambia su `<h4>` a `<h3>`
  (queda subordinada al `<h2>` de la sección).

### RF-3 — Verificación
- Lighthouse móvil `/tienda` sin fallo `heading-order`.

## 4. Fuera de alcance

- El `<h4>` del ítem del carrito (dentro del panel/diálogo del carrito, que no está en el DOM
  cuando está cerrado).
- `robots.txt` / `llms.txt`: requieren definir el dominio público real del sitio; quedan como deuda
  técnica pendiente de definir la URL canónica.
- Otras rutas no auditadas en esta iteración.

## 5. Requisitos no funcionales

- RNF-1: Solo Tailwind/semántica; sin dependencias.
- RNF-2: Cero cambios visuales.
- RNF-3: `npm run build` sin errores.

## 6. Criterios de aceptación

- [ ] CA-1: Jerarquía `h1 → h2 → h3` sin saltos en `/tienda`.
- [ ] CA-2: Lighthouse `heading-order` pasa (score 1).
- [ ] CA-3: El diseño se ve idéntico.
- [ ] CA-4: `npm run build` OK.
