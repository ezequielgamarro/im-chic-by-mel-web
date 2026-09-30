import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Phone, Sparkles, CheckCircle2, AlertCircle, ExternalLink, Download } from 'lucide-react';

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
  'Maquillaje: Novias & Quinceañeras HD',
  'Pack: Look Total (MakeUp + Peinado)',
  'Pack: Belleza Completa (Uñas + Pelo + MakeUp)',
  'Experiencia Novia VIP Integral',
  'Cursos: Masterclass Automaquillaje',
  'Asesoría: Cuidado Facial Mary Kay'
];

const TIME_SLOTS = [
  '09:30', '11:00', '14:00', '15:30', '17:00', '18:30', '19:30'
];

export default function TurnoModal({ isOpen, onClose, initialService = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    date: '',
    time: '15:30',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [links, setLinks] = useState({ gcal: '', whatsapp: '', icsUrl: '' });

  // Sincronizar servicio inicial al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setErrors({});

      // Calcular fecha mínima (hoy) y sugerida (mañana)
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDate = tomorrow.toISOString().split('T')[0];

      let preselectedService = SERVICE_OPTIONS[0];
      if (initialService) {
        const found = SERVICE_OPTIONS.find((s) =>
          s.toLowerCase().includes(initialService.toLowerCase())
        );
        if (found) preselectedService = found;
        else preselectedService = initialService;
      }

      setFormData((prev) => ({
        ...prev,
        service: preselectedService,
        date: defaultDate,
        time: prev.time || '15:30'
      }));
    }
  }, [isOpen, initialService]);

  if (!isOpen) return null;

  // Validación exhaustiva en cliente
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

      // 1. Construcción de enlace de Google Calendar
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, hours, minutes);
      const endDate = new Date(startDate.getTime() + 90 * 60 * 1000); // 1h 30m

      const pad = (n) => String(n).padStart(2, '0');
      const formatGCalDate = (d) =>
        d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        'T' +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        '00';

      const startStr = formatGCalDate(startDate);
      const endStr = formatGCalDate(endDate);

      const title = `Turno en I'm Chic: ${formData.service} - ${formData.name}`;
      const details =
        `🌸 Turno reservado en I'm Chic By Melany Toledo\n\n` +
        `👤 Cliente: ${formData.name}\n` +
        `📱 WhatsApp: ${formData.phone}\n` +
        `💅 Servicio: ${formData.service}\n` +
        `📅 Fecha: ${pad(day)}/${pad(month)}/${year}\n` +
        `⏰ Horario: ${formData.time} hs\n` +
        (formData.notes ? `📝 Notas: ${formData.notes}\n\n` : '\n') +
        `📍 Lugar: Estudio I'm Chic - Tucumán, Argentina\n` +
        `📞 Melany Toledo: +54 9 381 355-3492\n` +
        `📸 Instagram: @imchicbymelany`;

      const location = `I'm Chic By Melany Toledo - Estudio de Belleza, Tucumán`;

      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        title
      )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(
        details
      )}&location=${encodeURIComponent(location)}`;

      // 2. Construcción de enlace de WhatsApp
      const whatsappMessage =
        `🌸 *NUEVO TURNO - I'M CHIC BY MELANY TOLEDO* 🌸\n\n` +
        `¡Hola Melany! Generé mi turno desde la web y lo agendé en mi Google Calendar:\n\n` +
        `👤 *Cliente:* ${formData.name}\n` +
        `📱 *Teléfono:* ${formData.phone}\n` +
        `💅 *Servicio:* ${formData.service}\n` +
        `📅 *Fecha:* ${pad(day)}/${pad(month)}/${year}\n` +
        `⏰ *Horario:* ${formData.time} hs\n` +
        (formData.notes ? `📝 *Detalles:* ${formData.notes}\n\n` : '\n') +
        `🗓️ *Estado:* Agendado en mi Google Calendar. ¿Me confirmás disponibilidad? 💕`;

      const whatsappUrl = `https://wa.me/5493813553492?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      // 3. Generación de archivo .ics universal (para iPhone / Android / Outlook)
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Im Chic By Melany Toledo//Turnos Web//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `SUMMARY:Turno I'm Chic: ${formData.service} - ${formData.name}`,
        `DESCRIPTION:Turno en I'm Chic By Melany Toledo\\nCliente: ${formData.name}\\nTel: ${formData.phone}\\nServicio: ${formData.service}`,
        `LOCATION:I'm Chic By Melany Toledo, Tucuman, Argentina`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const icsUrl = URL.createObjectURL(blob);

      setLinks({ gcal: gcalUrl, whatsapp: whatsappUrl, icsUrl });
      setStep('success');

      // Intentar abrir automáticamente en pestañas nuevas
      try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Bloqueador de ventanas emergentes para WhatsApp:', err);
      }

      try {
        window.open(gcalUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Bloqueador de ventanas emergentes para Google Calendar:', err);
      }
    } catch (error) {
      console.error('Error al generar el turno:', error);
      setErrors({ global: 'Ocurrió un error inesperado al procesar el turno. Por favor reintentá.' });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#5A0B22]/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-gradient-to-b from-white via-[#FFF0F3]/40 to-white rounded-3xl shadow-2xl border border-white/80 p-6 sm:p-8 z-10 my-8 overflow-hidden"
        >
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FFF0F3] hover:bg-[#FFC9D6] text-[#5A0B22] flex items-center justify-center transition-colors shadow-sm"
          >
            <X size={18} />
          </button>

          {step === 'form' ? (
            <div>
              {/* Encabezado */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC9D6]/60 border border-[#D87F95]/30 text-[#7A1333] text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={14} className="text-[#D4AF37]" />
                  <span>Reserva Online Inmediata</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22]">
                  Generar Turno
                </h3>
                <p className="text-xs sm:text-sm text-[#5A0B22]/70 mt-1 max-w-sm mx-auto">
                  Agendá tu cita. Se enviará a WhatsApp y se guardará automáticamente en tu Google Calendar.
                </p>
              </div>

              {errors.global && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errors.global}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
                    Tu Nombre y Apellido *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50" />
                    <input
                      type="text"
                      placeholder="Ej: Sofía Giménez"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                        errors.name ? 'border-red-400 bg-red-50/50' : 'border-[#FFC9D6]/80 bg-white'
                      } text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all`}
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.name}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
                    Tu Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50" />
                    <input
                      type="tel"
                      placeholder="Ej: 381 555-1234"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                        errors.phone ? 'border-red-400 bg-red-50/50' : 'border-[#FFC9D6]/80 bg-white'
                      } text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.phone}</p>}
                </div>

                {/* Servicio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
                    Servicio a Realizar *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FFC9D6]/80 bg-white text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all"
                  >
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha y Horario */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5A0B22] mb-1">
                      Fecha del Turno *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50 pointer-events-none" />
                      <input
                        type="date"
                        min={todayStr}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2 rounded-xl border ${
                          errors.date ? 'border-red-400 bg-red-50/50' : 'border-[#FFC9D6]/80 bg-white'
                        } text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all`}
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
                        className={`w-full pl-10 pr-3 py-2 rounded-xl border ${
                          errors.time ? 'border-red-400 bg-red-50/50' : 'border-[#FFC9D6]/80 bg-white'
                        } text-[#5A0B22] text-sm focus:outline-none focus:ring-2 focus:ring-[#D87F95] transition-all`}
                      />
                    </div>
                  </div>
                </div>

                {/* Atajos de Horarios Rápidos */}
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

                {/* Notas adicionales */}
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

                {/* Botón Acción Principal */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-medium text-sm sm:text-base tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <Calendar className="w-5 h-5 text-[#F7E7B4]" />
                    <span>Confirmar y Agendar Turno</span>
                  </motion.button>
                  <p className="text-[11px] text-[#5A0B22]/60 text-center mt-2">
                    Abre WhatsApp para avisar a Melany y agrega el evento en tu Google Calendar.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* Pantalla de Éxito */
            <div className="text-center py-4 space-y-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md"
              >
                <CheckCircle2 size={36} />
              </motion.div>

              <div>
                <h4 className="font-serif text-2xl font-bold text-[#5A0B22]">
                  ¡Turno Generado con Éxito!
                </h4>
                <p className="text-sm text-[#5A0B22]/80 mt-1 max-w-sm mx-auto">
                  Hemos preparado tu mensaje de WhatsApp y tu evento de Google Calendar.
                </p>
              </div>

              {/* Resumen del turno */}
              <div className="bg-[#FFF0F3]/80 rounded-2xl p-4 text-left text-xs sm:text-sm text-[#5A0B22] space-y-1.5 border border-[#FFC9D6]/60">
                <div className="flex justify-between border-b border-[#FFC9D6]/40 pb-1">
                  <span className="font-bold">Cliente:</span>
                  <span>{formData.name}</span>
                </div>
                <div className="flex justify-between border-b border-[#FFC9D6]/40 pb-1">
                  <span className="font-bold">Servicio:</span>
                  <span className="text-right truncate max-w-[200px]">{formData.service}</span>
                </div>
                <div className="flex justify-between border-b border-[#FFC9D6]/40 pb-1">
                  <span className="font-bold">Fecha y Hora:</span>
                  <span>{formData.date} a las {formData.time} hs</span>
                </div>
                {formData.notes && (
                  <div className="flex justify-between pt-0.5">
                    <span className="font-bold">Notas:</span>
                    <span className="text-right italic">{formData.notes}</span>
                  </div>
                )}
              </div>

              {/* Botones de acción directa */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={links.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Phone size={18} />
                  <span>1. Enviar Turno por WhatsApp a Melany</span>
                  <ExternalLink size={14} className="opacity-80" />
                </a>

                <a
                  href={links.gcal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#5A0B22] hover:bg-[#7A1333] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Calendar size={18} className="text-[#F7E7B4]" />
                  <span>2. Abrir en Google Calendar</span>
                  <ExternalLink size={14} className="opacity-80" />
                </a>

                {links.icsUrl && (
                  <a
                    href={links.icsUrl}
                    download={`Turno_ImChic_${formData.date}.ics`}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FFF0F3] border border-[#FFC9D6] text-[#5A0B22] font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Download size={15} className="text-[#7A1333]" />
                    <span>Descargar archivo .ics (iPhone / Android / Outlook)</span>
                  </a>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-[#5A0B22]/70 hover:text-[#5A0B22] underline cursor-pointer"
                >
                  Finalizar y Cerrar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
