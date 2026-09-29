import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paintbrush,
  Sparkles,
  Eye,
  Smile,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Coffee,
  FileText,
  HeartHandshake,
  Palette,
  Award,
  MessageCircle,
  Menu,
  X,
  ArrowDown,
  Briefcase,
  TrendingUp,
  Share2,
  Star,
  Camera,
  Check
} from 'lucide-react';
import WhatsAppButton from './src/components/WhatsAppButton';
import SparkleButton from './src/components/SparkleButton';
import LimeButton from './src/components/LimeButton';
import DownloadButton from './src/components/DownloadButton';
import InstagramButton from './src/components/InstagramButton';



/**
 * Componente ImageWithFallback
 * Renderiza la etiqueta <img /> con las rutas requeridas y provee un elegante
 * placeholder visual en caso de que la imagen aún no se haya copiado al directorio.
 */
function ImageWithFallback({ src, alt, className, containerClassName = "", placeholderIcon: PlaceholderIcon = Camera, placeholderLabel = "Imagen" }) {
  const [error, setError] = useState(false);

  if (error && placeholderLabel === "Logo") {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#5A0B22] to-[#7A1333] text-white shadow-md border border-[#D4AF37]/30 ${containerClassName}`}>
        <span className="font-serif font-bold text-sm tracking-widest text-[#F7E7B4]">IC</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#FFF0F3] to-[#FFC9D6]/40 ${containerClassName}`}>
      {!error && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className={`transition-transform duration-700 hover:scale-105 ${className}`}
        />
      ) : (
        <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-[#5A0B22]/20 rounded-2xl bg-white/60 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] mb-2 shadow-sm">
            <PlaceholderIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#5A0B22]">{placeholderLabel}</span>
        </div>
      )}
    </div>
  );
}

export default function ImChicLanding() {
  const [activeTab, setActiveTab] = useState('tabA'); // 'tabA' (Masterclass) | 'tabB' (Formación Integral)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados de Acordeón animado para Masterclass
  const [openAccordionA, setOpenAccordionA] = useState({
    clase1: true,
    clase2: false,
  });

  const toggleAccordionA = (key) => {
    setOpenAccordionA((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const whatsappNumber = "5493813553492";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("¡Hola Melany! Quiero más información sobre I'm Chic Academy")}`;

  // Variantes de animación para cascadas fluidas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const cardHoverMotion = {
    whileHover: { y: -6, transition: { duration: 0.25, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans selection:bg-[#5A0B22] selection:text-white relative overflow-x-hidden">
      
      {/* Top Announcement Bar */}
      <motion.div 
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#5A0B22] text-[#FFF8FA] py-2.5 px-4 text-center text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
        <span>Inscripciones 2026 abiertas • Grupos reducidos para atención personalizada</span>
        <span className="hidden md:inline text-[#F8B4C4]">|</span>
        <a href="#cursos" className="hidden md:inline underline hover:text-white transition-colors">
          Ver Cursos & Masterclass
        </a>
      </motion.div>

      {/* HEADER / NAVEGACIÓN */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#FFC9D6] via-[#FFD2DE]/95 to-[#FFDEE6]/90 backdrop-blur-md transition-all duration-300 relative shadow-[0_10px_30px_-10px_rgba(255,201,214,0.6)]">
        <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-[#FFDEE6]/90 via-[#FFEBF0]/50 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-8 lg:gap-12">
            {/* Logo */}
            <motion.a
              href="#inicio"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3.5 focus:outline-none rounded-2xl p-1 group"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-white rounded-full p-0 shadow-md border border-white/80 ring-2 ring-[#5A0B22]/15 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-lg">
                <img
                  src="/assets/logo-im-chic.png"
                  alt="Logo I'm Chic - By Melany Toledo"
                  className="w-full h-full object-cover scale-[1.25] rounded-full"
                />
              </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#5A0B22] leading-none">I'm Chic</span>
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#7A1333] uppercase mt-1">By Melany Toledo</span>
            </div>
            </motion.a>

            {/* Nav Desktop — links elegantes con hover pill */}
            <nav className="hidden md:flex items-center gap-0.5 font-medium text-sm text-[#5A0B22]">
              <Link to="/" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Inicio</Link>
              <Link to="/cursos" className="relative px-3.5 py-1.5 rounded-full font-bold text-[#7A1333] bg-white/50 hover:bg-[#5A0B22]/8 transition-all duration-200 tracking-wide">Cursos</Link>
              <Link to="/galeria" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Galería</Link>
              <Link to="/tienda" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Tienda MK</Link>
              <Link to="/inversion" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Inversión</Link>
              <Link to="/contacto" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Contacto</Link>
            </nav>
          </div>

          {/* CTA Desktop: solo WhatsApp Escribime verde */}
          <div className="hidden md:flex items-center">
            <WhatsAppButton
              phoneNumber={whatsappNumber}
              message="¡Hola Melany! Te contacto desde la web de I'm Chic."
              open={true}
              size="sm"
              text="Escribime"
            />
          </div>

          {/* Hamburger móvil — sin caja */}
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
              <div className="flex flex-col gap-2 font-medium text-base text-[#5A0B22]">
                {[
                  ['/', 'Inicio'],
                  ['/cursos', 'Cursos & Masterclass'],
                  ['/galeria', 'Galería'],
                  ['/tienda', 'Tienda Mary Kay'],
                  ['/inversion', 'Inversión'],
                  ['/contacto', 'Contacto'],
                ].map(([path, label]) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 border-b border-[#FFC9D6]/60 flex items-center justify-between"
                  >
                    <span>{label}</span>
                    <ChevronRight className="w-4 h-4 text-[#7A1333]" />
                  </Link>
                ))}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <SparkleButton text="Elegí tu curso" href="#cursos" onClick={() => setMobileMenuOpen(false)} />
                  <WhatsAppButton
                    phoneNumber={whatsappNumber}
                    message="¡Hola Melany! Te contacto desde la web de I'm Chic."
                    open={true}
                    size="sm"
                    text="Escribime"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* 1. HERO SECTION (Cascada de entrada con Framer Motion) */}
        <section id="inicio" className="relative pt-10 pb-16 md:pt-20 md:pb-24 overflow-hidden">
          {/* Círculos ambientales de fondo */}
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-white/50 rounded-full filter blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 -left-16 w-96 h-96 bg-[#F8B4C4]/40 rounded-full filter blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center"
            >
              {/* Badge */}
              <motion.div variants={itemFadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#5A0B22]/15 text-[#5A0B22] text-xs sm:text-sm font-semibold mb-6 shadow-sm">
                <span className="text-[#7A1333]">✨</span>
                <span>Edición 2026 • Academia & Estudio de Belleza</span>
              </motion.div>

              {/* H1 Principal */}
              <motion.h1 
                variants={itemFadeUp}
                className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#5A0B22] mb-3 sm:mb-4 uppercase leading-[1.1]"
              >
                I'M CHIC ACADEMY
              </motion.h1>

              {/* Subtítulo */}
              <motion.div variants={itemFadeUp} className="max-w-3xl mx-auto mb-4 sm:mb-6">
                <p className="font-serif italic text-xl sm:text-2xl md:text-4xl font-medium text-[#7A1333] leading-relaxed">
                  Aprende • Practica • Potencia tu belleza
                </p>
              </motion.div>

              {/* Párrafo introductorio */}
              <motion.div variants={itemFadeUp} className="max-w-2xl mx-auto mb-8 sm:mb-10">
                <div className="inline-block p-3.5 sm:p-5 rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 shadow-md">
                  <p className="text-sm sm:text-base md:text-lg text-[#5A0B22] font-medium leading-relaxed">
                    Por <span className="font-bold underline decoration-[#F8B4C4] underline-offset-4">Melany Toledo</span> - Maquilladora Profesional y Asesora de Belleza Integral.
                  </p>
                </div>
              </motion.div>

              {/* CTA Principal elegante — solo un botón refinado */}
              <motion.div variants={itemFadeUp} className="flex items-center justify-center mb-8 sm:mb-12 w-full sm:w-auto">
                <SparkleButton
                  text="Descubrí tu formación"
                  href="#cursos"
                  style={{ minWidth: '220px', width: '100%', maxWidth: '300px' }}
                />
              </motion.div>

              {/* Features de confianza */}
              <motion.div variants={itemFadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 max-w-xl mx-auto pt-4 border-t border-[#5A0B22]/15 text-xs sm:text-sm text-[#5A0B22] font-medium w-full">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-[#7A1333]" />
                  <span>100% Práctico</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#7A1333]" />
                  <span>Grupos Reducidos</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Award className="w-4 h-4 text-[#7A1333]" />
                  <span>Certificado Incluido</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 2. SECCIÓN DE CURSOS (Tabs animados con AnimatePresence de Framer Motion) */}
        <section id="cursos" className="py-12 sm:py-16 md:py-24 bg-[#FFF0F3]/90 relative scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-8 sm:mb-10"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 text-[#5A0B22] text-xs font-bold uppercase tracking-wider mb-3 border border-[#5A0B22]/15">
                Nuestros Programas
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#5A0B22] mb-3">
                Elegí la formación ideal para vos
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[#5A0B22]/80 font-medium">
                Alterná entre pestañas para explorar temarios, fotos y beneficios con total comodidad.
              </p>
            </motion.div>

            {/* TABS ELEGANTES — selector responsive */}
            <div className="flex justify-center mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row items-center relative w-full sm:w-auto gap-2 sm:gap-0">
                {/* fondo decorativo sutil */}
                <div className="hidden sm:block absolute inset-0 rounded-2xl bg-white/60 border border-[#5A0B22]/10 shadow-sm -z-10" />
                <button
                  onClick={() => setActiveTab('tabA')}
                  className={`w-full sm:w-auto relative group flex items-center justify-center gap-2.5 px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 focus:outline-none rounded-xl sm:rounded-l-2xl sm:rounded-r-none ${
                    activeTab === 'tabA'
                      ? 'text-[#5A0B22] bg-white shadow-md'
                      : 'text-[#5A0B22]/60 hover:text-[#5A0B22]/90 hover:bg-white/50 bg-white/30 sm:bg-transparent'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${
                    activeTab === 'tabA' ? 'bg-[#D4AF37] scale-125' : 'bg-[#5A0B22]/30'
                  }`} />
                  <span className="font-serif">Masterclass Automaquillaje</span>
                  {activeTab === 'tabA' && (
                    <span className="hidden sm:block absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#D4AF37] rounded-full" />
                  )}
                </button>

                <span className="hidden sm:block w-px h-8 bg-[#5A0B22]/15 mx-1" />

                <button
                  onClick={() => setActiveTab('tabB')}
                  className={`w-full sm:w-auto relative group flex items-center justify-center gap-2.5 px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 focus:outline-none rounded-xl sm:rounded-r-2xl sm:rounded-l-none ${
                    activeTab === 'tabB'
                      ? 'text-[#5A0B22] bg-white shadow-md'
                      : 'text-[#5A0B22]/60 hover:text-[#5A0B22]/90 hover:bg-white/50 bg-white/30 sm:bg-transparent'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${
                    activeTab === 'tabB' ? 'bg-[#D4AF37] scale-125' : 'bg-[#5A0B22]/30'
                  }`} />
                  <span className="font-serif">Formación Integral Mary Kay</span>
                  {activeTab === 'tabB' && (
                    <span className="hidden sm:block absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#D4AF37] rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* TRANSICIÓN DE CONTENIDO DE PESTAÑAS CON ANIMATEPRESENCE */}
            <AnimatePresence mode="wait">
              {activeTab === 'tabA' ? (
                <motion.div
                  key="tabA"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-16"
                >
                  {/* Eslogan Pestaña A */}
                  <div className="text-center max-w-3xl mx-auto bg-white/80 p-6 sm:p-7 rounded-3xl border border-[#5A0B22]/15 shadow-sm">
                    <span className="inline-block text-xs uppercase tracking-widest text-[#7A1333] font-bold mb-1">
                      Taller Intensivo Exclusivo
                    </span>
                    <p className="font-serif text-xl sm:text-2xl font-bold text-[#5A0B22] leading-snug">
                      “Hacé de tu maquillaje una herramienta de confianza.”
                    </p>
                    <p className="text-sm text-[#5A0B22]/80 mt-2">
                      Una experiencia práctica, personalizada y pensada para vos.
                    </p>
                  </div>

                  {/* LAYOUT GRID: A un lado beneficios con íconos, al otro la imagen destacada */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Columna Izquierda: 6 Beneficios */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-[#5A0B22] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          <Paintbrush className="w-5 h-5 text-pink-200" />
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22]">
                          ¿Qué te llevás con este taller?
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        
                        {/* Beneficio 1: Brocha */}
                        <motion.div {...cardHoverMotion} className="bg-white/90 p-4 rounded-2xl border border-[#F8B4C4]/40 shadow-sm flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                            <Paintbrush className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#5A0B22] leading-snug">Resultados profesionales</h4>
                            <p className="text-xs text-[#5A0B22]/80 mt-0.5">Sin depender de nadie más.</p>
                          </div>
                        </motion.div>

                        {/* Beneficio 2: Rostro */}
                        <motion.div {...cardHoverMotion} className="bg-white/90 p-4 rounded-2xl border border-[#F8B4C4]/40 shadow-sm flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                            <Smile className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#5A0B22] leading-snug">Conocer tu rostro y tu piel</h4>
                            <p className="text-xs text-[#5A0B22]/80 mt-0.5">Técnicas que te favorecen a vos.</p>
                          </div>
                        </motion.div>

                        {/* Beneficio 3: Ojo */}
                        <motion.div {...cardHoverMotion} className="bg-white/90 p-4 rounded-2xl border border-[#F8B4C4]/40 shadow-sm flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                            <Eye className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#5A0B22] leading-snug">Dominar día y noche</h4>
                            <p className="text-xs text-[#5A0B22]/80 mt-0.5">Transformación ágil de tu look.</p>
                          </div>
                        </motion.div>

                        {/* Beneficio 4: Skincare */}
                        <motion.div {...cardHoverMotion} className="bg-white/90 p-4 rounded-2xl border border-[#F8B4C4]/40 shadow-sm flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#5A0B22] leading-snug">Skincare diario</h4>
                            <p className="text-xs text-[#5A0B22]/80 mt-0.5">Preparación y cuidado correcto.</p>
                          </div>
                        </motion.div>

                        {/* Beneficio 5: Brochas y compras */}
                        <motion.div {...cardHoverMotion} className="bg-white/90 p-4 rounded-2xl border border-[#F8B4C4]/40 shadow-sm flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#5A0B22] leading-snug">Herramientas correctas</h4>
                            <p className="text-xs text-[#5A0B22]/80 mt-0.5">Qué brocha usar sin gastar de más.</p>
                          </div>
                        </motion.div>

                        {/* Beneficio 6: Larga duración */}
                        <motion.div {...cardHoverMotion} className="bg-white/90 p-4 rounded-2xl border border-[#F8B4C4]/40 shadow-sm flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#5A0B22] leading-snug">Técnica de larga duración</h4>
                            <p className="text-xs text-[#5A0B22]/80 mt-0.5">Ideal para eventos y fiestas.</p>
                          </div>
                        </motion.div>

                      </div>
                    </div>

                    {/* Columna Derecha: Imagen destacada (/assets/masterclass-hero.png) con forma asimétrica moderna */}
                    <div className="lg:col-span-5 relative flex justify-center">
                      <div className="relative w-full max-w-sm aspect-[4/5] rounded-[2.5rem] overflow-hidden p-2 bg-gradient-to-b from-white to-[#FFC9D6] shadow-2xl border-4 border-white">
                        <ImageWithFallback
                          src="/assets/masterclass-hero.png"
                          alt="Chica maquillándose frente al espejo - Masterclass Automaquillaje"
                          className="w-full h-full object-cover rounded-[2rem]"
                          containerClassName="w-full h-full rounded-[2rem]"
                          placeholderIcon={Camera}
                          placeholderLabel="Chica maquillándose frente al espejo"
                        />
                        {/* Floating glass badge */}
                        <motion.div 
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute bottom-6 left-6 right-6 p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white shadow-lg text-center"
                        >
                          <span className="text-xs font-bold text-[#5A0B22] block">Técnica 1 a 1 en vivo</span>
                          <span className="text-[11px] text-[#7A1333]">Práctica personalizada frente al espejo</span>
                        </motion.div>
                      </div>
                    </div>

                  </div>

                  {/* TEMARIO: Acordeones Animados con Imágenes Flotantes */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#5A0B22] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22]">
                          Temario de la Masterclass (2 Clases Prácticas)
                        </h3>
                      </div>
                      <DownloadButton
                        fileUrl="/documents/Curso-de-Maquillaje-MasterClass.pdf"
                        fileName="Curso-de-Maquillaje-MasterClass.pdf"
                        tooltipText="Descargar Programa Masterclass PDF"
                        label="Descargar Programa"
                      />
                    </div>

                    <div className="space-y-4">
                      
                      {/* Primera Clase (Incluye /assets/clase-1.png) */}
                      <div className="bg-white rounded-3xl border border-[#5A0B22]/15 shadow-sm overflow-hidden">
                        <button
                          onClick={() => toggleAccordionA('clase1')}
                          className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[#FFF0F3]/50 transition-colors focus:outline-none"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] font-serif font-bold text-lg">
                              1
                            </div>
                            <div>
                              <h4 className="font-serif text-lg sm:text-xl font-bold text-[#5A0B22]">
                                Primera Clase: Preparación y Look de Día
                              </h4>
                              <p className="text-xs sm:text-sm text-[#7A1333] font-medium">Bases sólidas, visagismo y aplicación paso a paso</p>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: openAccordionA.clase1 ? 0 : -90 }}
                            transition={{ duration: 0.2 }}
                            className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#5A0B22]"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {openAccordionA.clase1 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden border-t border-[#FFF0F3]"
                            >
                              <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                {/* Contenido Lista */}
                                <div className="flex-1 space-y-2.5 text-sm sm:text-base text-[#5A0B22]">
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Diagnóstico de piel:</strong> Reconocé tu tipo y necesidad puntual.</span></div>
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Preparación:</strong> Skincare pre-maquillaje para fijación duradera.</span></div>
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Corrección:</strong> Ojeras, manchas e imperfecciones con tono exacto.</span></div>
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Brochas:</strong> Qué herramientas son indispensables y su uso real.</span></div>
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Maquillaje de día:</strong> Acabado luminoso, natural y armonioso.</span></div>
                                </div>

                                {/* Imagen Clase 1 flotando sutilmente */}
                                <motion.div 
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                  className="w-full sm:w-44 flex-shrink-0"
                                >
                                  <ImageWithFallback
                                    src="/assets/clase-1.png"
                                    alt="Retrato chica con collar de perlas - Clase 1"
                                    className="w-full h-44 object-cover rounded-2xl shadow-lg border-2 border-white"
                                    containerClassName="w-full h-44 rounded-2xl shadow-lg"
                                    placeholderIcon={Star}
                                    placeholderLabel="Retrato con perlas (Clase 1)"
                                  />
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Segunda Clase (Incluye /assets/clase-2.png) */}
                      <div className="bg-white rounded-3xl border border-[#5A0B22]/15 shadow-sm overflow-hidden">
                        <button
                          onClick={() => toggleAccordionA('clase2')}
                          className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[#FFF0F3]/50 transition-colors focus:outline-none"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] font-serif font-bold text-lg">
                              2
                            </div>
                            <div>
                              <h4 className="font-serif text-lg sm:text-xl font-bold text-[#5A0B22]">
                                Segunda Clase: Noche, Larga Duración y Rutina
                              </h4>
                              <p className="text-xs sm:text-sm text-[#7A1333] font-medium">Glamour nocturno, sellado profesional y cuidado restaurador</p>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: openAccordionA.clase2 ? 0 : -90 }}
                            transition={{ duration: 0.2 }}
                            className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#5A0B22]"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {openAccordionA.clase2 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden border-t border-[#FFF0F3]"
                            >
                              <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                {/* Contenido Lista */}
                                <div className="flex-1 space-y-2.5 text-sm sm:text-base text-[#5A0B22]">
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Repaso:</strong> Perfeccionamiento de la técnica adquirida en la clase 1.</span></div>
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Maquillaje de noche:</strong> Profundidad de mirada, delineado y volumen.</span></div>
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Larga duración:</strong> Sellado estratégico contra calor, transpiración y roces.</span></div>
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Desmaquillado:</strong> Remoción correcta sin fricción dañina.</span></div>
                                  <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#7A1333] flex-shrink-0" /><span><strong>Skincare nocturno:</strong> Rutina reparadora para despertar radiante.</span></div>
                                </div>

                                {/* Imagen Clase 2 */}
                                <motion.div 
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                  className="w-full sm:w-44 flex-shrink-0"
                                >
                                  <ImageWithFallback
                                    src="/assets/clase-2.png"
                                    alt="Chica sacándose una selfie en el espejo - Clase 2"
                                    className="w-full h-44 object-cover rounded-2xl shadow-lg border-2 border-white"
                                    containerClassName="w-full h-44 rounded-2xl shadow-lg"
                                    placeholderIcon={Camera}
                                    placeholderLabel="Selfie en espejo (Clase 2)"
                                  />
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>
                  </div>


                </motion.div>
              ) : (
                <motion.div
                  key="tabB"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-16"
                >
                  {/* Eslogan Pestaña B */}
                  <div className="text-center max-w-3xl mx-auto bg-white/80 p-6 sm:p-7 rounded-3xl border border-[#5A0B22]/15 shadow-sm">
                    <span className="inline-block text-xs uppercase tracking-widest text-[#7A1333] font-bold mb-1">
                      Formación Profesional Integral
                    </span>
                    <p className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22] leading-snug">
                      “Tu belleza, también es tu negocio.”
                    </p>
                    <p className="text-sm text-[#5A0B22]/80 mt-2">
                      Capacitación técnica Mary Kay, asesoría dermatológica y estrategias comerciales.
                    </p>
                  </div>

                  {/* Banner / Showcase Mary Kay con Foto Real */}
                  <div className="bg-white/90 rounded-3xl p-6 sm:p-8 border border-[#5A0B22]/15 shadow-md flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-5/12 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-white relative group">
                      <ImageWithFallback
                        src="/assets/mary-kay.png"
                        alt="Línea de productos Mary Kay TimeWise y catálogo profesional"
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full rounded-2xl"
                        placeholderIcon={Sparkles}
                        placeholderLabel="Productos Mary Kay TimeWise"
                      />
                      <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-2.5 text-center shadow-md">
                        <span className="text-xs font-bold text-[#5A0B22] block">Línea Oficial TimeWise Mary Kay</span>
                        <span className="text-[11px] text-[#7A1333]">Prácticas con cosméticos de alta gama</span>
                      </div>
                    </div>
                    <div className="w-full md:w-7/12 space-y-3">
                      <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFC9D6] text-[#5A0B22] text-xs font-bold uppercase tracking-wider">
                        Capacitación Oficial de Producto
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22]">
                        Aprenderás y asesorarás con Mary Kay
                      </h3>
                      <p className="text-sm sm:text-base text-[#5A0B22]/85 leading-relaxed">
                        Aprenderás en profundidad el catálogo Mary Kay, desde las rutinas de cuidado facial TimeWise (limpiadoras 4 en 1, hidratantes antioxidantes y máscaras) hasta técnicas de aplicación. Sabrás diagnosticar necesidades y recomendar con seguridad absoluta a tus clientas.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#5A0B22] border border-[#5A0B22]/10 shadow-sm">✓ Rutina facial TimeWise</span>
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#5A0B22] border border-[#5A0B22]/10 shadow-sm">✓ Diagnóstico por tipo de piel</span>
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-[#5A0B22] border border-[#5A0B22]/10 shadow-sm">✓ Rentabilidad & Ventas</span>
                      </div>
                    </div>
                  </div>

                  {/* BENEFICIOS EN TARJETAS CON ELEVACIÓN AL HACER HOVER */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-9 h-9 rounded-xl bg-[#5A0B22] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22]">
                        Beneficios de la Formación Profesional
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      
                      {/* Card 1 */}
                      <motion.div 
                        whileHover={{ y: -8, transition: { duration: 0.25 } }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-[#F8B4C4]/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="w-11 h-11 rounded-2xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] font-bold text-base mb-4">
                            1
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#5A0B22] mb-2 leading-snug">
                            Dominarás tu propio automaquillaje
                          </h4>
                          <p className="text-xs sm:text-sm text-[#5A0B22]/85 leading-relaxed">
                            Siendo vos misma la mejor vidriera de los productos que comercializás.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#FFC9D6]/50 flex items-center gap-1.5 text-xs text-[#7A1333] font-semibold">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Confianza absoluta</span>
                        </div>
                      </motion.div>

                      {/* Card 2 */}
                      <motion.div 
                        whileHover={{ y: -8, transition: { duration: 0.25 } }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-[#F8B4C4]/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="w-11 h-11 rounded-2xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] font-bold text-base mb-4">
                            2
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#5A0B22] mb-2 leading-snug">
                            Conocerás cada producto Mary Kay a fondo
                          </h4>
                          <p className="text-xs sm:text-sm text-[#5A0B22]/85 leading-relaxed">
                            Sabrás exactamente qué es, para qué sirve y cómo se aplica con criterio técnico.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#FFC9D6]/50 flex items-center gap-1.5 text-xs text-[#7A1333] font-semibold">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Conocimiento profundo</span>
                        </div>
                      </motion.div>

                      {/* Card 3 */}
                      <motion.div 
                        whileHover={{ y: -8, transition: { duration: 0.25 } }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-[#F8B4C4]/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="w-11 h-11 rounded-2xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] font-bold text-base mb-4">
                            3
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#5A0B22] mb-2 leading-snug">
                            Sabrás qué recomendar a cada cliente
                          </h4>
                          <p className="text-xs sm:text-sm text-[#5A0B22]/85 leading-relaxed">
                            Identificando tipo de piel, tono y necesidad puntual para no "vender por vender".
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#FFC9D6]/50 flex items-center gap-1.5 text-xs text-[#7A1333] font-semibold">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Asesoría asertiva</span>
                        </div>
                      </motion.div>

                      {/* Card 4 */}
                      <motion.div 
                        whileHover={{ y: -8, transition: { duration: 0.25 } }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-[#F8B4C4]/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="w-11 h-11 rounded-2xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] font-bold text-base mb-4">
                            4
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#5A0B22] mb-2 leading-snug">
                            Aprenderás a explicar cómo usar cada producto
                          </h4>
                          <p className="text-xs sm:text-sm text-[#5A0B22]/85 leading-relaxed">
                            Transmitirás instrucciones con argumentos reales que enamoran a tus clientas.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#FFC9D6]/50 flex items-center gap-1.5 text-xs text-[#7A1333] font-semibold">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Argumentos de valor</span>
                        </div>
                      </motion.div>

                      {/* Card 5 */}
                      <motion.div 
                        whileHover={{ y: -8, transition: { duration: 0.25 } }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-[#F8B4C4]/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="w-11 h-11 rounded-2xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] font-bold text-base mb-4">
                            5
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#5A0B22] mb-2 leading-snug">
                            Ganarás confianza para vender
                          </h4>
                          <p className="text-xs sm:text-sm text-[#5A0B22]/85 leading-relaxed">
                            Dejarás atrás las dudas al presentar presupuestos y ofrecer demostraciones.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#FFC9D6]/50 flex items-center gap-1.5 text-xs text-[#7A1333] font-semibold">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Cierre profesional</span>
                        </div>
                      </motion.div>

                      {/* Card 6 */}
                      <motion.div 
                        whileHover={{ y: -8, transition: { duration: 0.25 } }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-[#F8B4C4]/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="w-11 h-11 rounded-2xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] font-bold text-base mb-4">
                            6
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#5A0B22] mb-2 leading-snug">
                            Sumarás una habilidad extra (Redes sociales)
                          </h4>
                          <p className="text-xs sm:text-sm text-[#5A0B22]/85 leading-relaxed">
                            Estrategias de marketing para mostrar tu trabajo y captar nuevas compradoras.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#FFC9D6]/50 flex items-center gap-1.5 text-xs text-[#7A1333] font-semibold">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Atracción orgánica</span>
                        </div>
                      </motion.div>

                    </div>
                  </div>

                  {/* TEMARIO COMPLETO (Grid limpio de 9 clases + Bonus) */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#5A0B22] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          <Palette className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22]">
                          Temario Completo: 9 Clases Prácticas + Clase Bonus
                        </h3>
                      </div>
                      <DownloadButton
                        fileUrl="/documents/Im-Chic-Academy-MK-DIGITAL.pdf"
                        fileName="Im-Chic-Academy-MK-DIGITAL.pdf"
                        tooltipText="Descargar Programa Formación MK PDF"
                        label="Descargar Programa"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      
                      <div className="bg-white/85 p-4 rounded-2xl border border-[#5A0B22]/10 shadow-sm flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFC9D6] text-[#5A0B22] font-bold text-xs flex items-center justify-center flex-shrink-0">1</span>
                        <div>
                          <h5 className="font-bold text-sm text-[#5A0B22]">Clase 1</h5>
                          <p className="text-xs text-[#5A0B22]/80">Presentación y diagnóstico de piel (seca, grasa, mixta, sensible).</p>
                        </div>
                      </div>

                      <div className="bg-white/85 p-4 rounded-2xl border border-[#5A0B22]/10 shadow-sm flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFC9D6] text-[#5A0B22] font-bold text-xs flex items-center justify-center flex-shrink-0">2</span>
                        <div>
                          <h5 className="font-bold text-sm text-[#5A0B22]">Clase 2</h5>
                          <p className="text-xs text-[#5A0B22]/80">Limpieza facial profunda y uso de brochas profesionales.</p>
                        </div>
                      </div>

                      <div className="bg-white/85 p-4 rounded-2xl border border-[#5A0B22]/10 shadow-sm flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFC9D6] text-[#5A0B22] font-bold text-xs flex items-center justify-center flex-shrink-0">3</span>
                        <div>
                          <h5 className="font-bold text-sm text-[#5A0B22]">Clase 3</h5>
                          <p className="text-xs text-[#5A0B22]/80">Preparación de piel: Corrección, CC Cream y máscara de pestañas.</p>
                        </div>
                      </div>

                      <div className="bg-white/85 p-4 rounded-2xl border border-[#5A0B22]/10 shadow-sm flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFC9D6] text-[#5A0B22] font-bold text-xs flex items-center justify-center flex-shrink-0">4</span>
                        <div>
                          <h5 className="font-bold text-sm text-[#5A0B22]">Clase 4</h5>
                          <p className="text-xs text-[#5A0B22]/80">Visagismo de cejas: diseño, definición y armonía facial.</p>
                        </div>
                      </div>

                      <div className="bg-white/85 p-4 rounded-2xl border border-[#5A0B22]/10 shadow-sm flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFC9D6] text-[#5A0B22] font-bold text-xs flex items-center justify-center flex-shrink-0">5</span>
                        <div>
                          <h5 className="font-bold text-sm text-[#5A0B22]">Clase 5</h5>
                          <p className="text-xs text-[#5A0B22]/80">Base y contorno: rubor, iluminador y fijación de gloss.</p>
                        </div>
                      </div>

                      <div className="bg-white/85 p-4 rounded-2xl border border-[#5A0B22]/10 shadow-sm flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFC9D6] text-[#5A0B22] font-bold text-xs flex items-center justify-center flex-shrink-0">6</span>
                        <div>
                          <h5 className="font-bold text-sm text-[#5A0B22]">Clase 6</h5>
                          <p className="text-xs text-[#5A0B22]/80">Labios: tipos de labial (mate, brilloso, cremoso, gloss) y recomendación.</p>
                        </div>
                      </div>

                      <div className="bg-white/85 p-4 rounded-2xl border border-[#5A0B22]/10 shadow-sm flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFC9D6] text-[#5A0B22] font-bold text-xs flex items-center justify-center flex-shrink-0">7</span>
                        <div>
                          <h5 className="font-bold text-sm text-[#5A0B22]">Clase 7</h5>
                          <p className="text-xs text-[#5A0B22]/80">Maquillaje de día: sombras y colores recomendados según tono de piel.</p>
                        </div>
                      </div>

                      <div className="bg-white/85 p-4 rounded-2xl border border-[#5A0B22]/10 shadow-sm flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFC9D6] text-[#5A0B22] font-bold text-xs flex items-center justify-center flex-shrink-0">8</span>
                        <div>
                          <h5 className="font-bold text-sm text-[#5A0B22]">Clase 8</h5>
                          <p className="text-xs text-[#5A0B22]/80">Maquillaje de noche: intensificación de mirada y contornos de fiesta.</p>
                        </div>
                      </div>

                      <div className="bg-white/85 p-4 rounded-2xl border border-[#5A0B22]/10 shadow-sm flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#FFC9D6] text-[#5A0B22] font-bold text-xs flex items-center justify-center flex-shrink-0">9</span>
                        <div>
                          <h5 className="font-bold text-sm text-[#5A0B22]">Clase 9</h5>
                          <p className="text-xs text-[#5A0B22]/80">Desmaquillado profesional y rutina regenerativa de noche.</p>
                        </div>
                      </div>

                    </div>

                    {/* Tarjeta Destacada Clase Bonus */}
                    <div className="mt-4 p-4.5 sm:p-5 rounded-2xl bg-white/95 border border-[#D4AF37]/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-[#5A0B22]">
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-11 h-11 rounded-xl bg-[#FFC9D6] text-[#5A0B22] flex items-center justify-center font-bold flex-shrink-0 shadow-sm border border-[#5A0B22]/10">
                          <Sparkles className="w-5 h-5 text-[#7A1333]" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#5A0B22] text-[#F7E7B4] font-bold text-[10px] uppercase tracking-wider mb-1 shadow-sm">
                            <span>✨ Clase Bonus Especial</span>
                          </div>
                          <h5 className="font-serif font-bold text-base text-[#5A0B22]">
                            Redes Sociales y Marketing
                          </h5>
                          <p className="text-xs text-[#5A0B22]/80 mt-0.5">
                            Estrategias prácticas para vender a través de redes y crear contenido con tu propio maquillaje.
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 w-full sm:w-auto flex justify-end">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF0F3] border border-[#FFC9D6] text-[#7A1333] text-xs font-bold shadow-sm whitespace-nowrap">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>100% Incluida</span>
                        </span>
                      </div>
                    </div>
                  </div>


                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>

        {/* SECCIÓN: GALERÍA DE TRABAJOS & EXPERIENCIA EN EL ESTUDIO */}
        <section id="galeria" className="py-16 md:py-24 bg-white/70 relative backdrop-blur-sm scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFC9D6] text-[#5A0B22] text-xs font-bold uppercase tracking-wider mb-3">
                Portfolio & Experiencia Real
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#5A0B22] mb-3">
                Resultados y Momentos en I'm Chic
              </h2>
              <p className="text-sm sm:text-base text-[#5A0B22]/80 font-medium">
                Desde clases personalizadas y producciones editoriales hasta belleza integral en nuestro espacio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Melany en acción */}
              <motion.div whileHover={{ y: -6 }} className="group relative rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[3/4] bg-[#FFF0F3]">
                <ImageWithFallback
                  src="/assets/masterclass-hero.png"
                  alt="Melany Toledo realizando maquillaje profesional en vivo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                  placeholderLabel="Maquillaje en vivo"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/90 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Atención 1 a 1</span>
                  <h4 className="font-serif text-lg font-bold">Técnica Profesional con Melany</h4>
                  <p className="text-xs text-pink-100/90 mt-1">Práctica guiada y acompañamiento en cada trazo.</p>
                </div>
              </motion.div>

              {/* Card 2: Look de Día */}
              <motion.div whileHover={{ y: -6 }} className="group relative rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[3/4] bg-[#FFF0F3]">
                <ImageWithFallback
                  src="/assets/clase-1.png"
                  alt="Acabado de maquillaje social luminoso de día"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                  placeholderLabel="Look de Día"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/90 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Clase 1</span>
                  <h4 className="font-serif text-lg font-bold">Glow Natural & Visagismo</h4>
                  <p className="text-xs text-pink-100/90 mt-1">Piel aterciopelada y armonía para el día a día.</p>
                </div>
              </motion.div>

              {/* Card 3: Look de Noche */}
              <motion.div whileHover={{ y: -6 }} className="group relative rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[3/4] bg-[#FFF0F3]">
                <ImageWithFallback
                  src="/assets/clase-2.png"
                  alt="Maquillaje de noche artístico con apliques y perlas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                  placeholderLabel="Look de Noche"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/90 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Clase 2 & Eventos</span>
                  <h4 className="font-serif text-lg font-bold">Glamour Nocturno & Larga Duración</h4>
                  <p className="text-xs text-pink-100/90 mt-1">Detalles de pedrería, mirada intensa y fijación extrema.</p>
                </div>
              </motion.div>

              {/* Card 4: Productos Mary Kay */}
              <motion.div whileHover={{ y: -6 }} className="group relative rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[3/4] bg-[#FFF0F3]">
                <ImageWithFallback
                  src="/assets/mary-kay.png"
                  alt="Línea TimeWise Mary Kay para cuidado facial"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                  placeholderLabel="Cosmética Mary Kay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/90 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Formación Integral</span>
                  <h4 className="font-serif text-lg font-bold">Cuidado Facial TimeWise</h4>
                  <p className="text-xs text-pink-100/90 mt-1">Herramientas oficiales para diagnóstico y asesoramiento.</p>
                </div>
              </motion.div>

              {/* Card 5: Manicura */}
              <motion.div whileHover={{ y: -6 }} className="group relative rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[3/4] bg-[#FFF0F3]">
                <ImageWithFallback
                  src="/assets/manicura.png"
                  alt="Manicura francesa delicada con velo de perlas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                  placeholderLabel="Belleza de Manos"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/90 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Estudio de Belleza</span>
                  <h4 className="font-serif text-lg font-bold">Nail Art & Manicura Exclusiva</h4>
                  <p className="text-xs text-pink-100/90 mt-1">Detalles finos, elegancia para eventos y novias.</p>
                </div>
              </motion.div>

              {/* Card 6: Peinado / Alisado */}
              <motion.div whileHover={{ y: -6 }} className="group relative rounded-3xl overflow-hidden shadow-lg border-2 border-white aspect-[3/4] bg-[#FFF0F3]">
                <ImageWithFallback
                  src="/assets/peinado.png"
                  alt="Tratamiento capilar y alisado con brillo espejo en el estudio"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                  placeholderLabel="Estilismo Capilar"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/90 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Estudio de Belleza</span>
                  <h4 className="font-serif text-lg font-bold">Styling, Alisado & Brillo</h4>
                  <p className="text-xs text-pink-100/90 mt-1">Cuidado capilar integral para un look completo.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. SECCIÓN: INVERSIÓN Y DETALLES (Glassmorphism card) */}
        <section id="detalles" className="py-16 md:py-24 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-14"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 text-[#5A0B22] text-xs font-bold uppercase tracking-wider mb-3 border border-[#5A0B22]/15">
                Membresía & Valores
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#5A0B22] mb-4">
                Invertí en tu Formación
              </h2>
              <p className="text-base sm:text-lg text-[#5A0B22]/85">
                Una inversión que potencia tu confianza personal y se amortiza rápidamente en tu negocio.
              </p>
            </motion.div>

            {/* Tarjeta Glassmorphism refinada y perfectamente alineada */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-2xl border-2 border-white relative flex flex-col items-center"
            >
              {/* Badge superior centrado con estilo bottone lime */}
              <div className="mb-6 flex justify-center">
                <LimeButton isBadge={true}>
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Grupo reducido para una atención personalizada</span>
                </LimeButton>
              </div>

              {/* Encabezado de Precios */}
              <div className="w-full pb-8 border-b border-[#FFC9D6] text-center">
                <span className="text-xs uppercase tracking-[0.2em] text-[#7A1333] font-bold block mb-2">
                  Formación Integral Mary Kay
                </span>
                
                <div className="flex items-baseline justify-center gap-2 my-2">
                  <span className="font-serif text-5xl sm:text-6xl font-black text-[#5A0B22] tracking-tight">
                    $130.000
                  </span>
                  <span className="text-[#5A0B22]/80 font-bold text-base sm:text-lg">
                    / mes
                  </span>
                </div>

                <p className="text-sm font-bold text-[#7A1333] mt-1">
                  En 2 cuotas mensuales de $130.000
                </p>
                
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#FFF0F3] border border-[#FFC9D6] text-[#5A0B22] text-xs sm:text-sm font-semibold shadow-sm">
                  <Clock className="w-4 h-4 text-[#7A1333] flex-shrink-0" />
                  <span>Duración: 2 meses (1 clase práctica por semana)</span>
                </div>
              </div>

              {/* Ítems incluidos con íconos */}
              <div className="w-full py-8">
                <h3 className="font-serif text-xl font-bold text-[#5A0B22] mb-6 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <span>Tu experiencia incluye:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FFF0F3]/60 border border-[#FFC9D6]/60 shadow-sm hover:border-[#5A0B22]/25 hover:bg-white transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#5A0B22] leading-snug">Coffee break en cada encuentro</h4>
                      <p className="text-xs text-[#5A0B22]/80 mt-1">Espacio cálido para compartir, relajarse y conectar.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FFF0F3]/60 border border-[#FFC9D6]/60 shadow-sm hover:border-[#5A0B22]/25 hover:bg-white transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#5A0B22] leading-snug">Material de estudio en PDF</h4>
                      <p className="text-xs text-[#5A0B22]/80 mt-1">Guías paso a paso detalladas para repasar siempre.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FFF0F3]/60 border border-[#FFC9D6]/60 shadow-sm hover:border-[#5A0B22]/25 hover:bg-white transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#5A0B22] leading-snug">Recomendación personalizada</h4>
                      <p className="text-xs text-[#5A0B22]/80 mt-1">Asesoría individual de look (día y noche) adaptada a tus rasgos.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FFF0F3]/60 border border-[#FFC9D6]/60 shadow-sm hover:border-[#5A0B22]/25 hover:bg-white transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#5A0B22] leading-snug">Materiales disponibles en clase</h4>
                      <p className="text-xs text-[#5A0B22]/80 mt-1">Todos los cosméticos e insumos provistos para tus prácticas.</p>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 flex items-start gap-3.5 p-4 rounded-2xl bg-[#FFF0F3]/60 border border-[#FFC9D6]/60 shadow-sm hover:border-[#5A0B22]/25 hover:bg-white transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0 mt-0.5">
                      <Award className="w-5 h-5 text-[#5A0B22]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#5A0B22] leading-snug">Certificado de finalización</h4>
                      <p className="text-xs text-[#5A0B22]/80 mt-1">Diploma físico que acredita tu formación técnica en I'm Chic Academy.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Botón CTA Quiero Inscribirme Ahora con estilo bottone lime */}
              <div className="w-full pt-2 text-center space-y-4 flex flex-col items-center">
                <LimeButton
                  href={whatsappUrl}
                  className="w-full"
                  style={{ width: '100%', display: 'flex' }}
                >
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>Quiero Inscribirme Ahora</span>
                </LimeButton>

                {/* Cuadro inferior informativo Masterclass con diseño limpio y balanceado */}
                <div className="w-full mt-3 p-4 rounded-2xl bg-[#FFF0F3] border border-[#FFC9D6] text-[#5A0B22] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold block text-[#5A0B22]">¿Buscás el taller intensivo de 2 clases?</span>
                    <span className="text-[#5A0B22]/80">Consultá aranceles y fechas disponibles de la Masterclass individual.</span>
                  </div>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("¡Hola Melany! Quiero consultar arancel y fechas para la Masterclass de Automaquillaje")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#7A1333] hover:text-[#5A0B22] text-xs font-bold border border-[#FFC9D6] hover:border-[#5A0B22]/30 shadow-sm transition-all whitespace-nowrap"
                  >
                    <span>Consultar Masterclass</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </motion.div>

          </div>
        </section>

        {/* 4. FOOTER / CONTACTO */}
        <section id="contacto" className="py-16 md:py-24 bg-[#5A0B22] text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            
            {/* Logo en Footer */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-white rounded-3xl p-2 shadow-2xl border-2 border-white/40 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/logo-im-chic.png"
                alt="Logo I'm Chic Footer"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[#FFF8FA]">
              ¡Reservá tu lugar! Cupos limitados para atención personalizada.
            </h2>
            
            <p className="text-base sm:text-lg text-[#F8B4C4] max-w-xl mx-auto mb-10 leading-relaxed">
              Escribime directamente para resolver tus dudas, consultar horarios y asegurar tu vacante en la academia.
            </p>

            {/* Botón WhatsApp & Instagram Centrado */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <WhatsAppButton
                phoneNumber={whatsappNumber}
                message="¡Hola Melany! Quiero asegurar mi lugar en I'm Chic Academy."
              />
              <InstagramButton />
            </div>

            <div className="pt-10 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-[#F8B4C4]/80 gap-4">
              <p>© 2026 I'm Chic Academy - By Melany Toledo. Todos los derechos reservados.</p>
              <p className="flex items-center gap-2">
                <span>Maquillaje Profesional & Asesoría Integral</span>
                <span>•</span>
                <span>Tucumán, Argentina</span>
              </p>
            </div>

          </div>
        </section>
      </main>

    </div>
  );
}
