# Plan de Implementación — Spec 008: Cuentas de Usuario Opcionales + Google Calendar para Turnos

## 1. Alcance y Resumen

Este plan cubre la implementación completa de la **Spec 008** resolviendo las **10 observaciones del reviewer**. Incluye:

- **Cuentas de usuario opcionales**: Registro, login, perfil, carrito persistente, historial, formularios pre-llenados.
- **Google Calendar integration**: OAuth admin, configuración de servicios/horarios, disponibilidad inteligente en TurnoModal.
- **Páginas legales**: `/privacidad`, `/terminos`, `/cookies` + banner cookies + checkbox legal en registro.
- **Arquitectura**: Edge Functions (Deno) para Calendar API, Supabase Vault/pgcrypto para tokens, patrón Wrapper para TurnoModal.

**Fuera de alcance**: Pagos online, fidelidad, notificaciones push, roles complejos, sincronización bidireccional Calendar↔BD.

---

## 2. Decisiones Técnicas (Resolución de Observaciones 1–10)

| # | Observación | Decisión Técnica |
|---|-------------|------------------|
| 1 | **OAuth Google secrets** | `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en **Supabase Edge Function Secrets** (Dashboard → Edge Functions → Secrets). Flujo: cliente `signInWithOAuth` → callback en Edge Function intercambia `code` por tokens. |
| 2 | **Encriptación tokens** | **Supabase Vault** (si disponible en plan) o **pgcrypto** con clave maestra rotativa en Vault/Env. Tokens guardados en `admin_settings.google_calendar` como JSONB encriptado. Rotación documentada cada 90 días. |
| 3 | **Edge Function spike** | **Spike técnico obligatorio ANTES de implementación**. Deno + `jsr:@googleapis/calendar` o `fetch` manual OAuth2. Dependencias en `import_map.json`. Probar: OAuth callback → exchange code → guardar tokens → listar eventos → crear evento. |
| 4 | **Granularidad slots** | **Configurable por servicio** = MCD (mínimo común divisor) de todas las duraciones. Default 15 min. Si duraciones = [60, 90, 45] → MCD = 15. Guardar en `admin_settings.slot_granularity_minutes`. |
| 5 | **Timezone** | Fijar `America/Argentina/Buenos_Aires` constante en Edge Function. `business_hours` almacenados en TZ local. Conversión a UTC para queries a Calendar API. |
| 6 | **Rate limits Google Calendar** | Caché en **Supabase Cache** (o Upstash Redis si no hay) con TTL 5 min (`stale-while-revalidate`). Key: `calendar_busy:{calendar_id}:{date_range_hash}`. Edge Function devuelve caché si < 5 min. |
| 7 | **Migración SQL** | Crear `supabase/migrations/20261002140000_spec_008_users_calendar.sql` con: tablas (profiles, cart_items, user_courses, user_appointments, admin_settings), RLS policies (reusar `is_admin()`), índices (`user_appointments(user_id, scheduled_at) WHERE scheduled_at IS NOT NULL`), extensión `pgcrypto`, helpers `encrypt_text`/`decrypt_text` usando `pgp_sym_encrypt/decrypt` con clave de Vault/Env. |
| 8 | **Extensión TurnoModal** | Patrón **Wrapper + Composition** (no herencia). `TurnoModal` base **inalterado**. Nuevo `TurnoModalEnhanced` wrapper: usa `AuthContext` → si `user` existe → renderiza `CalendarAvailability` + botón "Confirmar turno"; si no → renderiza children (TurnoModal original). `CalendarAvailability` encapsula: selector servicio → fetch Edge Function → calendario 60 días → horas disponibles → callback `onSlotSelected`. |
| 9 | **Edge Function Auth** | Usar `supabase-functions-js` client que adjunta JWT automáticamente (`Authorization: Bearer <access_token>`). En Edge Function: `const { data: { user } } = await supabase.auth.getUser(jwt)`; validar `user` existe. |
| 10 | **TurnoModal sin login = idéntico** | `TurnoModalEnhanced` detecta `!user` → renderiza `TurnoModal` original sin montar lógica de calendario. |

---

## 3. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (React + Vite)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ RegisterPage │  │  LoginPage   │  │ AccountPage  │  │ TurnoModalEnhanced│ │
│  │ /registro    │  │  /login      │  │  /cuenta     │  │  (Wrapper)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                 │                 │                  │           │
│         ▼                 ▼                 ▼                  ▼           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        AuthContext (useAuth)                          │   │
│  │  - user, session, signUp, signIn, signOut, resetPassword, updateProfile│   │
│  │  - syncCart (localStorage ↔ Supabase), prefillData (nombre, email, tel)│   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         ▼                          ▼                          ▼            │
│  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐     │
│  │ CalendarAvail│          │  MyAppoint-  │          │  MyCourses   │     │
│  │  ability     │          │  mentsPage   │          │  Page        │     │
│  └──────┬───────┘          └──────┬───────┘          └──────┬───────┘     │
│         │                         │                         │              │
└─────────┼─────────────────────────┼─────────────────────────┼──────────────┘
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (Backend)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Auth       │  │  Database    │  │  Edge Fn:    │  │  Edge Fn:      │  │
│  │  (users,     │  │  (profiles,  │  │  calendar-   │  │  calendar-     │  │
│  │   sessions)  │  │   cart_items,│  │  availability│  │  create-event  │  │
│  │              │  │   user_* ,   │  │  (GET busy   │  │  (POST event)  │  │
│  │              │  │   admin_set) │  │   slots)     │  │              │  │
│  └──────────────┘  └──────────────┘  └──────┬───────┘  └───────┬────────┘  │
│                                              │                  │           │
│                    ┌─────────────────────────┘                  │           │
│                    ▼                                              ▼           │
│           ┌──────────────────┐                         ┌──────────────────┐   │
│           │  Google Calendar │◄────────────────────────►│  Supabase Vault  │   │
│           │  API (OAuth2)    │   access_token /         │  / pgcrypto key  │   │
│           │                  │   refresh_token (enc)    │  (master key)    │   │
│           └──────────────────┘                         └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Orden de Implementación (Fases)

### Fase 0: Preparación y Spike (Crítico)
- **T1**: Migración BD + índices + pgcrypto + helpers encriptación
- **T2**: Spike Edge Function (OAuth + Calendar list/create) + Secrets config

### Fase 1: Autenticación y Perfil
- **T3**: AuthContext extensiones (register, logout, cart sync, profile)
- **T4**: Páginas auth (`/registro`, `/login` recovery, `/cuenta`, `/mis-turnos`, `/mis-cursos`)

### Fase 2: Carrito y Persistencia
- **T5**: Carrito persistente (localStorage ↔ Supabase merge)

### Fase 3: TurnoModal + Disponibilidad
- **T6**: TurnoModalEnhanced + CalendarAvailability + Edge Function disponibilidad

### Fase 4: Admin Settings
- **T7**: Admin Settings tab (OAuth connect, duraciones, horarios, granularidad)

### Fase 5: Flujo de Reserva Completo
- **T8**: Flujo reserva (crear evento Calendar + user_appointments + WhatsApp)
- **T9**: Fallback WhatsApp (slot no libre / error)

### Fase 6: Legal y Compliance
- **T10**: Páginas legales + banner cookies + checkbox registro
- **T11**: Integración WhatsApp pre-fill (turnos, cursos, carrito)

### Fase 7: Validación y Cierre
- **T12**: Regresión visual + build + Lighthouse + smoke tests

---

## 5. Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Supabase Vault no disponible en plan gratuito | Alto | Media | Fallback a pgcrypto con clave en Env; documentar rotación 90 días |
| Rate limits Google Calendar (100 req/100s/user) | Alto | Alta | Caché 5 min + batch queries; exponer `calendar_busy` edge fn con TTL |
| OAuth callback loop / CORS en Edge Function | Medio | Media | Spike T2 valida flujo completo antes de continuar; usar `supabase-functions-js` |
| TurnoModalEnhanced rompe TurnoModal original | Crítico | Baja | Patrón Wrapper (composition), TurnoModal inalterado; tests de regresión CA-06, CA-14 |
| Timezone mismatch (UTC vs America/Argentina/Buenos_Aires) | Alto | Media | Constante TZ en Edge Function; tests con fechas límite DST |
| Merge carrito localStorage → Supabase con conflictos | Medio | Media | Estrategia: merge por `product_id`, sumar cantidades; último gana en timestamp |
| RLS policies no cubren admin correctamente | Medio | Baja | Reusar `is_admin()` probado en Spec 007; test unitario de policies |

---

## 6. Definition of Done (DoD)

Una tarea se considera **Done** cuando cumple **TODOS**:

- [ ] Código implementado según spec y observaciones 1–10
- [ ] Build `npm run build` pasa sin errores ni warnings
- [ ] Lighthouse Accessibility ≥ 90 en rutas nuevas (`/registro`, `/login`, `/cuenta`, `/mis-turnos`, `/mis-cursos`, `/admin` pestaña turnos)
- [ ] No regresión visual/funcional en componentes protegidos: `Navbar`, `TurnoModal` (sin login), `HomeServices`, `InversionPage`, `ContactoPage`, `MaryKayStore`
- [ ] Criterios de aceptación CA-01 a CA-14 de la spec validados manualmente
- [ ] Edge Functions deployadas y probadas en staging (OAuth, disponibilidad, crear evento)
- [ ] Migración SQL aplicada en Supabase (verificar con `supabase db diff`)
- [ ] Documentación actualizada en `MEMORY.md` (estado actual + decisiones)

---

## 7. Referencias

- **Spec aprobada**: `specs/008_cuentas_google_calendar/spec.md`
- **Constitución**: `docs/constitution.md` (5 principios)
- **Memoria**: `MEMORY.md` (estado actual, decisiones arquitectónicas)
- **Spec 007 (Admin Panel)**: `specs/007_admin_panel/` — reusar `is_admin()`, AuthContext, ProtectedRoute
- **Frontend Design Guide**: skill `frontend-design` (Tailwind CDN, mobile-first, WCAG 2.1 AA, marca #FFF0F3/#5A0B22/#7A1333/#FFC9D6/gold)