# Tasks 011 — Restyle de Login: Card Oscura, Inputs Píldora y Animaciones de Entrada

## T1 — Fondo de página con degradado y destellos
- **Archivo**: `src/pages/LoginPage.jsx`
- **Cambio**: Reemplazar el `div` raíz (`bg-[#FFF0F3]`) por un contenedor con degradado lineal `bg-gradient-to-br from-[#3F0516] via-[#5A0B22] to-[#3F0516]` y dos `div` absolutos con radiales dorado (`#D4AF37`) y rosa (`#FFC9D6`) de baja opacidad (destellos sutiles).
- **Criterio de hecho**: El fondo muestra degradado borgoña con destellos dorado/rosa; no hay imágenes pesadas.
- **Verificación**: Revisar en móvil y escritorio; `npm run build` pasa.

## T2 — Tarjeta contenedora tipo glass
- **Archivo**: `src/pages/LoginPage.jsx`
- **Cambio**: Reemplazar `main.premium-card` por `main` con `w-full max-w-[22rem] p-6 sm:p-8 rounded-3xl bg-[#3F0516]/60 backdrop-blur-md border border-[#D4AF37]/30 shadow-2xl`.
- **Criterio de hecho**: Tarjeta centrada, ancho máx ~22rem (340px), esquinas muy redondeadas, borde dorado sutil, sombra, responsive.
- **Verificación**: Revisar en 320px y ≥1024px; sin scroll horizontal.

## T3 — Logo con fallback
- **Archivo**: `src/pages/LoginPage.jsx`
- **Cambio**: Agregar arriba de la tarjeta un `div` círculo blanco (`w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg`) con `<img src="/assets/logo-im-chic.png" alt="I'm Chic by Mel" onError={...}>`; en `onError`, reemplazar por texto "IC" (mismo criterio que Navbar).
- **Criterio de hecho**: Logo visible en círculo blanco; si la imagen falla, se muestra "IC".
- **Verificación**: Cargar la página con la imagen presente y con la imagen ausente (o ruta incorrecta) para ver ambos casos.

## T4 — Título serif y subtítulo
- **Archivo**: `src/pages/LoginPage.jsx`
- **Cambio**: Reemplazar el header actual (chip + icono) por `<h1 className="font-serif text-2xl sm:text-3xl font-bold text-white text-center mb-2">Panel de Administración</h1>` + `<p className="text-sm text-[#FFC9D6]/80 text-center mb-6">Ingresá con tu email y contraseña para gestionar los productos de la tienda.</p>`.
- **Criterio de hecho**: Un único `<h1>` serif con el texto existente; subtítulo breve en rosa translúcido.
- **Verificación**: Confirmar un solo `<h1>` en el DOM; contraste AA.

## T5 — Inputs píldora con foco dorado
- **Archivo**: `src/pages/LoginPage.jsx`
- **Cambio**: Actualizar clases de los inputs email y contraseña a: `w-full min-h-[44px] px-[18px] py-[13px] rounded-full bg-white/10 text-white placeholder:text-[#FFC9D6]/50 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white/15 focus:border-[#D4AF37]/50 transition`. Conservar `<label>` visibles con `text-white` y `htmlFor`/`id`.
- **Criterio de hecho**: Inputs píldora, fondo translúcido claro, texto claro, placeholder rosa/dorado translúcido, padding 13px 18px, foco con anillo dorado.
- **Verificación**: Enfocar cada input y confirmar anillo dorado; verificar labels asociados.

## T6 — Botón submit con degradado y hover invertido
- **Archivo**: `src/pages/LoginPage.jsx`
- **Cambio**: Actualizar clases del botón submit a: `min-h-[44px] w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F7E7B4] to-[#D4AF37] text-[#3F0516] font-semibold text-sm shadow-md hover:from-[#5A0B22] hover:via-[#7A1333] hover:to-[#5A0B22] hover:text-[#D4AF37] hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]`.
- **Criterio de hecho**: Botón píldora con degradado dorado; hover invierte a borgoña con texto dorado; min-h 44px.
- **Verificación**: Pasar el cursor y confirmar inversión; verificar min-h 44px.

## T7 — Animaciones de entrada (bounce) y prefers-reduced-motion
- **Archivo**: `src/pages/LoginPage.jsx`
- **Cambio**: Agregar un bloque `<style>` dentro del componente con `@keyframes bounce`, `@keyframes bounce1`, `@keyframes bounce2` y la regla `@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }`. Aplicar las clases de animación a email (bounce), password (bounce1) y título/botón (bounce2).
- **Criterio de hecho**: Animaciones de entrada tipo bounce presentes; se desactivan con `prefers-reduced-motion: reduce`.
- **Verificación**: Cargar la página y ver animaciones; activar `prefers-reduced-motion: reduce` en DevTools y confirmar que no hay animaciones.

## T8 — Separador "o" y GoogleButton
- **Archivo**: `src/pages/LoginPage.jsx` (y `src/components/GoogleButton.jsx` si hace falta)
- **Cambio**: Ajustar el separador "o" para que combine sobre fondo oscuro (p. ej. `text-[#D4AF37]/60` con líneas `border-[#D4AF37]/30`). Si el wrapper de `GoogleButton` necesita ajuste (borde más visible), pasar `className` desde `LoginPage` o ajustar el wrapper.
- **Criterio de hecho**: Separador y GoogleButton se ven correctamente sobre la tarjeta oscura.
- **Verificación**: Revisar en móvil y escritorio; probar flujo Google.

## T9 — Links en dorado/rosa
- **Archivo**: `src/pages/LoginPage.jsx`
- **Cambio**: Actualizar "¿Olvidé mi contraseña?" a `text-[#D4AF37] hover:text-[#F7E7B4] underline` y "Registrarse" a `text-[#FFC9D6] hover:text-white underline font-semibold`.
- **Criterio de hecho**: Links en dorado/rosa con buen contraste sobre fondo oscuro.
- **Verificación**: Verificar contraste AA; probar navegación a `/reset-password` y `/registro`.

## T10 — Verificación de lógica intacta y build
- **Archivo**: `src/pages/LoginPage.jsx`
- **Cambio**: Ninguno (solo verificación). Confirmar que `useAuth`, `loading` con spinner, redirección si `isAdmin`, `handleSubmit` con validación, `setError` con `role="alert"`, navegación a `/admin`, `GoogleButton` y link de registro siguen intactos.
- **Criterio de hecho**: Toda la lógica de login funciona como antes; `npm run build` sin errores.
- **Verificación**: Probar login exitoso, login con error, Google, registro, olvidé contraseña; `npm run build` pasa.

## T11 — Actualización de MEMORY.md
- **Archivo**: `MEMORY.md`
- **Cambio**: Agregar una sección "Spec 011 — Restyle de Login (card oscura + píldora + animaciones)" con estado, fecha, decisiones de mapeo de colores y verificación.
- **Criterio de hecho**: MEMORY.md documenta el estado actual y las decisiones arquitectónicas de esta spec.
- **Verificación**: Leer MEMORY.md y confirmar la nueva sección.
