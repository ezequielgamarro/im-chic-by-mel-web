# Spec 009 — Ajustes de UI: Navbar, Login y Perfil de Usuario

## 1. Objetivo

Eliminar la redundancia visual del CTA "Agenda tu turno" en la Navbar (ya existen múltiples botones de acción en el sitio), compactar la página de login (`/login`) que hoy resulta visualmente sobredimensionada, y simplificar el perfil de usuario (`/cuenta`) quitando el campo de texto "URL de avatar", conservando únicamente la subida de imagen y su previsualización.

Los tres cambios son de **UI/UX** y **no alteran** la lógica de autenticación, el flujo global de turnos (`TurnoProvider`/`TurnoModalEnhanced`) ni la persistencia de datos del perfil.

## 2. Alcance

### 2.1 Incluye
- `src/components/Navbar.jsx`: quitar el botón CTA "Agenda tu turno" en desktop y en el menú móvil; limpiar lo que quede sin uso como consecuencia directa (handler e imports).
- `src/pages/LoginPage.jsx`: reducir proporciones (ancho de tarjeta, paddings, icono, tipografías, separadores) manteniendo accesibilidad.
- `src/pages/AccountPage.jsx`: quitar el bloque label + input `type="url"` de "URL de avatar"; dejar solo el overlay/botón de subida y la previsualización; corregir el `id`/label duplicado del input file.
- Documentación SDD (esta spec, `plan.md`, `tasks.md`).

### 2.2 Excluye
- Cambios de backend, Supabase, RLS, migraciones o esquemas.
- Cambios de comportamiento en `AuthContext`, `TurnoContext`, `TurnoModal` / `TurnoModalEnhanced`.
- Rediseño del resto de la Navbar (logo, links, barra de anuncios, botones auth) o de otras páginas.
- Subida real de archivos a Supabase Storage / Storage de avatares (hoy el avatar se guarda como data URL en `user_metadata`; se documenta como observación, no se cambia en esta spec).
- Otras inconsistencias preexistentes (p. ej. `formData.email` no inicializado en `AccountPage`, import `UserPlus` posiblemente sin uso en `Navbar`) que no son parte de la petición.

## 3. Requisitos EARS

### 3.1 Navbar — quitar CTA "Agenda tu turno"

**RF-01 (Ubicuo)**  
EL SISTEMA no mostrará el botón CTA "Agenda tu turno" en la Navbar, ni en el bloque de acciones de escritorio ni en el menú desplegable móvil.

**RF-02 (Por estado)**  
MIENTRAS el usuario navega cualquier ruta que renderice `Navbar`, EL SISTEMA conservará intactos el logo, los links de navegación (`Inicio`, `Cursos`, `Tienda MK`, `Servicios`, `Contacto`), la barra de anuncios superior y los botones de autenticación (`Ingresar` / `Panel Admin` / perfil / `Salir`).

**RF-03 (De evento, no regresión del flujo de turnos)**  
CUANDO el usuario pulse "Agendar turno" en `HomeServices.jsx` o `InversionPage.jsx`, EL SISTEMA abrirá `TurnoModalEnhanced` mediante `useTurno().open(...)` provisto por `TurnoProvider`, exactamente como hoy.

**RF-04 (De código, limpieza)**  
EL SISTEMA eliminará del `Navbar` las referencias que queden sin uso a causa de RF-01: la función `handleOpenTurno`, el icono `Calendar` de `lucide-react` y el import/destructuring de `useTurno` (`openTurno`). Cualquier otro import de `lucide-react` aún usado (p. ej. `Menu`, `X`, `ChevronRight`, `User`, `LogIn`, `LogOut`) permanecerá.

### 3.2 LoginPage — diseño más compacto

**RF-05 (Ubicuo)**  
EL SISTEMA renderizará `LoginPage` con dimensiones reducidas respecto del estado actual: contenedor/alto de tarjeta más acotado, paddings menores y jerarquía tipográfica más contenida, de forma consistente entre móvil y escritorio.

**RF-06 (Restricción de accesibilidad)**  
MIENTRAS se aplica la compactación, EL SISTEMA mantendrá: `min-h` ≥ 44px y touch-target en inputs y botón, cada `<label>` asociado a su input vía `htmlFor`/`id`, contraste WCAG 2.1 AA en texto y placeholders, y un único `<h1>` por página.

### 3.3 AccountPage — quitar "URL de avatar"

**RF-07 (Ubicuo)**  
EL SISTEMA no mostrará en `/cuenta` el control de texto de "URL de avatar": ni el label "URL de avatar (o subí una imagen)" ni el `<input type="url" id="avatarUrl">`.

**RF-08 (Por estado)**  
MIENTRAS el usuario ve la sección "Mi Perfil", EL SISTEMA conservará el overlay/botón de subir imagen sobre el avatar y la previsualización del avatar (imagen si existe, icono placeholder si no).

**RF-09 (De código, accesibilidad del input file)**  
EL SISTEMA dejará un único `<label htmlFor="...">` correctamente asociado al `<input type="file">` (sin `id` duplicado) y aportará al input un nombre accesible (texto `sr-only` o `aria-label`, p. ej. "Cambiar foto de perfil").

**RF-10 (De evento, persistencia)**  
CUANDO el usuario seleccione una imagen con el input file, EL SISTEMA la leerá como data URL y actualizará la previsualización; CUANDO el usuario pulse "Guardar cambios", EL SISTEMA persistirá el `avatar_url` en `user_metadata` vía `updateProfile`, sin requerir el campo de texto eliminado.

### 3.4 Verificación

**RF-11 (De evento)**  
CUANDO el implementador ejecute `npm run build`, EL SISTEMA compilará sin errores ni advertencias introducidas por estos cambios.

## 4. Restricciones y Constitución

- **Mobile-first**: los tres cambios se validan primero en viewport móvil.
- **Estabilidad estructural** (docs/constitution.md §2): `Navbar` y el flujo `TurnoModal` son componentes protegidos; este cambio de `Navbar` se limita a eliminar el CTA y su código muerto, sin alterar el resto.
- **Estética consistente** (§3): usar exclusivamente clases utilitarias Tailwind, mantener la paleta de marca (`#FFF0F3`, `#5A0B22`, `#7A1333`, `#FFC9D6`, dorado) y los estilos globales existentes (`premium-card`, `premium-chip`, `premium-or`, `premium-header`).
- **Validación visual** (§4): toda tarea se comprueba en la interfaz antes de darse por terminada.
- **SDD** (§5): esta spec + `plan.md` + `tasks.md` preceden cualquier edición de código.

## 5. Criterios de Aceptación (CA)

| ID | Criterio |
|----|----------|
| CA-01 | En desktop (≥ md) la Navbar no muestra ningún botón "Agenda tu turno". |
| CA-02 | En móvil (< md) el menú desplegable no muestra ningún botón "Agenda tu turno". |
| CA-03 | Logo, links de navegación, barra superior y botones auth de la Navbar siguen visibles y funcionando (Ingresar, Panel Admin, perfil, Salir). |
| CA-04 | El flujo de turnos sigue operativo: "Agendar turno" en Home (`/`) y Servicios (`/servicios` e `/inversion`) abre `TurnoModalEnhanced`. |
| CA-05 | `grep` confirma que `Navbar.jsx` ya no referencia `handleOpenTurno`, `Calendar` ni `useTurno`/`openTurno`, y `npm run build` pasa. |
| CA-06 | `/login` se percibe visualmente más pequeño/compacto (ancho de tarjeta, icono, paddings y tipografías reducidos) en móvil y escritorio. |
| CA-07 | `/login` mantiene inputs y botón con área táctil ≥ 44px, labels asociados, contraste AA y un solo `<h1>`. |
| CA-08 | `/cuenta` ya no muestra label ni input de "URL de avatar". |
| CA-09 | `/cuenta` conserva el botón de subida sobre el avatar y la previsualización; el input file tiene una única asociación label/`id` y un nombre accesible. |
| CA-10 | Al subir una imagen se actualiza la previsualización y, al guardar, el `avatar_url` se persiste y vuelve a mostrarse al recargar `/cuenta`. |
| CA-11 | `npm run build` sin errores; sin regresión en `/`, `/servicios`, `/inversion`, `/cursos`, `/tienda`, `/contacto`. |
| CA-12 | `MEMORY.md` actualizado al cierre (estado y decisión de quitar el CTA del Navbar). |

## 6. Observaciones / Riesgos (fuera de alcance salvo decisión)

- El avatar se guarda hoy como **data URL** (base64) dentro de `user_metadata`; imágenes grandes pueden exceder límites del JWT/metadata. No se corrige aquí; se sugiere spec futura de Storage de avatares.
- `AccountPage` usa `formData.email` para el input deshabilitado, pero `email` nunca se inicializa en el estado (el campo sale vacío). Preexistente, fuera de alcance.
- `Navbar` importa `UserPlus` sin uso visible. Preexistente; su limpieza no es necesaria para esta spec.

## 7. Estado

- **Estado**: Borrador listo para revisión y aprobación.
- **Fecha**: 2026-10-03
- **Autor**: Coordinador SDD
