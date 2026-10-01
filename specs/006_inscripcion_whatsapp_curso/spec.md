# Spec 006 — Inscripción a cursos por WhatsApp + limpieza del selector de turnos

- **ID:** 006
- **Estado:** Aprobada / en implementación
- **Fecha:** 2026-10-01
- **Rutas afectadas:** `/cursos` (`ImChicLanding.jsx`) y `TurnoModal` (global)
- **Constitución de referencia:** `docs/constitution.md`

## 1. Contexto

- En `/cursos`, el botón **"Quiero Inscribirme Ahora"** abre WhatsApp con un mensaje genérico
  ("Quiero más información sobre I'm Chic Academy"), sin indicar curso, valor ni detalles.
  La página tiene 2 pestañas: Masterclass ($65.000) y Formación Integral Mary Kay ($130.000/mes).
- En el `TurnoModal` ("Servicio a Realizar") siguen apareciendo opciones de **Cursos** y **Asesoría**
  que ya no corresponden a un turno de servicio.

## 2. Objetivo

1. Que el CTA de inscripción lleve a WhatsApp con un mensaje que indique **el curso activo, su valor y detalles**.
2. Quitar del selector de turnos las opciones de **Cursos** y **Asesoría**.

## 3. Alcance

### RF-1 — Mensaje de inscripción dinámico (`/cursos`)
- El mensaje depende de la pestaña activa:
  - **Masterclass Automaquillaje** → valor `$65.000`, "2 clases prácticas personalizadas".
  - **Formación Integral Mary Kay** → valor `$130.000 por mes`, "Duración: 2 meses (1 clase práctica por semana). En 2 cuotas mensuales de $130.000".
- El enlace apunta a `https://wa.me/5493813553492` con el texto codificado.

### RF-2 — Selector de turnos (`TurnoModal`)
- Eliminar `'Cursos: Masterclass Automaquillaje'` y `'Asesoría: Cuidado Facial Mary Kay'`.
- Quedan 10 opciones (Uñas, Cabello, Maquillaje).

## 4. Fuera de alcance

- Cambiar precios o textos de los cursos.
- Otras CTAs de la página de cursos.

## 5. Requisitos no funcionales

- Sin dependencias nuevas; `npm run build` OK; sin errores de consola.

## 6. Criterios de aceptación

- [ ] CA-1: Con la pestaña Masterclass, el botón abre WhatsApp con curso + `$65.000`.
- [ ] CA-2: Con la pestaña Formación Integral, el botón abre WhatsApp con curso + `$130.000 por mes`.
- [ ] CA-3: El selector de turnos ya no muestra opciones de Cursos ni Asesoría.
- [ ] CA-4: `npm run build` OK.
