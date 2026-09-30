import Navbar from "./src/components/Navbar";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Scissors, Palette, Menu, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppButton from './src/components/WhatsAppButton';
import SparkleButton from './src/components/SparkleButton';
import InstagramButton from './src/components/InstagramButton';
import TurnoModal from './src/components/TurnoModal';

const services = [
  {
    id: 'nails',
    title: 'Uñas que realzan tu estilo',
    subtitle: 'Nail Art & Spa',
    description: 'Realzá la belleza de tus manos con acabados impecables y duraderos. Semipermanente, capping y Soft Gel, adaptados a tu estilo y pensados para lucir uñas cuidadas, elegantes y sofisticadas.',
    icon: Sparkles,
    accentColor: 'from-[#FFB6C1] to-[#FF69B4]',
    images: [
      { src: '/assets/img/unas1.jpg', alt: 'Diseño de uñas semipermanente' },
      { src: '/assets/img/unas2.jpg', alt: 'Manicura rusa y esculpidas' },
      { src: '/assets/img/unas3.jpg', alt: 'Diseño elegante de uñas' },
      { src: '/assets/img/unas4.jpg', alt: 'Uñas esculpidas en gel' },
      { src: '/assets/img/unas5.jpg', alt: 'Nail art personalizado' },
      { src: '/assets/img/unas6.jpg', alt: 'Manicura detallada y esmaltado' },
      { src: '/assets/img/unas7.jpg', alt: 'Diseño y acabado en brillo' },
      { src: '/assets/img/unas8.jpg', alt: 'Uñas acrílicas esculpidas' },
      { src: '/assets/img/unas9.jpg', alt: 'Decoración y pedrería en uñas' },
      { src: '/assets/img/unas10.jpg', alt: 'Manicura premium de autor' },
      { src: '/assets/img/unas11.JPEG', alt: 'Diseño artístico de uñas' },
    ],
  },
  {
    id: 'hair',
    title: 'Transformá tu cabello',
    subtitle: 'Hair Studio',
    description: 'Tratamientos personalizados para nutrir, reparar y revitalizar tu cabello, devolviéndole suavidad, brillo y movimiento para que luzca saludable y radiante.',
    icon: Scissors,
    accentColor: 'from-[#E2A7B8] to-[#D87F95]',
    images: [
      { src: '/assets/img/pelo1.jpg', alt: 'Estilismo y peinado profesional' },
      { src: '/assets/img/pelo2.jpg', alt: 'Tratamiento y brushing de cabello' },
      { src: '/assets/img/pelo3.jpg', alt: 'Corte y estilismo de gala' },
    ],
  },
  {
    id: 'makeup',
    title: 'Tu belleza, elevada a otro nivel',
    subtitle: 'MakeUp & Beauty',
    description: 'Maquillaje profesional diseñado para realzar tus facciones y potenciar tu belleza, con un acabado elegante y personalizado para cada ocasión especial.',
    icon: Palette,
    accentColor: 'from-[#D4AF37] to-[#F3E5AB]',
    images: [
      { src: '/assets/img/maquillaje1.jpg', alt: 'Maquillaje social profesional' },
      { src: '/assets/img/maquillaje2.jpg', alt: 'Maquillaje para eventos' },
      { src: '/assets/img/maquillaje3.jpg', alt: 'Maquillaje de fiesta radiante' },
      { src: '/assets/img/maquillaje4.jpg', alt: 'Maquillaje editorial y ojos' },
      { src: '/assets/img/maquillaje5.jpg', alt: 'Técnica de piel blindada y ojos' },
      { src: '/assets/img/maquillaje6.jpg', alt: 'MakeUp artístico de fiesta' },
      { src: '/assets/img/maquillaje7.jpg', alt: 'Maquillaje de novia y evento' },
      { src: '/assets/img/maquillaje8.jpg', alt: 'MakeUp social natural y elegante' },
    ],
  }
];

function ServiceCarousel({ service }) {
  const { images, title, subtitle, icon: Icon, accentColor } = service;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = images[index];

  useEffect(() => {
    if (paused || images.length <= 1) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [paused, images.length]);

  const goTo = (next) => {
    setIndex((next + images.length) % images.length);
  };

  return (
    <div
      className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-[#D87F95]/30 bg-gradient-to-br from-[#FFF0F3] to-[#FFC9D6]/40 shadow-xl group-hover:border-[#D87F95]/60 transition-all duration-500"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
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

      <div className="absolute inset-0 bg-gradient-to-t from-[#5A0B22]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 pointer-events-none">
        <div className="text-white">
          <span className="text-xs uppercase font-bold tracking-widest text-[#FFC9D6]">{subtitle}</span>
          <h4 className="text-xl font-serif font-bold">{title}</h4>
        </div>
      </div>

      <div className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${accentColor} text-white shadow-md backdrop-blur-sm z-10`}>
        <Icon size={20} />
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 text-[#5A0B22] flex items-center justify-center shadow-md hover:bg-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 text-[#5A0B22] flex items-center justify-center shadow-md hover:bg-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-1.5 px-4">
            {images.map((image, i) => (
              <button
                key={image.src}
                type="button"
                aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                aria-current={i === index ? true : undefined}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function HomeServices() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTurnoOpen, setIsTurnoOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const whatsappNumber = "5493813553492";

  const handleOpenTurno = (serviceName = '') => {
    setSelectedService(serviceName);
    setIsTurnoOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans selection:bg-[#5A0B22] selection:text-white overflow-x-hidden relative">

      <Navbar />

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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 flex items-center justify-center"
            >
              <button
                type="button"
                onClick={() => handleOpenTurno()}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm sm:text-base tracking-wide shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              >
                <Calendar className="w-4 h-4 text-[#F7E7B4] group-hover:rotate-12 transition-transform" />
                <span>Generar Turno Online</span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* Servicios */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col space-y-16 sm:space-y-24">
            {services.map((service, index) => {
              const isEven = index % 2 !== 0;
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
                    <ServiceCarousel service={service} />
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

                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mt-6 sm:mt-8">
                      <button
                        type="button"
                        onClick={() => handleOpenTurno(service.title)}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-medium text-sm sm:text-base tracking-wide shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                      >
                        <Calendar className="w-4 h-4 text-[#F7E7B4] group-hover:rotate-12 transition-transform" />
                        <span>Generar Turno</span>
                      </button>
                    </div>
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

      {/* Modal para Generar Turno con Google Calendar y WhatsApp */}
      <TurnoModal
        isOpen={isTurnoOpen}
        onClose={() => setIsTurnoOpen(false)}
        initialService={selectedService}
      />
    </div>
  );
}
