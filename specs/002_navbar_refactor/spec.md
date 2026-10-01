# Spec 002 — Refactor de la Navbar

- **ID:** 002
- **Estado:** Propuesta (pendiente de aprobación del `plan.md`)
- **Fecha:** 2026-10-01
- **Autor:** Senior Software Engineer (vía OpenCode)
- **Alcance:** componente global presente en las 5 rutas (`/`, `/cursos`, `/tienda`, `/servicios`, `/contacto`)
- **Constitución de referencia:** `docs/constitution.md`

---

## 1. Contexto

Hallazgos de la auditoría (Chrome DevTools) sobre `src/components/Navbar.jsx`:

- **Tres CTAs compitiendo** en el menú móvil: `Agenda tu turno`, `Elegí tu curso` (SparkleButton) y `Agendar` (WhatsApp).
- **Verde WhatsApp** (`#00d757`) fuera de la paleta de marca (rojo vino / rosa / dorado) → rompe "Estética Consistente".
- **Menú móvil tipo dropdown**: los links usan `py-2` (≈40 px, por debajo de 44 px), sin `role`, sin cierre con `Escape`, sin gestión de foco, y el scroll del body no se bloquea.
- **Top bar**: el punto dorado con `animate-ping` se desplaza y aparece suelto a la izquierda al abrir el menú; el enlace "Ver Cursos & Masterclass" está oculto en móvil.
- **Doble instancia de `TurnoModal`**: la Navbar monta su propio modal y cada página monta otro → dos modales en el DOM.
- Falta `aria-current="page"` en el enlace activo.

> El hitbox de la hamburguesa (44×44) ya fue corregido en la Spec 001 y se conserva.

## 2. Objetivos

1. Navbar **mobile-first y accesible** (WCAG 2.1 AA) en todas las rutas.
2. **Consistencia visual** con la paleta de marca.
3. **Simplificar CTAs** (un primario claro por contexto).
4. Eliminar la **duplicación de `TurnoModal`**.

## 3. Alcance

### RF-1 — Consistencia visual de CTAs
- El CTA primario es `Agenda tu turno` (gradiente de marca).
- WhatsApp pasa a ser **acción secundaria** con estética de marca (outline/fondo rosa), no verde `#00d757`, dentro de la Navbar.

### RF-2 — Simplificación de acciones
- **Desktop:** CTA primario + WhatsApp secundario. Se elimina el `SparkleButton` "Elegí tu curso" (ya existe el enlace "Cursos").
- **Móvil:** máximo 2 acciones: `Agenda tu turno` (primario) y `Escribinos por WhatsApp` (secundario).

### RF-3 — Menú móvil accesible
- Panel a pantalla completa bajo el header; links con `min-h-[44px]`.
- `aria-expanded` + `aria-controls` en la hamburguesa; `aria-current="page"` en el enlace activo.
- Cierre con `Escape` y clic fuera; retorno del foco a la hamburguesa; bloqueo de scroll del `body` mientras está abierto.

### RF-4 — Top bar
- Sustituir el punto `animate-ping` desplazado por un separador estático.
- Mostrar "Ver Cursos & Masterclass" también en móvil (o quitarlo de forma consistente en todos los tamaños) → a confirmar.

### RF-5 — Eliminar la doble instancia de `TurnoModal`
- La Navbar deja de montar su propio `TurnoModal`.
- **Opción recomendada:** contexto único `TurnoContext` + un solo `<TurnoModal>` en `src/main.jsx`; la Navbar y las páginas lo invocan vía hook.
- **Opción mínima:** la Navbar sigue montando su modal y las páginas dejan de montarlo (menos cambios, menos limpio).

### RF-6 — Semántica
- `<header>` + `<nav aria-label="Principal">`, foco visible en todos los interactivos.

## 4. Fuera de alcance

- Rediseño del contenido del `TurnoModal`.
- Resto de secciones de las páginas (home y servicios ya definidos en Spec 001).
- Migración de Tailwind CDN, `robots.txt`/`llms.txt`.

## 5. Requisitos no funcionales

- **RNF-1** Solo clases utilitarias de Tailwind (o estilos ya existentes).
- **RNF-2** Sin dependencias nuevas.
- **RNF-3** Mobile-first; validar a 390×844 y 1440×900.
- **RNF-4** `npm run build` sin errores.
- **RNF-5** Lighthouse móvil: Accessibility ≥ 95 en las 5 rutas.

## 6. Criterios de aceptación

- [ ] CA-1: Un solo CTA primario claro por contexto; sin verde WhatsApp en la Navbar.
- [ ] CA-2: Menú móvil cierra con `Escape`, bloquea scroll y todos sus links ≥ 44 px.
- [ ] CA-3: `aria-expanded`/`aria-controls`/`aria-current` presentes.
- [ ] CA-4: Una sola instancia de `TurnoModal` en el DOM.
- [ ] CA-5: Sin regresiones visuales en desktop.
- [ ] CA-6: `npm run build` OK y Lighthouse Accessibility ≥ 95.

## 7. Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Cambiar el verde de WhatsApp no sea deseado | Confirmar antes de implementar (ver preguntas de aprobación) |
| Centralizar el modal toca varias páginas | Abordarlo como paso aislado y validar cada ruta |
| Menú a pantalla completa cambia el look actual | Mantener colores/tipografía y validar en móvil + desktop |
