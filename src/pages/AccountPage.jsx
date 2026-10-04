import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Image,
  LogOut,
  Save,
  AlertCircle,
  CheckCircle2,
  Calendar,
  BookOpen,
  ArrowLeft,
  ShoppingBag,
  Heart,
  Receipt,
} from 'lucide-react';
import CartPanel from '../components/account/CartPanel';
import FavoritesPanel from '../components/account/FavoritesPanel';
import OrdersPanel from '../components/account/OrdersPanel';

const TABS = [
  { key: 'perfil', label: 'Mi Perfil', icon: User },
  { key: 'carrito', label: 'Mi Carrito', icon: ShoppingBag },
  { key: 'favoritos', label: 'Favoritos', icon: Heart },
  { key: 'compras', label: 'Mis Compras', icon: Receipt },
];

/**
 * Página de cuenta de usuario (Spec 010 T10).
 * - Perfil editable (pestaña "Mi Perfil"): nombre, teléfono, avatar.
 * - Carrito / Favoritos / Mis Compras en pestañas accesibles.
 * - Accesos "Mis Turnos" y "Mis Cursos" persistentes.
 * - Botón "Cerrar sesión".
 */
function AccountPage() {
  const { user, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState('perfil');
  const tabRefs = useRef([]);

  // Cargar datos del perfil al montar
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        avatarUrl: user.user_metadata?.avatar_url || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        avatar_url: formData.avatarUrl.trim(),
      });
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      setError(err?.message || 'No pudimos guardar los cambios. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // Navegación por teclado de la tablist (RF-26): flechas + Home/End.
  const handleTabKeyDown = (event, index) => {
    let nextIndex = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TABS.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    setActiveTab(TABS[nextIndex].key);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="premium-page min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans">
      <header className="premium-header sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-script text-lg leading-none text-[#7A1333]">
              Im Chic by Mel
            </p>
            <h1 className="font-serif text-xl sm:text-2xl font-bold">
              Mi Cuenta
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
            >
              <ArrowLeft size={18} className="text-[#7A1333]" aria-hidden="true" />
              <span>Volver al inicio</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
            >
              <LogOut size={18} className="text-[#7A1333]" aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
        {/* Tablist accesible (mobile-first, scroll horizontal) */}
        <div
          role="tablist"
          aria-label="Secciones de mi cuenta"
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
        >
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`account-tab-${tab.key}`}
                aria-selected={selected}
                aria-controls={`account-panel-${tab.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.key)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`min-h-[44px] shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22] ${
                  selected
                    ? 'bg-[#5A0B22] text-white shadow-md'
                    : 'bg-white text-[#5A0B22] border border-[#5A0B22]/15 hover:bg-[#FFC9D6]/30'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel: Mi Perfil */}
        <div
          role="tabpanel"
          id="account-panel-perfil"
          aria-labelledby="account-tab-perfil"
          hidden={activeTab !== 'perfil'}
          className="focus:outline-none"
        >
          <section aria-labelledby="profile-heading">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-[#D4AF37]" aria-hidden="true" />
              <h2 id="profile-heading" className="font-serif text-lg sm:text-xl font-semibold text-[#5A0B22]">
                Mi Perfil
              </h2>
            </div>

            <form onSubmit={handleSave} className="premium-card p-6 space-y-4">
              {error && (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div role="status" className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{success}</span>
                </div>
              )}

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#FFC9D6]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#FFC9D6]/60 text-[#7A1333] flex items-center justify-center">
                      <User size={28} aria-hidden="true" />
                    </div>
                  )}
                  <label htmlFor="avatar-file" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition">
                    <Image size={16} className="text-white" aria-hidden="true" />
                    <span className="sr-only">Cambiar foto de perfil</span>
                    <input
                      id="avatar-file"
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.result }));
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      placeholder="Tu nombre completo"
                      className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#5A0B22]/20 bg-white text-[#5A0B22] placeholder:text-[#5A0B22]/40 focus:outline-none focus:ring-2 focus:ring-[#7A1333] focus:border-[#7A1333] transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-semibold text-[#5A0B22]">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50" aria-hidden="true" />
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
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-[#5A0B22]">
                  Email (no editable)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A1333]/50" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#5A0B22]/20 bg-[#FFF0F3]/80 text-[#5A0B22]/70 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-[#5A0B22]/50">El email no se puede cambiar desde aquí.</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
              >
                <Save size={18} className="text-[#F7E7B4]" aria-hidden="true" />
                <span>{saving ? 'Guardando…' : 'Guardar cambios'}</span>
              </button>
            </form>
          </section>
        </div>

        {/* Panel: Mi Carrito */}
        <div
          role="tabpanel"
          id="account-panel-carrito"
          aria-labelledby="account-tab-carrito"
          hidden={activeTab !== 'carrito'}
          className="focus:outline-none"
        >
          <CartPanel />
        </div>

        {/* Panel: Favoritos */}
        <div
          role="tabpanel"
          id="account-panel-favoritos"
          aria-labelledby="account-tab-favoritos"
          hidden={activeTab !== 'favoritos'}
          className="focus:outline-none"
        >
          <FavoritesPanel />
        </div>

        {/* Panel: Mis Compras */}
        <div
          role="tabpanel"
          id="account-panel-compras"
          aria-labelledby="account-tab-compras"
          hidden={activeTab !== 'compras'}
          className="focus:outline-none"
        >
          <OrdersPanel />
        </div>

        {/* Accesos rápidos (persistentes, fuera de los tabs) */}
        <section aria-labelledby="quick-heading" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 id="quick-heading" className="sr-only">Accesos rápidos</h2>
          <Link
            to="/mis-turnos"
            className="premium-card-soft p-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A1333] to-[#5A0B22] flex items-center justify-center text-white">
              <Calendar size={24} className="text-[#F7E7B4]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#5A0B22]">Mis Turnos</h3>
              <p className="text-sm text-[#5A0B22]/70">Ver y gestionar mis turnos agendados</p>
            </div>
          </Link>

          <Link
            to="/mis-cursos"
            className="premium-card-soft p-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A1333] to-[#5A0B22] flex items-center justify-center text-white">
              <BookOpen size={24} className="text-[#F7E7B4]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#5A0B22]">Mis Cursos</h3>
              <p className="text-sm text-[#5A0B22]/70">Ver mis cursos inscritos</p>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default AccountPage;
