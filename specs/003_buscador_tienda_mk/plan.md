# Plan de implementación — Spec 003 (Buscador Tienda MK)

Implementa `specs/003_buscador_tienda_mk/spec.md`.

## Archivo a modificar (único)
`MaryKayStore.jsx`

### 1. Imports
- Añadir `Search` al import de `lucide-react` (ya se importa `X`, usado para limpiar).

### 2. Estado
- Nuevo estado: `const [searchQuery, setSearchQuery] = useState('');`

### 3. Filtrado (reemplaza el actual `filteredProducts`)
- `useMemo` con dependencias `[activeCategory, searchQuery]`.
- Normaliza `searchQuery` a minúsculas y filtra por `name`, `description` y `category`.
- Intersección con `activeCategory`.

### 4. UI (dentro de la sección `#tienda`)
- Insertar, **antes** de `{/* Filtros de Categoría */}`, un contenedor
  `max-w-xl mx-auto mb-6` con el input de búsqueda (ícono `Search` a la izquierda,
  botón `X` para limpiar cuando hay texto).
- Input: `type="search"`, `min-h-[44px]`, `aria-label="Buscar productos"`,
  estilos de marca (fondo `#FFF0F3`, borde `#FFC9D6`, ring de foco).

### 5. Estado vacío
- Dentro del grid, si `filteredProducts.length === 0`, mostrar un bloque
  `col-span-full` con mensaje y sugerencia.

## Validación
1. `npm run build`.
2. Chrome DevTools MCP en `/tienda` (móvil + desktop):
   - Buscar "labial" y "timewise" → resultados correctos.
   - Combinar con categoría.
   - Limpiar búsqueda → vuelve el catálogo.
   - Buscar algo inexistente → estado vacío.
   - Input ≥ 44 px; sin errores de consola; sin scroll horizontal.

## Fuera de alcance
- Otras páginas, carrito, Navbar.
