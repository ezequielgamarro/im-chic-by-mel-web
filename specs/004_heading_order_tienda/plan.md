# Plan de implementación — Spec 004 (Heading order Tienda)

Implementa `specs/004_heading_order_tienda/spec.md`.

## Archivo a modificar (único)
`MaryKayStore.jsx`

1. **Caption del hero** (~línea 659)
   - `<h3 className="font-serif font-bold text-[#5A0B22] text-base sm:text-lg leading-tight mb-0.5 sm:mb-1">Consultora de Belleza</h3>`
   - → `<p ... misma className>Consultora de Belleza</p>`

2. **Nombre del producto en `ProductCard`** (~línea 322)
   - `<h4 className="font-serif text-xl font-bold text-[#5A0B22] leading-tight mb-2">`
   - → `<h3 ... misma className>`

## Validación
1. `npm run build`.
2. Chrome DevTools MCP en `/tienda` (móvil):
   - Extraer la secuencia de `h1..h6` y confirmar `H1, H2, H3, ...`.
   - Lighthouse móvil: `heading-order` en score 1.
   - Sin cambios visuales (captura).
