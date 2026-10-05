# Plan 012 — Botón Logo "Volver al inicio" en la cabecera del Panel Admin

## 1. Decisión de diseño del botón-logo

### 1.1 Estructura propuesta

Reemplazar el `<div>` actual de la cabecera (líneas 151–158 de `AdminPage.jsx`) por un contenedor flex horizontal que integre el logo-navegable y el texto existente:

```jsx
{/* Contenedor izquierdo: logo navegable + texto */}
<div className="flex items-center gap-3">
  <Link
    to="/"
    aria-label="Volver al inicio"
    title="Volver al inicio"
    className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white border border-[#FFC9D6] flex items-center justify-center overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22] transition-transform hover:scale-105"
  >
    <img
      src="/assets/logo-im-chic.png"
      alt=""
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement.innerHTML = '<span class="font-script text-[#7A1333] text-lg font-bold">IC</span>';
      }}
    />
  </Link>
  <div>
    <p className="font-script text-lg leading-none text-[#7A1333]">
      Im Chic by Mel
    </p>
    <h1 className="font-serif text-xl sm:text-2xl font-bold">
      Panel de Administración
    </h1>
  </div>
</div>
```

### 1.2 Justificación

- **Criterio Navbar**: el fallback "IC" y el círculo blanco con borde rosa replican el patrón ya usado en `src/components/Navbar.jsx` (verificar consistencia).
- **Accesibilidad**: `aria-label` y `title` en el `<Link>` garantizan que lectores de pantalla y tooltips identifiquen la acción. El área táctil de 44×44px cumple WCAG 2.1 AA.
- **Mobile-first**: el contenedor flex con `gap-3` se adapta al wrap del header (`flex flex-wrap`) sin romper el layout en 320px+.
- **Sin dependencias**: solo Tailwind vía CDN; no se instalan paquetes nuevos.

## 2. Enfoque de implementación

### 2.1 Cambio mínimo

- **Archivo**: `src/pages/AdminPage.jsx` (único archivo modificado).
- **Líneas afectadas**: 151–158 (bloque `<div>` de la cabecera).
- **Import necesario**: agregar `Link` a la importación de `react-router-dom` (línea 2).

### 2.2 Pasos

1. Importar `Link` desde `react-router-dom`.
2. Reemplazar el `<div>` de la cabecera por el contenedor flex con el `<Link>` y el texto existente.
3. Verificar que el `onError` del `<img>` use el mismo criterio que el Navbar (fallback "IC" en un `<span>` con `font-script` y color de marca).
4. Asegurar que el header mantenga `flex flex-wrap items-center justify-between gap-3` para no romper el layout.

### 2.3 Verificación

- Ejecutar `npm run build` y confirmar que compila sin errores.
- Revisar visualmente en viewport móvil (320px+) y desktop que:
  - El logo aparece a la izquierda.
  - Al hacer clic, navega a `/`.
  - El texto "Im Chic by Mel" y el `<h1>` se muestran al lado del logo.
  - Los tabs siguen al centro y "Cerrar sesión" a la derecha.
  - El foco visible se muestra al navegar por teclado.
- Actualizar `MEMORY.md` con el estado final.

## 3. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| El `onError` con `innerHTML` puede ser frágil | Usar el mismo patrón que el Navbar (verificar `src/components/Navbar.jsx`); si el Navbar usa un estado de fallback, replicar ese enfoque. |
| El wrap del header puede romperse en pantallas muy angostas | El contenedor flex con `gap-3` y el `flex-wrap` del header permiten que el logo y el texto se apilen si es necesario; validar en 320px. |
| El `<Link>` puede heredar estilos no deseados | Aplicar `reset` con clases Tailwind (`no-underline`, `text-inherit`) si es necesario. |

## 4. Criterios de éxito

- El build compila sin errores.
- El logo es visible y navega a `/`.
- El layout del header no se rompe.
- Se cumplen los CA de la spec.
