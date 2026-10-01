# Plan de implementación — Spec 002 (Navbar)

Implementa `specs/002_navbar_refactor/spec.md`.
Pendiente de aprobación. Incluye 2 decisiones a confirmar (marcadas ❓).

---

## Decisión A ❓ — Color del botón WhatsApp en la Navbar
- **A1 (recomendada):** reestilar a paleta de marca (rosa/vino) dentro de la Navbar.
- **A2:** conservar el verde `#00d757`.

## Decisión B ❓ — Centralización del `TurnoModal`
- **B1 (recomendada):** contexto único + un solo modal en `src/main.jsx`.
- **B2 (mínima):** el modal queda solo en la Navbar; las páginas dejan de montarlo.

---

## Archivos

### 1. `src/components/Navbar.jsx` — MODIFICAR (principal)
- Top bar: quitar el `<span>` con `animate-ping`; sustituir por separador estático. Unificar visibilidad de "Ver Cursos & Masterclass".
- `<nav aria-label="Principal">`; `aria-current="page"` en el link activo.
- Hamburguesa: `aria-expanded={mobileMenuOpen}` + `aria-controls="mobile-menu"` (ya tiene `aria-label` dinámico y 44×44 de Spec 001).
- Menú móvil: panel `id="mobile-menu"` a pantalla completa, links `min-h-[44px]`, cierre con `Escape` y clic fuera, retorno de foco, `body` con `overflow-hidden` mientras está abierto.
- CTAs: dejar `Agenda tu turno` (primario) + WhatsApp (secundario, según Decisión A). Quitar `SparkleButton`.
- Quitar el `<TurnoModal>` propio según Decisión B.

### 2. `src/components/WhatsAppButton.jsx` — MODIFICAR
- Añadir prop `tone` (`"brand"` | `"whatsapp"`, default `"whatsapp"` para no romper otros usos).
- `tone="brand"`: fondo/borde en paleta (`#FFF0F3`/`#5A0B22`) e ícono en `#7A1333`.
- Mantener tamaños `sm/md/lg` y el resto del comportamiento.

### 3. `src/components/SparkleButton.jsx` — SIN CAMBIOS
- Deja de importarse en la Navbar (el archivo se conserva).

### 4. `src/main.jsx` — MODIFICAR (solo si Decisión B = B1)
- Envolver con `TurnoProvider` (nuevo) y montar un único `<TurnoModal>`.

### 5. `src/context/TurnoContext.jsx` — CREAR (solo si B1)
- `TurnoProvider` con `open(service)`, `close()` y estado `selectedService`.
- Hook `useTurno()`.

### 6. `HomeServices.jsx` e `InversionPage.jsx` — MODIFICAR (solo si B1)
- Reemplazar el `TurnoModal` local por `useTurno().open(...)`.

---

## Validación (Constitución, principio 4)

1. `npm run build` sin errores.
2. Chrome DevTools MCP en `/`, `/servicios` y `/contacto`:
   - Móvil 390×844: abrir menú, cerrar con `Escape`, verificar scroll bloqueado y links ≥ 44 px.
   - Sin scroll horizontal ni solapes.
   - Consola sin errores.
   - Lighthouse móvil: Accessibility ≥ 95.
3. Verificar que existe **una sola** instancia de `TurnoModal` en el DOM (CA-4).

## Orden sugerido
1. `WhatsAppButton` (variante `tone`).
2. `Navbar` (top bar, semántica, menú móvil, CTAs).
3. Decisión B (modal).
4. Validación.

## Fuera de alcance
- Contenido del `TurnoModal`, otras páginas y deuda técnica ya registrada en `MEMORY.md`.
