import React, { useState } from 'react';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import { X, Cookie, Settings, Check, ChevronDown, ChevronUp } from 'lucide-react';

export function CookieBanner() {
  const { 
    showBanner, 
    showSettings, 
    accept, 
    reject, 
    openSettings, 
    closeSettings, 
    savePreferences,
    hasConsented 
  } = useCookieConsent();

  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  if (!showBanner && !showSettings) return null;

  const handleToggle = (category) => {
    if (category === 'necessary') return; // Always required
    setPreferences(prev => ({
      ...preferences,
      [category]: !preferences[category],
    }));
  };

  const handleSave = () => {
    savePreferences(preferences);
  };

  if (showSettings) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-label="Configuración de cookies">
        <div className="fixed inset-0 bg-black/50" onClick={closeSettings} aria-hidden="true" />
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-[#5A0B22] flex items-center gap-2">
              <Cookie size={20} className="text-[#7A1333]" />
              Configuración de Cookies
            </h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-[#5A0B22]" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-[#5A0B22]/70 mb-4">
            Gestioná tus preferencias de cookies. Las cookies necesarias son esenciales para el funcionamiento del sitio.
          </p>

          <div className="space-y-4">
            {[
              { key: 'necessary', label: 'Necesarias', desc: 'Esenciales para el funcionamiento del sitio (autenticación, carrito, seguridad).', required: true },
              { key: 'analytics', label: 'Analíticas', desc: 'Nos ayudan a entender cómo usás el sitio para mejorarlo (Google Analytics).', required: false },
              { key: 'marketing', label: 'Marketing', desc: 'Personalizan anuncios y contenido según tus intereses.', required: false },
            ].map(({ key, label, desc, required }) => (
              <div key={key} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[key]}
                      onChange={() => !required && setPreferences(prev => ({ ...preferences, [key]: !prev[key] }))}
                      disabled={required}
                      className="w-4 h-4 text-[#7A1333] border-[#FFC9D6] rounded focus:ring-2 focus:ring-[#7A1333]"
                    />
                    <span className="font-medium text-[#5A0B22]">{label}</span>
                    {required && <span className="text-xs text-[#5A0B22]/50 ml-1">(Requerida)</span>}
                  </label>
                  <p className="text-xs text-[#5A0B22]/60 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={closeSettings}
              className="flex-1 py-2 px-4 rounded-xl bg-white border border-[#FFC9D6] text-[#5A0B22] font-semibold text-sm hover:bg-[#FFF0F3] transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => savePreferences(preferences)}
              className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow hover:shadow-lg transition"
            >
              Guardar preferencias
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-white/95 border border-[#5A0B22]/10 rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFC9D6]/60 flex items-center justify-center flex-shrink-0">
              <Cookie size={20} className="text-[#7A1333]" />
            </div>
            <div>
              <p className="font-semibold text-[#5A0B22]">¿Aceptás nuestras cookies?</p>
              <p className="text-sm text-[#5A0B22]/70 mt-0.5">
                Usamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar contenido.
                <a href="/cookies" className="underline hover:text-[#7A1333] ml-1">Leer más</a>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowSettings(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-[#FFC9D6] text-[#5A0B22] font-semibold text-sm hover:bg-[#FFF0F3] transition flex items-center justify-center gap-2"
            >
              <Settings size={16} /> Configurar
            </button>
            <button
              onClick={reject}
              className="min-h-[44px] px-6 py-2 rounded-xl bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFF0F3] transition"
            >
              Rechazar
            </button>
            <button
              onClick={accept}
              className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg transition"
            >
              <Check size={16} /> Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;