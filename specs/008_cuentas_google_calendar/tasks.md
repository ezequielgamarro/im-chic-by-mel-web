# Tareas de Implementación — Spec 008: Cuentas de Usuario + Google Calendar

## T1: Migración BD + Índices + pgcrypto + Helpers Encriptación

**Objetivo**: Crear esquema completo de base de datos con tablas, RLS, índices, extensión pgcrypto y funciones helper para encriptación.

**Archivos/Áreas**:
- `supabase/migrations/20261002140000_spec_008_users_calendar.sql`
- `supabase/migrations/` (nuevo archivo)

**Criterio de Aceptación**:
- [ ] Tablas creadas: `profiles`, `cart_items`, `user_courses`, `user_appointments`, `admin_settings`
- [ ] RLS policies aplicadas (reusar `is_admin()` para `admin_settings`)
- [ ] Índice: `user_appointments(user_id, scheduled_at) WHERE scheduled_at IS NOT NULL`
- [ ] Extensión `pgcrypto` habilitada
- [ ] Funciones `encrypt_text(text, key)` / `decrypt_text(bytea, key)` usando `pgp_sym_encrypt/decrypt`
- [ ] Clave maestra leída desde Vault/Env (no hardcodeada)
- [ ] `supabase db diff` muestra solo esta migración
- [ ] Migración aplicable en staging sin errores

**NO romper**: Nada (solo BD nueva)

---

## T2: Spike Edge Function (OAuth + Calendar List/Create) + Secrets Config

**Objetivo**: Validar técnicamente el flujo completo OAuth → tokens → Calendar API antes de implementar tareas dependientes.

**Archivos/Áreas**:
- `supabase/functions/calendar-oauth/index.ts` (callback OAuth)
- `supabase/functions/calendar-availability/index.ts` (GET busy slots)
- `supabase/functions/calendar-create-event/index.ts` (POST crear evento)
- `supabase/functions/import_map.json` (dependencias Deno)
- Dashboard Supabase → Edge Functions → Secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ENCRYPTION_KEY`

**Criterio de Aceptación**:
- [ ] `import_map.json` con `jsr:@googleapis/calendar` o `fetch` manual OAuth2
- [ ] Secrets configurados en Dashboard (NO en código ni BD)
- [ ] Flujo probado end-to-end:
  1. OAuth callback recibe `code` → intercambia por `access_token` + `refresh_token`
  2. Tokens encriptados con `encrypt_text` → guardados en `admin_settings.google_calendar`
  3. `calendar-availability` lista eventos busy para rango de fechas (con caché 5 min)
  4. `calendar-create-event` crea evento en Calendar del admin
- [ ] Timezone fijo `America/Argentina/Buenos_Aires` en todas las Edge Functions
- [ ] Rate limit manejado: caché Supabase Cache/Upstash con TTL 5 min, key `calendar_busy:{calendar_id}:{date_range_hash}`
- [ ] Logs de debug en cada paso
- [ ] Deploy a staging funcionando

**NO romper**: Nada (nuevas Edge Functions)

---

## T3: AuthContext Extensiones (register, logout, cart sync, profile)

**Objetivo**: Extender `AuthContext` existente con registro, logout con sincronización de carrito, actualización de perfil y prefill de formularios.

**Archivos/Áreas**:
- `src/context/AuthContext.jsx` (existente - extender)
- `src/hooks/useAuth.js` (si existe, extender)

**Criterio de Aceptación**:
- [ ] `signUp(email, password, metadata)` → crea usuario + perfil en `profiles` + email confirmación
- [ ] `signOut()` → limpia sesión + exporta `cart_items` → `localStorage` (merge strategy: sumar cantidades por `product_id`)
- [ ] `syncCartOnLogin()` → merge `localStorage` → `cart_items` (sumar cantidades, último timestamp gana)
- [ ] `updateProfile({full_name, phone, avatar_url})` → actualiza `profiles`
- [ ] `getPrefillData()` → retorna `{name, email, phone}` desde `user` + `profile`
- [ ] `resetPassword(email)` → envía email reset Supabase Auth
- [ ] Tipos TypeScript/JSDoc actualizados
- [ ] Tests manuales: registro → login → logout → login en otro navegador → carrito idéntico

**NO romper**: `AuthContext` actual (login, session, user, isAdmin) — solo agregar, no modificar firmas existentes

---

## T4: Páginas Auth (`/registro`, `/login` recovery, `/cuenta`, `/mis-turnos`, `/mis-cursos`)

**Objetivo**: Crear páginas de autenticación y cuenta de usuario accesibles, mobile-first, WCAG 2.1 AA.

**Archivos/Áreas**:
- `src/pages/RegisterPage.jsx` (nuevo)
- `src/pages/LoginPage.jsx` (existente - agregar "¿Olvidé contraseña?")
- `src/pages/AccountPage.jsx` (nuevo)
- `src/pages/MyAppointmentsPage.jsx` (nuevo)
- `src/pages/MyCoursesPage.jsx` (nuevo)
- `src/routes/AppRoutes.jsx` (agregar rutas protegidas/públicas)
- `src/components/ProtectedRoute.jsx` (existente - reusar)

**Criterio de Aceptación**:
- [ ] `/registro`: formulario email, password, nombre, teléfono, **checkbox legal obligatorio** (links a `/terminos`, `/privacidad`), validación HTML5 + React, submit → `signUp` → feedback toast
- [ ] `/login`: agregado link "¿Olvidé contraseña?" → `/reset-password` (página simple con email input)
- [ ] `/cuenta`: perfil editable (nombre, teléfono, avatar), botón "Cerrar sesión", secciones "Mis Turnos" y "Mis Cursos" con links a páginas dedicadas
- [ ] `/mis-turnos`: lista `user_appointments` con status badge (solicitado/confirmado/cancelado/completado), fecha, servicio, botón cancelar (si confirmado)
- [ ] `/mis-cursos`: lista `user_courses` con course_key, enrolled_at, status
- [ ] Todas las rutas protegidas usan `ProtectedRoute` (redirige a `/login` con `redirect_to`)
- [ ] Lighthouse Accessibility ≥ 90 en cada página
- [ ] Mobile-first, áreas táctiles ≥ 44px, contraste AA, un solo `<h1>` por página

**NO romper**: `LoginPage` actual (solo agregar link recovery), `ProtectedRoute`, `Navbar`

---

## T5: Carrito Persistente (localStorage ↔ Supabase Merge)

**Objetivo**: Sincronización bidireccional del carrito entre localStorage (anon) y Supabase (auth).

**Archivos/Áreas**:
- `src/context/CartContext.jsx` (existente - extender) o `src/hooks/useCart.js`
- `src/utils/cartSync.js` (nuevo - lógica de merge)
- `src/components/CartButton.jsx` / `CartDrawer.jsx` (existentes - asegurar integración)

**Criterio de Aceptación**:
- [ ] Usuario sin cuenta: carrito en `localStorage` (clave `imchic_cart`) — funcionamiento actual intacto
- [ ] Login: `syncCartOnLogin()` ejecuta merge:
  - Por `product_id`: sumar cantidades
  - Conflictos: último `created_at` gana (timestamp)
  - Limpia `localStorage` tras merge exitoso
- [ ] Logout: `signOut()` exporta `cart_items` → `localStorage` (sobrescribe)
- [ ] Agregar/quitar productos actualiza ambas fuentes según auth state
- [ ] Persistencia verificada: login → agregar → logout → login en incógnito → carrito idéntico
- [ ] No duplicados en `cart_items` (unique constraint `user_id, product_id`)

**NO romper**: Carrito actual para usuarios sin cuenta (CA-01), `CartButton`, `CartDrawer`

---

## T6: TurnoModalEnhanced + CalendarAvailability + Edge Function Disponibilidad

**Objetivo**: Wrapper `TurnoModalEnhanced` que detecta auth y renderiza calendario de disponibilidad para logueados, TurnoModal original para anónimos.

**Archivos/Áreas**:
- `src/components/TurnoModalEnhanced.jsx` (nuevo - wrapper)
- `src/components/CalendarAvailability.jsx` (nuevo - selector servicio + calendario 60 días + horas)
- `src/components/TurnoModal.jsx` (existente - **INALTERADO**)
- `src/context/TurnoContext.jsx` (existente - exponer `openTurnoModal` que use Enhanced)
- `supabase/functions/calendar-availability/index.ts` (de T2 - consumir)

**Criterio de Aceptación**:
- [ ] `TurnoModalEnhanced`:
  - Usa `useAuth()` → si `user` existe → renderiza `CalendarAvailability` + botón "Confirmar turno"
  - Si `!user` → renderiza `children` (TurnoModal original) **sin montar lógica de calendario**
- [ ] `CalendarAvailability`:
  - Selector servicio (lee `admin_settings.service_durations` via Edge Function o cache)
  - Fetch a `calendar-availability` Edge Function con `{service_key, date_range: 60d}`
  - Calendario visual 60 días: **verde** (hay slots), **rojo** (sin slots), **gris** (fuera horario/pasado)
  - Click día verde → lista horas disponibles (intervalos = `slot_granularity_minutes`, default 15 min)
  - Callback `onSlotSelected({service_key, datetime, duration})` → pasa a padre para confirmación
  - Loading, error, empty states accesibles (ARIA live regions)
- [ ] Integración: `TurnoContext.openTurnoModal` ahora abre `TurnoModalEnhanced` con `TurnoModal` como children
- [ ] **CA-06**: Usuario sin login → TurnoModal **idéntico a hoy** (verificar visual + funcional)
- [ ] **CA-14**: No regresión en TurnoModal original

**NO romper**: `TurnoModal` base (constitución: estabilidad estructural), `TurnoContext` API pública

---

## T7: Admin Settings Tab (OAuth Connect, Duraciones, Horarios, Granularidad)

**Objetivo**: Nueva pestaña "Configuración de Turnos" en `/admin` para gestionar Google Calendar, duraciones, horarios y granularidad.

**Archivos/Áreas**:
- `src/pages/admin/TurnSettingsTab.jsx` (nuevo)
- `src/pages/AdminPage.jsx` (existente - agregar pestaña)
- `src/components/admin/GoogleCalendarConnect.jsx` (nuevo - botón OAuth + estado)
- `src/components/admin/ServiceDurationsForm.jsx` (nuevo - editor JSON duraciones)
- `src/components/admin/BusinessHoursForm.jsx` (nuevo - editor días/rangos)
- `src/components/admin/SlotGranularityInput.jsx` (nuevo - input numérico + auto-cálculo MCD)

**Criterio de Aceptación**:
- [ ] Pestaña "Configuración de Turnos" visible solo para admin (reusar `isAdmin` de AuthContext)
- [ ] **Google Calendar Connect**:
  - Botón "Conectar Google Calendar" → abre OAuth en popup/nueva pestaña (`supabase.auth.signInWithOAuth` con provider google, scope `calendar.events`)
  - Callback maneja `code` → llama Edge Function `calendar-oauth` → guarda tokens encriptados
  - Estado visual: "Desconectado" / "Conectado" / "Error" + última sincronización
  - Botón "Desconectar" → limpia `admin_settings.google_calendar`
- [ ] **Duraciones por Servicio**: Editor clave-valor (servicio → minutos), select con servicios conocidos (Uñas, Cabello, Maquillaje, Packs, etc.) + agregar custom, guardado en `admin_settings.service_durations`
- [ ] **Horario de Atención**: Grid 7 días (Lun-Dom) con toggles habilitado/deshabilitado + inputs time open/close, guardado en `admin_settings.business_hours` (TZ local Argentina)
- [ ] **Granularidad Slots**: Input numérico (min 5, max 60, step 5) + botón "Auto-calcular MCD" que lee todas las duraciones y calcula MCD, guardado en `admin_settings.slot_granularity_minutes`
- [ ] Todos los forms: validación, toast feedback, loading states, mobile-first
- [ ] Lighthouse Accessibility ≥ 90 en `/admin` con pestaña activa

**NO romper**: `AdminPage` existente (ProductList, ProductForm, StockControls), `ProtectedRoute`

---

## T8: Flujo Reserva (Crear Evento Calendar + user_appointments + WhatsApp)

**Objetivo**: Confirmar slot seleccionado → crear evento en Google Calendar + guardar en BD + enviar WhatsApp confirmación.

**Archivos/Áreas**:
- `src/components/TurnoModalEnhanced.jsx` (extender - manejar confirmación)
- `supabase/functions/calendar-create-event/index.ts` (de T2 - consumir)
- `src/utils/whatsapp.js` (existente - extender con templates turno confirmado)
- `src/hooks/useAppointment.js` (nuevo - lógica reserva)

**Criterio de Aceptación**:
- [ ] Usuario logueado selecciona slot en `CalendarAvailability` → click "Confirmar turno"
- [ ] Llama Edge Function `calendar-create-event` con `{service_key, datetime, duration, client_data: {name, email, phone, notes}}`
- [ ] Edge Function:
  1. Renueva `access_token` si expiró (usa `refresh_token`)
  2. Crea evento en Calendar (título: "Turno - {servicio} - {cliente}", descripción: datos + notas)
  3. Retorna `google_event_id`
- [ ] Cliente: guarda en `user_appointments` con `status='confirmado'`, `scheduled_at`, `google_event_id`
- [ ] Envía **2 WhatsApp** (pre-fill via `whatsapp.js`):
  - Admin: ✅ confirmación + datos cliente + servicio + fecha/hora + enlace Calendar
  - Cliente: ✅ confirmación + recordatorio + enlace Calendar
- [ ] Feedback visual: "Turno confirmado" + toast + cierre modal
- [ ] **CA-04** validado manualmente

**NO romper**: `TurnoModal` original, WhatsApp actual para anónimos

---

## T9: Fallback WhatsApp (Slot No Libre / Error / Calendar Desconectado)

**Objetivo**: Manejar casos de fallback sin crear evento en Calendar, enviando WhatsApp de consulta al admin.

**Archivos/Áreas**:
- `src/components/TurnoModalEnhanced.jsx` (extender - lógica fallback)
- `src/utils/whatsapp.js` (template fallback)
- `supabase/functions/calendar-create-event/index.ts` (retornar error codes)

**Criterio de Aceptación**:
- [ ] Fallback trigger cuando:
  - Slot seleccionado ya no libre (race condition: Edge Function valida disponibilidad al crear)
  - Google Calendar no conectado (`admin_settings.google_calendar.connected === false`)
  - Error en Edge Function (network, auth, rate limit, quota)
- [ ] En fallback:
  - **NO** crea evento en Calendar
  - Guarda en `user_appointments` con `status='solicitado'`, `scheduled_at=null`, `google_event_id=null`
  - Envía **1 WhatsApp al admin**: *"Cliente {nombre} ({tel}) quiere {servicio} el {fecha} a las {hora}. ¿Tenés disponibilidad?"*
  - Usuario ve mensaje: "Tu solicitud fue enviada. Te confirmaremos por WhatsApp."
- [ ] **CA-05** validado: hora roja / Calendar desconectado / error → WhatsApp fallback + BD status='solicitado'
- [ ] Logs de error en Edge Function para debugging

**NO romper**: Flujo principal (T8), WhatsApp actual

---

## T10: Páginas Legales + Banner Cookies + Checkbox Registro

**Objetivo**: Implementar páginas legales estáticas, banner de cookies consentimiento, y checkbox legal en registro.

**Archivos/Áreas**:
- `src/components/legal/PrivacyContent.jsx`, `TermsContent.jsx`, `CookiesContent.jsx` (nuevos - componentes React)
- `src/components/legal/content/privacidad.md`, `terminos.md`, `cookies.md` (nuevos - textos base Ley 25.326 Argentina)
- `src/pages/LegalPage.jsx` (nuevo - wrapper genérico para 3 rutas)
- `src/components/CookieBanner.jsx` (nuevo - banner inferior fijo)
- `src/hooks/useCookieConsent.js` (nuevo - localStorage `cookie_consent`)
- `src/pages/RegisterPage.jsx` (de T4 - integrar checkbox)

**Criterio de Aceptación**:
- [ ] Rutas `/privacidad`, `/terminos`, `/cookies` renderizan `LegalPage` con componente correspondiente
- [ ] Textos base en `.md` (fácil edición) cubren: datos recabados, finalidad, base legal, derechos ARCO (Ley 25.326), contacto, cookies necesarias/analytics, consentimiento Google OAuth
- [ ] **Banner Cookies**: Aparece en primera visita (check `localStorage.cookie_consent`), posición fixed bottom, botones "Aceptar", "Rechazar", "Configurar"
  - Aceptar → guarda `cookie_consent: 'accepted'` → permite scripts analytics
  - Rechazar → guarda `cookie_consent: 'rejected'` → bloquea scripts no esenciales
  - Configurar → modal con toggles por categoría (necesarias, analytics, marketing)
- [ ] **Checkbox Registro**: Obligatorio, label "Acepto los [Términos](/terminos) y la [Política de Privacidad](/privacidad)", links funcionales, deshabilita botón "Registrarse" si no checked
- [ ] Accesibilidad: banner con `role="dialog"`, `aria-label`, focus trap en modal configurar
- [ ] Lighthouse Accessibility ≥ 90 en páginas legales

**NO romper**: Nada (nuevas páginas/componentes)

---

## T11: Integración WhatsApp Pre-fill (Turnos, Cursos, Carrito)

**Objetivo**: Unificar lógica de pre-fill de WhatsApp usando datos de perfil para usuarios logueados.

**Archivos/Áreas**:
- `src/utils/whatsapp.js` (existente - refactor/extender)
- `src/components/TurnoModal.jsx` (existente - usar pre-fill si logueado)
- `src/pages/CursosPage.jsx` (existente - botón "Quiero Inscribirme Ahora")
- `src/components/CartDrawer.jsx` / `CartButton.jsx` (existente - botón "Pedir por WhatsApp")

**Criterio de Aceptación**:
- [ ] `whatsapp.js` exporta `buildTurnoMessage(data)`, `buildCursoMessage(data)`, `buildCartMessage(items, data)` que aceptan `prefillData` opcional
- [ ] `useAuth().getPrefillData()` retorna `{name, email, phone}` desde `user.user_metadata` + `profile`
- [ ] **TurnoModal** (anon): usa pre-fill si `user` existe (vía `TurnoModalEnhanced` pasa datos)
- [ ] **Cursos**: botón "Quiero Inscribirme" pre-llena nombre, email, teléfono, curso
- [ ] **Carrito → WhatsApp**: lista productos + total + datos perfil si logueado
- [ ] **CA-07**: Formularios pre-llenados funcionan en todos los flujos
- [ ] Sin login: campos vacíos (comportamiento actual intacto)

**NO romper**: WhatsApp actual para usuarios sin cuenta, mensajes existentes

---

## T12: Regresión Visual + Build + Lighthouse + Smoke Tests

**Objetivo**: Validación completa de no regresión, performance, accesibilidad y criterios de aceptación.

**Archivos/Áreas**: Todo el proyecto

**Criterio de Aceptación**:
- [ ] `npm run build` → **0 errores, 0 warnings**
- [ ] **Lighthouse móvil** (Chrome DevTools):
  - `/` (Home): 100/100/100/100 (baseline actual)
  - `/servicios`, `/tienda`: Accessibility 100 (baseline)
  - `/registro`, `/login`, `/cuenta`, `/mis-turnos`, `/mis-cursos`, `/admin`: **Accessibility ≥ 90**
- [ ] **Smoke Tests Manuales** (CA-01 a CA-14):
  - CA-01: Anónimo navega todo → WhatsApp idéntico a hoy ✓
  - CA-02: Registro → email → login → `/cuenta` con nombre ✓
  - CA-03: Login → carrito → logout → otro navegador → login → carrito idéntico ✓
  - CA-04: Logueado → TurnoModal → calendario verde → hora → WhatsApp + Calendar ✓
  - CA-05: Logueado → hora roja / Calendar off → WhatsApp fallback ✓
  - CA-06: Anónimo → TurnoModal → **idéntico a hoy** ✓
  - CA-07: Admin → `/admin` → pestaña Turnos → OAuth → "Conectado" ✓
  - CA-08: Admin → duraciones → slots usan esas duraciones ✓
  - CA-09: Admin → horarios → slots solo en rangos ✓
  - CA-10: `/privacidad`, `/terminos`, `/cookies` accesibles, texto Ley 25.326 ✓
  - CA-11: Banner cookies primera visita → guarda preferencia ✓
  - CA-12: Registro → checkbox legal obligatorio + links ✓
  - CA-13: Build + Lighthouse ✓
  - CA-14: No regresión: Navbar, TurnoModal (anon), HomeServices, InversionPage, ContactoPage, MaryKayStore ✓
- [ ] `MEMORY.md` actualizado con estado final y decisiones

**NO romper**: Nada — esta tarea **valida** que nada se rompió

---

## Resumen de Tareas

| ID | Título | Fase | Dependencias |
|----|--------|------|--------------|
| T1 | Migración BD + Índices + pgcrypto + Helpers | 0 | — |
| T2 | Spike Edge Function OAuth + Calendar + Secrets | 0 | T1 (tabla admin_settings) |
| T3 | AuthContext Extensiones | 1 | T1 |
| T4 | Páginas Auth + Cuenta | 1 | T3 |
| T5 | Carrito Persistente Merge | 2 | T1, T3 |
| T6 | TurnoModalEnhanced + CalendarAvailability | 3 | T2, T3, T4 |
| T7 | Admin Settings Tab Turnos | 4 | T1, T2, T3 |
| T8 | Flujo Reserva Completo | 5 | T2, T6, T7 |
| T9 | Fallback WhatsApp | 5 | T8 |
| T10 | Páginas Legales + Cookies + Checkbox | 6 | T4 |
| T11 | WhatsApp Pre-fill Unificado | 6 | T3, T5, T6, T8 |
| T12 | Regresión + Build + Lighthouse + Smoke | 7 | T1–T11 |

**Orden crítico**: T1 → T2 → (T3, T7 en paralelo) → T4 → T5 → T6 → T8 → T9 → T10 → T11 → T12