import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Scissors, Palette, Star, ChevronRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppButton from './src/components/WhatsAppButton';

const whatsappNumber = "5493813553492";

const servicios = [
  {
    category: 'Uñas',
    icon: Sparkles,
    gradient: 'from-[#FFB6C1] to-[#FF69B4]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/30',
    items: [
      { name: 'Manicura Rusa', price: 'Consultar', tag: null },
      { name: 'Esculpidas en Gel', price: 'Consultar', tag: 'Popular' },
      { name: 'Esculpidas en Acrílico', price: 'Consultar', tag: null },
      { name: 'Esmaltado Semipermanente', price: 'Consultar', tag: null },
      { name: 'Nail Art (diseño a mano)', price: 'Consultar', tag: 'Premium' },
      { name: 'Retiro + Remoción', price: 'Consultar', tag: null },
    ]
  },
  {
    category: 'Pelo',
    icon: Scissors,
    gradient: 'from-[#E2A7B8] to-[#D87F95]',
    lightBg: 'from-[#FFF0F3] to-[#E2A7B8]/20',
    items: [
      { name: 'Corte + Brushing', price: 'Consultar', tag: null },
      { name: 'Balayage', price: 'Consultar', tag: 'Popular' },
      { name: 'Iluminación / Mechas', price: 'Consultar', tag: null },
      { name: 'Hidratación Profunda', price: 'Consultar', tag: null },
      { name: 'Peinado Social', price: 'Consultar', tag: null },
      { name: 'Peinado de Novia', price: 'Consultar', tag: 'Premium' },
    ]
  },
  {
    category: 'Maquillaje',
    icon: Palette,
    gradient: 'from-[#D4AF37] to-[#F3E5AB]',
    lightBg: 'from-[#FFF0F3] to-[#D4AF37]/15',
    items: [
      { name: 'Maquillaje Social', price: 'Consultar', tag: null },
      { name: 'Maquillaje de Fiesta', price: 'Consultar', tag: 'Popular' },
      { name: 'Maquillaje de Novia', price: 'Consultar', tag: 'Premium' },
      { name: 'Maquillaje Natural', price: 'Consultar', tag: null },
      { name: 'Maquillaje Editorial', price: 'Consultar', tag: null },
    ]
  },
];

const paquetes = [
  {
    name: 'Esencial',
    icon: '✨',
    description: 'Ideal para un día especial.',
    services: ['Maquillaje Social', 'Peinado (media melena)', 'Esmaltado básico'],
    tag: null,
    cta: 'Consultar precio',
  },
  {
    name: 'Chic Total',
    icon: '👑',
    description: 'La experiencia completa de belleza.',
    services: ['Maquillaje Completo', 'Peinado Premium', 'Uñas Esculpidas o Gel', 'Retoque al finalizar'],
    tag: 'Más Elegido',
    cta: 'Consultar precio',
  },
  {
    name: 'Novia',
    icon: '💍',
    description: 'Tu día más especial merece lo mejor.',
    services: ['Maquillaje de Novia HD', 'Peinado de Novia', 'Prueba previa incluida', 'Acompañamiento personalizado'],
    tag: 'Exclusivo',
    cta: 'Consultar precio',
  },
];

export default function InversionPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans overflow-x-hidden">

      {/* Announcement Bar */}
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="bg-[#5A0B22] text-[#FFF8FA] py-2.5 px-4 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 z-50 relative">
        <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
        <span>Precios • Consultá por combos y paquetes especiales</span>
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#FFC9D6] via-[#FFD2DE]/95 to-[#FFDEE6]/90 backdrop-blur-md transition-all duration-300 relative shadow-[0_10px_30px_-10px_rgba(255,201,214,0.6)]">
        <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-[#FFDEE6]/90 via-[#FFEBF0]/50 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-white shadow-md ring-2 ring-[#5A0B22]/15 overflow-hidden flex items-center justify-center">
              <img src="/assets/logo-im-chic.png" alt="Logo" className="w-full h-full object-cover scale-[1.25]"
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="font-serif font-bold text-sm text-[#5A0B22]">IC</span>'; }} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold text-[#5A0B22] leading-none">I'm Chic</span>
              <span className="text-[10px] font-semibold tracking-[0.15em] text-[#7A1333] uppercase">By Melany Toledo</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5 text-sm font-medium text-[#5A0B22]">
            <Link to="/" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Inicio</Link>
            <Link to="/cursos" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Cursos</Link>
            <Link to="/galeria" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Galería</Link>
            <Link to="/tienda" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Tienda MK</Link>
            <Link to="/inversion" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Inversión</Link>
            <Link to="/contacto" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Contacto</Link>
          </nav>
          <div className="hidden md:block">
            <WhatsAppButton phoneNumber={whatsappNumber} message="¡Hola Melany! Quiero consultar precios de servicios." open={true} size="sm" text="Consultar" />
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#5A0B22]">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg px-6 py-5 shadow-2xl rounded-b-3xl absolute w-full">
            <div className="flex flex-col gap-2 text-base font-medium text-[#5A0B22]">
              {[['/', 'Inicio'], ['/cursos', 'Cursos'], ['/galeria', 'Galería'], ['/tienda', 'Tienda MK'], ['/inversion', 'Inversión'], ['/contacto', 'Contacto']].map(([path, label]) => (
                <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-[#FFC9D6]/40 flex items-center justify-between">
                  <span>{label}</span><ChevronRight className="w-4 h-4 text-[#7A1333]" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFF0F3] border border-[#FFC9D6] text-[#7A1333] text-xs font-bold uppercase tracking-widest mb-4">
            Tarifario & Servicios
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#5A0B22] mb-4 leading-tight">
            Tu inversión en<br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#D87F95] to-[#7A1333]">belleza & confianza</span>
          </h1>
          <p className="text-[#5A0B22]/70 text-base sm:text-lg max-w-xl mx-auto px-2 leading-relaxed">
            Los precios se actualizan periódicamente. Consultá disponibilidad y oferta actual por WhatsApp.
          </p>
        </motion.div>

        {/* Paquetes destacados */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12 sm:mb-20"
        >
          {paquetes.map((pkg) => (
            <motion.div
              key={pkg.name}
              variants={itemVariants}
              className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 border flex flex-col ${pkg.tag === 'Más Elegido' ? 'bg-[#5A0B22] text-white border-[#5A0B22] shadow-xl shadow-[#5A0B22]/20' : 'bg-white border-[#FFC9D6]/40 shadow-sm'}`}
            >
              {pkg.tag && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${pkg.tag === 'Más Elegido' ? 'bg-[#D4AF37] text-[#5A0B22]' : 'bg-[#FFF0F3] text-[#5A0B22] border border-[#FFC9D6]'}`}>
                  {pkg.tag}
                </div>
              )}
              <div className="text-3xl mb-3">{pkg.icon}</div>
              <h3 className={`font-serif text-xl sm:text-2xl font-bold mb-1 ${pkg.tag === 'Más Elegido' ? 'text-white' : 'text-[#5A0B22]'}`}>{pkg.name}</h3>
              <p className={`text-xs sm:text-sm mb-5 sm:mb-6 ${pkg.tag === 'Más Elegido' ? 'text-[#FFC9D6]' : 'text-[#5A0B22]/60'}`}>{pkg.description}</p>
              <ul className="space-y-2.5 flex-1 mb-6 sm:mb-7">
                {pkg.services.map((s) => (
                  <li key={s} className={`flex items-center gap-2.5 text-xs sm:text-sm ${pkg.tag === 'Más Elegido' ? 'text-white/90' : 'text-[#5A0B22]'}`}>
                    <Check className={`w-4 h-4 flex-shrink-0 ${pkg.tag === 'Más Elegido' ? 'text-[#D4AF37]' : 'text-green-500'}`} />
                    {s}
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`¡Hola Melany! Quiero consultar el precio del paquete ${pkg.name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-all ${pkg.tag === 'Más Elegido' ? 'bg-white text-[#5A0B22] hover:bg-[#FFF0F3]' : 'bg-[#5A0B22] text-white hover:bg-[#7A1333]'}`}
              >
                {pkg.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Servicios individuales */}
        <div className="mb-8 sm:mb-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFF0F3] border border-[#FFC9D6] text-[#7A1333] text-xs font-bold uppercase tracking-widest mb-3">
            Servicios Individuales
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A0B22]">Tarifario</h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8"
        >
          {servicios.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.category} variants={itemVariants} className={`bg-gradient-to-br ${cat.lightBg} rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#FFC9D6]/30 shadow-sm`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white shadow-md mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#5A0B22] mb-4 sm:mb-5">{cat.category}</h3>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li key={item.name} className="flex items-center justify-between py-2.5 border-b border-[#5A0B22]/8">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-[#5A0B22]">{item.name}</span>
                        {item.tag && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#5A0B22] uppercase tracking-wide">{item.tag}</span>
                        )}
                      </div>
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`¡Hola Melany! Quiero consultar el precio de: ${item.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#7A1333] hover:underline flex items-center gap-1 flex-shrink-0 ml-2"
                      >
                        Consultar <ChevronRight className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-20 text-center bg-gradient-to-br from-[#FFF0F3] to-[#FFC9D6]/40 rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-[#FFC9D6]/50"
        >
          <Star className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] mx-auto mb-3 sm:mb-4" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22] mb-3">¿Querés un presupuesto personalizado?</h2>
          <p className="text-[#5A0B22]/70 mb-6 sm:mb-7 max-w-md mx-auto text-sm sm:text-base px-2">Escribime y armamos juntas el paquete ideal según lo que necesitás para tu ocasión especial.</p>
          <WhatsAppButton phoneNumber={whatsappNumber} message="¡Hola Melany! Quiero un presupuesto personalizado para mis servicios de belleza." open={true} size="lg" text="Pedir Presupuesto" />
        </motion.div>
      </main>

      <footer className="py-6 border-t border-[#5A0B22]/10 text-center text-sm text-[#5A0B22]/50 mt-4">
        © 2026 I'm Chic By Melany Toledo — Estudio de Belleza Integral
      </footer>
    </div>
  );
}
