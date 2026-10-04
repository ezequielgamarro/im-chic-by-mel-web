import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import CalendarAvailability from './CalendarAvailability';
import { buildFallbackTurnoMessage } from '../utils/whatsapp';
import { notifyOwner } from '../lib/notifyOwner';
import { formatServiceName } from '../utils/serviceNames';
import { CheckCircle2, AlertCircle, Loader2, AlertTriangle, Sparkles, X, Calendar, Clock, Phone, User, Mail, Lock, ExternalLink } from 'lucide-react';

const SERVICE_KEY_MAP = {
  'Uñas: Semipermanente & Capping': 'unas_semipermanente',
  'Uñas: Esculpidas en Gel / Acrigel': 'unas_esculpidas',
  'Uñas: Soft Gel Tips de Autor': 'unas_soft_gel',
  'Uñas: Nail Art & Pedrería': 'unas_nail_art',
  'Cabello: Alisado Espejo / Plastificado': 'cabello_alisado',
  'Cabello: Nutrición & Shock de Keratina': 'cabello_nutricion',
  'Cabello: Peinado Social & Styling': 'cabello_peinado',
  'Maquillaje: MakeUp Social Glam': 'maquillaje_social',
  'Maquillaje: MakeUp Noche Piel Blindada': 'maquillaje_noche',
  'Maquillaje: Novias & Quinceañeras HD': 'maquillaje_novias',
};

const SERVICE_OPTIONS = [
  'Uñas: Semipermanente & Capping',
  'Uñas: Esculpidas en Gel / Acrigel',
  'Uñas: Soft Gel Tips de Autor',
  'Uñas: Nail Art & Pedrería',
  'Cabello: Alisado Espejo / Plastificado',
  'Cabello: Nutrición & Shock de Keratina',
  'Cabello: Peinado Social & Styling',
  'Maquillaje: MakeUp Social Glam',
  'Maquillaje: MakeUp Noche Piel Blindada',
  'Maquillaje: Novias & Quinceañeras HD'
];

const TIME_SLOTS = [
  '09:30', '11:00', '14:00', '15:30', '17:00', '18:30', '19:30'
];

// Mapea el nombre de servicio mostrado a la categoría usada en admin_settings.service_durations
function getCategoryKey(displayName, durations = {}) {
  const name = (displayName || '').toLowerCase();
  if (name.includes('uña')) return 'unas';
  if (name.includes('cabello')) return 'cabello';
  if (name.includes('maquillaje') || name.includes('makeup')) return 'maquillaje';
  if (name.includes('pack')) return 'packs';
  // Si existe una clave que coincida, usarla; si no, 'unas' por defecto
  const keys = Object.keys(durations || {});
  if (keys.length > 0) return keys[0];
  return 'unas';
}

// Devuelve { [categoryKey]: minutos } para que CalendarAvailability encuentre la duración
function getNormalizedDurations(displayName, durations = {}) {
  const key = getCategoryKey(displayName, durations);
  const minutes = (durations && durations[key]) || 60;
  return { [key]: minutes };
}

function TurnoModalForm({ onServiceSelect, onSubmit, initialService = '' }) {
  // Fecha por defecto: mañana
  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Servicio por defecto: el inicial, o el primero de la lista
  const defaultService = (() => {
    if (initialService) {
      const found = SERVICE_OPTIONS.find((s) => s.toLowerCase().includes(initialService.toLowerCase()));
      return found || initialService;
    }
    return SERVICE_OPTIONS[0];
  })();

  const [formData, setFormData] = useState({
    name: '', phone: '', service: defaultService, date: defaultDate, time: '15:30', notes: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Por favor ingresá tu nombre completo.';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 6) {
      errs.phone = 'Ingresá un número de teléfono válido (mínimo 6 dígitos).';
    }
    if (!formData.date) {
      errs.date = 'Seleccioná la fecha para tu turno.';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (formData.date < todayStr) {
        errs.date = 'La fecha no puede ser en el pasado.';
      }
    }
    if (!formData.time) {
      errs.time = 'Seleccioná un horario.';
    }
    if (!formData.service) {
      errs.service = 'Seleccioná el servicio a realizar.';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const errs = validateForm();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      onSubmit(formData);
    } catch (error) {
      console.error('Error al generar el turno:', error);
      setErrors({ global: 'Ocurrió un error inesperado al procesar el turno. Por favor reintentá.' });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {(errors.global || Object.keys(errors).length > 0) && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {errors.global || 'Revisá los campos marcados en rojo para continuar.'}
          </span>
        </div>
      )}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
          Tu Nombre y Apellido *
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50" aria-hidden="true" />
          <input
            type="text"
            placeholder="Ej: Sofía Giménez"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-400 bg-red-50/50' : 'border-[#FFC9D6]/80 bg-white'} text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all`}
          />
        </div>
        {errors.name && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
          Tu Teléfono / WhatsApp *
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50" aria-hidden="true" />
          <input
            type="tel"
            placeholder="Ej: 381 555-1234"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.phone ? 'border-red-400 bg-red-50/50' : 'border-[#FFC9D6]/80 bg-white'} text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all`}
          />
        </div>
        {errors.phone && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
          Servicio a Realizar *
        </label>
        <select
          value={formData.service}
          onChange={(e) => {
            setFormData({ ...formData, service: e.target.value });
            onServiceSelect(e.target.value);
          }}
          className={`w-full px-4 py-2.5 rounded-xl border ${errors.service ? 'border-red-400 bg-red-50/50' : 'border-[#FFC9D6]/80 bg-white'} text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all`}
        >
          {SERVICE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {errors.service && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.service}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
            Fecha del Turno *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50 pointer-events-none" />
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full pl-10 pr-3 py-2 rounded-xl border ${errors.date ? 'border-red-400 bg-red-50/50' : 'border-[#FFC9D6]/80 bg-white'} text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all`}
            />
          </div>
          {errors.date && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
            Horario Estimado *
          </label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50 pointer-events-none" />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className={`w-full pl-10 pr-3 py-2 rounded-xl border ${errors.time ? 'border-red-400 bg-red-50/50' : 'border-[#FFC9D6]/80 bg-white'} text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all`}
            />
          </div>
        </div>
      </div>

      <div>
        <span className="block text-[11px] text-[#5A0B22]/70 mb-1.5 font-medium">
          Horarios más solicitados:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {TIME_SLOTS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFormData({ ...formData, time: t })}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                formData.time === t
                  ? 'bg-[#5A0B22] text-white border-[#5A0B22] font-bold shadow-sm'
                  : 'bg-white text-[#5A0B22] border-[#FFC9D6] hover:bg-[#FFF0F3]'
              }`}
            >
              {t} hs
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
          Detalles o Aclaraciones (Opcional)
        </label>
        <textarea
          rows={2}
          placeholder="Ej: Con retiro de esmalte anterior, diseño especial, etc."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl border border-[#FFC9D6]/80 bg-white text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all resize-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-medium text-sm sm:text-base tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Calendar size={20} className="text-[#F7E7B4]" />
          <span>Continuar y Ver Disponibilidad</span>
        </button>
        <p className="text-[11px] text-[#5A0B22]/60 text-center mt-2">
          Seleccioná día y hora con disponibilidad en tiempo real
        </p>
      </div>
    </form>
  );
}

function TurnoModalEnhanced({ isOpen, onClose, initialService = '' }) {
  const { user, session } = useAuth();
  const [step, setStep] = useState('calendar');
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [fallbackData, setFallbackData] = useState(null);
  const [adminSettings, setAdminSettings] = useState({
    service_durations: {},
    business_hours: {},
    slot_granularity_minutes: 15,
  });

  // Cargar configuración del admin (duraciones, horarios, granularidad) desde la vista pública
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    supabase
      .from('admin_settings_public')
      .select('service_durations, business_hours, slot_granularity_minutes')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.warn('[admin_settings_public] No se pudo cargar config:', error.message);
          return;
        }
        if (mounted && data) {
          setAdminSettings({
            service_durations: data.service_durations || {},
            business_hours: data.business_hours || {},
            slot_granularity_minutes: data.slot_granularity_minutes || 15,
          });
        }
      });
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const SERVICE_KEY_MAP = {
    'Uñas: Semipermanente & Capping': 'unas_semipermanente',
    'Uñas: Esculpidas en Gel / Acrigel': 'unas_esculpidas',
    'Uñas: Soft Gel Tips de Autor': 'unas_soft_gel',
    'Uñas: Nail Art & Pedrería': 'unas_nail_art',
    'Cabello: Alisado Espejo / Plastificado': 'cabello_alisado',
    'Cabello: Nutrición & Shock de Keratina': 'cabello_nutricion',
    'Cabello: Peinado Social & Styling': 'cabello_peinado',
    'Maquillaje: MakeUp Social Glam': 'maquillaje_social',
    'Maquillaje: MakeUp Noche Piel Blindada': 'maquillaje_noche',
    'Maquillaje: Novias & Quinceañeras HD': 'maquillaje_novias',
  };

  const getServiceKey = (displayName) => {
    return SERVICE_KEY_MAP[displayName] || displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }

  const handleSlotSelected = useCallback(async (slot) => {
    setSelectedSlot(slot);
    setStep('confirming');
    setLoading(true);
    setError(null);

    const loggedIn = !!(user && session);

    // Datos del cliente desde el formulario (o vacíos si no hay)
    const client = formData || { name: '', phone: '', email: '', notes: '' };

    // Abrimos la pestaña de WhatsApp AHORA (sincrónico, dentro del clic) para que
    // el navegador no la bloquee como popup; se navega después.
    let waRef = null;
    try {
      waRef = window.open('', '_blank');
    } catch (e) {
      waRef = null;
    }

    // Abre WhatsApp al dueño con el resumen del turno (no requiere API paga)
    const openOwnerWhatsApp = () => {
      const dt = slot.datetime ? new Date(slot.datetime) : null;
      const fecha = dt ? dt.toLocaleDateString('es-AR') : '';
      const hora = dt ? dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '';
      const servicio = formatServiceName(slot.service);
      const usuario = client.name || client.email || user?.email || '';
      const msg = loggedIn && usuario
        ? `Hola! Acabo de solicitar un turno para ${servicio} el ${fecha} a las ${hora}. Mi usuario es ${usuario}.`
        : `Hola! Quería consultar disponibilidad para ${servicio} el ${fecha} a las ${hora}. ¿Está disponible?`;
      const url = `https://wa.me/5493813553492?text=${encodeURIComponent(msg)}`;
      try {
        if (waRef && !waRef.closed) {
          waRef.opener = null;
          waRef.location.href = url;
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      } catch (e) {
        console.warn('No se pudo abrir WhatsApp:', e?.message);
      }
    };

    // Invitado: no se guarda en BD, solo se consulta disponibilidad por WhatsApp
    if (!loggedIn) {
      setSuccess('Te enviamos a WhatsApp para consultar disponibilidad. Aguardá la respuesta de la dueña.');
      setIsSuccess(true);
      setStep('success');
      setLoading(false);
      openOwnerWhatsApp();
      return;
    }

    // Guarda el turno en la BD (solo usuarios logueados)
    const saveAppointment = async (status, googleEventId = null) => {
      try {
        const { data: inserted, error: dbError } = await supabase
          .from('user_appointments')
          .insert([{
            user_id: user.id,
            service_key: slot.service,
            scheduled_at: slot.datetime || null,
            status,
            google_event_id: googleEventId,
            client_name: client.name || null,
            client_phone: client.phone || null,
            notes: client.notes || null,
            whatsapp_message: `Cliente ${client.name} (${client.phone}) quiere ${slot.service} el ${slot.datetime?.split('T')[0]} a las ${slot.datetime?.split('T')[1]?.slice(0, 5)}. ¿Tenés disponibilidad?`,
          }])
          .select();

        if (dbError) {
          console.error('[user_appointments] Error al insertar:', dbError.message);
          return { ok: false, error: dbError };
        }
        console.log('[user_appointments] Turno guardado:', inserted);

        // Notificación "silenciosa" al dueño (webhook si está configurado + alerta en panel)
        if (inserted?.[0]) {
          notifyOwner(inserted[0]);
        }

        return { ok: true, data: inserted };
      } catch (e) {
        console.error('[user_appointments] Excepción al insertar:', e.message);
        return { ok: false, error: e };
      }
    };

    try {
      const response = await fetch(
        'https://nxviapvgzfdzzyctzokh.supabase.co/functions/v1/calendar-create-event',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_key: slot.service,
            datetime: slot.datetime,
            duration: slot.duration,
            client_data: client,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      // Si la función pide fallback (Calendar no conectado / slot ocupado)
      if (!response.ok || result.fallback) {
        const rFallback = await saveAppointment('solicitado');
        if (rFallback.ok) setIsSuccess(true);
        setFallbackData({ reason: result.error || 'Disponibilidad a confirmar' });
        setStep('fallback');
        openOwnerWhatsApp();
        return;
      }

      // Éxito en Calendar: guardar como confirmado
      const saved = await saveAppointment('confirmado', result.google_event_id);

      if (!saved.ok) {
        setError('Tu turno se creó pero no pudimos guardarlo en tu cuenta. Contactá a soporte.');
        setStep('fallback');
        openOwnerWhatsApp();
        return;
      }

      setSuccess('¡Turno confirmado! Se guardó en tu calendario y en tu cuenta. Te contactaremos por WhatsApp.');
      setIsSuccess(true);
      setStep('success');
      openOwnerWhatsApp();
    } catch (err) {
      console.error('Error confirming appointment:', err);
      // Aun con error de red/función, guardamos como 'solicitado'
      const rCatch = await saveAppointment('solicitado');
      if (rCatch.ok) setIsSuccess(true);
      setFallbackData({ reason: 'No pudimos confirmar automáticamente. Tu solicitud quedó registrada.' });
      setStep('fallback');
      openOwnerWhatsApp();
    } finally {
      setLoading(false);
    }
  }, [user, session, formData]);

  const resetModal = useCallback(() => {
    setStep('form');
    setSelectedService('');
    setError(null);
    setSuccess('');
    setFallbackData(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    // Servicio por defecto: el inicial, o el primero de la lista
    const defaultService = (() => {
      if (initialService) {
        const found = SERVICE_OPTIONS.find((s) => s.toLowerCase().includes(initialService.toLowerCase()));
        return found || initialService;
      }
      return SERVICE_OPTIONS[0];
    })();
    setSelectedService(defaultService);
    // Datos del cliente desde el perfil del usuario logueado (sin formulario intermedio)
    setFormData({
      name: user?.user_metadata?.full_name || '',
      phone: user?.user_metadata?.phone || '',
      email: user?.email || '',
      notes: '',
      service: defaultService,
      date: '',
      time: '',
    });
    setStep('calendar');
    setIsSuccess(false);
    setError(null);
    setSuccess('');
    setFallbackData(null);
    // Nota: NO incluimos `user` en las deps a propósito. Si lo hiciéramos, un refresco
    // de sesión (p. ej. al volver de la pestaña de WhatsApp) re-ejecutaría este efecto
    // y resetearía el modal al calendario. Solo queremos inicializar al ABRIR.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialService]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-[#5A0B22]/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      
      <div className="premium-card animate-scale-in relative w-full max-w-lg p-6 sm:p-8 z-10 my-8 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Cerrar modal" className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FFF0F3] hover:bg-[#FFC9D6] text-[#5A0B22] flex items-center justify-center transition-colors shadow-sm">
          <X size={18} />
        </button>

        {!isSuccess && step === 'calendar' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC9D6]/60 border border-[#D87F95]/30 text-[#7A1333] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} className="text-[#D4AF37]" />
                <span>Disponibilidad en Tiempo Real</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#5A0B22]">
                Elegí tu día y hora
              </h3>
              <p className="text-xs text-[#5A0B22]/70 mt-1 max-w-sm mx-auto">
                Los días verdes tienen horarios disponibles. Los rojos están completos.
              </p>
            </div>

            {/* Selector de servicio (directo, sin paso intermedio) */}
            <div>
              <label htmlFor="enhanced-service" className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
                Servicio
              </label>
              <select
                id="enhanced-service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[#FFC9D6]/80 bg-white text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all"
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <CalendarAvailability
              selectedService={getCategoryKey(selectedService, adminSettings.service_durations)}
              onSlotSelected={handleSlotSelected}
              serviceDurations={getNormalizedDurations(selectedService, adminSettings.service_durations)}
              businessHours={adminSettings.business_hours}
              slotGranularity={adminSettings.slot_granularity_minutes}
              disabled={loading}
            />
          </div>
        )}

        {!isSuccess && step === 'confirming' && (
          <div className="text-center py-10">
            <Loader2 size={48} className="mx-auto mb-4 text-[#7A1333] animate-spin" />
            <p className="text-[#5A0B22]/75 font-medium">Confirmando tu turno…</p>
          </div>
        )}

        {!isSuccess && step === 'fallback' && (
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle size={34} />
            </div>
            <div>
              <h4 className="font-serif text-2xl font-bold text-[#5A0B22]">Solicitud registrada</h4>
              <p className="text-sm text-[#5A0B22]/80 mt-1 max-w-sm mx-auto">
                {fallbackData?.reason || 'No pudimos confirmar automáticamente con Google Calendar.'} Tu solicitud quedó guardada y podés avisarle a Melany por WhatsApp.
              </p>
            </div>

            <a
              href={`https://wa.me/5493813553492?text=${buildFallbackTurnoMessage({
                name: formData?.name || user?.user_metadata?.full_name || '',
                phone: formData?.phone || user?.user_metadata?.phone || '',
                service: selectedService,
                date: selectedSlot?.datetime ? selectedSlot.datetime.split('T')[0] : '',
                time: selectedSlot?.datetime ? selectedSlot.datetime.split('T')[1]?.slice(0, 5) : '',
              })}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all min-h-[48px]"
            >
              <Phone size={18} />
              <span>Enviar solicitud por WhatsApp</span>
              <ExternalLink size={14} className="opacity-80" />
            </a>

            <button
              type="button"
              onClick={() => setStep('calendar')}
              className="text-xs text-[#5A0B22]/70 hover:text-[#5A0B22] underline cursor-pointer"
            >
              Volver a elegir otro horario
            </button>
          </div>
        )}

        {isSuccess && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="font-serif text-2xl font-bold text-[#5A0B22]">
                {user ? '¡Turno solicitado!' : '¡Consulta enviada!'}
              </h4>
              <p className="text-sm text-[#5A0B22]/80 mt-2 max-w-sm mx-auto">
                {success || 'Te enviamos a WhatsApp para notificar a la dueña. Por favor, aguardá su confirmación.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/5493813553492?text=${buildFallbackTurnoMessage({
                  name: formData?.name || user?.user_metadata?.full_name || '',
                  phone: formData?.phone || user?.user_metadata?.phone || '',
                  service: selectedService,
                  date: selectedSlot?.datetime ? selectedSlot.datetime.split('T')[0] : '',
                  time: selectedSlot?.datetime ? selectedSlot.datetime.split('T')[1]?.slice(0, 5) : '',
                })}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                <Phone size={16} aria-hidden="true" />
                <span>Reabrir WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow hover:shadow-lg transition-all"
              >
                <X size={16} aria-hidden="true" />
                <span>Cerrar</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#5A0B22]/60 hover:text-[#5A0B22] underline cursor-pointer"
            >
              Finalizar y cerrar
            </button>
          </div>
        )}

        {!isSuccess && error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TurnoModalEnhanced;