# Spec 008 — Cuentas de Usuario Opcionales + Google Calendar para Turnos

## 1. Objetivo
Permitir a los visitantes registrarse/crear una cuenta opcional para obtener beneficios (carrito persistente, formularios pre-llenados, historial), manteniendo **toda la funcionalidad actual intacta para usuarios sin cuenta**. Además, integrar Google Calendar del admin para disponibilidad inteligente de turnos en el TurnoModal.

## 2. Alcance
- **Incluye**: Registro/Login, Perfil, Carrito persistente (localStorage ↔ Supabase), TurnoModal con disponibilidad (Google Calendar), Configuración de turnos en `/admin`, Páginas legales mínimas.
- **Excluye**: Checkout con pago online, programa de fidelidad/puntos, notificaciones push/email marketing, roles complejos (staff, vendedor), panel de cliente avanzado.

## 3. Requisitos EARS

### 3.1 Cuentas de Usuario (Opcionales)

**RF-01 Registro de usuario**  
CUANDO un visitante complete el formulario de registro (email, contraseña, nombre opcional, teléfono opcional) Y acepte términos y privacidad, EL SISTEMA creará el usuario en Supabase Auth, enviará email de confirmación, y creará su perfil en `public.profiles`.

**RF-02 Inicio de sesión**  
CUANDO un usuario registrado inicie sesión con email y contraseña válidos, EL SISTEMA autenticará al usuario, restaurará su sesión, y sincronizará su carrito localStorage → Supabase (`cart_items`).

**RF-03 Cierre de sesión**  
CUANDO un usuario cierre sesión, EL SISTEMA limpiará la sesión, mantendrá el carrito en localStorage (para que siga funcionando sin cuenta), y redirigirá al inicio.

**RF-04 Recuperación de contraseña**  
CUANDO un usuario solicite recuperar contraseña, EL SISTEMA enviará email de reset (Supabase Auth) y permitirá establecer nueva contraseña.

**RF-05 Perfil de usuario**  
MIENTRAS un usuario esté autenticado, EL SISTEMA le permitirá ver y editar su perfil (nombre, teléfono, avatar) en `/cuenta`.

**RF-06 Carrito persistente**  
MIENTRAS un usuario navegue sin cuenta, EL SISTEMA guardará el carrito en localStorage; CUANDO inicie sesión, EL SISTEMA fusionará localStorage → `public.cart_items` (merge por `product_id`, sumando cantidades); CUANDO cierre sesión, EL SISTEMA exportará `cart_items` → localStorage.

**RF-07 Formularios pre-llenados (WhatsApp)**  
CUANDO un usuario autenticado abra TurnoModal, formulario de curso, o carrito→WhatsApp, EL SISTEMA pre-llenará nombre, email y teléfono desde su perfil.

**RF-08 Historial de usuario**  
MIENTRAS un usuario autenticado visite `/mis-turnos`, `/mis-cursos`, `/cuenta`, EL SISTEMA mostrará sus turnos solicitados (`user_appointments`), cursos inscritos (`user_courses`), y direcciones guardadas.

### 3.2 Google Calendar + Disponibilidad Inteligente

**RF-09 Conexión Google Calendar (Admin)**  
CUANDO el admin acceda a la pestaña "Configuración de Turnos" en `/admin` y pulse "Conectar Google Calendar", EL SISTEMA iniciará flujo OAuth 2.0 (Google Calendar API, scope `calendar.events`), guardará `access_token` y `refresh_token` encriptados en `admin_settings.google_calendar`, y mostrará estado "Conectado".

**RF-10 Configuración de Servicios (Duración)**  
MIENTRAS el admin esté en "Configuración de Turnos", EL SISTEMA le permitirá definir duración estimada (minutos) por cada servicio (Uñas, Cabello, Maquillaje, Packs, etc.), persistiendo en `admin_settings.service_durations`.

**RF-11 Configuración de Horario de Atención**  
MIENTRAS el admin esté en "Configuración de Turnos", EL SISTEMA le permitirá definir días y rangos horarios de atención (ej: Lun-Sáb 09:00–19:00), persistiendo en `admin_settings.business_hours`.

**RF-12 Consulta de Disponibilidad (TurnoModal - Usuario Logueado)**  
CUANDO un usuario autenticado abra TurnoModal y seleccione un servicio, EL SISTEMA consultará Google Calendar del admin (vía edge function / serverless) para los próximos 60 días, calculará slots libres de duración = servicio seleccionado dentro del horario de atención, y mostrará:
- Calendario de días: **verde** (hay slots) / **rojo** (sin slots) / **gris** (fuera de horario / pasado).
- Al clickear un día verde: lista de **horas disponibles** (intervalos de 30 min) para ese servicio.

**RF-13 TurnoModal - Usuario Sin Login**  
CUANDO un usuario SIN sesión abra TurnoModal, EL SISTEMA mostrará el selector de servicio y botón WhatsApp **exactamente como hoy** (sin calendario, sin disponibilidad).

**RF-14 Reserva de Slot Disponible**  
CUANDO un usuario logueado elija un día y hora disponibles (slot libre en Google Calendar), EL SISTEMA:
1. Creará evento en Google Calendar del admin (título: "Turno - {servicio} - {cliente}", descripción: datos del cliente + notas).
2. Guardará registro en `user_appointments` (user_id, service_key, datetime, status='confirmado', google_event_id).
3. Enviará WhatsApp al admin y al cliente con confirmación (fecha, hora, servicio, datos cliente).

**RF-15 Fallback: Slot No Disponible / Calendar Desconectado / Error**  
CUANDO el usuario elija una hora NO disponible, O Google Calendar no esté conectado, O la API falle, EL SISTEMA NO creará evento; en su lugar enviará WhatsApp al admin con mensaje: *"Cliente {nombre} quiere turno {servicio} el {fecha} a las {hora}. ¿Tenés disponibilidad?"* y guardará en `user_appointments` con status='solicitado'.

### 3.3 Páginas Legales (Plantillas Base)

**RF-16 Páginas legales estáticas**  
EL SISTEMA servirá `/privacidad`, `/terminos`, `/cookies` con plantillas base (texto en `public/legal/*.md` o componentes React) adaptadas a Ley 25.326 (Argentina). Incluirán: datos recabados, finalidad, base legal, derechos ARCO, contacto, cookies necesarias/analytics, consentimiento Google OAuth.

**RF-17 Banner de Cookies**  
AL PRIMER visita, EL SISTEMA mostrará banner inferior "Usamos cookies..." con botones "Aceptar" / "Rechazar" / "Configurar". Guardará preferencia en localStorage (`cookie_consent`). Si rechaza, no cargará scripts no esenciales.

**RF-18 Checkbox Legal en Registro**  
EN el formulario de registro, EL SISTEMA requerirá checkbox "Acepto Términos y Política de Privacidad" (enlace a `/terminos` y `/privacidad`) antes de habilitar botón "Registrarse".

## 4. Modelo de Datos (Supabase)

```sql
-- Perfiles extendidos
create table public.profiles (
  id uuid references auth.users primary key,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Carrito persistente por usuario
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  product_id uuid references public.products,
  quantity int default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

-- Inscripciones a cursos
create table public.user_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  course_key text not null, -- 'masterclass' | 'formacion_integral'
  enrolled_at timestamptz default now(),
  status text default 'inscrito',
  unique (user_id, course_key)
);

-- Turnos solicitados / confirmados
create table public.user_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  service_key text not null,
  requested_at timestamptz default now(),
  scheduled_at timestamptz,           -- null si 'solicitado'
  status text default 'solicitado',   -- 'solicitado' | 'confirmado' | 'cancelado' | 'completado'
  google_event_id text,               -- si se creó en Calendar
  whatsapp_message text,              -- mensaje enviado
  unique (user_id, service_key, scheduled_at)
);

-- Configuración del admin (una sola fila, upsert)
create table public.admin_settings (
  id int primary key default 1,
  google_calendar jsonb default '{}',           -- {connected:bool, access_token_enc, refresh_token_enc, calendar_id}
  service_durations jsonb default '{}',         -- {"unas":60, "cabello":90, "maquillaje":45, ...}
  business_hours jsonb default '{}',            -- {"mon":{"open":"09:00","close":"19:00"},...,"sun":null}
  updated_at timestamptz default now()
);

-- RLS: cada usuario solo ve/modifica lo suyo
alter table public.profiles enable row level security;
create policy "own_profile" on public.profiles using (auth.uid() = id) with check (auth.uid() = id);

alter table public.cart_items enable row level security;
create policy "own_cart" on public.cart_items using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.user_courses enable row level security;
create policy "own_courses" on public.user_courses using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.user_appointments enable row level security;
create policy "own_appointments" on public.user_appointments using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- admin_settings: solo admin (reusar is_admin())
alter table public.admin_settings enable row level security;
create policy "admin_settings_rw" on public.admin_settings
  using ((select public.is_admin())) with check ((select public.is_admin()));
```

## 5. Componentes y Rutas Nuevas

| Ruta | Componente | Acceso | Descripción |
|------|------------|--------|-------------|
| `/registro` | `RegisterPage` | Público | Formulario registro + checkbox legal |
| `/login` | `LoginPage` (existente) | Público | Email + password + "¿Olvidé contraseña?" |
| `/cuenta` | `AccountPage` | Cliente | Perfil, direcciones, historial turnos/cursos |
| `/mis-turnos` | `MyAppointmentsPage` | Cliente | Lista de turnos (solicitado/confirmado) |
| `/mis-cursos` | `MyCoursesPage` | Cliente | Lista de cursos inscritos |
| `/privacidad` | `LegalPage` | Público | Plantilla privacidad |
| `/terminos` | `LegalPage` | Público | Plantilla términos |
| `/cookies` | `LegalPage` | Público | Plantilla cookies |
| `/admin` (nueva pestaña) | `TurnSettingsTab` | Admin | Config: Google Calendar, duraciones, horarios |

## 6. TurnoModal - Cambios de Comportamiento

| Usuario | Qué ve en TurnoModal |
|---------|---------------------|
| **Sin login** | Selector servicio → Botón "Pedir por WhatsApp" (igual que hoy) |
| **Logueado (cliente)** | Selector servicio → **Calendario 60 días** (días verde/rojo/gris) → Click día verde → **Horas disponibles** (slots de 30 min) para ese servicio → Click hora → Confirmar → WhatsApp + Google Calendar |
| **Admin** | Igual que cliente logueado + acceso a pestaña Configuración |

**Cálculo de slots**:
- Input: `service_duration` (min), `business_hours` (día → rangos), `google_calendar_events` (busy slots).
- Algoritmo: para cada día en horario, generar intervalos de 30min desde `open` a `close - service_duration`. Filtrar los que solapen eventos "busy" en Calendar. Devolver disponibles.

## 7. Flujo WhatsApp (Integración Existente)

- **Turno confirmado (slot libre)**: WhatsApp a admin + cliente con ✅ confirmación + datos + enlace Calendar.
- **Turno solicitado (fallback)**: WhatsApp a admin: *"Cliente {nombre} ({tel}) quiere {servicio} el {fecha} a las {hora}. ¿Tenés disponibilidad?"*
- **Curso inscrito**: WhatsApp pre-llenado con datos perfil + curso.
- **Carrito → WhatsApp**: Lista productos + total + datos perfil si logueado.

## 8. Criterios de Aceptación (CA)

| ID | Criterio |
|----|----------|
| CA-01 | Usuario sin cuenta navega, ve servicios, cursos, tienda, carrito → WhatsApp **exactamente igual que hoy**. |
| CA-02 | Usuario se registra → email confirmación → login → ve `/cuenta` con su nombre. |
| CA-03 | Usuario logueado añade al carrito → cierra sesión → abre en otro navegador → loguea → carrito idéntico. |
| CA-04 | Usuario logueado abre TurnoModal → ve calendario con días verde/rojo → elige hora verde → recibe WhatsApp confirmación + evento en Calendar admin. |
| CA-05 | Usuario logueado elige hora roja / Calendar desconectado → WhatsApp fallback a admin preguntando disponibilidad. |
| CA-06 | Usuario sin login abre TurnoModal → **idéntico a hoy** (sin calendario, solo WhatsApp). |
| CA-07 | Admin en `/admin` → pestaña "Configuración de Turnos" → conecta Google Calendar (OAuth) → estado "Conectado". |
| CA-08 | Admin configura duraciones por servicio → se usan para calcular slots en TurnoModal. |
| CA-09 | Admin configura horario atención (días + rangos) → slots solo dentro de esos rangos. |
| CA-10 | Páginas `/privacidad`, `/terminos`, `/cookies` accesibles, con texto base Ley 25.326. |
| CA-11 | Banner cookies aparece en primera visita, guarda preferencia, no molesta si ya aceptó. |
| CA-12 | Registro requiere checkbox "Acepto términos y privacidad" (links funcionales). |
| CA-13 | Build `npm run build` pasa sin errores. Lighthouse Accessibility ≥ 90 en `/registro`, `/login`, `/cuenta`, `/admin`. |
| CA-14 | No regresión: Navbar, TurnoModal (sin login), `/servicios`, `/cursos`, `/tienda`, `/inversion` intactos. |

## 9. Fuera de Alcance (Out of Scope)
- Checkout con pasarela de pago (MercadoPago, Stripe).
- Programa de fidelidad, puntos, referidos.
- Notificaciones push, email marketing automatizado.
- Roles: staff, vendedor, multi-admin.
- Sincronización bidireccional Google Calendar ↔ BD (solo escritura BD→Calendar).
- Recordatorios automáticos 24h antes (fase futura).

## 10. Restricciones y Constitución
- Mobile-first, Tailwind CDN, marca (#FFF0F3, #5A0B22, #7A1333, #FFC9D6, gold).
- Áreas táctiles ≥ 44px, contraste AA, un solo `<h1>` por página.
- **Estabilidad estructural**: No modificar `Navbar`, `TurnoModal` (salvo extensión controlada), `HomeServices`, `InversionPage`, `ContactoPage`, `MaryKayStore` sin spec.
- SDD obligatorio: esta spec → plan → tareas → implementación → validación.

## 11. Decisiones Técnicas Clave
- **Google Calendar**: Edge Function (Deno) en Supabase para no exponer tokens en cliente. Recibe `{service_key, date_range}` → devuelve `{busy_slots[]}`. Admin tokens encriptados en `admin_settings` (pgcrypto o secret manager).
- **OAuth Google**: `supabase.auth.signInWithOAuth({provider:'google', options:{scopes:'calendar.events'}})` o flujo manual con `googleapis` en Edge Function.
- **Tokens**: `access_token` (corta vida) + `refresh_token` (larga vida). Renovación automática en Edge Function antes de cada llamada.
- **Disponibilidad**: Cálculo en Edge Function (server-side) para no exponer calendario ni lógica en cliente.
- **Legal**: Plantillas en `src/components/legal/` + páginas estáticas en `public/legal/` o rutas React.

## 12. Estado
- **Estado**: Borrador listo para revisión y aprobación.
- **Fecha**: 2026-10-02
- **Autor**: Coordinador SDD