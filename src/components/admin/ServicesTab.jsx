import React, { useState, useEffect, useCallback } from 'react';
import {
  Scissors,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Inbox,
  Save,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CustomCheckbox from '../CustomCheckbox';

// Categorías del select del formulario (spec 013 RF-B7/§3.2).
const CATEGORY_OPTIONS = ['Uñas', 'Cabello', 'Maquillaje', 'packs', 'general'];

// Errores que indican que la migración spec 013 todavía no está aplicada.
const MIGRATION_ERROR_CODES = ['42P01', 'PGRST205'];

// Errores que indican que la migración spec 016 todavía no está aplicada
// (columnas estimated_duration_text / block_minutes inexistentes).
const MIGRATION_016_CODES = ['PGRST204', '42703'];
const MIGRATION_016_HINT =
  'Aplicá la migración spec 016 en el SQL Editor para editar duraciones';

const isMigration016Error = (err) => {
  if (!err) return false;
  return (
    MIGRATION_016_CODES.includes(err.code) ||
    /column .* does not exist/i.test(err.message || '')
  );
};

const EMPTY_FORM = {
  name: '',
  category: 'Uñas',
  description: '',
  estimated_duration_text: '',
  block_minutes: '',
  price: '',
  sort_order: '0',
  is_active: true,
};

const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') return 'Consultar';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
};

/**
 * Pestaña "Servicios" del panel admin (spec 013 RF-B6/RF-B7/RF-B8/RF-B9):
 * CRUD sobre `public.services` (lista, crear, editar, eliminar, alternar
 * visibilidad). Patrón espejo de TurnosTab (estados/acciones) + ProductForm
 * (formulario con validación por campo). Sin la migración aplicada muestra un
 * error amigable con hint de migración pendiente.
 */
export default function ServicesTab() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false); // guardado del formulario
  const [busyId, setBusyId] = useState(null);  // toggle/eliminar en curso
  const [editing, setEditing] = useState(null); // servicio en edición o null (crear)
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitErrorIsHint, setSubmitErrorIsHint] = useState(false); // hint de migración 016 (role=status)

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });

    if (fetchError) {
      setServices([]);
      if (MIGRATION_ERROR_CODES.includes(fetchError.code)) {
        setError(
          'La tabla services todavía no existe. Aplicá la migración spec 013 (SQL Editor o supabase db push).'
        );
      } else {
        setError(fetchError.message);
      }
    } else {
      setServices(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const startEdit = (service) => {
    setEditing(service);
    setFormErrors({});
    setSubmitError('');
    setSubmitErrorIsHint(false);
    setForm({
      name: service.name ?? '',
      // Si el servicio en edición trae una categoría fuera del select, se agrega
      // como valor libre (ver categoryOptions abajo).
      category: service.category ?? 'general',
      description: service.description ?? '',
      estimated_duration_text: service.estimated_duration_text ?? '',
      block_minutes:
        service.block_minutes !== null && service.block_minutes !== undefined
          ? String(service.block_minutes)
          : '',
      price:
        service.price !== null && service.price !== undefined ? String(service.price) : '',
      sort_order:
        service.sort_order !== null && service.sort_order !== undefined
          ? String(service.sort_order)
          : '0',
      is_active: service.is_active !== false,
    });
    if (typeof document !== 'undefined') {
      const formEl = document.getElementById('service-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSubmitError('');
    setSubmitErrorIsHint(false);
  };

  const validate = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = 'Ingresá el nombre del servicio.';
    }

    const blockNum = Number(form.block_minutes);
    if (
      form.block_minutes.trim() === '' ||
      !Number.isInteger(blockNum) ||
      blockNum < 15 ||
      blockNum > 720
    ) {
      next.block_minutes = 'Ingresá los minutos a bloquear en la agenda (entero entre 15 y 720).';
    }

    if (form.price.trim() !== '') {
      const priceNum = Number(form.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        next.price = 'El precio debe ser un número mayor o igual a 0 (o dejalo vacío).';
      }
    }

    const sortNum = Number(form.sort_order);
    if (form.sort_order.trim() === '' || !Number.isInteger(sortNum) || sortNum < 0) {
      next.sort_order = 'Ingresá un orden de aparición mayor o igual a 0.';
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setFormErrors(nextErrors);
    setSubmitError('');
    setSubmitErrorIsHint(false);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || null,
        estimated_duration_text: form.estimated_duration_text.trim() || null,
        block_minutes: Number(form.block_minutes),
        price: form.price.trim() === '' ? null : Number(form.price),
        sort_order: Number(form.sort_order),
        is_active: Boolean(form.is_active),
      };

      const { error: saveError } = editing
        ? await supabase.from('services').update(payload).eq('id', editing.id)
        : await supabase.from('services').insert(payload);

      if (saveError) {
        if (saveError.code === '23505') {
          setSubmitError('Ya existe un servicio con ese nombre.');
        } else if (isMigration016Error(saveError)) {
          // Degradación RF-06: la migración 016 no está aplicada; no rompemos el resto.
          setSubmitError(MIGRATION_016_HINT);
          setSubmitErrorIsHint(true);
        } else {
          setSubmitError(saveError.message || 'No pudimos guardar el servicio. Intentalo de nuevo.');
        }
        return;
      }

      cancelEdit();
      fetchServices();
    } catch (e) {
      setSubmitError(e?.message || 'No pudimos guardar el servicio. Intentalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const removeService = async (service) => {
    if (!window.confirm(`¿Eliminar el servicio "${service.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setBusyId(service.id);
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', service.id);

    if (deleteError) {
      window.alert('No pudimos eliminar el servicio. Intentá de nuevo.');
    } else {
      if (editing && editing.id === service.id) cancelEdit();
      fetchServices();
    }
    setBusyId(null);
  };

  const toggleActive = async (service) => {
    setBusyId(service.id);
    const nextActive = !service.is_active;
    const { error: toggleError } = await supabase
      .from('services')
      .update({ is_active: nextActive })
      .eq('id', service.id);

    if (toggleError) {
      window.alert('No pudimos cambiar la visibilidad del servicio. Intentá de nuevo.');
    } else {
      // Actualización optimista local + refetch para garantizar consistencia.
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: nextActive } : s))
      );
      fetchServices();
    }
    setBusyId(null);
  };

  // Opciones del select de categoría: fijas + valor libre si el servicio en
  // edición trae una categoría distinta (no la perdemos al editar).
  const categoryOptions = (() => {
    const opts = [...CATEGORY_OPTIONS];
    if (editing?.category && !opts.includes(editing.category)) {
      opts.unshift(editing.category);
    }
    return opts;
  })();

  return (
    <section aria-labelledby="services-heading" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scissors size={20} className="text-[#D4AF37]" aria-hidden="true" />
          <h2 id="services-heading" className="font-serif text-lg sm:text-xl font-semibold text-[#5A0B22]">
            Servicios
          </h2>
        </div>
        <button
          type="button"
          onClick={fetchServices}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
        >
          <RefreshCw size={16} className="text-[#7A1333]" aria-hidden="true" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Formulario crear / editar */}
      <form
        id="service-form"
        onSubmit={handleSubmit}
        noValidate
        className="bg-white/90 border border-[#5A0B22]/10 rounded-3xl shadow-sm p-5 sm:p-6 flex flex-col gap-4"
      >
        <h3 className="font-serif text-lg font-semibold text-[#5A0B22]">
          {editing ? 'Editar servicio' : 'Crear servicio'}
        </h3>

        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="service-name" className="text-sm font-semibold text-[#5A0B22]">
            Nombre *
          </label>
          <input
            id="service-name"
            name="name"
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, name: e.target.value }));
              setFormErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="Ej.: Uñas: Semipermanente & Capping"
            aria-invalid={formErrors.name ? true : undefined}
            aria-describedby={formErrors.name ? 'service-name-error' : undefined}
            className="w-full min-h-[44px] px-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
          />
          {formErrors.name ? (
            <p id="service-name-error" role="alert" className="text-sm font-medium text-[#B91C1C]">
              {formErrors.name}
            </p>
          ) : null}
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="service-category" className="text-sm font-semibold text-[#5A0B22]">
            Categoría
          </label>
          <select
            id="service-category"
            name="category"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full min-h-[44px] px-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="service-description" className="text-sm font-semibold text-[#5A0B22]">
            Descripción
          </label>
          <textarea
            id="service-description"
            name="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Breve descripción del servicio (opcional)"
            className="w-full px-4 py-3 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 resize-y focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
          />
        </div>

        {/* Duración variable, precio y orden */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="service-estimated-duration-text" className="text-sm font-semibold text-[#5A0B22]">
              Texto estimado para el cliente
            </label>
            <input
              id="service-estimated-duration-text"
              name="estimated_duration_text"
              type="text"
              value={form.estimated_duration_text}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, estimated_duration_text: e.target.value }));
              }}
              placeholder="Ej: 1 a 2 hs"
              aria-invalid={formErrors.estimated_duration_text ? true : undefined}
              aria-describedby={formErrors.estimated_duration_text ? 'service-estimated-duration-text-error' : undefined}
              className="w-full min-h-[44px] px-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
            />
            {formErrors.estimated_duration_text ? (
              <p id="service-estimated-duration-text-error" role="alert" className="text-sm font-medium text-[#B91C1C]">
                {formErrors.estimated_duration_text}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="service-block-minutes" className="text-sm font-semibold text-[#5A0B22]">
              Minutos a bloquear en la agenda *
            </label>
            <input
              id="service-block-minutes"
              name="block_minutes"
              type="number"
              inputMode="numeric"
              min="15"
              max="720"
              step="1"
              value={form.block_minutes}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, block_minutes: e.target.value }));
                setFormErrors((prev) => ({ ...prev, block_minutes: '' }));
              }}
              placeholder="Ej: 120"
              aria-invalid={formErrors.block_minutes ? true : undefined}
              aria-describedby={formErrors.block_minutes ? 'service-block-minutes-error' : undefined}
              className="w-full min-h-[44px] px-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
            />
            {formErrors.block_minutes ? (
              <p id="service-block-minutes-error" role="alert" className="text-sm font-medium text-[#B91C1C]">
                {formErrors.block_minutes}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="service-price" className="text-sm font-semibold text-[#5A0B22]">
              Precio (ARS)
            </label>
            <input
              id="service-price"
              name="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, price: e.target.value }));
                setFormErrors((prev) => ({ ...prev, price: '' }));
              }}
              placeholder="Vacío = consultar"
              aria-invalid={formErrors.price ? true : undefined}
              aria-describedby={formErrors.price ? 'service-price-error' : undefined}
              className="w-full min-h-[44px] px-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
            />
            {formErrors.price ? (
              <p id="service-price-error" role="alert" className="text-sm font-medium text-[#B91C1C]">
                {formErrors.price}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="service-sort-order" className="text-sm font-semibold text-[#5A0B22]">
              Orden de aparición
            </label>
            <input
              id="service-sort-order"
              name="sort_order"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.sort_order}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, sort_order: e.target.value }));
                setFormErrors((prev) => ({ ...prev, sort_order: '' }));
              }}
              placeholder="Ej.: 1"
              aria-invalid={formErrors.sort_order ? true : undefined}
              aria-describedby={formErrors.sort_order ? 'service-sort-order-error' : undefined}
              className="w-full min-h-[44px] px-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
            />
            {formErrors.sort_order ? (
              <p id="service-sort-order-error" role="alert" className="text-sm font-medium text-[#B91C1C]">
                {formErrors.sort_order}
              </p>
            ) : null}
          </div>
        </div>

        {/* Visible */}
        <CustomCheckbox
          label="Visible en el TurnoModal"
          checked={form.is_active}
          onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
        />

        {submitError ? (
          <p
            role={submitErrorIsHint ? 'status' : 'alert'}
            className={`text-sm font-medium rounded-xl px-4 py-3 ${
              submitErrorIsHint
                ? 'text-[#7A1333] bg-[#FFF0F3] border border-[#7A1333]/20'
                : 'text-[#B91C1C] bg-[#FEE2E2]/70 border border-[#B91C1C]/20'
            }`}
          >
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            {saving ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  aria-hidden="true"
                />
                <span>Guardando…</span>
              </>
            ) : (
              <>
                <Save size={18} className="text-[#F7E7B4]" aria-hidden="true" />
                <span>{editing ? 'Guardar cambios' : 'Crear servicio'}</span>
              </>
            )}
          </button>

          {editing ? (
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#5A0B22]/20 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      {/* Lista: estados loading / error / vacío / datos */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16" role="status" aria-live="polite">
          <div
            className="w-10 h-10 rounded-full border-4 border-[#FFC9D6] border-t-[#7A1333] animate-spin"
            aria-hidden="true"
          />
          <p className="text-sm text-[#5A0B22]/75 font-medium">Cargando servicios…</p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 py-10 text-center bg-white/80 border border-[#B91C1C]/20 rounded-3xl p-6"
        >
          <AlertTriangle size={28} className="text-[#B91C1C]" aria-hidden="true" />
          <p className="text-sm text-[#B91C1C] font-medium">No pudimos cargar los servicios.</p>
          <p className="text-xs text-[#5A0B22]/70 break-words max-w-md">{error}</p>
          <button
            type="button"
            onClick={fetchServices}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            <RefreshCw size={18} className="text-[#F7E7B4]" aria-hidden="true" />
            <span>Reintentar</span>
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center bg-white/80 border border-[#5A0B22]/10 rounded-3xl p-6">
          <div className="w-14 h-14 rounded-full bg-[#FFC9D6]/60 text-[#7A1333] flex items-center justify-center">
            <Inbox size={26} aria-hidden="true" />
          </div>
          <p className="font-serif text-lg font-semibold">No hay servicios cargados</p>
          <p className="text-sm text-[#5A0B22]/75 leading-relaxed max-w-sm">
            Creá el primer servicio con el formulario de arriba. Los servicios visibles aparecen en el TurnoModal.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {services.map((service) => {
            const busy = busyId === service.id;
            return (
              <li key={service.id} className="premium-card-soft p-5 flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg font-semibold text-[#5A0B22] break-words">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#5A0B22]/60">
                      {service.category || 'general'}
                      {' · '}
                      {service.estimated_duration_text || `Aprox ${service.block_minutes ?? '—'} min`}
                      {' · bloquea '}
                      {service.block_minutes ?? '—'}
                      {' min'}
                      {service.sort_order !== null && service.sort_order !== undefined
                        ? ` · orden ${service.sort_order}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-[#FFC9D6]/40 text-[#5A0B22] border-[#D4AF37]/40">
                      {service.category || 'general'}
                    </span>
                    {service.is_active === false && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-800 border-amber-300">
                        oculto
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-white text-[#5A0B22] border-[#5A0B22]/15">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>

                {service.description ? (
                  <p className="text-sm text-[#5A0B22]/70">{service.description}</p>
                ) : null}

                {/* Acciones por fila */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-[#5A0B22]/10">
                  <button
                    type="button"
                    onClick={() => startEdit(service)}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/20 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
                  >
                    <Pencil size={16} aria-hidden="true" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleActive(service)}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-sm hover:bg-blue-100 disabled:opacity-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
                  >
                    {service.is_active === false ? (
                      <Eye size={16} aria-hidden="true" />
                    ) : (
                      <EyeOff size={16} aria-hidden="true" />
                    )}
                    <span>{service.is_active === false ? 'Visible' : 'Oculto'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeService(service)}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-100 disabled:opacity-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    <span>{busy ? 'Procesando…' : 'Eliminar'}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
