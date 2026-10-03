import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import TurnoModalEnhanced from '../components/TurnoModalEnhanced';

const TurnoContext = createContext(null);

/**
 * Provee una única instancia de TurnoModal a toda la app.
 * Uso: const { open, close } = useTurno(); open('Uñas');
 *
 * Siempre abre `TurnoModalEnhanced` (calendario de disponibilidad).
 *  - Usuario logueado → guarda el turno en la BD + abre WhatsApp.
 *  - Invitado → muestra el calendario y abre WhatsApp con la info para consultar.
 */
export function TurnoProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const open = useCallback((serviceName = '') => {
    // Siempre abrimos el modal (con calendario de disponibilidad).
    // - Logueado → guarda el turno en la BD y avisa por WhatsApp.
    // - Invitado → muestra el calendario y manda WhatsApp con la info para consultar.
    setSelectedService(serviceName || '');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, selectedService, open, close }),
    [isOpen, selectedService, open, close]
  );

  return (
    <TurnoContext.Provider value={value}>
      {children}
      <TurnoModalEnhanced
        isOpen={isOpen}
        onClose={close}
        initialService={selectedService}
      />
    </TurnoContext.Provider>
  );
}

export function useTurno() {
  const ctx = useContext(TurnoContext);
  if (!ctx) {
    throw new Error('useTurno debe usarse dentro de <TurnoProvider>');
  }
  return ctx;
}

export default TurnoContext;
