# Tasks 012 — Botón Logo "Volver al inicio" en la cabecera del Panel Admin

## T1: Importar `Link` desde `react-router-dom`

- **Archivo**: `src/pages/AdminPage.jsx`
- **Cambio**: Modificar la línea 2 para importar `Link`:
  ```js
  import { Link, useNavigate } from 'react-router-dom';
  ```
- **Criterio de hecho**: La importación incluye `Link`.
- **Verificación**: `npm run build` compila sin errores.

## T2: Reemplazar el `<div>` de la cabecera por el contenedor flex con logo-navegable

- **Archivo**: `src/pages/AdminPage.jsx`
- **Cambio**: Reemplazar las líneas 151–158 (el `<div>` con "Im Chic by Mel" y el `<h1>`) por:
  ```jsx
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
- **Criterio de hecho**: El header muestra el logo-navegable a la izquierda con el texto existente al lado.
- **Verificación**: `npm run build` compila sin errores; revisar visualmente que el layout no se rompe.

## T3: Verificar consistencia del fallback "IC" con el Navbar

- **Archivo**: `src/pages/AdminPage.jsx` (y revisar `src/components/Navbar.jsx`)
- **Cambio**: Si el Navbar usa un patrón diferente para el fallback (ej. estado en lugar de `innerHTML`), ajustar el `onError` del `<img>` para replicar ese criterio.
- **Criterio de hecho**: El fallback "IC" usa el mismo criterio que el Navbar.
- **Verificación**: Revisar `src/components/Navbar.jsx` y confirmar que el patrón es consistente.

## T4: Verificación visual en viewport móvil y desktop

- **Archivo**: `src/pages/AdminPage.jsx`
- **Cambio**: Ninguno (solo verificación).
- **Criterio de hecho**:
  - El logo aparece a la izquierda del header.
  - Al hacer clic, navega a `/`.
  - El texto "Im Chic by Mel" y el `<h1>` se muestran al lado del logo.
  - Los tabs siguen al centro y "Cerrar sesión" a la derecha.
  - El foco visible se muestra al navegar por teclado.
  - El layout no se rompe en 320px+.
- **Verificación**: Probar en navegador (Chrome DevTools) en viewport móvil y desktop.

## T5: Actualizar `MEMORY.md`

- **Archivo**: `MEMORY.md`
- **Cambio**: Agregar una sección `## Spec 012 — Botón Logo "Volver al inicio" en Panel Admin (IMPLEMENTADA, 2026-10-04)` con un resumen breve del cambio.
- **Criterio de hecho**: `MEMORY.md` incluye la sección de la spec 012.
- **Verificación**: Leer `MEMORY.md` y confirmar que la sección está presente.

## T6: Build final

- **Archivo**: `src/pages/AdminPage.jsx`
- **Cambio**: Ninguno (solo verificación).
- **Criterio de hecho**: `npm run build` compila sin errores ni advertencias introducidas por estos cambios.
- **Verificación**: Ejecutar `npm run build` y confirmar que el build es exitoso.
