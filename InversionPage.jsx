import Navbar from "./src/components/Navbar";
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Scissors, Palette, Calendar, Check } from 'lucide-react';
import WhatsAppButton from './src/components/WhatsAppButton';
import InstagramButton from './src/components/InstagramButton';
import { useTurno } from './src/context/TurnoContext';

const whatsappNumber = "5493813553492";

const CATEGORIES = [
  {
    id: 'unas',
    heading: 'Uñas',
    subtitle: 'Nail Art & Spa',
    description: 'Acabados impecables y duraderos, adaptados a tu estilo para lucir manos cuidadas y elegantes.',
    modalService: 'Uñas',
    icon: Sparkles,
    gradient: 'from-[#FFB6C1] to-[#FF69B4]',
    treatments: ['Semipermanente', 'Capping', 'Soft gel'],
  },
  {
    id: 'cabello',
    heading: 'Tratamientos capilares',
    subtitle: 'Hair Studio',
    description: 'Nutrición, reparación y brillo para devolverle a tu cabello suavidad y movimiento natural.',
    modalService: 'Cabello',
    icon: Scissors,
    gradient: 'from-[#E2A7B8] to-[#D87F95]',
    treatments: ['Alisado Luminoliss', 'Plastificado', 'Botox', 'Queratina', 'Nutrición capilar + ampolla'],
  },
  {
    id: 'maquillaje',
    heading: 'Maquillaje Profesional',
    subtitle: 'MakeUp & Beauty',
    description: 'Maquillaje a medida que realza tus facciones con un acabado elegante para cada ocasión.',
    modalService: 'Maquillaje',
    icon: Palette,
    gradient: 'from-[#D4AF37] to-[#F3E5AB]',
    treatments: ['Maquillaje social', 'Maquillaje de novia', 'Maquillaje de quinceañera'],
  },
];

export default function InversionPage() {
  const { open: openTurno } = useTurno();

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans overflow-x-hidden selection:bg-[#5A0B22] selection:text-white">

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#FFC9D6] text-[#7A1333] text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Nuestros Servicios
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#5A0B22] mb-4 leading-tight">
            Servicios diseñados para<br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#D87F95] via-[#A82449] to-[#5A0B22]">
              realzar tu belleza única
            </span>
          </h1>
          <p className="text-[#5A0B22]/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-2">
            Elegí tu categoría, conocé las prestaciones y agendá tu turno en segundos.
          </p>
        </motion.div>

        {/* Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.article
                key={category.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col rounded-3xl bg-white/85 border border-[#5A0B22]/10 shadow-lg p-6 sm:p-7"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white shadow-md mb-5`}
                  aria-hidden="true"
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <span className="h-[1px] w-8 bg-gradient-to-r from-[#D87F95] to-transparent" />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#A64D66]">
                    {category.subtitle}
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 mb-3">
                  {category.heading}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {category.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {category.treatments.map((treatment) => (
                    <li key={treatment} className="flex items-start gap-2 text-sm text-[#5A0B22]">
                      <Check className="w-4 h-4 text-[#7A1333] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{treatment}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => openTurno(category.modalService)}
                  className="mt-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm tracking-wide shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
                >
                  <Calendar className="w-4 h-4 text-[#F7E7B4]" aria-hidden="true" />
                  <span>Agendar turno</span>
                </button>
              </motion.article>
            );
          })}
        </div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-br from-[#FFF0F3] via-white to-[#FFC9D6]/40 rounded-3xl p-8 sm:p-12 border border-[#FFC9D6] shadow-md mt-12"
        >
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#5A0B22] mb-3">
            ¿Tenés un evento especial o consulta particular?
          </h2>
          <p className="text-[#5A0B22]/75 mb-6 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Escribime por WhatsApp y armamos un paquete exclusivo que se ajuste a tus horarios y necesidades.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openTurno()}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-full bg-[#5A0B22] hover:bg-[#7A1333] text-[#FFF8FA] text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
              <span>Generar Mi Turno Ahora</span>
            </button>
            <WhatsAppButton
              phoneNumber={whatsappNumber}
              message="¡Hola Melany! Quisiera pedirte un presupuesto personalizado para mis servicios de belleza."
              open={true}
              size="md"
              tone="brand"
              text="Pedir Presupuesto WhatsApp"
            />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[#5A0B22]/10 text-center text-xs sm:text-sm text-[#5A0B22]/75 mt-10 bg-white/40">
        <div className="flex items-center justify-center gap-3 mb-4">
          <WhatsAppButton open={false} text="WhatsApp" />
          <InstagramButton />
        </div>
        <p>© 2026 I'm Chic By Melany Toledo — Estudio de Belleza Integral & Academia.</p>
        <p className="mt-1 text-[11px] text-[#5A0B22]/70">Yerba Buena / San Miguel de Tucumán, Argentina</p>
      </footer>
    </div>
  );
}
