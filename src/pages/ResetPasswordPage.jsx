import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

/**
 * Página de recuperación de contraseña (tarea T4).
 * - Formulario simple con email para solicitar reset.
 * - Envía email de reset via Supabase Auth.
 */
function ResetPasswordPage() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('request'); // 'request' | 'sent' | 'reset'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF0F3] flex items-center justify-center" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFC9D6] border-t-[#7A1333] animate-spin" aria-hidden="true" />
          <p className="text-sm text-[#5A0B22]/75 font-medium">Cargando…</p>
        </div>
      </div>
    );
  }

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresá un email válido.');
      return;
    }

    setSubmitting(true);
    try {
      // Usar Supabase Auth para enviar email de reset
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;

      setSuccess('Te enviamos un email con instrucciones para restablecer tu contraseña. Revisá tu bandeja de entrada (y spam).');
      setStep('sent');
    } catch (err) {
      setError(err?.message || 'No pudimos enviar el email. Verificá el email e intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (!newPassword || newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setSuccess('¡Contraseña actualizada correctamente! Redirigiendo al login…');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err) {
      setError(err?.message || 'No pudimos actualizar la contraseña. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="premium-page min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans flex items-center justify-center p-6">
      <main className="premium-card animate-fade-up w-full max-w-md p-6 sm:p-8">
        <header className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#FFC9D6]/60 text-[#7A1333] flex items-center justify-center mx-auto mb-4">
            {step === 'request' ? (
              <RotateCcw size={26} aria-hidden="true" />
            ) : step === 'sent' ? (
              <Mail size={26} aria-hidden="true" />
            ) : (
              <Lock size={26} aria-hidden="true" />
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            {step === 'request' ? 'Recuperar contraseña' : step === 'sent' ? 'Email enviado' : 'Nueva contraseña'}
          </h1>
          <p className="text-sm text-[#5A0B22]/75 leading-relaxed">
            {step === 'request' ? 'Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.' : step === 'sent' ? 'Revisá tu bandeja de entrada (y spam) para restablecer tu contraseña.' : 'Ingresá tu nueva contraseña.'}
          </p>
        </header>

        {step === 'request' && (
          <form onSubmit={handleRequestReset} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-[#5A0B22]">Email</label>
              <div className="relative">
                <Mail size={18} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A1333]" />
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

            {error && (
              <p role="alert" className="text-sm font-medium text-[#B91C1C] bg-[#FEE2E2]/70 border border-[#B91C1C]/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}

            {success && (
              <p role="status" className="text-sm font-medium text-green-700 bg-green-50/70 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
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
                  <span>Enviando…</span>
                </>
              ) : (
                <>
                  <RotateCcw size={18} className="text-[#F7E7B4]" aria-hidden="true" />
                  <span>Enviar enlace</span>
                </>
              )}
            </button>
          </form>
        )}

        {step === 'sent' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-[#5A0B22]/75">Si no recibís el email en unos minutos, revisá la carpeta de spam.</p>
            <button
              onClick={() => setStep('request')}
              className="text-xs text-[#7A1333] hover:text-[#5A0B22] underline"
            >
              Reenviar email
            </button>
            <Link to="/login" className="text-xs text-[#7A1333] hover:text-[#5A0B22] underline block mt-2">
              Volver al login
            </Link>
          </div>
        )}

        {/* Nota: Supabase maneja el flujo de reset via email con token. 
            Al hacer click en el link del email, redirige a /reset-password?token=...
            Para simplificar, usamos updateUser directamente si hay sesión activa. */}
      </main>
    </div>
  );
}

export default ResetPasswordPage;