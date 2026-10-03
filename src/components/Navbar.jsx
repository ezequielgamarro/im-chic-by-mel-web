import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, ChevronRight, User, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useTurno } from '../context/TurnoContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { open: openTurno } = useTurno();
  const { user, isAdmin, signOut } = useAuth();
  const menuButtonRef = useRef(null);

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/cursos', label: 'Cursos' },
    { path: '/tienda', label: 'Tienda MK' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/contacto', label: 'Contacto' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  // Cierre con Escape + bloqueo de scroll del body mientras el menú está abierto
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const handleOpenTurno = () => {
    closeMenu();
    openTurno();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#5A0B22] text-[#FFF8FA] py-2.5 px-4 text-center text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 relative z-50"
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37]" aria-hidden="true" />
        <span>Servicios de Belleza • Atención personalizada</span>
        <span className="hidden md:inline text-[#F8B4C4]">|</span>
        <Link to="/cursos" className="hidden md:inline underline hover:text-white transition-colors">
          Ver Cursos & Masterclass
        </Link>
      </motion.div>

      {/* Backdrop móvil (clic fuera cierra) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.button
            key="menu-backdrop"
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="md:hidden fixed inset-0 z-40 bg-[#5A0B22]/40 backdrop-blur-sm cursor-default"
          />
        )}
      </AnimatePresence>

      {/* HEADER / NAVEGACIÓN */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#FFC9D6] via-[#FFD2DE]/95 to-[#FFDEE6]/90 backdrop-blur-md transition-all duration-300 relative shadow-[0_10px_30px_-10px_rgba(255,201,214,0.6)]">
        <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-[#FFDEE6]/90 via-[#FFEBF0]/50 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between relative z-50">

          <div className="flex items-center gap-8 lg:gap-12">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3.5 focus:outline-none rounded-2xl p-1 group block"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-white rounded-full p-0 shadow-md border border-white/80 ring-2 ring-[#5A0B22]/15 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-lg">
                <img
                  src="/assets/logo-im-chic.png"
                  alt="Logo I'm Chic - By Melany Toledo"
                  className="w-full h-full object-cover scale-[1.25] rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="font-serif font-bold text-sm text-[#5A0B22]">IC</span>';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#5A0B22] leading-none">I'm Chic</span>
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#7A1333] uppercase mt-1">By Melany Toledo</span>
              </div>
            </Link>

            {/* Nav Desktop */}
            <nav aria-label="Principal" className="hidden md:flex items-center gap-0.5 font-medium text-sm text-[#5A0B22]">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={location.pathname === link.path ? 'page' : undefined}
                  className={`relative px-3.5 py-1.5 rounded-full transition-all duration-200 tracking-wide ${location.pathname === link.path ? 'font-bold text-[#7A1333] bg-white/50' : 'hover:bg-[#5A0B22]/8 hover:text-[#5A0B22]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CTA Desktop: Botón Agenda tu turno */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenTurno}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-gradient-to-r from-[#5A0B22] to-[#7A1333] text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
            >
              <Calendar className="w-3.5 h-3.5 text-[#F7E7B4]" />
              <span>Agenda tu turno</span>
            </button>
            
            {/* Auth buttons desktop */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <User size={14} />
                    <span>Panel Admin</span>
                  </Link>
                )}
                <Link
                  to="/cuenta"
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors"
                >
                  <User size={14} />
                  <span className="hidden sm:inline">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors"
                >
                  <LogIn size={14} />
                  <span>Ingresar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger móvil */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#5A0B22] hover:bg-[#5A0B22]/8 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Desplegable Móvil */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              id="mobile-menu"
              aria-label="Menú móvil"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden absolute left-0 right-0 top-full z-50 bg-white/95 backdrop-blur-lg px-6 py-6 shadow-2xl rounded-b-3xl overflow-hidden max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              <div className="flex flex-col gap-1 font-medium text-base text-[#5A0B22]">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMenu}
                    aria-current={location.pathname === link.path ? 'page' : undefined}
                    className={`min-h-[44px] py-3 border-b border-[#FFC9D6]/60 flex items-center justify-between ${location.pathname === link.path ? 'font-bold text-[#7A1333]' : ''}`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#7A1333]" />
                  </Link>
                ))}

                <div className="pt-4 flex flex-col items-stretch gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenTurno}
                    className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-[#5A0B22] to-[#7A1333] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
                  >
                    <Calendar className="w-4 h-4 text-[#F7E7B4]" />
                    <span>Agenda tu turno</span>
                  </button>
                </div>

                {/* Auth section mobile */}
                {user ? (
                  <div className="pt-2 border-t border-[#FFC9D6]/60 flex flex-col gap-2">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={closeMenu}
                        className="w-full min-h-[44px] py-2 px-4 rounded-xl bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
                      >
                        <User size={18} />
                        <span>Panel Admin</span>
                      </Link>
                    )}
                    <Link
                      to="/cuenta"
                      onClick={closeMenu}
                      className="w-full min-h-[44px] py-2 px-4 rounded-xl bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <User size={18} />
                      <span>{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full min-h-[44px] py-2 px-4 rounded-xl bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#FFC9D6]/60 flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="w-full min-h-[44px] py-2 px-4 rounded-xl bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogIn size={18} />
                      <span>Iniciar sesión</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}