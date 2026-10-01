---
name: frontend-design
description: >
  Guía de diseño frontend para el proyecto Im Chic by Mel. Úsala al crear,
  rediseñar o auditar componentes de UI (React + Tailwind vía CDN) para
  asegurar una interfaz limpia, mobile-first, accesible (WCAG 2.1 AA) y
  consistente con la identidad visual de la marca y la Constitución del
  proyecto. Aplica a secciones, tarjetas, botones, carruseles, modales y
  formularios.
---

# Skill: Frontend Design — Im Chic by Mel

Propósito: producir interfaces **limpias, accesibles y de alta conversión** sin
romper la identidad visual ni la estructura existente.

## Reglas no negociables
1. **Mobile-first real:** diseña y valida primero a 390 px de ancho; luego escala
   a `sm` (640), `md` (768), `lg` (1024), `xl` (1280).
2. **Áreas táctiles ≥ 44×44 px** en todo elemento interactivo, con separación
   mínima de 8 px entre acciones adyacentes.
3. **Jerarquía de títulos correcta y única:** un solo `<h1>` por página, luego
   `<h2>` de sección y `<h3>` de subsección. Nunca salte niveles (`h2` → `h4`).
4. **Solo clases utilitarias de Tailwind** (vía CDN). Evita CSS ad-hoc salvo las
   utilidades ya definidas en `index.html`.
5. **Contraste ≥ 4.5:1** en texto normal y ≥ 3:1 en texto grande / íconos
   funcionales.

## Paleta de marca (usar estos tokens)
| Token | Hex | Uso |
| --- | --- | --- |
| `#5A0B22` | burgundy | Texto principal, CTA primario |
| `#7A1333` | burgundyLight | Gradientes, estados activos |
| `#FFC9D6` | pink | Fondos de acento |
| `#FFF0F3` / `#FFF8FA` | pinkLight/Lighter | Fondos de sección |
| `#D87F95` | pinkDeep | Acentos, etiquetas |
| `#D4AF37` / `#F7E7B4` | gold / goldLight | Detalles premium |
| `#FFFFFF` | — | Superficies |

Tipografías: `font-serif` (Playfair Display) para títulos, `font-sans`
(Plus Jakarta Sans) para cuerpo, `font-display` (Cormorant) y `font-script`
(Alex Brush) solo como acento decorativo.

## Patrones aprobados
- **CTA primario:** píldora con `bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22]`,
  `min-h-11`, ícono `Calendar` en `text-[#F7E7B4]`.
- **Verde WhatsApp (`#25D366`)**: reservarlo a la acción de WhatsApp; no usarlo
  como CTA primario de la marca.
- **Animaciones:** Framer Motion con `initial` visible-friendly y respeto a
  `prefers-reduced-motion`. Nunca dejar contenido permanentemente en
  `opacity: 0` sin fallback.
- **Estados:** siempre incluir `hover`, `active`, `focus-visible` y `disabled`.

## Checklist antes de dar por terminada una tarea
Ver `references/accessibility-checklist.md`.

## Anti-patrones prohibidos
- Dots de carrusel de menos de 24 px de área.
- `div` clicable en lugar de `button`/`a`.
- Texto gris claro sobre blanco (< 4.5:1).
- Modales sin `role="dialog"` / `aria-modal` / cierre con `Escape`.
- Múltiples CTAs primarios compitiendo en la misma vista.
