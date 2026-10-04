import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

/**
 * Página de login del panel de administración (tarea T6).
 * - Si ya hay sesión de admin, redirige a /admin (evita ver el login de nuevo).
 * - Al enviar, llama a signIn(email, password); ante error lo muestra accesible.
 * - Tras un login exitoso, el estado de sesión actualiza isAdmin y redirige a /admin.
 */
export default function LoginPage() {
  const { isAdmin, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mientras se restaura la sesión, evita parpadeo de redirección.
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

  // Ya autenticado como admin → ir directo al panel.
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Ingresá tu email y contraseña para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      // Redirigir al panel de administración tras login exitoso
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(
        err?.message ||
          'No pudimos iniciar sesión. Verificá tus credenciales e intentá de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="premium-page min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans flex items-center justify-center p-6">
      <main className="premium-card animate-fade-up w-full max-w-sm p-5 sm:p-6">
        <header className="text-center mb-4">
          <span className="premium-chip mb-3">Acceso</span>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFC9D6] to-[#F8B4C4] text-[#7A1333] flex items-center justify-center mx-auto mb-3 animate-float ring-1 ring-[#D4AF37]/50 shadow-lg">
            <LogIn size={22} aria-hidden="true" />
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold mb-1.5">
            Panel de Administración
          </h1>
          <p className="text-xs sm:text-sm text-[#5A0B22]/75 leading-relaxed">
            Ingresá con tu email y contraseña para gestionar los productos de la
            tienda.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-[#5A0B22]"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A1333]"
              />
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-[#5A0B22]"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A1333]"
              />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
              />
            </div>
          </div>

          <div className="text-right">
            <Link
              to="/reset-password"
              className="text-xs text-[#7A1333] hover:text-[#5A0B22] underline"
            >
              ¿Olvidé mi contraseña?
            </Link>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm font-medium text-[#B91C1C] bg-[#FEE2E2]/70 border border-[#B91C1C]/20 rounded-xl px-4 py-3"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            {submitting ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  aria-hidden="true"
                />
                <span>Ingresando…</span>
              </>
            ) : (
              <>
                <LogIn size={18} className="text-[#F7E7B4]" aria-hidden="true" />
                <span>Ingresar</span>
              </>
            )}
          </button>
        </form>

        {/* Separador + Google */}
        <div className="premium-or my-4">o</div>
        <GoogleButton label="Continuar con Google" />

        <p className="text-center text-sm text-[#5A0B22]/60 mt-5">
          ¿No tenés cuenta? <Link to="/registro" className="font-semibold underline hover:text-[#7A1333]">Registrarse</Link>
        </p>
      </main>
    </div>
  );
}
