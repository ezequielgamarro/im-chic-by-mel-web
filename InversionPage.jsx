import Navbar from "./src/components/Navbar";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Scissors,
  Palette,
  Star,
  ChevronRight,
  Menu,
  X,
  Calendar,
  Clock,
  Check,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Search,
  ArrowRight,
  Gift,
  Award,
  Crown,
  Zap,
  Phone,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppButton from './src/components/WhatsAppButton';
import TurnoModal from './src/components/TurnoModal';

const whatsappNumber = "5493813553492";

// Categorías del catálogo
const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: Layers },
  { id: 'unas', label: 'Uñas & Manicura', icon: Sparkles },
  { id: 'cabello', label: 'Cabello & Hair Studio', icon: Scissors },
  { id: 'maquillaje', label: 'MakeUp & Belleza', icon: Palette },
  { id: 'packs', label: 'Packs & Combos VIP', icon: Crown },
  { id: 'cursos', label: 'Cursos & Asesorías', icon: Award },
];

// Detalle exhaustivo de servicios ofrecidos en I'm Chic
const SERVICES_DATA = [
  // --- UÑAS ---
  {
    id: 'capping-semi',
    name: 'Semipermanente & Capping Gel',
    category: 'unas',
    categoryLabel: 'Uñas & Manicura',
    subtitle: 'Fuerza extrema, protección de uña natural y brillo por 21 días',
    description: 'Tratamiento fortalecedor ideal si tus uñas se quiebran o escaman. Aplicamos una fina capa niveladora de gel constructor sobre tu uña natural y finalizamos con esmaltado semipermanente de alta densidad que no se salta ni opaca.',
    duration: '1h 15 min',
    tag: 'Más Pedido',
    tagColor: 'bg-[#5A0B22] text-white',
    icon: Sparkles,
    gradient: 'from-[#FFB6C1] to-[#FF69B4]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/30',
    includes: [
      'Limpieza y perfilado profundo de cutículas',
      'Limado anatómico según la forma de tus dedos',
      'Capa protectora Capping Gel autonivelante',
      'Esmaltado semipermanente con color a elección',
      'Top coat gloss de alto impacto o mate terciopelo',
      'Aceite nutritivo de cutículas con vitamina E'
    ],
    turnoService: 'Uñas: Semipermanente & Capping'
  },
  {
    id: 'esculpidas-gel',
    name: 'Esculpidas en Gel / Acrigel',
    category: 'unas',
    categoryLabel: 'Uñas & Manicura',
    subtitle: 'Extensión arquitectónica, curvatura C perfecta y resistencia',
    description: 'Extensión milimétrica esculpida a mano sobre moldes o tips estructurales. Te permite lograr el largo que siempre soñaste con un acabado liviano, cómodo y resistente a los impactos del día a día.',
    duration: '2h 15 min',
    tag: 'Elegancia VIP',
    tagColor: 'bg-[#D4AF37] text-[#5A0B22]',
    icon: Sparkles,
    gradient: 'from-[#FFB6C1] to-[#FF69B4]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/30',
    includes: [
      'Esculpido estructural con gel o acrigel premium',
      'Forma a tu gusto: Almendrada, Cuadrada, Coffin o Stiletto',
      'Nivelación y balance de ápice sin sensación pesada',
      'Esmaltado semipermanente del color que elijas',
      'Hidratación profunda de manos y cutículas'
    ],
    turnoService: 'Uñas: Esculpidas en Gel / Acrigel'
  },
  {
    id: 'soft-gel',
    name: 'Soft Gel Tips de Autor',
    category: 'unas',
    categoryLabel: 'Uñas & Manicura',
    subtitle: 'Uñas perfectas en tiempo récord, ultralivianas y naturales',
    description: 'La técnica internacional más moderna. Tips de gel flexible preformados que se fusionan a la uña con base gel específica. Cero sensación plástica, máxima comodidad y duración de hasta 4 semanas.',
    duration: '1h 30 min',
    tag: 'Tendencia',
    tagColor: 'bg-[#7A1333] text-white',
    icon: Sparkles,
    gradient: 'from-[#FFB6C1] to-[#FF69B4]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/30',
    includes: [
      'Preparación química suave que cuida tu uña natural',
      'Alineación y adhesión de tips según curvatura exacta',
      'Sellado perimetral invisible en zona de cutícula',
      'Esmaltado semipermanente y top coat de máxima duración'
    ],
    turnoService: 'Uñas: Soft Gel Tips de Autor'
  },
  {
    id: 'nail-art',
    name: 'Nail Art de Autor & Pedrería Fina',
    category: 'unas',
    categoryLabel: 'Uñas & Manicura',
    subtitle: 'Diseños a mano alzada, francesitas modernas y cristales Swarovski',
    description: 'Dale personalidad a tu set con diseños exclusivos: francesitas micro y decoradas, efectos aurora/glaze, degradé baby boomer, encapsulados con glitter y aplicación de pedrería fina con sellado blindado.',
    duration: '+30 min extra',
    tag: 'Diseño Exclusivo',
    tagColor: 'bg-white text-[#5A0B22] border border-[#5A0B22]/20',
    icon: Sparkles,
    gradient: 'from-[#FFB6C1] to-[#FF69B4]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/30',
    includes: [
      'Pincelería de precisión a mano alzada',
      'Efectos cromo, holográfico, mármol o animal print',
      'Pedrería fijada con gel constructor anti-caídas',
      'Sellado ultra gloss para protección del arte'
    ],
    turnoService: 'Uñas: Nail Art & Pedrería'
  },
  {
    id: 'manicura-rusa',
    name: 'Manicura Rusa / Combinada',
    category: 'unas',
    categoryLabel: 'Uñas & Manicura',
    subtitle: 'Aparatología de precisión para un esmaltado milimétrico y limpio',
    description: 'Técnica de limpieza profunda con torno y fresas diamantadas esterilizadas. Despeja el área cuticular por completo, permitiendo esmaltar debajo del pliegue de la uña para que el crecimiento tarde más tiempo en notarse.',
    duration: '1h 00 min',
    tag: 'Detalle Pro',
    tagColor: 'bg-[#FFC9D6] text-[#5A0B22]',
    icon: Sparkles,
    gradient: 'from-[#FFB6C1] to-[#FF69B4]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/30',
    includes: [
      'Protocolo higiénico riguroso con fresas esterilizadas',
      'Pulido suave de laterales y zona perimetral',
      'Nivelación y exfoliación de cutículas',
      'Nutrición intensiva con aceites y bálsamo reparador'
    ],
    turnoService: 'Uñas: Semipermanente & Capping'
  },

  // --- CABELLO ---
  {
    id: 'alisado-espejo',
    name: 'Alisado Espejo / Plastificado Capilar',
    category: 'cabello',
    categoryLabel: 'Cabello & Hair Studio',
    subtitle: 'Cero frizz, brillo reflectivo supremo y suavidad al tacto',
    description: 'Tratamiento termo-disciplinante de alta potencia. Sella las cutículas capilares, elimina el volumen indeseado y deja tu cabello con caída natural, tacto de seda y un brillo espejo deslumbrante incluso en días de humedad.',
    duration: '2h 30 min',
    tag: 'Efecto Espejo',
    tagColor: 'bg-[#5A0B22] text-white',
    icon: Scissors,
    gradient: 'from-[#E2A7B8] to-[#D87F95]',
    lightBg: 'from-[#FFF0F3] to-[#E2A7B8]/20',
    includes: [
      'Lavado preparatorio con shampoo purificante',
      'Aplicación homogénea mecha por mecha sin dañar la fibra',
      'Sellado térmico de precisión con plancha profesional',
      'Brushing de cierre y serum nutritivo sellador de puntas',
      'Duración de 3 a 5 meses con cuidados recomendados'
    ],
    turnoService: 'Cabello: Alisado Espejo / Plastificado'
  },
  {
    id: 'nutricion-keratina',
    name: 'Nutrición Profunda & Shock de Keratina',
    category: 'cabello',
    categoryLabel: 'Cabello & Hair Studio',
    subtitle: 'Restauración intensiva para cabellos resecos, porosos o decolorados',
    description: 'Tratamiento de hidratación molecular con cóctel de aminoácidos, lípidos y keratina. Rellena las fisuras de la fibra capilar, devolviendo elasticidad, cuerpo, suavidad y movimiento natural a las melenas castigadas.',
    duration: '1h 30 min',
    tag: 'Salud Capilar',
    tagColor: 'bg-[#D4AF37] text-[#5A0B22]',
    icon: Scissors,
    gradient: 'from-[#E2A7B8] to-[#D87F95]',
    lightBg: 'from-[#FFF0F3] to-[#E2A7B8]/20',
    includes: [
      'Diagnóstico capilar previo de porosidad y resistencia',
      'Baño reconstructor con activos orgánicos y keratina',
      'Activación térmica y sellado de cutículas',
      'Brushing de finalización con movimiento y brillo'
    ],
    turnoService: 'Cabello: Nutrición & Shock de Keratina'
  },
  {
    id: 'peinado-social',
    name: 'Peinado Social & Styling de Fiesta',
    category: 'cabello',
    categoryLabel: 'Cabello & Hair Studio',
    subtitle: 'Ondas al agua, recogidos sofisticados y semirecogidos bohemios',
    description: 'Diseñamos tu peinado ideal en función de tu vestimenta, tipo de escote y rasgos faciales. Estilos duraderos a prueba de baile, abrazos y viento, manteniendo siempre una apariencia natural y sin rigidez.',
    duration: '1h 15 min',
    tag: 'Fiestas & Galas',
    tagColor: 'bg-[#7A1333] text-white',
    icon: Scissors,
    gradient: 'from-[#E2A7B8] to-[#D87F95]',
    lightBg: 'from-[#FFF0F3] to-[#E2A7B8]/20',
    includes: [
      'Preparación de textura y volumen en raíz',
      'Modelado con herramientas térmicas profesionales',
      'Técnicas de fijación invisible y flexible',
      'Colocación de apliques, hebillas o tocados si los traes'
    ],
    turnoService: 'Cabello: Peinado Social & Styling'
  },
  {
    id: 'corte-brushing',
    name: 'Corte de Estilo & Brushing Modelado',
    category: 'cabello',
    categoryLabel: 'Cabello & Hair Studio',
    subtitle: 'Renovación de puntas, desmechado y definición con volumen',
    description: 'Corte técnico para sanar puntas o transformar tu estilo en capas, corte recto o desmechado. Acompañado de lavado relajante y brushing profesional con volumen y brillo sedoso.',
    duration: '50 min',
    tag: 'Cuidado Diario',
    tagColor: 'bg-[#FFC9D6] text-[#5A0B22]',
    icon: Scissors,
    gradient: 'from-[#E2A7B8] to-[#D87F95]',
    lightBg: 'from-[#FFF0F3] to-[#E2A7B8]/20',
    includes: [
      'Lavado con masaje capilar descontracturante',
      'Corte de precisión según tus preferencias',
      'Brushing con secador y sellado de puntas con argán'
    ],
    turnoService: 'Cabello: Peinado Social & Styling'
  },

  // --- MAQUILLAJE ---
  {
    id: 'makeup-social',
    name: 'MakeUp Social Glam',
    category: 'maquillaje',
    categoryLabel: 'MakeUp & Belleza',
    subtitle: 'Piel luminosa, ojos destacados y pestañas para eventos inolvidables',
    description: 'El look perfecto para egresos, cócteles, madrinas e invitadas de boda. Preparamos tu piel para que luzca radiante y uniforme, con un difuminado armónico en ojos y pestañas postizas incluidas para abrir la mirada.',
    duration: '1h 15 min',
    tag: 'Favorito',
    tagColor: 'bg-[#5A0B22] text-white',
    icon: Palette,
    gradient: 'from-[#D4AF37] to-[#F3E5AB]',
    lightBg: 'from-[#FFF0F3] to-[#D4AF37]/15',
    includes: [
      'Preparación de piel: limpieza, tonificación e hidratación',
      'Corrección cromática de ojeras y manchas',
      'Base liviana o de cobertura construible según preferencia',
      'Sombreado glam con iluminador y delineado',
      'Pestañas postizas en tira o mechones incluidas',
      'Labios definidos de larga duración'
    ],
    turnoService: 'Maquillaje: MakeUp Social Glam'
  },
  {
    id: 'makeup-blindada',
    name: 'MakeUp Noche & Piel Blindada',
    category: 'maquillaje',
    categoryLabel: 'MakeUp & Belleza',
    subtitle: 'Técnica blindada a prueba de agua, sudor, lágrimas y calor',
    description: 'Nuestra técnica de mayor resistencia. Capas con productos siliconados de fijación extrema que no transfieren ni se cuartean. Contornos HD esculpidos, iluminación intensa y mirada impactante de fiesta.',
    duration: '1h 30 min',
    tag: 'Resistencia Total',
    tagColor: 'bg-[#D4AF37] text-[#5A0B22]',
    icon: Palette,
    gradient: 'from-[#D4AF37] to-[#F3E5AB]',
    lightBg: 'from-[#FFF0F3] to-[#D4AF37]/15',
    includes: [
      'Blindaje dermatológico paso a paso impermeable',
      'Técnicas de ojos de alta intensidad: Smokey, Foxy o Cut Crease',
      'Contornos y luces esculpidas en crema y polvo HD',
      'Pestañas postizas 3D de alta densidad',
      'Fijador sellador profesional efecto escudo'
    ],
    turnoService: 'Maquillaje: MakeUp Noche Piel Blindada'
  },
  {
    id: 'makeup-novia',
    name: 'MakeUp Novias & Quinceañeras HD',
    category: 'maquillaje',
    categoryLabel: 'MakeUp & Belleza',
    subtitle: 'Acabado fotográfico impecable para la noche más mágica de tu vida',
    description: 'Atención personalizada para novias y quinceañeras. Maquillaje diseñado a medida con productos de alta gama testeados bajo luces de fotografía y video 4K, garantizando que permanezcas impecable hasta el final de la fiesta.',
    duration: '2h 00 min',
    tag: 'Exclusivo Novias',
    tagColor: 'bg-[#7A1333] text-white',
    icon: Palette,
    gradient: 'from-[#D4AF37] to-[#F3E5AB]',
    lightBg: 'from-[#FFF0F3] to-[#D4AF37]/15',
    includes: [
      'Asesoramiento estilístico según vestido, tocado y ramo',
      'Skincare de lujo preparatorio TimeWise de Mary Kay',
      'Maquillaje HD fotográfico resistente a lágrimas',
      'Pestañas premium efecto seda y diseño de cejas',
      'Kit de retoque express para la noche'
    ],
    turnoService: 'Maquillaje: Novias & Quinceañeras HD'
  },
  {
    id: 'makeup-express',
    name: 'MakeUp Express / Natural Glow',
    category: 'maquillaje',
    categoryLabel: 'MakeUp & Belleza',
    subtitle: 'Frescura, piel jugosa y toque chic para sesiones de fotos o trabajo',
    description: 'Para quienes buscan verse frescas, descansadas y con luz propia. Cobertura ligera con CC Cream, rubor en crema, cejas peinadas orgánicas y labios hidratados con brillo suave.',
    duration: '45 min',
    tag: 'Natural Look',
    tagColor: 'bg-[#FFC9D6] text-[#5A0B22]',
    icon: Palette,
    gradient: 'from-[#D4AF37] to-[#F3E5AB]',
    lightBg: 'from-[#FFF0F3] to-[#D4AF37]/15',
    includes: [
      'Hidratación iluminadora con antioxidantes',
      'CC Cream o base sérum ultra ligera',
      'Máscara de pestañas y cejas orgánicas',
      'Rubor e iluminador líquido con acabado glow'
    ],
    turnoService: 'Maquillaje: MakeUp Social Glam'
  },

  // --- PACKS & COMBOS ---
  {
    id: 'pack-look-total',
    name: 'Pack Look Total (MakeUp + Peinado)',
    category: 'packs',
    categoryLabel: 'Packs & Combos VIP',
    subtitle: 'El combo favorito: salís completamente lista y radiante para tu fiesta',
    description: 'Combiná en una sola sesión el Maquillaje Social Glam completo (con pestañas) y el Peinado de Fiesta que elijas. Armonía visual impecable y sin estrés de trasladarte a diferentes lugares.',
    duration: '2h 30 min',
    tag: 'Combo Estrella',
    tagColor: 'bg-[#D4AF37] text-[#5A0B22] font-black',
    icon: Crown,
    gradient: 'from-[#5A0B22] to-[#7A1333]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/40',
    includes: [
      'MakeUp Social Glam completo con pestañas postizas',
      'Peinado a elección (ondas, recogido o semirecogido)',
      'Fijación extrema contra el calor y movimiento',
      'Acompañamiento en la colocación de accesorios'
    ],
    turnoService: 'Pack: Look Total (MakeUp + Peinado)'
  },
  {
    id: 'pack-belleza-completa',
    name: 'Pack Belleza Completa (Uñas + Cabello + MakeUp)',
    category: 'packs',
    categoryLabel: 'Packs & Combos VIP',
    subtitle: 'Experiencia integral de pies a cabeza para eventos destacados',
    description: 'La experiencia de belleza definitiva. Capping o esmaltado semipermanente en tus uñas, peinado y styling profesional, y maquillaje de fiesta con pestañas. Todo coordinado en un ambiente cálido y relajante.',
    duration: '3h 45 min',
    tag: 'Full Experiencia',
    tagColor: 'bg-[#5A0B22] text-white',
    icon: Crown,
    gradient: 'from-[#5A0B22] to-[#7A1333]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/40',
    includes: [
      'Manicura Capping Gel o Semipermanente con color',
      'Peinado Social y modelado térmico de gala',
      'MakeUp de Fiesta con piel blindada o social glam',
      'Café, té o infusión de cortesía durante tu atención'
    ],
    turnoService: 'Pack: Belleza Completa (Uñas + Pelo + MakeUp)'
  },
  {
    id: 'pack-novia-vip',
    name: 'Experiencia Novia VIP Integral',
    category: 'packs',
    categoryLabel: 'Packs & Combos VIP',
    subtitle: 'Tu día más soñado con atención exclusiva, pruebas previas y relax',
    description: 'El paquete de ensueño para novias y quinceañeras. Incluye cita previa para probar maquillaje y peinado, preparación dérmica con productos Mary Kay, manicura esculpida o soft gel, y atención preferencial el día de tu evento.',
    duration: 'Jornada Exclusiva',
    tag: 'Exclusivo VIP',
    tagColor: 'bg-[#D4AF37] text-[#5A0B22]',
    icon: Crown,
    gradient: 'from-[#5A0B22] to-[#7A1333]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/40',
    includes: [
      'Cita de prueba previa de maquillaje y peinado',
      'Maquillaje de Novia HD con fijación 24hs a prueba de lágrimas',
      'Peinado de Novia con colocación de velo y tocado',
      'Set de Uñas Esculpidas o Soft Gel con diseño de novia',
      'Kit de retoque express para la fiesta'
    ],
    turnoService: 'Experiencia Novia VIP Integral'
  },

  // --- CURSOS & ASESORÍAS ---
  {
    id: 'masterclass-automaquillaje',
    name: 'Masterclass de Automaquillaje (2 Clases)',
    category: 'cursos',
    categoryLabel: 'Cursos & Asesorías',
    subtitle: 'Hacé de tu maquillaje una herramienta diaria de poder y confianza',
    description: 'Taller intensivo personalizado individual o grupal reducido. Clase 1 de día y visagismo; Clase 2 de noche glam y sellado duradero. Materiales incluidos en el estudio, guía digital y certificado.',
    duration: '2 Clases de 2h 30m',
    tag: 'Academia I\'m Chic',
    tagColor: 'bg-[#5A0B22] text-white',
    icon: Award,
    gradient: 'from-[#7A1333] to-[#D4AF37]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/30',
    includes: [
      'Diagnóstico de tu biotipo cutáneo y morfología facial',
      'Uso correcto de brochas e identificación de tonos',
      'Práctica 1 a 1 frente a espejo profesional con guía',
      'Guía PDF con apuntes paso a paso y certificado de asistencia'
    ],
    turnoService: 'Cursos: Masterclass Automaquillaje'
  },
  {
    id: 'asesoria-mary-kay',
    name: 'Sesión de Belleza & Skincare Mary Kay',
    category: 'cursos',
    categoryLabel: 'Cursos & Asesorías',
    subtitle: 'Descubrí la rutina facial exacta que tu tipo de piel necesita',
    description: 'Asesoría dermatocosmética personalizada con la línea TimeWise de Mary Kay. Testeamos limpiadoras, sérums antioxidantes y protectores en tu rostro para que sientas los resultados en el momento.',
    duration: '45 min',
    tag: 'Asesoría Oficial',
    tagColor: 'bg-[#FFC9D6] text-[#5A0B22]',
    icon: Award,
    gradient: 'from-[#7A1333] to-[#D4AF37]',
    lightBg: 'from-[#FFF0F3] to-[#FFC9D6]/30',
    includes: [
      'Análisis de tipo de piel (seca, mixta, grasa o sensible)',
      'Prueba guiada de la rutina TimeWise 4 en 1',
      'Consejos de aplicación para potenciar resultados',
      'Beneficios exclusivos en la adquisición de productos'
    ],
    turnoService: 'Asesoría: Cuidado Facial Mary Kay'
  }
];

export default function InversionPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para el modal de turno
  const [isTurnoOpen, setIsTurnoOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  // Manejo de apertura del agendador con manejo de errores try/catch
  const handleOpenTurno = (serviceName) => {
    try {
      setSelectedService(serviceName || '');
      setIsTurnoOpen(true);
    } catch (err) {
      console.error('Error al abrir TurnoModal:', err);
    }
  };

  // Filtrado reactivo de servicios por categoría y búsqueda
  const filteredServices = useMemo(() => {
    try {
      return SERVICES_DATA.filter((service) => {
        const matchesCategory =
          activeCategory === 'todos' || service.category === activeCategory;
        const matchesSearch =
          searchQuery.trim() === '' ||
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    } catch (err) {
      console.error('Error al filtrar servicios:', err);
      return SERVICES_DATA;
    }
  }, [activeCategory, searchQuery]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
    },
  };

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans overflow-x-hidden selection:bg-[#5A0B22] selection:text-white">

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#FFC9D6] text-[#7A1333] text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Catálogo Completo de Servicios
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#5A0B22] mb-4 leading-tight">
            Servicios diseñados para<br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#D87F95] via-[#A82449] to-[#5A0B22]">
              realzar tu belleza única
            </span>
          </h1>
          <p className="text-[#5A0B22]/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-2">
            Uñas de autor, tratamientos capilares de alta costura, maquillaje profesional y packs especiales.
            Elegí tu servicio y asegurá tu turno en el día y horario que mejor te quede.
          </p>

          {/* Quick Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-8 text-left">
            <div className="bg-white/80 p-3 rounded-2xl border border-[#FFC9D6]/40 shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#5A0B22]">Uñas & Spa</p>
                <p className="text-[#5A0B22]/60">Capping & Esculpidas</p>
              </div>
            </div>

            <div className="bg-white/80 p-3 rounded-2xl border border-[#FFC9D6]/40 shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0">
                <Scissors className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#5A0B22]">Hair Studio</p>
                <p className="text-[#5A0B22]/60">Alisados & Peinados</p>
              </div>
            </div>

            <div className="bg-white/80 p-3 rounded-2xl border border-[#FFC9D6]/40 shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#5A0B22]">MakeUp Pro</p>
                <p className="text-[#5A0B22]/60">Social, Noche & Novias</p>
              </div>
            </div>

            <div className="bg-white/80 p-3 rounded-2xl border border-[#FFC9D6]/40 shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#5A0B22]">Turnos Online</p>
                <p className="text-[#5A0B22]/60">Agendá en 1 minuto</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtros Interactivos & Búsqueda */}
        <div className="mb-10 sm:mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-[#FFC9D6]/60 shadow-sm">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none ${
                      isActive
                        ? 'bg-[#5A0B22] text-[#FFF8FA] shadow-md scale-[1.02]'
                        : 'bg-white text-[#5A0B22]/80 hover:bg-[#FFF0F3] hover:text-[#5A0B22] border border-[#5A0B22]/10'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#7A1333]'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <Search className="w-4 h-4 text-[#7A1333] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar servicio (ej: capping, novia)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-2xl text-xs sm:text-sm text-[#5A0B22] placeholder:text-[#5A0B22]/40 border border-[#FFC9D6] focus:outline-none focus:ring-2 focus:ring-[#5A0B22]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5A0B22]/50 hover:text-[#5A0B22]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Listado Detallado de Servicios */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeCategory + searchQuery}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {filteredServices.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white/70 rounded-3xl border border-[#FFC9D6] p-8">
              <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-[#5A0B22] mb-1">No se encontraron servicios</h3>
              <p className="text-sm text-[#5A0B22]/70 mb-4">Probá buscando con otra palabra o limpiando el filtro.</p>
              <button
                onClick={() => {
                  setActiveCategory('todos');
                  setSearchQuery('');
                }}
                className="px-5 py-2 rounded-full bg-[#5A0B22] text-white text-xs font-bold shadow-sm"
              >
                Ver todos los servicios
              </button>
            </div>
          ) : (
            filteredServices.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  className="bg-white rounded-3xl p-6 border border-[#FFC9D6]/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1333] px-2.5 py-1 rounded-full bg-[#FFF0F3] border border-[#FFC9D6]">
                        {service.categoryLabel}
                      </span>
                      {service.tag && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${service.tagColor}`}>
                          {service.tag}
                        </span>
                      )}
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-bold text-[#5A0B22] leading-snug">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#7A1333] font-semibold mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtitle / Promise */}
                    <p className="text-xs font-medium text-[#7A1333] italic mb-3">
                      “{service.subtitle}”
                    </p>

                    {/* Comprehensive description */}
                    <p className="text-xs sm:text-sm text-[#5A0B22]/80 leading-relaxed mb-5">
                      {service.description}
                    </p>

                    {/* What is included */}
                    <div className="border-t border-[#FFC9D6]/50 pt-4 mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#5A0B22] mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¿Qué incluye el servicio?</span>
                      </p>
                      <ul className="space-y-2">
                        {service.includes.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#5A0B22]/85 leading-snug">
                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions / CTA Buttons */}
                  <div className="pt-4 border-t border-[#FFC9D6]/40 flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => handleOpenTurno(service.turnoService)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#5A0B22] text-[#FFF8FA] hover:bg-[#7A1333] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      <span>Generar Turno</span>
                    </button>
                    
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`¡Hola Melany! Quiero consultar precio y disponibilidad para el servicio de: ${service.name}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#FFF0F3] hover:bg-[#FFC9D6]/50 text-[#7A1333] text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-[#7A1333]" />
                      <span>Consultar por WhatsApp</span>
                    </a>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Sección: Cómo Funciona Tu Turno */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-[#FFC9D6]/70 shadow-sm mb-16">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FFF0F3] text-[#7A1333] text-xs font-bold uppercase tracking-widest mb-2 border border-[#FFC9D6]">
              Agendamiento Fácil & Seguro
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0B22]">
              ¿Cómo agendar tu turno en I'm Chic?
            </h2>
            <p className="text-xs sm:text-sm text-[#5A0B22]/70 mt-2">
              Un proceso simple e instantáneo para que reserves tu lugar sin demoras.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FFF0F3]/60 border border-[#FFC9D6]/40">
              <div className="w-12 h-12 rounded-2xl bg-[#5A0B22] text-[#FFF8FA] flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                1
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#5A0B22] mb-1">Elegí tu Servicio</h4>
              <p className="text-xs text-[#5A0B22]/75 leading-relaxed">
                Navegá nuestro catálogo de Uñas, Cabello, MakeUp o Combos VIP y hacé clic en "Generar Turno".
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FFF0F3]/60 border border-[#FFC9D6]/40">
              <div className="w-12 h-12 rounded-2xl bg-[#5A0B22] text-[#FFF8FA] flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                2
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#5A0B22] mb-1">Fecha y Horario</h4>
              <p className="text-xs text-[#5A0B22]/75 leading-relaxed">
                Seleccioná el día y horario que mejor se adapte a tu agenda con un par de clics.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FFF0F3]/60 border border-[#FFC9D6]/40">
              <div className="w-12 h-12 rounded-2xl bg-[#5A0B22] text-[#FFF8FA] flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                3
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#5A0B22] mb-1">Google Calendar & Wsp</h4>
              <p className="text-xs text-[#5A0B22]/75 leading-relaxed">
                El turno se añade automáticamente a tu calendario personal y se envía la solicitud directa a Melany por WhatsApp.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FFF0F3]/60 border border-[#FFC9D6]/40">
              <div className="w-12 h-12 rounded-2xl bg-[#5A0B22] text-[#FFF8FA] flex items-center justify-center font-bold text-lg mb-3 shadow-md">
                4
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#5A0B22] mb-1">¡Vení a Brillar!</h4>
              <p className="text-xs text-[#5A0B22]/75 leading-relaxed">
                Te esperamos en nuestro estudio para consentirte con el mejor servicio y atención personalizada.
              </p>
            </div>
          </div>
        </section>

        {/* Banner de Garantía y Confianza */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <div className="bg-white/80 p-5 rounded-2xl border border-[#FFC9D6]/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#5A0B22]">Bioseguridad & Esterilización</h4>
              <p className="text-xs text-[#5A0B22]/70 mt-0.5">
                Instrumental esterilizado y protocolos rigurosos de higiene en cada atención.
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-[#FFC9D6]/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#5A0B22]">Cosmética de Alta Gama</h4>
              <p className="text-xs text-[#5A0B22]/70 mt-0.5">
                Productos oficiales Mary Kay, geles hipoalergénicos y termoprotectores de máxima calidad.
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl border border-[#FFC9D6]/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFC9D6] flex items-center justify-center text-[#5A0B22] flex-shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#5A0B22]">Atención 100% Personalizada</h4>
              <p className="text-xs text-[#5A0B22]/70 mt-0.5">
                Cuidamos cada detalle para que tu experiencia en el estudio sea un momento de relax total.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Presupuesto a Medida */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-br from-[#FFF0F3] via-white to-[#FFC9D6]/40 rounded-3xl p-8 sm:p-12 border border-[#FFC9D6] shadow-md"
        >
          <Star className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#5A0B22] mb-3">
            ¿Tenés un evento especial o consulta particular?
          </h2>
          <p className="text-[#5A0B22]/75 mb-6 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Escribime directamente por WhatsApp y armamos un paquete exclusivo que se ajuste a tus horarios y necesidades.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleOpenTurno('')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#5A0B22] text-[#FFF8FA] hover:bg-[#7A1333] text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Generar Mi Turno Ahora</span>
            </button>
            <WhatsAppButton
              phoneNumber={whatsappNumber}
              message="¡Hola Melany! Quisiera pedirte un presupuesto personalizado para mis servicios de belleza."
              open={true}
              size="lg"
              text="Pedir Presupuesto WhatsApp"
            />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[#5A0B22]/10 text-center text-xs sm:text-sm text-[#5A0B22]/60 mt-10 bg-white/40">
        <p>© 2026 I'm Chic By Melany Toledo — Estudio de Belleza Integral & Academia.</p>
        <p className="mt-1 text-[11px] text-[#5A0B22]/40">Yerba Buena / San Miguel de Tucumán, Argentina</p>
      </footer>

      {/* Modal de Generación de Turnos */}
      <TurnoModal
        isOpen={isTurnoOpen}
        onClose={() => setIsTurnoOpen(false)}
        initialService={selectedService}
      />
    </div>
  );
}
