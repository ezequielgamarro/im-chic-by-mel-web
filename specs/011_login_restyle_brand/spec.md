# Spec 011 — Restyle de Login: Card Oscura, Inputs Píldora y Animaciones de Entrada

## 1. Objetivo

Aplicar a la página de login (`/login`) un estilo visual tipo "card oscura con inputs tipo píldora y animaciones de entrada", replicando un diseño de referencia pero **adaptado a la paleta de marca** de Im Chic by Mel (borgoña profundo, dorado, rosa). El resultado debe sentirse premium y coherente con la identidad visual del sitio, conservando toda la lógica de autenticación existente y la accesibilidad WCAG 2.1 AA.

El cambio es **exclusivamente visual/UI**: no altera `useAuth`, el estado de carga, la validación, la redirección ni el flujo de Google.

## 2. Alcance

### 2.1 Incluye
- `src/pages/LoginPage.jsx`: rediseño completo de la capa visual (fondo, tarjeta, logo, título, inputs, botón, separador, links) manteniendo intacta la lógica.
- `src/components/GoogleButton.jsx`: ajuste menor de su contenedor/clases para combinar sobre la tarjeta oscura (el botón ya es claro/blanco y combina; solo se ajusta el wrapper si hace falta).
- Bloque `<style>` local dentro de `LoginPage.jsx` para los `@keyframes` de animación de entrada (bounce) y la regla `prefers-reduced-motion`.
- Documentación SDD (esta spec, `plan.md`, `tasks.md`).

### 2.2 Excluye
- Cambios de backend, Supabase, RLS, migraciones o esquemas.
- Cambios de comportamiento en `AuthContext`, `ProtectedRoute`, `GoogleButton` (lógica OAuth).
- Rediseño de otras páginas (Home, Servicios, Tienda, Cursos, Contacto, Registro, Cuenta, Admin).
- Instalación de dependencias (prohibido styled-components o cualquier paquete nuevo; solo Tailwind vía CDN + `<style>` local).
- Cambios en la Navbar, Footer o TurnoModal.

## 3. Requisitos EARS

### 3.1 Fondo de página

**RF-01 (Ubicuo)**  
EL SISTEMA renderizará el fondo de `/login` con un degradado en tonos de marca: borgoña profundo `#3F0516` → `#5A0B22`, con destellos sutiles dorado `#D4AF37` y rosa `#FFC9D6` (radiales o lineales de baja opacidad).

**RF-02 (Restricción de rendimiento)**  
MIENTRANTE se muestren los destellos, EL SISTEMA los implementará con gradientes CSS (no imágenes pesadas) para no penalizar el rendimiento móvil.

### 3.2 Tarjeta contenedora

**RF-03 (Ubicuo)**  
EL SISTEMA presentará el formulario dentro de una tarjeta tipo "glass" sobre el fondo oscuro: fondo translúcido/oscuro de marca, borde dorado sutil, esquinas muy redondeadas (`rounded-3xl`), sombra, ancho máximo ~22rem (340px), centrada y responsive (mobile-first).

### 3.3 Logo

**RF-04 (Ubicuo)**  
EL SISTEMA mostrará el logo de I'm Chic arriba de la tarjeta, dentro de un círculo blanco, usando `/assets/logo-im-chic.png`.

**RF-05 (De evento, fallback)**  
CUANDO la imagen del logo no cargue (onError), EL SISTEMA mostrará el texto "IC" como fallback, con el mismo criterio que el Navbar.

### 3.4 Título y subtítulo

**RF-06 (Ubicuo)**  
EL SISTEMA mostrará un único `<h1>` con la tipografía serif de la marca, texto "Panel de Administración" (sin cambiar semántica), estilizado grande arriba de la tarjeta, más un subtítulo breve.

### 3.5 Inputs

**RF-07 (Ubicuo)**  
EL SISTEMA renderizará los inputs (email y contraseña) con forma de píldora (`rounded-full`), fondo translúcido claro sobre la tarjeta oscura, texto claro, placeholder en rosa/dorado translúcido, padding tipo 13px 18px.

**RF-08 (De evento, foco)**  
CUANDO el usuario enfoque un input, EL SISTEMA mostrará un anillo dorado y una animación de rebote (keyframe bounce).

**RF-09 (Restricción de accesibilidad)**  
MIENTRAS se aplica el estilo píldora, EL SISTEMA conservará las etiquetas `<label>` visibles y asociadas a sus inputs vía `htmlFor`/`id`, y mantendrá área táctil ≥ 44px.

### 3.6 Botón submit

**RF-10 (Ubicuo)**  
EL SISTEMA renderizará el botón "Ingresar" como píldora con degradado en tonos de marca (dorado/borgoña), altura mínima 44px.

**RF-11 (De evento, hover)**  
CUANDO el usuario pase el cursor sobre el botón, EL SISTEMA invertirá el degradado a borgoña con texto dorado, con transición suave.

### 3.7 Animaciones de entrada

**RF-12 (Ubicuo)**  
EL SISTEMA aplicará animaciones de entrada tipo bounce: `bounce` para email, `bounce1` para password, `bounce2` para título/botón, mediante un `<style>` local con `@keyframes`.

**RF-13 (Restricción de accesibilidad)**  
MIENTRAS se apliquen las animaciones, EL SISTEMA las desactivará cuando el usuario tenga configurado `prefers-reduced-motion: reduce`.

### 3.8 Separador y GoogleButton

**RF-14 (Ubicuo)**  
EL SISTEMA mostrará el separador "o" y el `GoogleButton` (ya es claro/blanco y combina) sobre la tarjeta oscura, ajustando su contenedor si hace falta.

### 3.9 Links

**RF-15 (Ubicuo)**  
EL SISTEMA mostrará los links "¿Olvidé mi contraseña?" y "¿No tenés cuenta? Registrarse" en dorado/rosa con buen contraste sobre el fondo oscuro.

### 3.10 Verificación

**RF-16 (De evento)**  
CUANDO el implementador ejecute `npm run build`, EL SISTEMA compilará sin errores ni advertencias introducidas por estos cambios.

## 4. Restricciones y Constitución

- **Mobile-first** (§1): el diseño se valida primero en viewport móvil (320px+).
- **Estabilidad estructural** (§2): no se modifican componentes protegidos (Navbar, TurnoModal). Solo se toca `LoginPage.jsx` y, si hace falta, el wrapper de `GoogleButton.jsx`.
- **Estética consistente** (§3): usar exclusivamente clases utilitarias Tailwind + un bloque `<style>` local para keyframes. **Prohibido** instalar styled-components o cualquier dependencia. Paleta de marca: `#3F0516`, `#5A0B22`, `#7A1333`, `#D4AF37`, `#FFC9D6`, `#FFF0F3`.
- **Validación visual** (§4): toda tarea se comprueba en la interfaz antes de darse por terminada.
- **SDD** (§5): esta spec + `plan.md` + `tasks.md` preceden cualquier edición de código.

## 5. Criterios de Aceptación (CA)

| ID | Criterio |
|----|----------|
| CA-01 | El fondo de `/login` muestra un degradado borgoña profundo (`#3F0516` → `#5A0B22`) con destellos sutiles dorado y rosa. |
| CA-02 | La tarjeta es tipo glass: fondo translúcido oscuro, borde dorado sutil, `rounded-3xl`, sombra, ancho máx ~22rem (340px), centrada y responsive. |
| CA-03 | El logo de I'm Chic aparece arriba de la tarjeta dentro de un círculo blanco; si la imagen falla, se muestra "IC". |
| CA-04 | Hay un único `<h1>` serif con "Panel de Administración" y un subtítulo breve. |
| CA-05 | Los inputs son píldora (`rounded-full`), fondo translúcido claro, texto claro, placeholder rosa/dorado translúcido, padding ~13px 18px. |
| CA-06 | Al enfocar un input se muestra anillo dorado y animación de rebote. |
| CA-07 | Los `<label>` siguen visibles y asociados (`htmlFor`/`id`); área táctil ≥ 44px. |
| CA-08 | El botón submit es píldora con degradado dorado/borgoña; en hover invierte a borgoña con texto dorado; min-h 44px. |
| CA-09 | Las animaciones de entrada (bounce, bounce1, bounce2) se aplican y se desactivan con `prefers-reduced-motion: reduce`. |
| CA-10 | El separador "o" y el GoogleButton se ven correctamente sobre la tarjeta oscura. |
| CA-11 | Los links "¿Olvidé mi contraseña?" y "Registrarse" usan dorado/rosa con contraste AA. |
| CA-12 | La lógica de login está intacta: useAuth, loading con spinner, redirección si isAdmin, handleSubmit con validación, setError con role="alert", navegación a /admin, GoogleButton, link de registro. |
| CA-13 | `npm run build` sin errores; sin regresión en otras rutas. |
| CA-14 | `MEMORY.md` actualizado al cierre. |

## 6. Observaciones / Riesgos (fuera de alcance salvo decisión)

- El fallback "IC" del logo debe usar el mismo criterio que el Navbar (revisar `src/components/Navbar.jsx` para consistencia).
- Las animaciones bounce deben ser sutiles para no afectar la percepción de estabilidad ni el rendimiento en móviles de gama baja.
- Si el contraste de algún texto claro sobre fondo translúcido no alcanza AA, se ajusta la opacidad del fondo de la tarjeta (no el color del texto).
- No se toca `AuthContext` ni `ProtectedRoute`; cualquier cambio de lógica queda fuera de esta spec.

## 7. Estado

- **Estado**: Corrección aplicada — tema claro + solo logo, sin título visible.
- **Fecha**: 2026-10-04
- **Autor**: Coordinador SDD

### Nota de corrección (2026-10-04)

El usuario solicitó revertir al tema claro original de la app y eliminar el título visible "Panel de Administración". Se aplicaron los siguientes cambios en `src/pages/LoginPage.jsx`:

- **Fondo**: se restauró el tema claro `bg-[#FFF0F3]` con texto `text-[#5A0B22]`; se mantuvieron destellos sutiles rosa/dorado de baja opacidad.
- **Tarjeta**: blanca (`bg-white`) con borde `border-[#FFC9D6]/50` y `shadow-2xl`.
- **Logo**: círculo blanco con borde suave `border-[#FFC9D6]`, centrado arriba de la tarjeta.
- **Título**: se eliminó el `<h1>` visible "Panel de Administración" y el subtítulo; se agregó `<h1 className="sr-only">Iniciar sesión</h1>` para accesibilidad.
- **Inputs**: píldora en tema claro (`bg-[#FFF0F3]`, `text-[#5A0B22]`, foco `ring-[#7A1333]`).
- **Botón submit**: píldora con degradado de marca claro (`from-[#5A0B22] via-[#7A1333] to-[#5A0B22]`, texto blanco).
- **Separador y links**: ajustados a tonos claros (`#FFC9D6`, `#7A1333`).
- **Animaciones**: se conservaron los keyframes bounce/bounce1/bounce2 y la regla `prefers-reduced-motion: reduce`.
- **Lógica intacta**: `useAuth`, `loading` spinner, redirección `isAdmin`, `handleSubmit`, `setError` con `role="alert"`, `navigate('/admin')`, `GoogleButton` y links sin cambios.
