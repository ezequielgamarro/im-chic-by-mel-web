# Plan de implementación — Spec 001

Implementa `specs/001_global_improvements_and_services/spec.md`.
Orden pensado para minimizar riesgo: primero el Error Boundary (aislado),
luego el carrusel accesible, luego el rediseño de Servicios y el ajuste de Navbar.

---

## 1. `src/components/ErrorBoundary.jsx` — CREAR

Componente de clase nuevo.

- `state = { hasError: false, error: null }`.
- `static getDerivedStateFromError(error)` → `{ hasError: true, error }`.
- `componentDidCatch(error, info)` → `console.error('[ErrorBoundary]', error, info)`.
- Render de fallback de marca: fondo `bg-[#FFF0F3]`, tarjeta centrada, título
  `<h1>`, mensaje, botón **Recargar** (`onClick={() => window.location.reload()}`,
  `min-h-11`) y enlace WhatsApp (`https://wa.me/5493813553492`).
- Acepta `children`. Sin dependencias nuevas.

## 2. `src/main.jsx` — MODIFICAR

- `import ErrorBoundary from './src/components/ErrorBoundary';`
- Envolver el árbol dentro de `<React.StrictMode>`:
  `<ErrorBoundary><BrowserRouter>…</BrowserRouter></ErrorBoundary>`.
- No se tocan imports de rutas ni componentes.

## 3. `src/components/ServiceCarousel.jsx` — CREAR

Extraer `ServiceCarousel` desde `HomeServices.jsx` con las mejoras de RF-2.

- Props: `service` (igual que hoy), opcional `className`.
- Estados: `index`, `paused`. Autoplay 4 s con `prefers-reduced-motion` (sin cambios de lógica base).
- Controles: botones `w-11 h-11` (44 px) `min-w-11 min-h-11`, `aria-label`.
- Indicadores: cada uno `button` con `p-3` (hitbox ≈ 30×30 px visible) o
  `min-w-11 min-h-11`; punto interno `w-1.5 h-1.5` / activo `w-6`. `aria-current`.
- A11y: `role="region"`, `aria-roledescription="carrusel"`, `aria-label`,
  `aria-live="polite"` en el contenedor de la imagen.
- Teclado: `onKeyDown` flechas ← → sobre el contenedor (`tabIndex=0`).
- Imágenes: conservar `alt`, `loading="lazy"`, `object-cover`, `aspect-[4/5]`.

## 4. `HomeServices.jsx` — MODIFICAR

### 4.1 Datos
- Ampliar el array `services` con `treatments: string[]`:
  - `nails` → `['Semipermanente', 'Capping', 'Soft gel']`
  - `hair` → `['Alisado Luminoliss', 'Plastificado', 'Botox', 'Queratina', 'Nutrición capilar + ampolla']`
  - `makeup` → `['Maquillaje social', 'Maquillaje de novia', 'Maquillaje de quinceañera']`
- Añadir `heading` corto por categoría (ej. "Uñas", "Tratamientos capilares",
  "Maquillaje Profesional") para el `<h3>`.

### 4.2 Estructura / jerarquía
- Hero: cambiar `motion.h2` → `motion.h1` (mantener clases y animación).
- Sección Servicios: añadir `<h2>` "Nuestros Servicios" con subtítulo.
- Rediseñar el bloque `services.map(...)` a una grilla
  `grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8`:
  - Tarjeta: `rounded-2xl bg-white/80 border border-[#5A0B22]/10 shadow-lg p-5 sm:p-6 flex flex-col`.
  - Cabecera: ícono (badge ya existente) + `<h3>` + categoría.
  - Cuerpo: descripción breve + lista de `treatments` (ícono `Check`/`Sparkles`,
    `list-disc`/`flex`).
  - CTA: botón `Agendar turno` con `min-h-11`, `onClick={() => handleOpenTurno(service.title)}`.
- Reemplazar el `<div>` alternado (`isEven`) y las animaciones `whileInView` que
  dejaban `opacity: 0`. Usar `initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}}`
  con `viewport={{ once: true, amount: 0.2 }}` — y sobre todo **sin dejar el
  contenedor raíz en opacity 0**.
- Usar `ServiceCarousel` importado (eliminar la definición local `ServiceCarousel`).
- Eliminar imports sin uso si quedan (`WhatsAppButton`, `SparkleButton`).

### 4.3 Footer
- Cambiar `text-[#5A0B22]/60` → `text-[#5A0B22]/75` (contraste ≥ 4.5:1).

## 5. `src/components/Navbar.jsx` — MODIFICAR (mínimo, protegido)

- Único cambio: el botón hamburguesa (línea ~108) pasa de `p-2` a
  `w-11 h-11 flex items-center justify-center` para alcanzar 44×44 px.
- No se alteran estructura, links ni CTAs. Cualquier otro cambio queda fuera.

## 6. Validación (Constitución, principio 4)

1. `npm run build` → sin errores.
2. `npm run dev` + Chrome DevTools MCP:
   - Móvil `390×844` y desktop `1440×900`: sin scroll horizontal, sin solapes.
   - Lighthouse móvil: Accessibility ≥ 95 y sin `target-size` / `heading-order` /
     `color-contrast`.
   - Consola sin errores.
   - Forzar error en un componente hijo → aparece el fallback (CA-1).
   - Clic en cada `Agendar turno` → abre `TurnoModal` con el servicio correcto.

## 7. Archivos afectados (resumen)

| Archivo | Acción |
| --- | --- |
| `src/components/ErrorBoundary.jsx` | CREAR |
| `src/components/ServiceCarousel.jsx` | CREAR |
| `src/main.jsx` | MODIFICAR (envolver con ErrorBoundary) |
| `HomeServices.jsx` | MODIFICAR (servicios, H1/H2/H3, footer, usar carrusel) |
| `src/components/Navbar.jsx` | MODIFICAR (hitbox hamburguesa 44 px) |
| `.agents/skills/frontend-design/**` | CREADO (skill) |
| `specs/001_global_improvements_and_services/{spec,plan}.md` | CREADO |

> No se modifican `index.html`, `TurnoModal.jsx`, ni otras rutas.
