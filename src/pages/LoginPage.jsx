import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';
import { LogIn, Mail, Lock } from 'lucide-react';

/**
 * Página de login del panel de administración (Spec 011 — restyle).
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
    <div className="relative min-h-screen overflow-hidden bg-[#FFF0F3] text-[#5A0B22] font-sans flex items-center justify-center p-6">
      {/* Destellos sutiles de marca (T1) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #FFC9D6 0%, transparent 70%)' }}
      />

      {/* Animaciones de entrada + prefers-reduced-motion (T7) */}
      <style>{`
        @keyframes bounce {
          0% { transform: translateY(10px); opacity: 0; }
          60% { transform: translateY(-4px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce1 {
          0% { transform: translateY(14px); opacity: 0; }
          60% { transform: translateY(-5px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce2 {
          0% { transform: translateY(18px); opacity: 0; }
          60% { transform: translateY(-6px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce { animation: bounce 0.6s ease-out both; }
        .animate-bounce1 { animation: bounce1 0.6s ease-out 0.1s both; }
        .animate-bounce2 { animation: bounce2 0.6s ease-out 0.2s both; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Tarjeta glass (T2) */}
      <main className="relative w-full max-w-[22rem] p-6 sm:p-8 rounded-3xl bg-white border border-[#FFC9D6]/50 shadow-2xl">
        {/* Logo con fallback (T3) */}
        <div className="w-20 h-20 rounded-full bg-white border border-[#FFC9D6] shadow-lg flex items-center justify-center mx-auto overflow-hidden mb-4">
          <img
            src="/assets/logo-im-chic.png"
            alt="I'm Chic by Mel"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.parentElement.innerHTML = '<span class="font-serif font-bold text-sm text-[#5A0B22]">IC</span>';
            }}
          />
        </div>

        {/* Título solo lector de pantalla (accesibilidad) */}
        <h1 className="sr-only">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {/* Email (T5) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-[#5A0B22]">
              Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
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
                className="animate-bounce w-full min-h-[44px] pl-11 pr-[18px] py-[13px] rounded-full bg-[#FFF0F3] text-[#5A0B22] placeholder:text-[#5A0B22]/40 border border-[#5A0B22]/20 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
              />
            </div>
          </div>

          {/* Contraseña (T5) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-[#5A0B22]">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={18}
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/70"
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
                className="animate-bounce1 w-full min-h-[44px] pl-11 pr-[18px] py-[13px] rounded-full bg-[#FFF0F3] text-[#5A0B22] placeholder:text-[#5A0B22]/40 border border-[#5A0B22]/20 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
              />
            </div>
          </div>

          {/* Link olvidé contraseña (T9) */}
          <div className="text-right">
            <Link
              to="/reset-password"
              className="text-xs text-[#7A1333] hover:text-[#5A0B22] underline"
            >
              ¿Olvidé mi contraseña?
            </Link>
          </div>

          {/* Error accesible */}
          {error && (
            <p
              role="alert"
              className="text-sm font-medium text-[#5A0B22] bg-[#FFF0F3] border border-[#FFC9D6] rounded-xl px-4 py-3"
            >
              {error}
            </p>
          )}

          {/* Botón submit (T6) */}
          <button
            type="submit"
            disabled={submitting}
            className="animate-bounce2 min-h-[44px] w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            {submitting ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-[#3F0516]/40 border-t-[#3F0516] animate-spin"
                  aria-hidden="true"
                />
                <span>Ingresando…</span>
              </>
            ) : (
              <>
                <LogIn size={18} aria-hidden="true" />
                <span>Ingresar</span>
              </>
            )}
          </button>
        </form>

        {/* Separador + Google (T8) */}
        <div className="flex items-center gap-3 my-5" aria-hidden="true">
          <span className="flex-1 h-px bg-[#FFC9D6]/60" />
          <span className="text-xs text-[#7A1333]/60">o</span>
          <span className="flex-1 h-px bg-[#FFC9D6]/60" />
        </div>
        <GoogleButton label="Continuar con Google" />

        {/* Link registro (T9) */}
        <p className="text-center text-sm text-[#5A0B22]/70 mt-5">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="text-[#7A1333] hover:text-[#5A0B22] underline font-semibold">
            Registrarse
          </Link>
        </p>
      </main>
    </div>
  );
}
