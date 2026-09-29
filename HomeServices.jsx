import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Scissors, Palette, ArrowRight, Menu, X, ChevronRight, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppButton from './src/components/WhatsAppButton';
import SparkleButton from './src/components/SparkleButton';
import InstagramButton from './src/components/InstagramButton';

const services = [
  {
    id: 'nails',
    title: 'Uñas que realzan tu estilo',
    subtitle: 'Nail Art & Spa',
    description: 'Realzá la belleza de tus manos con acabados impecables y duraderos. Semipermanente, capping y Soft Gel, adaptados a tu estilo y pensados para lucir uñas cuidadas, elegantes y sofisticadas.',
    icon: Sparkles,
    accentColor: 'from-[#FFB6C1] to-[#FF69B4]',
    bgGradient: 'from-[#FFF0F3] to-[#FFC9D6]',
    image: '/assets/img/unas1.jpg',
    imageAlt: 'Uñas deslumbrantes realizadas por Melany Toledo',
    link: '/galeria',
  },
  {
    id: 'hair',
    title: 'Transformá tu cabello',
    subtitle: 'Hair Studio',
    description: 'Tratamientos personalizados para nutrir, reparar y revitalizar tu cabello, devolviéndole suavidad, brillo y movimiento para que luzca saludable y radiante.',
    icon: Scissors,
    accentColor: 'from-[#E2A7B8] to-[#D87F95]',
    bgGradient: 'from-[#FFF0F3] to-[#FFC9D6]',
    image: '/assets/img/pelo3.jpg',
    imageAlt: 'Estilismo y peinado realizado por Melany Toledo',
    link: '/galeria',
  },
  {
    id: 'makeup',
    title: 'Tu belleza, elevada a otro nivel',
    subtitle: 'MakeUp & Beauty',
    description: 'Maquillaje profesional diseñado para realzar tus facciones y potenciar tu belleza, con un acabado elegante y personalizado para cada ocasión especial.',
    icon: Palette,
    accentColor: 'from-[#D4AF37] to-[#F3E5AB]',
    bgGradient: 'from-[#FFF0F3] to-[#FFC9D6]',
    image: '/assets/img/maquillaje1.jpg',
    imageAlt: 'Maquillaje profesional realizado por Melany Toledo',
    link: '/galeria',
  }
];

export default function HomeServices() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const whatsappNumber = "5493813553492";

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans selection:bg-[#5A0B22] selection:text-white overflow-x-hidden relative">

      {/* Top Announcement Bar idéntica a ImChicLanding */}
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

      {/* HEADER / NAVEGACIÓN idéntica a ImChicLanding */}
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

            {/* Nav Desktop — links elegantes con hover pill */}
            <nav className="hidden md:flex items-center gap-0.5 font-medium text-sm text-[#5A0B22]">
              <Link to="/" className="relative px-3.5 py-1.5 rounded-full font-semibold hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Inicio</Link>
              <Link to="/cursos" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Cursos</Link>
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
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#FFC9D6]/60 flex items-center justify-between"><span>Inicio</span><ChevronRight className="w-4 h-4 text-[#7A1333]" /></Link>
                <Link to="/cursos" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#FFC9D6]/60 flex items-center justify-between"><span>Cursos & Masterclass</span><ChevronRight className="w-4 h-4 text-[#7A1333]" /></Link>
                <Link to="/galeria" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#FFC9D6]/60 flex items-center justify-between"><span>Galería</span><ChevronRight className="w-4 h-4 text-[#7A1333]" /></Link>
                <Link to="/tienda" className="py-2 border-b border-[#FFC9D6]/60 flex items-center justify-between"><span>Tienda Mary Kay</span><ChevronRight className="w-4 h-4 text-[#7A1333]" /></Link>
                <Link to="/inversion" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[#FFC9D6]/60 flex items-center justify-between"><span>Inversión</span><ChevronRight className="w-4 h-4 text-[#7A1333]" /></Link>
                <Link to="/contacto" onClick={() => setMobileMenuOpen(false)} className="py-2 flex items-center justify-between"><span>Contacto</span><ChevronRight className="w-4 h-4 text-[#7A1333]" /></Link>
                <div className="pt-4 flex items-center justify-center gap-3">
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
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 pt-10 pb-20">
        <section className="flex flex-col items-center justify-center py-8 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="mb-6 inline-block"
            >
              <span className="px-6 py-2 rounded-full border border-[#D87F95]/40 bg-[#FFF0F3] text-[#5A0B22] text-xs font-semibold tracking-[0.2em] uppercase shadow-sm">
                Estudio de Belleza Integral
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-4 sm:mb-6 leading-tight text-gray-900"
            >
              <span className="block">Realzá tu belleza</span>
              <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-[#D87F95] via-[#C56B82] to-[#D87F95]">Potenciá tu esencia</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed px-2"
            >
              Servicios de uñas, tratamientos capilares y maquillaje profesional pensados para realzar tu belleza y hacerte sentir increíble en cada ocasión.
            </motion.p>
          </div>
        </section>

        {/* Servicios */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col space-y-16 sm:space-y-24">
            {services.map((service, index) => {
              const isEven = index % 2 !== 0;
              const Icon = service.icon;
              return (
                <div key={service.id} className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 group`}>

                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full md:w-1/2 relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#D87F95] to-[#FFC9D6] opacity-20 blur-2xl rounded-full group-hover:opacity-40 transition-opacity duration-700"></div>
                    <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-[#D87F95]/30 bg-gradient-to-br from-[#FFF0F3] to-[#FFC9D6]/40 shadow-xl group-hover:border-[#D87F95]/60 transition-all duration-500">
                      <img
                        src={service.image}
                        alt={service.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div className="text-white">
                          <span className="text-xs uppercase font-bold tracking-widest text-[#FFC9D6]">{service.subtitle}</span>
                          <h4 className="text-xl font-serif font-bold">{service.title}</h4>
                        </div>
                      </div>
                      <div className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${service.accentColor} text-white shadow-md backdrop-blur-sm`}>
                        <Icon size={20} />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full md:w-1/2"
                  >
                    <div className="flex items-center space-x-4 mb-3 sm:mb-4">
                      <span className="h-[1px] w-12 bg-gradient-to-r from-[#D87F95] to-transparent"></span>
                      <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#D87F95]">{service.subtitle}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mb-4 sm:mb-6 leading-tight">
                      {service.title}
                    </h2>

                    <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-10 leading-relaxed">
                      {service.description}
                    </p>

                    <Link to={service.link} className="inline-flex items-center space-x-3 group/btn">
                      <span className="text-base sm:text-lg font-medium text-[#5A0B22] group-hover/btn:text-[#D87F95] transition-colors uppercase tracking-widest">
                        Explorar Galería
                      </span>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#D87F95]/50 flex items-center justify-center group-hover/btn:bg-[#D87F95] group-hover/btn:border-[#D87F95] transition-all duration-300">
                        <ArrowRight size={18} className="text-[#D87F95] group-hover/btn:text-white" />
                      </div>
                    </Link>
                  </motion.div>

                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-8 bg-white border-t border-[#5A0B22]/10 text-center text-sm text-[#5A0B22]/60">
        <div className="flex flex-col items-center justify-center gap-4">
          <InstagramButton />
          <p>© 2026 I'm Chic By Melany Toledo - Consultora de Belleza Independiente Mary Kay.</p>
        </div>
      </footer>
    </div>
  );
}
