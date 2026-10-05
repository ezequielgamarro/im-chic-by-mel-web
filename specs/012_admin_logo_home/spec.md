# Spec 012 — Botón Logo "Volver al inicio" en la cabecera del Panel Admin

## 1. Objetivo

Agregar en la cabecera (header) del Panel de Administración (`/admin`), a la izquierda, el logo de I'm Chic by Mel como **botón navegable** que permita al usuario volver al inicio (`/`). El cambio es **exclusivamente visual/UI**: no altera la lógica de autenticación, productos, turnos, settings ni el cierre de sesión.

## 2. Alcance

### 2.1 Incluye
- `src/pages/AdminPage.jsx`: modificación del bloque `<header>` para agregar un contenedor flex a la izquierda con:
  - (a) Un `<Link to="/" aria-label="Volver al inicio" title="Volver al inicio">` que envuelve un círculo blanco con borde rosa y la imagen `/assets/logo-im-chic.png` (con `onError` → "IC", criterio Navbar).
  - (b) Al lado, el texto existente "Im Chic by Mel" (`font-script`) + el `<h1>` "Panel de Administración" (sin cambios).
- Documentación SDD (esta spec, `plan.md`, `tasks.md`).

### 2.2 Excluye
- Cambios de backend, Supabase, RLS, migraciones o esquemas.
- Cambios de comportamiento en `AuthContext`, `ProtectedRoute`, `ProductList`, `ProductForm`, `TurnosTab`, `TurnSettingsTab`.
- Rediseño de otras páginas (Home, Servicios, Tienda, Cursos, Contacto, Registro, Cuenta, Login).
- Instalación de dependencias (solo Tailwind vía CDN).
- Cambios en la Navbar, Footer o TurnoModal.
- Modificar tabs, secciones, lógica de productos/turnos/settings, cierre de sesión.

## 3. Requisitos EARS

### 3.1 Botón-logo

**RF-01 (Ubicuo)**  
EL SISTEMA renderizará en la cabecera de `/admin`, a la izquierda, un `<Link to="/">` con `aria-label="Volver al inicio"` y `title="Volver al inicio"` que envuelve un círculo blanco con borde rosa (`border-[#FFC9D6]`) y la imagen `/assets/logo-im-chic.png`.

**RF-02 (De evento, fallback)**  
CUANDO la imagen del logo no cargue (`onError`), EL SISTEMA mostrará el texto "IC" como fallback, con el mismo criterio que el Navbar.

**RF-03 (Restricción de accesibilidad)**  
MIENTRAS se muestre el botón-logo, EL SISTEMA garantizará un área táctil ≥ 44px (`min-w-[44px] min-h-[44px]`) y un foco visible (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]`).

### 3.2 Texto existente

**RF-04 (Ubicuo)**  
EL SISTEMA conservará el texto "Im Chic by Mel" (`font-script text-lg leading-none text-[#7A1333]`) y el `<h1>` "Panel de Administración" (`font-serif text-xl sm:text-2xl font-bold`) al lado del logo, sin cambios en su contenido ni semántica.

### 3.3 Layout

**RF-05 (Ubicuo)**  
EL SISTEMA mantendrá el layout actual del header: tabs al centro, botón "Cerrar sesión" a la derecha, sin romper la estructura responsive (mobile-first).

**RF-06 (Restricción de diseño)**  
MIENTRAS se agregue el logo, EL SISTEMA usará exclusivamente clases utilitarias Tailwind y no instalará dependencias nuevas.

### 3.4 Verificación

**RF-07 (De evento)**  
CUANDO el implementador ejecute `npm run build`, EL SISTEMA compilará sin errores ni advertencias introducidas por estos cambios.

## 4. Restricciones y Constitución

- **Mobile-first** (§1): el diseño se valida primero en viewport móvil (320px+).
- **Estabilidad estructural** (§2): no se modifican componentes protegidos (Navbar, TurnoModal). Solo se toca `AdminPage.jsx`.
- **Estética consistente** (§3): usar exclusivamente clases utilitarias Tailwind. Paleta de marca: `#5A0B22`, `#7A1333`, `#D4AF37`, `#FFC9D6`, `#FFF0F3`.
- **Validación visual** (§4): toda tarea se comprueba en la interfaz antes de darse por terminada.
- **SDD** (§5): esta spec + `plan.md` + `tasks.md` preceden cualquier edición de código.

## 5. Criterios de Aceptación (CA)

| ID | Criterio |
|----|----------|
| CA-01 | El header de `/admin` muestra a la izquierda un `<Link to="/">` con `aria-label="Volver al inicio"` y `title="Volver al inicio"`. |
| CA-02 | El link envuelve un círculo blanco con borde rosa (`border-[#FFC9D6]`) y la imagen `/assets/logo-im-chic.png`. |
| CA-03 | Si la imagen del logo falla, se muestra "IC" como fallback (criterio Navbar). |
| CA-04 | El botón-logo tiene área táctil ≥ 44px y foco visible. |
| CA-05 | El texto "Im Chic by Mel" (`font-script`) y el `<h1>` "Panel de Administración" se muestran al lado del logo, sin cambios. |
| CA-06 | El layout del header se mantiene: tabs al centro, "Cerrar sesión" a la derecha, responsive. |
| CA-07 | No se modifican tabs, secciones, lógica de productos/turnos/settings ni cierre de sesión. |
| CA-08 | `npm run build` sin errores; sin regresión en otras rutas. |
| CA-09 | `MEMORY.md` actualizado al cierre. |

## 6. Observaciones / Riesgos (fuera de alcance salvo decisión)

- El fallback "IC" del logo debe usar el mismo criterio que el Navbar (revisar `src/components/Navbar.jsx` para consistencia).
- El header actual usa `flex flex-wrap items-center justify-between gap-3`; el nuevo contenedor izquierdo debe integrarse sin romper el wrap en móvil.
- No se toca `AuthContext` ni `ProtectedRoute`; cualquier cambio de lógica queda fuera de esta spec.

## 7. Estado

- **Estado**: Borrador listo para revisión y aprobación.
- **Fecha**: 2026-10-04
- **Autor**: Coordinador SDD
