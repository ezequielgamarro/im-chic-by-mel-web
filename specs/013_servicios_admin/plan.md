# Plan 013 — Etiquetas legibles de categorías + Pestaña "Servicios" (CRUD + integración pública)

## 1. Parte A — Corrección de "Uñas" en `TurnSettingsTab.jsx`

### 1.1 Diagnóstico (verificado)

- `CATEGORIAS_SERVICIOS = ['unas', 'cabello', 'maquillaje', 'packs']` (línea 5).
- Render (líneas 266–285): `<label htmlFor={"dur-" + cat} className="w-32 font-medium text-[#5A0B22] capitalize">{cat}</label>` → `capitalize` sobre `unas` produce **"Unas"**.
- Todo el resto del repo ya dice "Uñas" correctamente (InversionPage.jsx y HomeServices.jsx — en la **raíz** del repo —, `serviceNames.js`, `TurnoModalEnhanced.jsx`).

### 1.2 Cambio mínimo

Agregar un mapa de etiquetas y usarlo solo en el texto visible:

```js
const CAT_LABELS = {
  unas: 'Uñas',
  cabello: 'Cabello',
  maquillaje: 'Maquillaje',
  packs: 'Packs',
};
```

En el `.map` del label:

```jsx
<label htmlFor={"dur-" + cat} className="w-32 font-medium text-[#5A0B22]">
  {CAT_LABELS[cat] || cat}
</label>
```

- Se elimina la clase `capitalize` (las etiquetas ya vienen correctamente casuadas; el fallback `|| cat` conserva robustez).
- **No se toca**: `serviceDurations[cat]`, `handleDurationChange(cat, …)`, el upsert de `admin_settings`, `htmlFor`/`id` (siguen con la clave cruda).

## 2. Parte B — Migración `20261004000000_spec_013_services.sql`

Formato y reglas alineados a `supabase/migrations/20261003120000_spec_010_favorites_orders.sql` y a la skill `supabase-postgres-best-practices` (RLS con `(select …)`, least privilege, idempotencia con `if not exists`/`drop … if exists`, FK/índices explícitos — acá no hay FK). **Aplicación manual**: cabecera con nota de que el MCP no puede aplicarla; aplicar con `supabase db push` o SQL Editor.

### 2.1 Estructura

1. **Tabla** (schema completo en spec §6): `public.services` con `unique (name)` (`services_unique_name`), `check (duration_minutes > 0)`, `check (price >= 0)`, defaults (`'general'`, `60`, `0`, `true`).
2. **Índices**: `services_category_idx (category)`, `services_sort_order_idx (sort_order)`.
3. **Trigger**: `services_set_updated_at` → `public.set_updated_at()` (reutiliza la función de spec 007; con `drop trigger if exists` previo).
4. **RLS**:
   ```sql
   alter table public.services enable row level security;

   -- Lectura pública: solo activos (anon + authenticated)
   create policy "services_public_select" on public.services
     for select to anon, authenticated using (is_active);

   -- Admin: ve TODO (incluye ocultos) y hace CRUD
   create policy "services_admin_select" on public.services
     for select to authenticated using ((select public.is_admin()));
   create policy "services_admin_insert" on public.services
     for insert to authenticated with check ((select public.is_admin()));
   create policy "services_admin_update" on public.services
     for update to authenticated
     using ((select public.is_admin())) with check ((select public.is_admin()));
   create policy "services_admin_delete" on public.services
     for delete to authenticated using ((select public.is_admin()));
   ```
   (Un admin logueado ve el **unión** de `public_select` + `admin_select` → todos los filas; un anon solo ve `is_active = true`.)
5. **Grants mínimos**:
   ```sql
   grant select on public.services to anon, authenticated;
   grant insert, update, delete on public.services to authenticated;
   ```
6. **Seed idempotente** (`insert … on conflict (name) do nothing`), nombres **exactos** de `SERVICE_OPTIONS`:

   | # | name | category | duration_minutes (est.) |
   |---|------|----------|--------------------------|
   | 1 | Uñas: Semipermanente & Capping | Uñas | 60 |
   | 2 | Uñas: Esculpidas en Gel / Acrigel | Uñas | 90 |
   | 3 | Uñas: Soft Gel Tips de Autor | Uñas | 90 |
   | 4 | Uñas: Nail Art & Pedrería | Uñas | 60 |
   | 5 | Cabello: Alisado Espejo / Plastificado | Cabello | 120 |
   | 6 | Cabello: Nutrición & Shock de Keratina | Cabello | 90 |
   | 7 | Cabello: Peinado Social & Styling | Cabello | 45 |
   | 8 | Maquillaje: MakeUp Social Glam | Maquillaje | 60 |
   | 9 | Maquillaje: MakeUp Noche Piel Blindada | Maquillaje | 75 |
   | 10 | Maquillaje: Novias & Quinceañeras HD | Maquillaje | 90 |

   Todas con `sort_order` = índice (1..10), `price = null`, `is_active = true`. Duraciones estimadas; el admin puede ajustarlas luego desde la pestaña nueva.

7. **Comentarios**: `comment on table/column` documentando el modelo (criterio de las specs previas).

## 3. `src/components/admin/ServicesTab.jsx` (nuevo)

Patrón espejo de `TurnosTab.jsx` (sección con heading, estados loading/error/vacío, botón "Actualizar") + `ProductForm.jsx` (formulario con validación por campo, errores `role="alert"`, envío con estado). Export default `ServicesTab`.

### 3.1 Estado y carga

```js
const [services, setServices] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');          // incluye hint de migración pendiente
const [saving, setSaving] = useState(false);     // guardado / toggle / delete
const [editing, setEditing] = useState(null);    // servicio en edición o null (modo crear)
```

- `fetchServices`: `supabase.from('services').select('*').order('sort_order', { ascending: true })`.
- Si el error es `42P01`/`PGRST205` (tabla inexistente): mensaje amigable "La tabla services todavía no existe. Aplicá la migración spec 013 (SQL Editor o supabase db push)."
- Badge "oculto" (ámbar) para `!service.is_active`.

### 3.2 Formulario (crear / editar)

Campos: `name*`, `category` (`<select>` con `'Uñas' | 'Cabello' | 'Maquillaje' | 'packs' | 'general'`; si el servicio en edición tiene otra categoría, se agrega al select), `description` (textarea), `duration_minutes*` (number, min 1), `price` (number, vacío → `null`), `sort_order` (number, min 0), `is_active` (checkbox "Visible en el TurnoModal").

- Validación cliente (RF-B8): name no vacío; duration entero > 0; price vacío o ≥ 0; sort_order ≥ 0.
- Guardar: modo crear → `insert`; modo editar → `update … eq('id', …)`. Manejo de `23505` (nombre duplicado) → "Ya existe un servicio con ese nombre."
- Tras guardar/eliminar/toggle: `fetchServices()` y reset de `editing`.

### 3.3 Acciones por fila (lista)

- **Editar**: precarga el formulario (`setEditing(service)`; scroll/foco al form).
- **Eliminar**: `window.confirm` con el nombre → `delete().eq('id', …)`.
- **Visible/Oculto**: `update({ is_active: !s.is_active })` + refetch (patrón optimista simple con rollback solo si falla).
- Controles con `min-h-[44px]`, iconos lucide (`Pencil`, `Trash2`, `Eye`/`EyeOff`, `RefreshCw`, `Scissors`), paleta de marca, foco visible.

### 3.4 Precio

Si `price != null`, mostrar en la lista con `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })` (criterio spec 007); si `null`, mostrar "Consultar" en texto tenue (el TurnoModal no muestra precios; es dato informativo del admin).

## 4. `src/pages/AdminPage.jsx` — 4ª pestaña

- Import: `import ServicesTab from '../components/admin/ServicesTab';` e icono `Scissors` desde `lucide-react`.
- Nuevo botón en el `<nav>` existente (después de "Config. Turnos"), con el mismo patrón de clases que las otras (active: gradiente borgoña; `min-h-[44px]`, gap-2):
  ```jsx
  <button type="button" onClick={() => setActiveTab('services')} …>
    <Scissors size={18} aria-hidden="true" />
    <span>Servicios</span>
  </button>
  ```
- Render en `<main>`: encadenar un `activeTab === 'services' ? <ServicesTab />` antes del `else` de `TurnSettingsTab` (las 3 ramas actuales quedan intactas).
- Actualizar el comentario de `activeTab` (`'products' | 'appointments' | 'settings' | 'services'`).
- Nota mobile: el nav ya usa `flex gap-1 p-1` dentro de un header `flex flex-wrap`; con 4 pestañas validar wrap en 320px (el texto "Config. Turnos" puede comprimirse; si rompe, usar `flex-wrap` en el nav — decisión visual en T6).

## 5. `src/components/TurnoModalEnhanced.jsx` — integración pública

### 5.1 Carga de servicios al abrir

Estado nuevo junto a `adminSettings`:

```js
const [serviceOptions, setServiceOptions] = useState(SERVICE_OPTIONS); // fallback inmediato
const [dbCategoryByService, setDbCategoryByService] = useState({});    // name → category (DB)
```

Nuevo `useEffect` (deps `[isOpen]`, mismo patrón tolerante que `admin_settings_public`):

```js
supabase
  .from('services')
  .select('name, category, duration_minutes, is_active')
  .eq('is_active', true)
  .order('sort_order', { ascending: true })
  .then(({ data, error }) => {
    if (error || !data || data.length === 0) {
      // 42P01/PGRST205/vacío → fallback silencioso (console.warn)
      return; // serviceOptions sigue en SERVICE_OPTIONS
    }
    setServiceOptions(data.map((s) => s.name));
    setDbCategoryByService(
      Object.fromEntries(data.map((s) => [s.name, s.category]))
    );
  });
```

- `mounted` guard (como el efecto de `admin_settings_public`) para no setState tras desmontar.
- El `<select>` del paso calendario (línea ~561) y la lógica de default pasan a iterar `serviceOptions` en lugar de `SERVICE_OPTIONS` (búsqueda `SERVICE_OPTIONS.find` → `serviceOptions.find`).

### 5.2 Servicio por defecto (carrera open→carga)

El efecto de apertura (líneas 492–522) ya setea `defaultService` con `SERVICE_OPTIONS`. Cambio:

- Dentro del mismo efecto, usar `serviceOptions` **del render actual** (que arranca como `SERVICE_OPTIONS`, así el default es idéntico hoy).
- Efecto adicional (deps `[serviceOptions]`): si `selectedService` ya no está en `serviceOptions` (porque llegó la lista de DB y el default cambió) **y** el usuario no interactuó aún con el select, re-aplicar la misma lógica (`initialService` → match `includes` → primero de la lista). Guard simple: comparar `selectedService` contra el valor seteado por defecto; si difiere de ambos (default anterior y nuevo), no pisar. Alternativa aceptable y más simple: re-ejecutar la lógica de default solo si `selectedService` está vacío o ya no existe en `serviceOptions`.

### 5.3 `getCategoryKey` con prioridad a la categoría DB

Firma ampliada (parámetro nuevo con default para no romper los 2 call sites actuales):

```js
function getCategoryKey(displayName, durations = {}, categoryByService = {}) {
  // 1) Prioridad: categoría real del servicio cargado desde la DB
  const raw = categoryByService[displayName];
  if (raw) {
    const key = String(raw).toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');        // 'Uñas' → 'unas'
    if (durations[key]) return key;            // solo si admin_settings la conoce
    if (['unas', 'cabello', 'maquillaje', 'packs'].includes(key)) return key;
  }
  // 2) Fallback: lógica actual por texto (sin cambios)
  const name = (displayName || '').toLowerCase();
  if (name.includes('uña')) return 'unas';
  …
}
```

Call sites actualizados:

```jsx
<CalendarAvailability
  selectedService={getCategoryKey(selectedService, adminSettings.service_durations, dbCategoryByService)}
  serviceDurations={getNormalizedDurations(selectedService, adminSettings.service_durations, dbCategoryByService)}
  …
/>
```

`getNormalizedDurations` delega en `getCategoryKey` (sin cambios estructurales). **No se toca** `CalendarAvailability`, la Edge Function ni el guardado: `slot.service` sigue siendo la clave de categoría y `service_key` en `user_appointments` no cambia de significado (CA-09).

### 5.4 Qué NO se toca en el modal

- `TurnoModalForm` (sin uso), `SERVICE_OPTIONS`/`SERVICE_KEY_MAP` de módulo (quedan como fallback), `SERVICE_KEY_MAP`/`getServiceKey` internos (sin uso), pasos `confirming`/`fallback`/`success`, `handleSlotSelected`, `notifyOwner`, mensajes WhatsApp.

## 6. Enfoque de implementación y verificación

Orden: **T1 (Parte A) → T2 (migración) → T3 (ServicesTab) → T4 (AdminPage) → T5 (TurnoModal) → T6 (build + validación visual, con y sin migración) → T7 (MEMORY)**. T3 y T4 son dependientes entre sí (import); T1 y T5 son independientes en código (T5 degrada sin T2).

Verificación (constitución §4):

1. `npm run build` (exit 0, sin warnings nuevos).
2. **Sin migración**: `/admin` → pestaña Servicios muestra error amigable de migración; TurnoModal muestra las 10 opciones hardcodeadas; flujo de turno completo (calendario → WhatsApp → `user_appointments`) sin errores.
3. **Con migración aplicada**: pestaña Servicios lista los 10 servicios sembrados; crear/editar/eliminar/ocultar funcionan; ocultar un servicio lo remueve del TurnoModal; crear servicio nuevo lo agrega ordenado por `sort_order`.
4. Parte A: Config. Turnos muestra "Uñas/Cabello/Maquillaje/Packs"; guardar duraciones sigue persistiendo con claves crudas (`admin_settings.service_durations`).
5. Accesibilidad: tab-order, foco visible, labels, 44px; mobile 320px.

## 7. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Migración no aplicada y admin cree que "no anda" | RF-B5/CA-06: fallback en TurnoModal + mensaje explícito de migración pendiente en ServicesTab. |
| PostgREST cachea el esquema (`PGRST205`) tras crear la tabla | Tras aplicar, esperar/refrescar; el código ya trata `PGRST205` como fallback. |
| `unique(name)` rompe el guardado con error crudo 23505 | ServicesTab traduce a mensaje amigable (RF-B8/§3.2). |
| Carrera al abrir el modal (default vs lista DB) | §5.2: solo re-aplicar default si el usuario no eligió o el valor ya no existe en la lista. |
| Categoría DB fuera de `service_durations` (p. ej. `'general'`) | `getCategoryKey` cae al fallback actual (§5.3); sin regresión. |
| Nav de 4 pestañas rompe en 320px | Validar en T6; si hace wrap, agregar `flex-wrap` al nav (patrón ya presente en el header). |
| Semillas con nombres que difieren de `SERVICE_OPTIONS` (futuro rename) | El fallback del modal mantiene los 10 actuales; el seed usa nombres exactos verificados (§2.1). |
| RLS mal diseñada exponiendo servicios ocultos | `services_public_select` filtra `is_active`; políticas admin con `(select public.is_admin())` (criterio spec 007/010). |

## 8. Criterios de éxito

- "Unas" desaparece de Config. Turnos; el guardado no cambia.
- El admin puede administrar servicios (alta/baja/ocultar) sin tocar código.
- El TurnoModal refleja los servicios activos de la DB y degrada grácil sin ella.
- Build OK, sin dependencias nuevas, front 100% funcional sin la migración aplicada.
