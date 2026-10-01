import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import TurnoModal from '../components/TurnoModal';

const TurnoContext = createContext(null);

/**
 * Provee una única instancia de TurnoModal a toda la app.
 * Uso: const { open, close } = useTurno(); open('Uñas');
 */
export function TurnoProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const open = useCallback((serviceName = '') => {
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
      <TurnoModal
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
