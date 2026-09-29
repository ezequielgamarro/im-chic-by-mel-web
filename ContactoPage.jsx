import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, MessageCircle, Phone, ChevronRight, Menu, X, Send, Sparkles } from 'lucide-react';

// SVG inline del logo de Instagram (lucide-react no lo incluye en esta versión)
function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}
import { Link } from 'react-router-dom';
import WhatsAppButton from './src/components/WhatsAppButton';

const whatsappNumber = "5493813553492";

const infoCards = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: '+54 9 381 355-3492',
    sub: 'Respondemos rápido',
    gradient: 'from-green-400 to-green-600',
    href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("¡Hola Melany! Te contacto desde la web.")}`,
  },
  {
    icon: InstagramIcon,
    title: 'Instagram',
    value: '@imchicbymelany',
    sub: 'Seguinos para inspiración',
    gradient: 'from-[#E2A7B8] to-[#D87F95]',
    href: 'https://instagram.com/imchicbymelany',
  },
  {
    icon: MapPin,
    title: 'Ubicación',
    value: 'Tucumán, Argentina',
    sub: 'Consultar dirección exacta',
    gradient: 'from-[#FFB6C1] to-[#FF69B4]',
    href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("¡Hola Melany! ¿Podrías enviarme la dirección exacta del estudio?")}`,
  },
  {
    icon: Clock,
    title: 'Horarios',
    value: 'Lun–Sáb 9:00–20:00',
    sub: 'Con turno previo',
    gradient: 'from-[#D4AF37] to-[#F3E5AB]',
    href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("¡Hola Melany! Quiero consultar disponibilidad de horarios.")}`,
  },
];

const faqs = [
  {
    q: '¿Necesito sacar turno previo?',
    a: 'Sí, trabajamos exclusivamente con turno para garantizar tu atención personalizada. Podés agendarlo por WhatsApp o Instagram.',
  },
  {
    q: '¿Los precios incluyen materiales?',
    a: 'Todos los servicios incluyen materiales de primera calidad. Los precios son finales, sin sorpresas.',
  },
  {
    q: '¿Hacen servicios a domicilio?',
    a: 'Para eventos especiales (novias, quinceaños, etc.) ofrecemos servicio a domicilio. Consultá disponibilidad y cobertura.',
  },
  {
    q: '¿Cuánto tiempo dura cada servicio?',
    a: 'Depende del servicio. Un maquillaje social dura ~45 min, uñas esculpidas ~2 hs, peinado ~1 hs. Al agendar te indicamos el tiempo exacto.',
  },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#FFC9D6]/40 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#FFF0F3]/50 transition-colors"
      >
        <span className="font-semibold text-[#5A0B22] text-sm sm:text-base pr-4">{item.q}</span>
        <ChevronRight className={`w-5 h-5 text-[#7A1333] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-4 text-sm text-[#5A0B22]/75 leading-relaxed border-t border-[#FFF0F3]">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function ContactoPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans overflow-x-hidden">

      {/* Announcement Bar */}
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="bg-[#5A0B22] text-[#FFF8FA] py-2.5 px-4 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 z-50 relative">
        <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
        <span>Contacto & Reservas • Respondemos por WhatsApp</span>
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#FFC9D6] via-[#FFD2DE]/95 to-[#FFDEE6]/90 backdrop-blur-md transition-all duration-300 relative shadow-[0_10px_30px_-10px_rgba(255,201,214,0.6)]">
        <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-[#FFDEE6]/90 via-[#FFEBF0]/50 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
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
            <WhatsAppButton phoneNumber={whatsappNumber} message="¡Hola Melany! Te contacto desde la web." open={true} size="sm" text="Escribime" />
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFF0F3] border border-[#FFC9D6] text-[#7A1333] text-xs font-bold uppercase tracking-widest mb-4">
            Contacto & Reservas
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#5A0B22] mb-4 leading-tight">
            Hablemos de<br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#D87F95] to-[#7A1333]">tu belleza</span>
          </h1>
          <p className="text-[#5A0B22]/70 text-base sm:text-lg max-w-lg mx-auto leading-relaxed px-2">
            La mejor manera de contactarme es por WhatsApp o Instagram. Respondo rápido y con mucho cariño 💕
          </p>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 mb-12 sm:mb-20">
          {infoCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.a
                key={card.title}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center gap-3.5 sm:gap-5 border border-[#FFC9D6]/30 shadow-sm hover:shadow-xl transition-shadow group"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#7A1333] mb-0.5">{card.title}</p>
                  <p className="font-bold text-[#5A0B22] text-sm sm:text-base truncate">{card.value}</p>
                  <p className="text-xs text-[#5A0B22]/55">{card.sub}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#5A0B22]/30 group-hover:text-[#7A1333] group-hover:translate-x-1 transition-all" />
              </motion.a>
            );
          })}
        </div>

        {/* CTA principal — WhatsApp destacado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#5A0B22] rounded-2xl sm:rounded-3xl p-6 sm:p-14 text-center mb-12 sm:mb-20 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-[#D4AF37]/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-white/20">
              <Send className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFC9D6]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-3">¿Lista para tu turno?</h2>
            <p className="text-[#FFC9D6] mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base px-2">
              Escribime directo por WhatsApp, contame qué servicio necesitás y elegimos el horario perfecto para vos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full">
              <WhatsAppButton
                phoneNumber={whatsappNumber}
                message="¡Hola Melany! Quiero agendar un turno. ¿Qué disponibilidad tenés?"
                open={true}
                size="lg"
                text="Agendar Turno por WhatsApp"
              />
              <a
                href="https://instagram.com/imchicbymelany"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-colors text-sm"
              >
                <InstagramIcon className="w-5 h-5" />
                <span>Seguinos en Instagram</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* FAQs */}
        <div className="mb-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFF0F3] border border-[#FFC9D6] text-[#7A1333] text-xs font-bold uppercase tracking-widest mb-3">
            Preguntas frecuentes
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#5A0B22] mb-6 sm:mb-10">FAQ</h2>
        </div>
        <div className="space-y-3 max-w-2xl mx-auto">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} item={faq} />
          ))}
        </div>

        {/* Aclaración */}
        <div className="mt-10 p-5 rounded-2xl bg-[#FFF0F3] border border-[#FFC9D6]/50 flex gap-4 items-start max-w-2xl mx-auto">
          <Sparkles className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#5A0B22]/75 leading-relaxed">
            <strong className="text-[#5A0B22]">Nota:</strong> Trabajamos exclusivamente con turno para brindarte atención 100% personalizada. Los turnos se confirman una vez coordinado el horario por WhatsApp.
          </p>
        </div>
      </main>

      <footer className="py-6 border-t border-[#5A0B22]/10 text-center text-sm text-[#5A0B22]/50 mt-4">
        © 2026 I'm Chic By Melany Toledo — Estudio de Belleza Integral
      </footer>
    </div>
  );
}
