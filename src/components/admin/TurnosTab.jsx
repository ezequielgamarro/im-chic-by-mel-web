import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { formatServiceName } from '../../utils/serviceNames';
import {
  Calendar,
  Clock,
  User,
  Phone,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Check,
  MessageCircle,
  Inbox,
} from 'lucide-react';

const STATUS_META = {
  solicitado: { label: 'Solicitado', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  confirmado: { label: 'Confirmado', cls: 'text-green-700 bg-green-50 border-green-200' },
  cancelado: { label: 'Rechazado', cls: 'text-red-700 bg-red-50 border-red-200' },
  completado: { label: 'Completado', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

/** Pestaña "Turnos" del panel admin: lista todos los turnos y permite cambiar su estado. */
export default function TurnosTab() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [filter, setFilter] = useState('solicitado');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('user_appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setAppointments([]);
    } else {
      setAppointments(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = useCallback(async (appointment, status) => {
    setSavingId(appointment.id);
    const { error: upError } = await supabase
      .from('user_appointments')
      .update({ status })
      .eq('id', appointment.id);

    if (!upError) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointment.id ? { ...a, status } : a))
      );
    } else {
      window.alert('No pudimos actualizar el estado. Intentá de nuevo.');
    }
    setSavingId(null);
  }, []);

  const pendingCount = appointments.filter((a) => a.status === 'solicitado').length;
  const visible = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  const FILTERS = [
    { key: 'solicitado', label: 'Solicitados' },
    { key: 'confirmado', label: 'Confirmados' },
    { key: 'completado', label: 'Completados' },
    { key: 'cancelado', label: 'Rechazados' },
    { key: 'all', label: 'Todos' },
  ];

  return (
    <section aria-labelledby="appointments-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-[#D4AF37]" aria-hidden="true" />
          <h2 id="appointments-heading" className="font-serif text-lg sm:text-xl font-semibold text-[#5A0B22]">
            Turnos
          </h2>
          {pendingCount > 0 && (
            <span className="inline-flex items-center min-h-[24px] px-2.5 rounded-full bg-[#B91C1C] text-white text-xs font-bold">
              {pendingCount} pendiente{pendingCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={fetchAppointments}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
        >
          <RefreshCw size={16} className="text-[#7A1333]" aria-hidden="true" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`min-h-[36px] px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filter === f.key
                ? 'bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white border-transparent'
                : 'bg-white text-[#5A0B22]/75 border-[#5A0B22]/15 hover:bg-[#FFC9D6]/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16" role="status" aria-live="polite">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFC9D6] border-t-[#7A1333] animate-spin" aria-hidden="true" />
          <p className="text-sm text-[#5A0B22]/75 font-medium">Cargando turnos…</p>
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center bg-white/80 border border-[#B91C1C]/20 rounded-3xl p-6">
          <AlertTriangle size={28} className="text-[#B91C1C]" aria-hidden="true" />
          <p className="text-sm text-[#B91C1C] font-medium">No pudimos cargar los turnos.</p>
          <p className="text-xs text-[#5A0B22]/70 break-words">{error}</p>
          <button
            type="button"
            onClick={fetchAppointments}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow hover:shadow-lg transition-all"
          >
            <RefreshCw size={18} className="text-[#F7E7B4]" aria-hidden="true" />
            <span>Reintentar</span>
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center bg-white/80 border border-[#5A0B22]/10 rounded-3xl p-6">
          <div className="w-14 h-14 rounded-full bg-[#FFC9D6]/60 text-[#7A1333] flex items-center justify-center">
            <Inbox size={26} aria-hidden="true" />
          </div>
          <p className="font-serif text-lg font-semibold">No hay turnos en esta vista</p>
          <p className="text-sm text-[#5A0B22]/75 leading-relaxed max-w-sm">
            Cuando un cliente agende un turno, aparecerá acá para que puedas confirmarlo o rechazarlo.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((apt) => {
            const meta = STATUS_META[apt.status] || STATUS_META.solicitado;
            const saving = savingId === apt.id;
            return (
              <li
                key={apt.id}
                className="premium-card-soft p-5 flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#5A0B22]">
                      {formatServiceName(apt.service_key)}
                    </h3>
                    <p className="text-xs text-[#5A0B22]/60">
                      Solicitado el {formatDate(apt.created_at)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#5A0B22]/80">
                  <span className="flex items-center gap-2">
                    <User size={15} className="text-[#7A1333]" aria-hidden="true" />
                    {apt.client_name || 'Sin nombre'}
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone size={15} className="text-[#7A1333]" aria-hidden="true" />
                    {apt.client_phone || 'Sin teléfono'}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={15} className="text-[#7A1333]" aria-hidden="true" />
                    {formatDate(apt.scheduled_at)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={15} className="text-[#7A1333]" aria-hidden="true" />
                    {formatTime(apt.scheduled_at)}
                  </span>
                  {apt.notes && (
                    <span className="sm:col-span-2 text-[#5A0B22]/70 italic">“{apt.notes}”</span>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-[#5A0B22]/10">
                  {apt.client_phone && (
                    <a
                      href={`https://wa.me/${apt.client_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                    >
                      <MessageCircle size={16} aria-hidden="true" />
                      <span>WhatsApp cliente</span>
                    </a>
                  )}
                  {apt.status !== 'confirmado' && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => updateStatus(apt, 'confirmado')}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition"
                    >
                      <Check size={16} aria-hidden="true" />
                      <span>{saving ? 'Guardando…' : 'Aceptar'}</span>
                    </button>
                  )}
                  {apt.status !== 'completado' && apt.status !== 'cancelado' && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => updateStatus(apt, 'completado')}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-sm hover:bg-blue-100 disabled:opacity-50 transition"
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>Completado</span>
                    </button>
                  )}
                  {apt.status !== 'cancelado' && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => updateStatus(apt, 'cancelado')}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 font-semibold text-sm hover:bg-red-100 disabled:opacity-50 transition"
                    >
                      <XCircle size={16} aria-hidden="true" />
                      <span>Rechazar</span>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
