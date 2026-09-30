import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, ChevronRight } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import SparkleButton from './SparkleButton';
import TurnoModal from './TurnoModal';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTurnoModalOpen, setIsTurnoModalOpen] = useState(false);
  const whatsappNumber = "5492215904978"; // Replace with actual number if needed
  const location = useLocation();

  const handleOpenTurno = () => {
    setIsTurnoModalOpen(true);
  };

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/cursos', label: 'Cursos' },
    { path: '/tienda', label: 'Tienda MK' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/contacto', label: 'Contacto' },
  ];

  return (
    <>
      <TurnoModal isOpen={isTurnoModalOpen} onClose={() => setIsTurnoModalOpen(false)} />
      
      {/* Top Announcement Bar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#5A0B22] text-[#FFF8FA] py-2.5 px-4 text-center text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 relative z-50"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
        <span>Servicios de Belleza • Atención personalizada</span>
        <span className="hidden md:inline text-[#F8B4C4]">|</span>
        <Link to="/cursos" className="hidden md:inline underline hover:text-white transition-colors">
          Ver Cursos & Masterclass
        </Link>
      </motion.div>

      {/* HEADER / NAVEGACIÓN */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#FFC9D6] via-[#FFD2DE]/95 to-[#FFDEE6]/90 backdrop-blur-md transition-all duration-300 relative shadow-[0_10px_30px_-10px_rgba(255,201,214,0.6)]">
        <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-[#FFDEE6]/90 via-[#FFEBF0]/50 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

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
            <nav className="hidden md:flex items-center gap-0.5 font-medium text-sm text-[#5A0B22]">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`relative px-3.5 py-1.5 rounded-full transition-all duration-200 tracking-wide ${location.pathname === link.path ? 'font-bold text-[#7A1333] bg-white/50' : 'hover:bg-[#5A0B22]/8 hover:text-[#5A0B22]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CTA Desktop: Botón Generar Turno + WhatsApp */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenTurno()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#5A0B22] to-[#7A1333] text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#F7E7B4]" />
              <span>Generar Turno</span>
            </button>
            <WhatsAppButton
              phoneNumber={whatsappNumber}
              message="¡Hola Melany! Te contacto para agendar un servicio."
              open={true}
              size="sm"
              text="Agendar"
            />
          </div>

          {/* Hamburger móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            className="md:hidden p-2 text-[#5A0B22] hover:opacity-60 transition-opacity focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Desplegable Móvil */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 backdrop-blur-lg px-6 py-6 shadow-2xl rounded-b-3xl overflow-hidden"
            >
              <div className="flex flex-col gap-4 font-medium text-base text-[#5A0B22]">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`py-2 border-b border-[#FFC9D6]/60 flex items-center justify-between ${location.pathname === link.path ? 'font-bold text-[#7A1333]' : ''}`}
                  >
                    <span>{link.label}</span><ChevronRight className="w-4 h-4 text-[#7A1333]" />
                  </Link>
                ))}
                
                <div className="pt-4 flex flex-col items-stretch gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenTurno();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5A0B22] to-[#7A1333] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-[#F7E7B4]" />
                    <span>Generar Turno Online</span>
                  </button>
                  <div className="flex items-center justify-center gap-3">
                    <SparkleButton text="Elegí tu curso" href="/cursos" onClick={() => setMobileMenuOpen(false)} />
                    <WhatsAppButton
                      phoneNumber={whatsappNumber}
                      message="¡Hola Melany! Te contacto para agendar un servicio."
                      open={true}
                      size="sm"
                      text="Agendar"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
