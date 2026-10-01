import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Carrusel de trabajos accesible (WCAG 2.1 AA).
 * - Controles con área táctil >= 44x44 px.
 * - Indicadores con área táctil >= 24x24 px y aria-current.
 * - Navegación por teclado y respeto a prefers-reduced-motion.
 */
export default function ServiceCarousel({ service }) {
  const { images, title, subtitle, icon: Icon, accentColor } = service;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = images[index];

  useEffect(() => {
    if (paused || images.length <= 1) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [paused, images.length]);

  const goTo = (next) => setIndex((next + images.length) % images.length);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    }
  };

  return (
    <div
      className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-[#D87F95]/30 bg-gradient-to-br from-[#FFF0F3] to-[#FFC9D6]/40 shadow-xl transition-all duration-500"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Trabajos de ${subtitle}`}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={current.src}
          src={current.src}
          alt={current.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </AnimatePresence>

      {/* Overlay decorativo en hover (no es encabezado para preservar la jerarquía) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 pointer-events-none">
        <p className="text-white">
          <span className="block text-xs uppercase font-bold tracking-widest text-[#FFC9D6]">
            {subtitle}
          </span>
          <span className="block text-xl font-serif font-bold">{title}</span>
        </p>
      </div>

      <div
        className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${accentColor} text-white shadow-md backdrop-blur-sm z-10`}
        aria-hidden="true"
      >
        <Icon size={20} />
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/85 text-[#5A0B22] flex items-center justify-center shadow-md hover:bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/85 text-[#5A0B22] flex items-center justify-center shadow-md hover:bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-0.5 px-4">
            {images.map((image, i) => (
              <button
                key={image.src}
                type="button"
                aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setIndex(i)}
                className="w-6 h-6 min-w-[24px] min-h-[24px] flex items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5A0B22]"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
