# Spec 003 — Buscador de productos en Tienda MK

- **ID:** 003
- **Estado:** Aprobada / en implementación
- **Fecha:** 2026-10-01
- **Ruta afectada:** `/tienda` (`MaryKayStore.jsx`)
- **Constitución de referencia:** `docs/constitution.md`

---

## 1. Contexto

La página `/tienda` (Mary Kay Store) muestra un catálogo de productos (`products`) filtrable
solo por categoría mediante botones. Con muchos productos, encontrar uno puntual requiere
recorrer todo el grid. No existe buscador.

## 2. Objetivo

Permitir **buscar productos por texto** de forma simple, rápida y mobile-first, combinable
con el filtro de categoría existente.

## 3. Alcance

### RF-1 — Campo de búsqueda
- Input de búsqueda visible en la sección "Tienda Mary Kay", encima de los filtros de categoría.
- Ícono de lupa; placeholder orientativo (`Buscar producto (ej: labial, TimeWise)...`).
- `aria-label="Buscar productos"`; área táctil ≥ 44 px; botón para limpiar la búsqueda.

### RF-2 — Filtrado
- Filtra por coincidencia (case-insensitive, parcial) en `name`, `description` y `category`.
- Se **combina** con `activeCategory`: primero categoría, luego texto.
- Búsqueda vacía = sin restricción de texto.

### RF-3 — Estado vacío
- Si no hay resultados, mostrar un mensaje claro ("No encontramos productos") + sugerencia,
  sin romper el layout del grid.

## 4. Fuera de alcance

- Búsqueda por voz, filtros por precio ni ordenamiento.
- Cambios en el carrito, en `Navbar` o en otras páginas.
- Backend: el filtrado es 100% en cliente.

## 5. Requisitos no funcionales

- **RNF-1** Solo clases utilitarias de Tailwind; sin dependencias nuevas.
- **RNF-2** Mobile-first (390×844) y desktop (1440×900).
- **RNF-3** `npm run build` sin errores.
- **RNF-4** No alterar el diseño existente más allá de insertar el buscador.

## 6. Criterios de aceptación

- [ ] CA-1: Escribir "labial" filtra los productos correspondientes.
- [ ] CA-2: La búsqueda se combina con la categoría activa.
- [ ] CA-3: Sin resultados → mensaje de estado vacío visible.
- [ ] CA-4: Botón de limpiar restablece la lista completa.
- [ ] CA-5: `npm run build` OK; sin errores en consola; input ≥ 44 px.

## 7. Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El grid animado (AnimatePresence) parpadea al filtrar | Mantener la key por producto y no remontar el contenedor |
| Acentos/mayúsculas | Comparar en minúsculas y sin exigir tildes exactas (includes simple) |
