# Spec 001 — Mejoras globales de calidad y rediseño de la sección de Servicios

- **ID:** 001
- **Estado:** Propuesta (pendiente de aprobación del `plan.md`)
- **Fecha:** 2026-10-01
- **Autor:** Senior Software Engineer (vía OpenCode)
- **Rutas afectadas:** `/` (HomeServices)
- **Constitución de referencia:** `docs/constitution.md`

---

## 1. Contexto

La auditoría técnica y visual (Chrome DevTools MCP) del home `http://localhost:5173/`
arrojó:

- **Sin** Error Boundary: un fallo de render/HMR deja `#root` vacío y la app en
  **pantalla en blanco** (observado: HTTP 500 en `ImChicLanding.jsx` durante una
  edición, que tumbó todo el SPA por import estático en `src/main.jsx`).
- **Lighthouse móvil:** Accessibility **89**, SEO **92**, Agentic Browsing **67**.
  Fallos: `target-size`, `heading-order`, `color-contrast`, `robots-txt`, `llms-txt`.
- **29 objetivos táctiles < 44 px**; dots del carrusel de **6×6 px**.
- **Sin `<h1>`**; orden `h2 → h4 → h2`.
- Sección de servicios pesada (layout alternado + carrusel) con descripciones
  genéricas y sin detalle de prestaciones ni CTA claro por categoría.
- Contraste del footer `#9c6d7a` sobre blanco = **4.3:1** (< 4.5:1).

## 2. Objetivos

1. Eliminar la posibilidad de "pantalla en blanco" ante errores de render.
2. Cumplir **WCAG 2.1 AA** en los puntos auditados y subir Accessibility ≥ 95.
3. Rediseñar Servicios en un formato **limpio, directo y de alta conversión**,
   con prestaciones explícitas y un CTA `Agendar turno` por categoría.

## 3. Alcance

### RF-1 — Error Boundary global
- Componente de clase `ErrorBoundary` con `getDerivedStateFromError` y
  `componentDidCatch`.
- Envuelve el árbol de rutas en `src/main.jsx`.
- Fallback de marca (mobile-first, Tailwind) con mensaje claro, botón
  **Recargar** y enlace de contacto por WhatsApp.
- Registra el error en consola (`componentDidCatch`) para diagnóstico.

### RF-2 — Accesibilidad y carrusel
- Extraer `ServiceCarousel` a `src/components/ServiceCarousel.jsx` y:
  - Controles anterior/siguiente **≥ 44×44 px**.
  - Indicadores con **área táctil ≥ 24×24 px** (punto visual interno + hitbox),
    `aria-current` correcto y `aria-label` "Ver imagen N de M".
  - `role="region"`, `aria-roledescription="carrusel"`, `aria-label`, `aria-live`.
  - Navegación por teclado (flechas) y `prefers-reduced-motion` (autoplay off).
- **Jerarquía de títulos:** `<h1>` en el hero; `<h2>` de sección
  "Nuestros Servicios"; `<h3>` por categoría. Eliminar los `<h4>` de overlay.
- **Contraste:** subir el texto del footer a un ratio ≥ 4.5:1.
- **Navbar (cambio mínimo y quirúrgico):** hamburguesa a **≥ 44×44 px**.
  (Componente protegido → se modifica solo esta propiedad, bajo esta spec.)

### RF-3 — Simplificación de Servicios
Rediseñar la sección como grilla responsive (1 columna en móvil, 3 en desktop)
de tarjetas limpias. Cada tarjeta contiene: ícono, categoría, título, lista de
prestaciones exactas y CTA `Agendar turno` (abre `TurnoModal` con el servicio
preseleccionado).

| Categoría | Prestaciones (texto exacto) |
| --- | --- |
| **Uñas** | Semipermanente, Capping, Soft gel |
| **Tratamientos capilares** | Alisado Luminoliss, Plastificado, Botox, Queratina, Nutrición capilar + ampolla |
| **Maquillaje Profesional** | Maquillaje social, Maquillaje de novia, Maquillaje de quinceañera |

- El carrusel optimizado (RF-2) se mantiene como recurso visual de cada tarjeta.
- Se conserva la paleta y tipografías de marca (Constitución, principio 3).

## 4. Fuera de alcance

- Migración de Tailwind CDN a build con PostCSS.
- Creación de `robots.txt` / `llms.txt` (se registra como deuda técnica).
- Refactor de `Navbar`/`TurnoModal` más allá del ajuste táctil descrito.
- Otras rutas (`/cursos`, `/tienda`, `/servicios`, `/contacto`).

## 5. Requisitos no funcionales

- **RNF-1** Mobile-first: validar a 390×844 sin scroll horizontal.
- **RNF-2** Solo clases utilitarias de Tailwind.
- **RNF-3** No introducir dependencias nuevas.
- **RNF-4** Sin regresiones visuales en desktop (1440×900).

## 6. Criterios de aceptación

- [ ] CA-1: Forzar un error de render muestra el fallback y la app no queda en blanco.
- [ ] CA-2: Lighthouse móvil Accessibility ≥ 95; sin fallos `target-size`,
      `heading-order` ni `color-contrast`.
- [ ] CA-3: Existe exactamente un `<h1>` y la jerarquía es secuencial.
- [ ] CA-4: Todos los interactivos ≥ 44×44 px (o área táctil equivalente).
- [ ] CA-5: La sección de Servicios muestra las 3 categorías con sus prestaciones
      exactas y un CTA `Agendar turno` funcional por categoría.
- [ ] CA-6: `npm run build` compila sin errores.

## 7. Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Extraer el carrusel rompe el layout | Mantener mismas clases contenedoras y validar en ambos viewports |
| Cambios en `Navbar` (protegido) | Limitarlos al hitbox del hamburger, documentados aquí |
| Duplicación de `TurnoModal` (Navbar + página) | Fuera de alcance; se registra como deuda técnica |
