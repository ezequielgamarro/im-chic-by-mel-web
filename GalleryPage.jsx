import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, Scissors, Palette, Camera, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppButton from './src/components/WhatsAppButton';
import InstagramButton from './src/components/InstagramButton';

// ────────────────────────────────────────────────────────────
// Datos de la galería — usamos las imágenes reales disponibles
// en /assets/ + fallbacks con placeholders visuales
// ────────────────────────────────────────────────────────────
// Datos de la galería organizados por categoría según archivos reales
// de /assets/img/
// ────────────────────────────────────────────────────────────
const galleryItems = [
  // ── UÑAS (11 trabajos reales) ──
  { id: 1,  category: 'Uñas', src: '/assets/img/unas1.jpg',   alt: 'Diseño de uñas semipermanente',       label: 'Nail Art Floral' },
  { id: 2,  category: 'Uñas', src: '/assets/img/unas2.jpg',   alt: 'Manicura rusa y esculpidas',          label: 'Manicura Rusa' },
  { id: 3,  category: 'Uñas', src: '/assets/img/unas3.jpg',   alt: 'Diseño elegante de uñas',             label: 'Diseño Studio' },
  { id: 4,  category: 'Uñas', src: '/assets/img/unas4.jpg',   alt: 'Uñas esculpidas en gel',              label: 'Esculpidas Gel' },
  { id: 5,  category: 'Uñas', src: '/assets/img/unas5.jpg',   alt: 'Nail art personalizado',              label: 'Nail Art Chic' },
  { id: 6,  category: 'Uñas', src: '/assets/img/unas6.jpg',   alt: 'Manicura detallada y esmaltado',      label: 'Esmaltado Semipermanente' },
  { id: 7,  category: 'Uñas', src: '/assets/img/unas7.jpg',   alt: 'Diseño y acabado en brillo',          label: 'Acabado Brillante' },
  { id: 8,  category: 'Uñas', src: '/assets/img/unas8.jpg',   alt: 'Uñas acrílicas esculpidas',           label: 'Acrílico Esculpido' },
  { id: 9,  category: 'Uñas', src: '/assets/img/unas9.jpg',   alt: 'Decoración y pedrería en uñas',       label: 'Decoración Exclusiva' },
  { id: 10, category: 'Uñas', src: '/assets/img/unas10.jpg',  alt: 'Manicura premium de autor',           label: 'Diseño de Autor' },
  { id: 11, category: 'Uñas', src: '/assets/img/unas11.JPEG', alt: 'Diseño artístico de uñas',           label: 'Nail Art Deluxe' },

  // ── PELO (3 trabajos reales) ──
  { id: 12, category: 'Pelo', src: '/assets/img/pelo1.jpg',   alt: 'Estilismo y peinado profesional',     label: 'Peinado Social' },
  { id: 13, category: 'Pelo', src: '/assets/img/pelo2.jpg',   alt: 'Tratamiento y brushing de cabello',   label: 'Brushing & Nutrición' },
  { id: 14, category: 'Pelo', src: '/assets/img/pelo3.jpg',   alt: 'Corte y estilismo de gala',           label: 'Estilismo de Gala' },

  // ── MAQUILLAJE (8 trabajos reales) ──
  { id: 15, category: 'Maquillaje', src: '/assets/img/maquillaje1.jpg', alt: 'Maquillaje social profesional',    label: 'Look Social Glam' },
  { id: 16, category: 'Maquillaje', src: '/assets/img/maquillaje2.jpg', alt: 'Maquillaje para eventos',          label: 'MakeUp Noche' },
  { id: 17, category: 'Maquillaje', src: '/assets/img/maquillaje3.jpg', alt: 'Maquillaje de fiesta radiante',    label: 'Radiant Glow' },
  { id: 18, category: 'Maquillaje', src: '/assets/img/maquillaje4.jpg', alt: 'Maquillaje editorial y ojos',      label: 'Editorial Eyes' },
  { id: 19, category: 'Maquillaje', src: '/assets/img/maquillaje5.jpg', alt: 'Técnica de piel blindada y ojos',  label: 'Piel Blindada' },
  { id: 20, category: 'Maquillaje', src: '/assets/img/maquillaje6.jpg', alt: 'MakeUp artístico de fiesta',       label: 'Party MakeUp' },
  { id: 21, category: 'Maquillaje', src: '/assets/img/maquillaje7.jpg', alt: 'Maquillaje de novia y evento',     label: 'Novia Radiante' },
  { id: 22, category: 'Maquillaje', src: '/assets/img/maquillaje8.jpg', alt: 'MakeUp social natural y elegante',  label: 'Natural Elegance' },
];

const categories = ['Uñas', 'Pelo', 'Maquillaje'];

const categoryConfig = {
  'Uñas':       { icon: Sparkles, color: 'from-[#FFB6C1] to-[#FF69B4]', label: 'Nail Art & Spa' },
  'Pelo':       { icon: Scissors, color: 'from-[#E2A7B8] to-[#D87F95]', label: 'Hair Studio' },
  'Maquillaje': { icon: Palette,  color: 'from-[#D4AF37] to-[#F3E5AB]', label: 'MakeUp & Beauty' },
};

// ── Imagen con fallback elegante ──
function GalleryImage({ item, onClick, index }) {
  const [error, setError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onClick={() => onClick(item)}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-shadow duration-300"
    >
      {!error ? (
        <img
          src={item.src}
          alt={item.alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#FFF0F3] to-[#FFC9D6]/60 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#5A0B22]/15">
          <div className="w-14 h-14 rounded-full bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22]">
            <Camera className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-[#5A0B22] px-4 text-center">{item.label}</span>
        </div>
      )}

      {/* Overlay hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFC9D6]">{item.category}</span>
          <p className="text-white font-serif font-bold text-base leading-tight">{item.label}</p>
        </div>
      </div>

      {/* Category badge */}
      <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-[#5A0B22] uppercase tracking-wider shadow-sm">
        {item.category}
      </div>
    </motion.div>
  );
}

// ── Lightbox ──
function Lightbox({ items, currentIndex, onClose, onPrev, onNext }) {
  const item = items[currentIndex];
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => { setImgError(false); }, [currentIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 sm:bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-xs font-medium">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 sm:bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Image */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative max-w-lg w-full max-h-[85vh] flex flex-col items-center gap-3 sm:gap-4 px-2 sm:px-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[#FFF0F3]" style={{ maxHeight: '72vh' }}>
          {!imgError ? (
            <img
              src={item.src}
              alt={item.alt}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
              style={{ maxHeight: '72vh' }}
            />
          ) : (
            <div className="aspect-[3/4] flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#FFF0F3] to-[#FFC9D6]/60">
              <Camera className="w-12 h-12 text-[#5A0B22]/40" />
              <span className="text-sm font-bold text-[#5A0B22]">{item.label}</span>
            </div>
          )}
        </div>
        <div className="text-center px-4">
          <span className="text-[#FFC9D6] text-xs font-bold uppercase tracking-widest">{item.category}</span>
          <p className="text-white font-serif text-base sm:text-lg font-bold">{item.label}</p>
        </div>
      </motion.div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-black/50 sm:bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </motion.div>
  );
}

// ── Página principal ──
export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('Uñas');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const whatsappNumber = "5493813553492";

  const filtered = galleryItems.filter(item => item.category === activeCategory);

  const openLightbox = (item) => {
    const idx = filtered.findIndex(i => i.id === item.id);
    setLightboxIndex(idx);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length);
  const nextImage = () => setLightboxIndex(i => (i + 1) % filtered.length);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKey = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, filtered.length]);

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans overflow-x-hidden">

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={filtered}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>

      {/* Announcement Bar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#5A0B22] text-[#FFF8FA] py-2.5 px-4 text-center text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 relative z-50"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
        <span>Galería de Trabajos • I'm Chic By Melany Toledo</span>
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#FFC9D6] via-[#FFD2DE]/95 to-[#FFDEE6]/90 backdrop-blur-md transition-all duration-300 relative shadow-[0_10px_30px_-10px_rgba(255,201,214,0.6)]">
        <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-[#FFDEE6]/90 via-[#FFEBF0]/50 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-white shadow-md ring-2 ring-[#5A0B22]/15 overflow-hidden flex items-center justify-center">
              <img
                src="/assets/logo-im-chic.png"
                alt="Logo"
                className="w-full h-full object-cover scale-[1.25]"
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="font-serif font-bold text-sm text-[#5A0B22]">IC</span>'; }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold text-[#5A0B22] leading-none">I'm Chic</span>
              <span className="text-[10px] font-semibold tracking-[0.15em] text-[#7A1333] uppercase">By Melany Toledo</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 font-medium text-sm text-[#5A0B22]">
            <Link to="/" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Inicio</Link>
            <Link to="/cursos" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Cursos</Link>
            <Link to="/galeria" className="relative px-3.5 py-1.5 rounded-full font-bold text-[#7A1333] bg-white/50 hover:bg-[#5A0B22]/8 transition-all duration-200 tracking-wide">Galería</Link>
            <Link to="/tienda" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Tienda MK</Link>
            <Link to="/inversion" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Inversión</Link>
            <Link to="/contacto" className="relative px-3.5 py-1.5 rounded-full hover:bg-[#5A0B22]/8 hover:text-[#5A0B22] transition-all duration-200 tracking-wide">Contacto</Link>
          </nav>

          <div className="hidden md:block">
            <WhatsAppButton phoneNumber={whatsappNumber} message="¡Hola Melany! Vi la galería y quiero agendar un servicio." open={true} size="sm" text="Agendar" />
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#5A0B22]">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-lg px-6 py-5 overflow-hidden absolute w-full shadow-2xl rounded-b-3xl"
            >
              <div className="flex flex-col gap-2 text-base font-medium text-[#5A0B22]">
                {[['/', 'Inicio'], ['/cursos', 'Cursos'], ['/galeria', 'Galería'], ['/tienda', 'Tienda MK'], ['/inversion', 'Inversión'], ['/contacto', 'Contacto']].map(([path, label]) => (
                  <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-[#FFC9D6]/40 flex items-center justify-between">
                    <span>{label}</span><ChevronRight className="w-4 h-4 text-[#7A1333]" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Hero de sección */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 sm:mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFF0F3] border border-[#FFC9D6] text-[#7A1333] text-xs font-bold uppercase tracking-widest mb-4">
            Nuestros Trabajos
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#5A0B22] mb-4 leading-tight">
            Galería de<br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#D87F95] to-[#7A1333]">Transformaciones</span>
          </h1>
          <p className="text-[#5A0B22]/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed px-2">
            Cada imagen cuenta una historia de confianza y arte. Explorá nuestros trabajos en uñas, pelo y maquillaje.
          </p>
        </motion.div>

        {/* Stats rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto mb-8 sm:mb-14"
        >
          {[
            { icon: Sparkles, label: 'Uñas', count: galleryItems.filter(i => i.category === 'Uñas').length },
            { icon: Scissors, label: 'Pelo', count: galleryItems.filter(i => i.category === 'Pelo').length },
            { icon: Palette,  label: 'Maquillaje', count: galleryItems.filter(i => i.category === 'Maquillaje').length },
          ].map(({ icon: Icon, label, count }) => (
            <div key={label} className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center shadow-sm border border-[#FFC9D6]/30">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#D87F95] mx-auto mb-1" />
              <p className="font-serif text-xl sm:text-2xl font-bold text-[#5A0B22]">{count}</p>
              <p className="text-[11px] sm:text-xs text-[#5A0B22]/60 font-medium">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {categories.map((cat) => {
            const cfg = categoryConfig[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#5A0B22] text-white shadow-lg shadow-[#5A0B22]/20'
                    : 'bg-white text-[#5A0B22] border border-[#FFC9D6] hover:bg-[#FFF0F3]'
                }`}
              >
                {cfg && <cfg.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid masonry */}
        <motion.div layout className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
          <AnimatePresence>
            {filtered.map((item, index) => (
              <div key={item.id} className="break-inside-avoid mb-3 sm:mb-4">
                <GalleryImage item={item} onClick={openLightbox} index={index} />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA inferior */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 sm:mt-20 text-center bg-[#5A0B22] rounded-2xl sm:rounded-3xl p-6 sm:p-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#FFC9D6] text-xs font-bold uppercase tracking-widest mb-4">
              ¿Te gustó lo que viste?
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              Reservá tu turno hoy
            </h2>
            <p className="text-[#FFC9D6] mb-8 max-w-md mx-auto">
              Escribime por WhatsApp y agendamos tu sesión. ¡Cupos limitados!
            </p>
            <WhatsAppButton
              phoneNumber={whatsappNumber}
              message="¡Hola Melany! Vi la galería y quiero reservar un turno."
              open={true}
              size="lg"
              text="Reservar Turno por WhatsApp"
            />
          </div>
        </motion.div>
      </main>

      {/* Footer armónico */}
      <footer className="py-8 bg-white border-t border-[#5A0B22]/10 text-center text-sm text-[#5A0B22]/60 mt-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <InstagramButton />
          <p>© 2026 I'm Chic By Melany Toledo — Estudio de Belleza Integral & Mary Kay.</p>
        </div>
      </footer>
    </div>
  );
}
