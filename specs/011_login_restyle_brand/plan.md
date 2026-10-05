# Plan 011 — Restyle de Login: Card Oscura, Inputs Píldora y Animaciones de Entrada

## 1. Decisiones técnicas

### 1.1 Enfoque general
- **Tailwind vía CDN + `<style>` local**: todo el estilo se implementa con clases utilitarias Tailwind. Los `@keyframes` de animación y la regla `prefers-reduced-motion` van en un bloque `<style>` dentro de `LoginPage.jsx` (no hay soporte de keyframes arbitrarios en la config de Tailwind del proyecto).
- **Sin dependencias nuevas**: prohibido instalar styled-components o cualquier paquete. No se toca `package.json`.
- **Mobile-first**: el layout se piensa para 320px+ y se escala a escritorio con `sm:`/`md:`.

### 1.2 Estructura de `LoginPage.jsx`
1. **Fondo**: `div` raíz con degradado lineal borgoña + dos `div` absolutos con radiales dorado/rosa de baja opacidad (destellos).
2. **Tarjeta**: `main` centrado, `max-w-[22rem]`, fondo `bg-[#3F0516]/60` (translúcido), `backdrop-blur`, borde `border border-[#D4AF37]/30`, `rounded-3xl`, `shadow-2xl`.
3. **Logo**: `div` círculo blanco (`bg-white rounded-full`) con `<img src="/assets/logo-im-chic.png" onError={...}>`; fallback a texto "IC" (mismo criterio que Navbar).
4. **Título**: `<h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">` + subtítulo `<p className="text-sm text-[#FFC9D6]/80">`.
5. **Formulario**: se conserva `handleSubmit`, `email`, `password`, `error`, `submitting`. Solo cambian clases de los inputs y botón.
6. **Inputs**: `rounded-full`, `bg-white/10`, `text-white`, `placeholder:text-[#FFC9D6]/50`, `px-[18px] py-[13px]`, `focus:ring-2 focus:ring-[#D4AF37]`, `focus:bg-white/15`, `transition`. Animación bounce al enfocar vía clase condicional o keyframe aplicado siempre (con `prefers-reduced-motion` desactivándolo).
7. **Botón submit**: `rounded-full`, `bg-gradient-to-r from-[#D4AF37] via-[#F7E7B4] to-[#D4AF37]`, `text-[#3F0516]`, `hover:from-[#5A0B22] hover:via-[#7A1333] hover:to-[#5A0B22] hover:text-[#D4AF37]`, `min-h-[44px]`, `transition-all`.
8. **Separador**: `premium-or` existente o línea con "o" en `text-[#D4AF37]/60`.
9. **GoogleButton**: se pasa `className` con fondo blanco (ya lo tiene) y se ajusta el wrapper si hace falta.
10. **Links**: `text-[#D4AF37]` y `text-[#FFC9D6]` con `hover:` más claros, `underline`.

### 1.3 Animaciones
- Keyframes en `<style>` local:
  - `bounce`: entrada del input email (translateY + leve escala).
  - `bounce1`: entrada del input password.
  - `bounce2`: entrada del título/botón.
- Se aplican con clases tipo `animate-[bounce_0.6s_ease-out]` o clases definidas en el `<style>`.
- `@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }` (scoped al componente si es posible, o global en el `<style>` local).

### 1.4 Accesibilidad
- Contraste AA: texto claro sobre fondo oscuro. Si `bg-white/10` no alcanza, subir a `bg-white/15` o `bg-white/20`.
- `min-h-[44px]` en inputs y botones.
- `<label htmlFor>` visibles (no `sr-only`) con color claro.
- `role="alert"` en error (ya existe).
- Un solo `<h1>`.

## 2. Tabla de mapeo de colores: referencia → marca

| Elemento en referencia | Color referencia | Color marca | Justificación |
|------------------------|------------------|-------------|---------------|
| Fondo página | Oscuro neutro | `#3F0516` → `#5A0B22` (degradado) | Borgoña profundo de marca |
| Destellos | Neutros | `#D4AF37` (dorado) + `#FFC9D6` (rosa) | Acentos de marca |
| Tarjeta | Glass oscuro | `bg-[#3F0516]/60` + `backdrop-blur` | Translúcido sobre degradado |
| Borde tarjeta | Sutil claro | `border-[#D4AF37]/30` | Dorado sutil |
| Título | Blanco | `text-white` | Contraste máximo |
| Subtítulo | Gris claro | `text-[#FFC9D6]/80` | Rosa de marca, legible |
| Input fondo | Translúcido claro | `bg-white/10` | Claroscuro sobre tarjeta |
| Input texto | Blanco | `text-white` | Legible |
| Input placeholder | Gris | `text-[#FFC9D6]/50` | Rosa translúcido |
| Input foco | Anillo claro | `focus:ring-[#D4AF37]` | Dorado marca |
| Botón submit | Degradado claro | `from-[#D4AF37] via-[#F7E7B4] to-[#D4AF37]` | Dorado premium |
| Botón hover | Oscuro | `from-[#5A0B22] via-[#7A1333] to-[#5A0B22]` + `text-[#D4AF37]` | Inversión a borgoña |
| Separador | Neutro | `text-[#D4AF37]/60` | Dorado sutil |
| Links | Claro | `text-[#D4AF37]` / `text-[#FFC9D6]` | Acentos marca |
| GoogleButton | Blanco | (sin cambio) | Ya combina |

## 3. Enfoque por archivo

### 3.1 `src/pages/LoginPage.jsx` (cambio principal)
- Reemplazar el `div` raíz de fondo (`bg-[#FFF0F3]`) por el degradado borgoña + destellos.
- Reemplazar `main.premium-card` por la tarjeta glass.
- Reemplazar el header (chip + icono) por logo + h1 serif + subtítulo.
- Actualizar clases de inputs a píldora + translúcido + foco dorado.
- Actualizar clases del botón submit a degradado dorado + hover borgoña.
- Actualizar color de links a dorado/rosa.
- Agregar `<style>` local con keyframes y `prefers-reduced-motion`.
- **Conservar intacto**: `useAuth`, `loading`, `isAdmin`, `handleSubmit`, `setError`, `navigate`, `GoogleButton`, link de registro.

### 3.2 `src/components/GoogleButton.jsx` (ajuste menor)
- Si el wrapper `div` o las clases del botón necesitan ajuste para combinar sobre fondo oscuro (p. ej. borde más visible), se toca solo el `className` del wrapper o se pasa `className` desde `LoginPage`.
- **No se toca la lógica** (`signInWithGoogle`, loading, error).

### 3.3 Archivos NO tocados
- `src/context/AuthContext.jsx`
- `src/components/Navbar.jsx`
- `src/components/TurnoModal.jsx` / `TurnoModalEnhanced.jsx`
- `src/pages/AccountPage.jsx`, `AdminPage.jsx`, etc.
- `package.json`, `tailwind.config`, `index.html`

## 4. Verificación

### 4.1 Build
- `npm run build` debe compilar sin errores ni advertencias nuevas.

### 4.2 Revisión visual (manual, por el implementador)
- Móvil (320px, 375px): tarjeta centrada, inputs píldora, botón visible, sin scroll horizontal.
- Escritorio (≥1024px): tarjeta centrada, destellos sutiles, animaciones de entrada.
- Foco en inputs: anillo dorado + bounce.
- Hover en botón: inversión a borgoña con texto dorado.
- `prefers-reduced-motion: reduce`: sin animaciones.
- Logo: carga la imagen; si falla, muestra "IC".

### 4.3 Regresión
- Probar login exitoso → redirige a `/admin`.
- Probar login con error → muestra `role="alert"`.
- Probar "Continuar con Google" → flujo OAuth intacto.
- Probar "¿Olvidé mi contraseña?" → navega a `/reset-password`.
- Probar "Registrarse" → navega a `/registro`.
- Verificar que otras rutas (`/`, `/servicios`, `/tienda`, `/cursos`, `/contacto`, `/cuenta`) no se vieron afectadas.

### 4.4 Documentación
- Actualizar `MEMORY.md` con el estado de la spec 011 y la decisión de estilo (card oscura + píldora + animaciones).

## 5. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Contraste insuficiente de texto claro sobre `bg-white/10` | Subir opacidad del fondo de inputs o usar `text-[#FFF0F3]` en lugar de `text-white` |
| Animaciones afectan rendimiento móvil | Keyframes cortos (≤0.6s), solo transform/opacity, desactivados con `prefers-reduced-motion` |
| Logo no existe en `/assets/logo-im-chic.png` | Verificar que el archivo existe; si no, ajustar ruta o usar fallback "IC" permanente (y anotar en MEMORY) |
| `backdrop-blur` no soportado en navegadores antiguos | Aceptable: degrada a fondo translúcido sin blur; no rompe layout |
