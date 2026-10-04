import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatServiceName } from '../utils/serviceNames';
import { Calendar, Clock, XCircle, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const STATUS_LABELS = {
  solicitado: { label: 'Solicitado', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: AlertCircle },
  confirmado: { label: 'Confirmado', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
  completado: { label: 'Completado', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: CheckCircle2 },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

function AppointmentCard({ appointment, onCancel }) {
  const status = STATUS_LABELS[appointment.status] || STATUS_LABELS.solicitado;
  const StatusIcon = status.icon;

  const cancelButton = appointment.status === 'confirmado' ? (
    <div className="pt-2 border-t border-[#5A0B22]/10">
      <button
        type="button"
        onClick={() => onCancel(appointment)}
        className="w-full py-2 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
      >
        <XCircle size={16} aria-hidden="true" />
        <span>Cancelar turno</span>
      </button>
    </div>
  ) : null;

  return (
    <div key={appointment.id} className="premium-card-soft p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-lg font-semibold text-[#5A0B22]">{formatServiceName(appointment.service_key || appointment.service)}</h3>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
          <status.icon size={12} aria-hidden="true" />
          <span>{status.label}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#5A0B22]/80">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#7A1333]" aria-hidden="true" />
          <span>
            <strong>Fecha:</strong> {formatDate(appointment.scheduled_at)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#7A1333]" aria-hidden="true" />
          <span>
            <strong>Hora:</strong> {formatTime(appointment.scheduled_at)}
          </span>
        </div>
        {appointment.notes && (
          <div className="sm:col-span-2 flex items-start gap-2">
            <Info size={16} className="text-[#7A1333] shrink-0" aria-hidden="true" />
            <span><strong>Notas:</strong> {appointment.notes}</span>
          </div>
        )}
      </div>

      {cancelButton}
    </div>
  );
}

function MyAppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('user_appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      setError(err?.message || 'No pudimos cargar tus turnos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointment) => {
    if (appointment.status !== 'confirmado') return;
    if (!window.confirm('¿Seguro que querés cancelar este turno?')) return;

    try {
      const { error } = await supabase
        .from('user_appointments')
        .update({ status: 'cancelado' })
        .eq('id', appointment.id);

      if (error) throw error;
      await fetchAppointments();
    } catch (err) {
      alert('No pudimos cancelar el turno. Intentá de nuevo.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FFF0F3] flex items-center justify-center p-6" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFC9D6] border-t-[#7A1333] animate-spin" aria-hidden="true" />
          <p className="text-sm text-[#5A0B22]/75 font-medium">Cargando tus turnos…</p>
        </div>
      </div>
    );
  }

  const appointmentCards = appointments.map(function(apt) {
    const status = STATUS_LABELS[apt.status] || STATUS_LABELS.solicitado;
    const StatusIcon = status.icon;

    return (
      <div key={apt.id} className="premium-card-soft p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold text-[#5A0B22]">{formatServiceName(apt.service_key || apt.service)}</h3>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            <StatusIcon size={12} aria-hidden="true" />
            <span>{status.label}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#5A0B22]/80">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#7A1333]" aria-hidden="true" />
            <span>
              <strong>Fecha:</strong> {formatDate(apt.scheduled_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#7A1333]" aria-hidden="true" />
            <span>
              <strong>Hora:</strong> {formatTime(apt.scheduled_at)}
            </span>
          </div>
          {apt.notes && (
            <div className="sm:col-span-2 flex items-start gap-2">
              <Info size={16} className="text-[#7A1333] shrink-0" aria-hidden="true" />
              <span><strong>Notas:</strong> {apt.notes}</span>
            </div>
          )}
        </div>

        {apt.status === 'confirmado' && (
          <div className="pt-2 border-t border-[#5A0B22]/10">
            <button
              type="button"
              onClick={() => handleCancel(apt)}
              className="w-full py-2 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={16} aria-hidden="true" />
              <span>Cancelar turno</span>
            </button>
          </div>
        )}
      </div>
    );
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FFF0F3] flex items-center justify-center p-6" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFC9D6] border-t-[#7A1333] animate-spin" aria-hidden="true" />
          <p className="text-sm text-[#5A0B22]/75 font-medium">Cargando tus turnos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans">
      <header className="premium-header sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-script text-lg leading-none text-[#7A1333]">Im Chic by Mel</p>
            <h1 className="font-serif text-xl sm:text-2xl font-bold">Mis Turnos</h1>
          </div>
          <Link to="/cuenta" className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]">
            ← Volver a mi cuenta
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white/90 border border-[#5A0B22]/10 rounded-3xl p-6">
            <div className="w-14 h-14 rounded-full bg-[#FFC9D6]/60 text-[#7A1333] flex items-center justify-center">
              <Calendar size={28} aria-hidden="true" />
            </div>
            <p className="font-serif text-lg font-semibold">Aún no tenés turnos agendados</p>
            <p className="text-sm text-[#5A0B22]/75 leading-relaxed max-w-sm">
              Cuando agendes un turno desde la web, aparecerá acá con su estado y detalles.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(function(apt) {
              const status = STATUS_LABELS[apt.status] || STATUS_LABELS.solicitado;
              const StatusIcon = status.icon;

              return (
                <div key={apt.id} className="premium-card-soft p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-semibold text-[#5A0B22]">{formatServiceName(apt.service_key || apt.service)}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      <StatusIcon size={12} aria-hidden="true" />
                      <span>{status.label}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#5A0B22]/80">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#7A1333]" aria-hidden="true" />
                      <span>
                        <strong>Fecha:</strong> {formatDate(apt.scheduled_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#7A1333]" aria-hidden="true" />
                      <span>
                        <strong>Hora:</strong> {formatTime(apt.scheduled_at)}
                      </span>
                    </div>
                    {apt.notes && (
                      <div className="sm:col-span-2 flex items-start gap-2">
                        <Info size={16} className="text-[#7A1333] shrink-0" aria-hidden="true" />
                        <span><strong>Notas:</strong> {apt.notes}</span>
                      </div>
                    )}
                  </div>

                  {apt.status === 'confirmado' && (
                    <div className="pt-2 border-t border-[#5A0B22]/10">
                      <button
                        type="button"
                        onClick={() => handleCancel(apt)}
                        className="w-full py-2 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} aria-hidden="true" />
                        <span>Cancelar turno</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyAppointmentsPage;