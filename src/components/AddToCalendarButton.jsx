import React, { useState } from 'react';

/**
 * AddToCalendarButton — Spec 014
 * Botón "Guardar en mi Calendario": genera la URL de Google Calendar
 * (action=TEMPLATE) y la abre en pestaña nueva con fallback accesible.
 * Solo Tailwind + <style> local namespaced (imchic-gcal-btn-); sin dependencias.
 */

// 'YYYYMMDDTHHmmssZ' (UTC)
const toGCalUTC = (date) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}` +
         `T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`;
};

const buildGCalUrl = ({ serviceName, scheduledAt, durationMinutes = 60, notes = '' }) => {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const text = `Turno: ${serviceName} — Im Chic by Mel`;
  const details = [
    `Servicio: ${serviceName}`,
    `Fecha y hora: ${start.toLocaleString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    notes ? `Notas: ${notes}` : null,
    'Im Chic by Mel',
  ].filter(Boolean).join('\n');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
         `&text=${encodeURIComponent(text)}` +
         `&dates=${toGCalUTC(start)}/${toGCalUTC(end)}` +
         `&details=${encodeURIComponent(details)}`;
};

function AddToCalendarButton({ serviceName, scheduledAt, durationMinutes = 60, notes = '' }) {
  const [fallbackMsg, setFallbackMsg] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');

  // RF-09: scheduledAt null/vacío/inválido → no renderiza nada
  const start = scheduledAt ? new Date(scheduledAt) : null;
  if (!start || Number.isNaN(start.getTime())) return null;

  const handleClick = () => {
    const url = buildGCalUrl({ serviceName, scheduledAt, durationMinutes, notes });
    // Síncrono dentro del handler (sin await ni setState previo) — anti-popup-blocker
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) {
      setFallbackMsg('');
      setFallbackUrl('');
      return;
    }
    // Fallback: <a> temporal + mensaje accesible con enlace manual
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setFallbackMsg('Se abrió una pestaña nueva para guardar el evento en tu calendario.');
      setFallbackUrl(url);
    } catch {
      setFallbackMsg('No pudimos abrir Google Calendar. Abrí este enlace manualmente:');
      setFallbackUrl(url);
    }
  };

  const ariaLabel = `Guardar el turno ${serviceName} en mi Google Calendar`;

  return (
    <>
      <style>{`
        .imchic-gcal-btn-icon {
          transition: transform 0.25s ease;
        }
        .imchic-gcal-btn:hover .imchic-gcal-btn-icon,
        .imchic-gcal-btn:focus-visible .imchic-gcal-btn-icon {
          animation: slope 0.4s ease;
        }
        @keyframes slope {
          50% { transform: rotate(10deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .imchic-gcal-btn-icon { transition: none; }
          .imchic-gcal-btn:hover .imchic-gcal-btn-icon,
          .imchic-gcal-btn:focus-visible .imchic-gcal-btn-icon {
            animation: none;
          }
        }
      `}</style>
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        className="imchic-gcal-btn inline-flex w-full items-center justify-center gap-2 h-[40px] min-h-[44px] px-4 py-2 rounded-[20px] bg-[#5A0B22] hover:bg-[#7A1333] text-white text-sm font-semibold tracking-[1px] cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
      >
        <svg
          className="imchic-gcal-btn-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="14" x2="8" y2="18" />
          <line x1="12" y1="14" x2="12" y2="18" />
        </svg>
        <span>Guardar en mi Calendario</span>
      </button>
      {fallbackMsg && (
        <p role="status" className="mt-2 text-sm text-[#5A0B22]">
          {fallbackMsg}{' '}
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold text-[#7A1333]"
          >
            Abrir Google Calendar
          </a>
        </p>
      )}
    </>
  );
}

export default AddToCalendarButton;
