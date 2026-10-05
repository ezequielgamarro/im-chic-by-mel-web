import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import CustomCheckbox from '../CustomCheckbox';

const CATEGORIAS_SERVICIOS = ['unas', 'cabello', 'maquillaje', 'packs'];

// Etiquetas legibles para el texto visible (spec 013 RF-A1). El estado/guardado
// sigue usando las claves crudas de CATEGORIAS_SERVICIOS.
const CAT_LABELS = { unas: 'Uñas', cabello: 'Cabello', maquillaje: 'Maquillaje', packs: 'Packs' };

const DIAS_SEMANA = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' },
];

const HORAS_DISPONIBLES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = (i % 2) * 30;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
});

export function TurnSettingsTab() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [googleConnected, setGoogleConnected] = useState(false);
  const [serviceDurations, setServiceDurations] = useState({});
  const [businessHours, setBusinessHours] = useState({});
  const [slotGranularity, setSlotGranularity] = useState(15);
  const [oauthUrl, setOauthUrl] = useState(null);
  const [showOauthModal, setShowOauthModal] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const { data: settings, error } = await supabase
        .from('admin_settings')
        .select('google_calendar, service_durations, business_hours, slot_granularity_minutes')
        .eq('id', 1)
        .single();

      if (!error && settings) {
        const gc = settings.google_calendar || {};
        setGoogleConnected(!!gc.connected);
        setServiceDurations(gc.service_durations || {});
        setBusinessHours(gc.business_hours || {});
        setSlotGranularity(settings.slot_granularity_minutes || 15);
      }
    } catch (e) {
      console.error('Error loading config:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (code) {
      handleOauthCallback(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setError('Error en OAuth: ' + error);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleDurationChange = (service, value) => {
    const num = parseInt(value, 10) || 0;
    setServiceDurations(prev => ({ ...prev, [service]: Math.max(0, num) }));
  };

  const handleHourChange = (day, type, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }));
  };

  const handleDayToggle = (day) => {
    setBusinessHours(prev => {
      if (prev[day]) {
        const { [day]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [day]: { open: '09:00', close: '19:00' } };
    });
  };

  const handleConnectCalendar = async () => {
    try {
      const clientId = '384579948995-vo6stkc6bh8d865r1vqdhjtpv3dotfal.apps.googleusercontent.com';
      const redirectUri = 'https://nxviapvgzfdzzyctzokh.supabase.co/functions/v1/calendar-availability/callback';
      const scope = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';
      const state = Math.random().toString(36).substring(2, 15);

      const oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
        'client_id=' + encodeURIComponent(clientId) + '&' +
        'redirect_uri=' + encodeURIComponent(redirectUri) + '&' +
        'scope=' + encodeURIComponent(scope) + '&' +
        'response_type=code&' +
        'access_type=offline&' +
        'prompt=consent&' +
        'state=' + state;

      setOauthUrl(oauthUrl);
      setShowOauthModal(true);
    } catch (e) {
      setError('Error generando URL de OAuth: ' + e.message);
    }
  };

  const handleOauthCallback = async (code) => {
    try {
      const resp = await fetch(
        'https://nxviapvgzfdzzyctzokh.supabase.co/functions/v1/calendar-availability/callback',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        }
      );

      if (!resp.ok) throw new Error('Error en callback OAuth');

      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      setGoogleConnected(true);
      setSuccess('Google Calendar conectado correctamente');
      setShowOauthModal(false);
      loadConfig();
    } catch (e) {
      setError('Error conectando Calendar: ' + e.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          id: 1,
          google_calendar: {
            connected: googleConnected,
            calendar_id: 'primary',
          },
          service_durations: serviceDurations,
          business_hours: businessHours,
          slot_granularity_minutes: slotGranularity,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSuccess('Configuración guardada correctamente');
    } catch (e) {
      setError('Error guardando: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-red-600">
        Acceso denegado: solo administradores.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1333] mx-auto mb-2" />
        <p className="text-[#5A0B22]">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-[#5A0B22]">Configuración de Turnos</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
        >
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Google Calendar Connection */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-[#FFC9D6]">
        <h3 className="text-lg font-semibold text-[#5A0B22] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#7A1333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Google Calendar
        </h3>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-[#5A0B22]">Conexión con Google Calendar</p>
            <p className="text-sm text-gray-600">Permite consultar disponibilidad en tiempo real</p>
          </div>
          {googleConnected ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Conectado ✓
            </span>
          ) : (
            <button
              onClick={handleConnectCalendar}
              className="px-4 py-2 bg-[#7A1333] text-white rounded-lg hover:bg-[#5A0B22] transition"
            >
              Conectar Google Calendar
            </button>
          )}
        </div>

        {googleConnected && (
          <p className="mt-3 text-sm text-green-700">
            ✓ Google Calendar conectado. La disponibilidad se consultará en tiempo real.
          </p>
        )}
      </section>

      {/* Duraciones de Servicios */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-[#FFC9D6]">
        <h3 className="text-lg font-semibold text-[#5A0B22] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#7A1333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Duración de Servicios (minutos)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Define la duración estimada de cada servicio para calcular disponibilidad correctamente.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIAS_SERVICIOS.map(function(cat) {
            return (
              <div key={cat} className="flex items-center gap-3">
                <label htmlFor={"dur-" + cat} className="w-32 font-medium text-[#5A0B22]">
                  {CAT_LABELS[cat] || cat}
                </label>
                <input
                  type="number"
                  id={"dur-" + cat}
                  min="0"
                  max="480"
                  value={serviceDurations[cat] || ''}
                  onChange={function(e) { handleDurationChange(cat, e.target.value); }}
                  className="flex-1 px-3 py-2 border border-[#FFC9D6] rounded-lg focus:ring-2 focus:ring-[#7A1333] focus:border-transparent"
                  placeholder="minutos"
                />
                <span className="text-gray-500 text-sm">min</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Horario de Atención */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-[#FFC9D6]">
        <h3 className="text-lg font-semibold text-[#5A0B22] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#7A1333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Horario de Atención
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Define los días y horarios de atención. Los turnos solo se ofrecerán dentro de estos rangos.
        </p>

        <div className="space-y-3">
          {DIAS_SEMANA.map(function(day) {
            var hours = businessHours[day.key] || {};
            var isOpen = !!businessHours[day.key];

            return (
              <div key={day.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <CustomCheckbox
                  label={day.label}
                  checked={isOpen}
                  onChange={function() { handleDayToggle(day.key); }}
                />

                {isOpen && (
                  <div className="flex items-center gap-2 flex-1">
                    <label htmlFor={"open-" + day.key} className="text-sm text-gray-600">Abre</label>
                    <select
                      id={"open-" + day.key}
                      value={hours.open || '09:00'}
                      onChange={function(e) { handleHourChange(day.key, 'open', e.target.value); }}
                      className="px-2 py-1 border border-[#FFC9D6] rounded-lg focus:ring-2 focus:ring-[#7A1333] focus:border-transparent text-sm"
                    >
                      {HORAS_DISPONIBLES.map(function(h) {
                        return <option key={h} value={h}>{h}</option>;
                      })}
                    </select>

                    <label htmlFor={"close-" + day.key} className="text-sm text-gray-600">Cierra</label>
                    <select
                      id={"close-" + day.key}
                      value={hours.close || '19:00'}
                      onChange={function(e) { handleHourChange(day.key, 'close', e.target.value); }}
                      className="px-2 py-1 border border-[#FFC9D6] rounded-lg focus:ring-2 focus:ring-[#7A1333] focus:border-transparent text-sm"
                    >
                      {HORAS_DISPONIBLES.map(function(h) {
                        return <option key={h} value={h}>{h}</option>;
                      })}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Granularidad de Slots */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-[#FFC9D6]">
        <h3 className="text-lg font-semibold text-[#5A0B22] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#7A1333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Granularidad de Slots
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Intervalo entre horarios disponibles (mínimo común divisor de duraciones).
        </p>

        <div className="flex items-center gap-4">
          <label htmlFor="granularity" className="font-medium text-[#5A0B22]">
            Intervalo:
          </label>
          <select
            id="granularity"
            value={slotGranularity}
            onChange={function(e) { setSlotGranularity(parseInt(e.target.value, 10)); }}
            className="px-3 py-2 border border-[#FFC9D6] rounded-lg focus:ring-2 focus:ring-[#7A1333] focus:border-transparent"
          >
            <option value={5}>5 minutos</option>
            <option value={10}>10 minutos</option>
            <option value={15}>15 minutos (recomendado)</option>
            <option value={30}>30 minutos</option>
          </select>
          <span className="text-sm text-gray-500">MCD recomendado: 15 min</span>
        </div>
      </section>

      {/* OAuth Modal */}
      {showOauthModal && oauthUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#5A0B22] mb-4">Conectar Google Calendar</h3>
            <p className="text-gray-600 mb-4">
              Se abrirá una ventana para autorizar el acceso a tu Google Calendar.
            </p>
            <div className="space-y-3">
              <a
                href={oauthUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 bg-[#7A1333] text-white rounded-lg text-center hover:bg-[#5A0B22] transition"
              >
                Autorizar en Google
              </a>
              <p className="text-sm text-gray-500 text-center">
                Tras autorizar, serás redirigido automáticamente.
              </p>
            </div>
            <button
              onClick={function() { setShowOauthModal(false); }}
              className="mt-4 w-full px-4 py-2 text-gray-600 hover:text-[#5A0B22]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TurnSettingsTab;