# Spec 015 — Navbar admin simplificada + CustomCheckbox animado (panel admin)

## 1. Objetivo

Dos tareas quirúrgicas aprobadas por el usuario, sin rodeos:

1. **Navbar admin**: cuando el usuario logueado es admin, la Navbar debe mostrar **solo** "Panel Admin" (bordó) y "Salir"; se **oculta** el botón con el nombre de usuario (Link a `/cuenta`) en desktop **y** en el menú móvil.
2. **CustomCheckbox animado**: nuevo componente `src/components/CustomCheckbox.jsx`, réplica visual del checkbox animado de referencia (Uiverse "Checkbox by SelfMadeSystem", licencia MIT), reimplementado con el stack real del proyecto (Tailwind CDN + `<style>` local namespaced) **en vez de styled-components**. Se reemplazan los checkboxes nativos del panel admin en `TurnSettingsTab.jsx` (días de la semana) y `ServicesTab.jsx` (`is_active` / "Visible en el TurnoModal").

## 2. Alcance

### 2.1 Incluye

- `src/components/Navbar.jsx`: `{!isAdmin && (...)}` envolviendo el `<Link to="/cuenta">` del desktop (~línea 161) y el del menú móvil (~línea 279). Carrito, Panel Admin, Salir, login, links y hamburguesa **intactos**.
- `src/components/CustomCheckbox.jsx` (nuevo): props `{ label, checked, onChange }`; mismo SVG de la referencia (`viewBox="0 0 64 64"`, `height="2em"`, `width="2em"`, path literal con `pathLength="575.0541381835938"` y `className` = path); misma estructura (`label > input + svg + span`); mismos valores de animación (`stroke-dasharray: 241 9999999` → `70.5096664428711 9999999`; `stroke-dashoffset: 0` → `-262.2723388671875`; transición `0.5s ease`); stroke de marca `#6a1b29`, label `#4a0d1c` / 15px. Bloque `<style>` local **namespaced** `.imchic-cbx-*` (patrón LoginPage/AddToCalendarButton).
- Accesibilidad AA (mínimos que no rompen el visual): input `sr-only` (enfocable con teclado, no `display: none`); foco visible vía `.imchic-cbx-container:focus-within` (stroke `#5A0B22` + outline); `min-h-[44px]` en el contenedor; `aria-hidden="true"` en el `<svg>`; `@media (prefers-reduced-motion: reduce)` desactiva la transición del path.
- `src/components/admin/TurnSettingsTab.jsx`: el checkbox nativo de los días pasa a `<CustomCheckbox label={day.label} checked={isOpen} onChange={() => handleDayToggle(day.key)} />`; se elimina el `<label>` nativo duplicado; lógica `isOpen`/`handleDayToggle` **sin cambios**. Import del componente.
- `src/components/admin/ServicesTab.jsx`: el checkbox `is_active` pasa a `<CustomCheckbox label="Visible en el TurnoModal" checked={form.is_active} onChange={...} />`; lógica de estado (`setForm`) conservada. Import del componente.
- Documentación: esta spec (carpeta `specs/015_admin_navbar_checkbox/`).

### 2.2 Excluye

- Instalar **cualquier** dependencia (styled-components prohibido; `package.json` intacto).
- Modificar `RegisterPage.jsx` ni `CookieBanner.jsx` (sus checkboxes no son del panel admin).
- Tocar carrito, "Panel Admin", "Salir", login, links ni hamburguesa de la Navbar.
- Cambiar la lógica de `businessHours`/`handleDayToggle` ni la de `form.is_active`.
- Actualizar `MEMORY.md` (pedido explícito del orquestador de esta tarea).

## 3. Requisitos (RF)

- **RF-01**: MIENTRAS el usuario logueado sea admin, EL SISTEMA renderizará en la Navbar (desktop y menú móvil) **solo** "Panel Admin" y "Salir"; el Link a `/cuenta` con el nombre NO se renderizará.
- **RF-02**: MIENTRAS el usuario logueado NO sea admin, EL SISTEMA mostrará el Link `/cuenta` con el nombre exactamente como antes (sin regresión).
- **RF-03**: EL SISTEMA ofrecerá `CustomCheckbox({ label, checked, onChange })` como drop-in del `<input type="checkbox">` nativo: mismo SVG y misma animación de la referencia, con `<style>` local namespaced `.imchic-cbx-*` (sin styled-components, sin dependencias nuevas).
- **RF-04**: MIENTRAS se use `CustomCheckbox`, EL SISTEMA garantizará AA: input enfocable con teclado (`sr-only`), foco visible, área táctil ≥ 44px, SVG `aria-hidden` y `prefers-reduced-motion` respetado.
- **RF-05**: EL SISTEMA usará `CustomCheckbox` en los checkboxes del panel admin de `TurnSettingsTab.jsx` (días) y `ServicesTab.jsx` (`is_active`), conservando la lógica de estado existente.

## 4. Criterios de Aceptación (CA)

| ID | Criterio |
|----|----------|
| CA-01 | Como admin, la Navbar desktop y móvil muestran solo "Panel Admin" + "Salir"; grep confirma `{!isAdmin && (` en ambos lugares y no hay Link `/cuenta` visible para admin. |
| CA-02 | Como usuario no admin, el botón con el nombre (`/cuenta`) se ve igual que antes. |
| CA-03 | `CustomCheckbox` replica la referencia: mismo SVG/path/`pathLength`, mismos dasharray/dashoffset/transiciones; visual bordó de marca. |
| CA-04 | Accesibilidad: input `sr-only` enfocable, foco visible al tabular, `min-h-[44px]`, `aria-hidden` en el svg, `prefers-reduced-motion` desactiva la transición. |
| CA-05 | TurnSettingsTab: los días usan `CustomCheckbox` con `isOpen`/`handleDayToggle` intactos; ServicesTab: `is_active` usa `CustomCheckbox` con `setForm` intacto. |
| CA-06 | `RegisterPage.jsx` y `CookieBanner.jsx` **no** modificados. |
| CA-07 | Sin dependencias nuevas (`package.json` sin cambios); solo Tailwind + `<style>` local namespaced. |
| CA-08 | `npm run build` exit 0 sin warnings introducidos. |

## 5. Decisión arquitectónica

- **NO se instala styled-components.** La referencia del checkbox venía como componente styled-components; el proyecto usa Tailwind vía CDN + bloques `<style>` locales con CSS puro namespaced (precedentes aprobados: `LoginPage.jsx`, `AddToCalendarButton.jsx`, `DownloadButton.jsx`, `SparkleButton.jsx`). Se replica la API, el SVG y los valores de animación exactos, reemplazando styled-components por un `<style>` local `.imchic-cbx-*` (constitución §3; spec 014 RF-10 ya fijó este patrón).
- La Navbar es componente protegido (constitución §2 / spec 002); este cambio está **autorizado explícitamente** por el usuario y acotado a ocultar `/cuenta` para admin en los dos lugares indicados.

## 6. Verificación

- `npm run build` → reporte literal del resultado.
- Grep en `Navbar.jsx`: `{!isAdmin && (` presente en desktop y móvil; sin Link `/cuenta` fuera de esa guarda.
- Grep: `CustomCheckbox` importado y usado en `TurnSettingsTab.jsx` y `ServicesTab.jsx`.

## 7. Estado

- **Estado**: Implementada (TAREA 1 + TAREA 2).
- **Fecha**: 2026-10-04
- **Autor**: Implementer SDD (subagente)
