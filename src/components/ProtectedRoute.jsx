import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege una ruta: solo permite el acceso a usuarios con sesión activa y rol admin.
 * - Mientras `loading` sea true, muestra un spinner inocuo para evitar parpadeo o
 *   redirecciones prematuras antes de restaurar la sesión.
 * - Sin sesión o sin rol admin → redirige a la raíz "/" (spec RF-1).
 * - Con rol admin → renderiza sus hijos (children).
 */
export default function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#FFF0F3] flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-4 border-[#FFC9D6] border-t-[#7A1333] animate-spin"
            aria-hidden="true"
          />
          <p className="text-sm text-[#5A0B22]/75 font-medium">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
