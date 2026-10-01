# Plan de implementación — Spec 006

Implementa `specs/006_inscripcion_whatsapp_curso/spec.md`.

## 1. `ImChicLanding.jsx` — MODIFICAR
- Tras `whatsappUrl` (~línea 91), agregar `courseInfo` (según `activeTab`) y
  `whatsappInscripcionUrl` (mensaje con curso, valor y detalle).
- En el `LimeButton` (~línea 868) cambiar `href={whatsappUrl}` → `href={whatsappInscripcionUrl}`.

## 2. `src/components/TurnoModal.jsx` — MODIFICAR
- Quitar de `SERVICE_OPTIONS`:
  - `'Cursos: Masterclass Automaquillaje'`
  - `'Asesoría: Cuidado Facial Mary Kay'`

## Validación
1. `npm run build`.
2. Chrome DevTools MCP:
   - `/cursos`: leer el `href` del CTA en pestaña Masterclass y en Formación Integral; verificar el texto codificado.
   - Abrir `TurnoModal` y listar las opciones (10, sin Cursos/Asesoría).
