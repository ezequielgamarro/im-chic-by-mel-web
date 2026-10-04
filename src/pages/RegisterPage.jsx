import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/GoogleButton';
import { User, Mail, Lock, UserPlus, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';

/**
 * Página de registro de usuarios (tarea T4).
 * - Formulario con email, contraseña, nombre y teléfono opcional.
 * - Checkbox legal obligatorio con enlaces a /terminos y /privacidad.
 * - Validación HTML5 + React, submit → signUp → feedback toast.
 * - Redirige a /login tras registro exitoso.
 */
function RegisterPage() {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  const validateForm = () => {
    const errs = {};
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Ingresá un email válido.';
    }
    if (!formData.password || formData.password.length < 8) {
      errs.password = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Las contraseñas no coinciden.';
    }
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = 'Ingresá tu nombre completo.';
    }
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 6) {
      errs.phone = 'Ingresá un teléfono válido (mínimo 6 dígitos).';
    }
    if (!acceptedTerms) {
      errs.terms = 'Debés aceptar los Términos y la Política de Privacidad.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      // Mostramos el primer error encontrado
      const firstError = Object.values(errs)[0];
      setError(firstError);
      return;
    }

    setSubmitting(true);
    try {
      await register(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim(),
        formData.phone.trim()
      );
      setSuccess('¡Cuenta creada exitosamente! Revisá tu email para confirmar la cuenta. Te redirigimos al login…');
      // Redirigir a login tras 2 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(
        err?.message ||
        'No pudimos crear tu cuenta. Verificá los datos e intentá de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="premium-page min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans flex items-center justify-center p-6">
      <main className="premium-card animate-fade-up w-full max-w-md p-6 sm:p-8">
        <header className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC9D6]/60 border border-[#D87F95]/30 text-[#7A1333] text-xs font-bold uppercase tracking-wider mb-3">
            <UserPlus size={14} className="text-[#D4AF37]" aria-hidden="true" />
            <span>Crear Cuenta</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22]">
            Creá tu cuenta
          </h1>
          <p className="text-sm text-[#5A0B22]/75 leading-relaxed mt-2 max-w-sm mx-auto">
            Registrate para guardar tu carrito, ver tu historial de turnos y cursos, y agendar turnos con disponibilidad en tiempo real.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-semibold text-[#5A0B22]">
              Nombre completo *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50" aria-hidden="true" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                inputMode="text"
                autoComplete="name"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ej: Sofía Giménez"
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-[#5A0B22]">
              Email *
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tucorreo@ejemplo.com"
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-semibold text-[#5A0B22]">
              Teléfono / WhatsApp (opcional)
            </label>
            <div className="relative">
              <Phone
                size={18}
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A1333]"
              />
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej: 381 555-1234"
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-[#5A0B22]">
              Contraseña *
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
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="•••••••• (mín. 8 caracteres)"
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-[#5A0B22]">
              Confirmar contraseña *
            </label>
            <div className="relative">
              <Lock
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A1333]"
              />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
              />
            </div>
          </div>

          {/* Checkbox legal obligatorio */}
          <div className="flex items-start gap-2 pt-2">
            <input
              id="acceptedTerms"
              type="checkbox"
              required
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-[#7A1333] border-[#FFC9D6] rounded focus:ring-2 focus:ring-[#7A1333]"
            />
            <label htmlFor="acceptedTerms" className="text-sm text-[#5A0B22]/80 leading-relaxed">
              Acepto los <Link to="/terminos" className="underline hover:text-[#7A1333]">Términos y Condiciones</Link> y la <Link to="/privacidad" className="underline hover:text-[#7A1333]">Política de Privacidad</Link> *
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm font-medium text-[#B91C1C] bg-[#FEE2E2]/70 border border-[#B91C1C]/20 rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          {success && (
            <p
              role="status"
              className="text-sm font-medium text-green-700 bg-green-50/70 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>{success}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                <span>Creando cuenta…</span>
              </>
            ) : (
              <>
                <UserPlus size={18} className="text-[#F7E7B4]" aria-hidden="true" />
                <span>Crear mi cuenta</span>
              </>
            )}
          </button>

          <p className="text-xs text-[#5A0B22]/60 text-center">
            ¿Ya tenés cuenta? <Link to="/login" className="font-semibold underline hover:text-[#7A1333]">Iniciar sesión</Link>
          </p>
        </form>

        {/* Separador + Google */}
        <div className="premium-or my-5">o</div>
        <GoogleButton label="Registrarse con Google" />
      </main>
    </div>
  );
}

export default RegisterPage;