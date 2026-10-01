# Checklist de accesibilidad y UI (WCAG 2.1 AA)

Usar antes de cerrar cualquier tarea de UI.

## Estructura
- [ ] Un único `<h1>` por página.
- [ ] Encabezados en orden descendente (`h1 → h2 → h3`), sin saltos.
- [ ] Cada sección tiene su encabezado descriptivo.
- [ ] `lang="es"` presente en `<html>`.

## Interacción táctil
- [ ] Todos los `button`/`a` miden ≥ 44×44 px (o tienen área táctil de 44 px).
- [ ] Separación ≥ 8 px entre acciones contiguas.
- [ ] Estado `:active` visible.
- [ ] Navegación por teclado: `Tab`, `Enter`/`Space`, flechas en carruseles.
- [ ] Foco visible (`focus-visible`) en todos los interactivos.

## Imágenes y multimedia
- [ ] Toda `<img>` tiene `alt` (o `alt=""` si es decorativa).
- [ ] `loading="lazy"` en imágenes fuera del primer viewport.
- [ ] `width`/`height` o `aspect-ratio` para evitar CLS.

## Contraste
- [ ] Texto normal ≥ 4.5:1; texto grande (≥ 24 px o ≥ 19 px bold) ≥ 3:1.
- [ ] Íconos funcionales ≥ 3:1.
- [ ] Verificar footer y textos secundarios (zonas típicas de fallo).

## Carruseles
- [ ] `role="region"` + `aria-roledescription="carrusel"` + `aria-label`.
- [ ] Controles anterior/siguiente ≥ 44×44 px con `aria-label`.
- [ ] Indicadores con área táctil ≥ 24×24 px y `aria-current`.
- [ ] Autoplay pausable y desactivado con `prefers-reduced-motion`.

## Modales
- [ ] `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.
- [ ] Cierre con `Escape` y clic en overlay.
- [ ] Foco inicial dentro del modal y retorno del foco al cerrar.
- [ ] Bloqueo de scroll del body mientras está abierto.

## Responsive
- [ ] Probado a 390×844 (móvil) y 1440×900 (escritorio).
- [ ] Sin scroll horizontal (`scrollWidth == clientWidth`).
- [ ] Sin solapamientos ni recortes de texto.
