import Navbar from "./src/components/Navbar";
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Scissors, Palette, Calendar } from 'lucide-react';
import InstagramButton from './src/components/InstagramButton';
import WhatsAppButton from './src/components/WhatsAppButton';
import ServiceCarousel from './src/components/ServiceCarousel';
import { useTurno } from './src/context/TurnoContext';

const services = [
  {
    id: 'nails',
    title: 'Uñas que realzan tu estilo',
    subtitle: 'Nail Art & Spa',
    description: 'Realzá la belleza de tus manos con acabados impecables y duraderos. Semipermanente, capping y Soft Gel, adaptados a tu estilo y pensados para lucir uñas cuidadas, elegantes y sofisticadas.',
    modalService: 'Uñas',
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
    modalService: 'Cabello',
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
    modalService: 'Maquillaje',
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

export default function HomeServices() {
  const { open: openTurno } = useTurno();

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans selection:bg-[#5A0B22] selection:text-white overflow-x-hidden relative">

      <Navbar />

      <main className="relative z-10 pt-10 pb-20">
        {/* HERO */}
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

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-4 sm:mb-6 leading-tight text-gray-900"
            >
              <span className="block">Realzá tu belleza</span>
              <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-[#D87F95] via-[#C56B82] to-[#D87F95]">Potenciá tu esencia</span>
            </motion.h1>

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
                onClick={() => openTurno()}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm sm:text-base tracking-wide shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              >
                <Calendar className="w-4 h-4 text-[#F7E7B4] group-hover:rotate-12 transition-transform" />
                <span>Agenda tu turno</span>
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
                      <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#A64D66]">{service.subtitle}</span>
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
                        onClick={() => openTurno(service.modalService)}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-medium text-sm sm:text-base tracking-wide shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                      >
                        <Calendar className="w-4 h-4 text-[#F7E7B4] group-hover:rotate-12 transition-transform" />
                        <span>Agenda tu turno</span>
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
      <footer className="py-8 bg-white border-t border-[#5A0B22]/10 text-center text-sm text-[#5A0B22]/75">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-3">
            <WhatsAppButton open={false} text="WhatsApp" />
            <InstagramButton />
          </div>
          <p>© 2026 I'm Chic By Melany Toledo - Consultora de Belleza Independiente Mary Kay.</p>
        </div>
      </footer>
    </div>
  );
}
