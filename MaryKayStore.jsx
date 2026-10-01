import Navbar from "./src/components/Navbar";
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Eye,
  Smile,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  HeartHandshake,
  Palette,
  Menu,
  X,
  Camera,
  Check,
  ShoppingBag,
  Droplets,
  Star,
  Gift,
  ShoppingCart,
  Trash2,
  Search,
  Plus,
  Minus
} from 'lucide-react';
import WhatsAppButton from './src/components/WhatsAppButton';
import SparkleButton from './src/components/SparkleButton';
import InstagramButton from './src/components/InstagramButton';

// Imágenes de Productos Mary Kay
import imgTwAvanzado from './src/assets/img/Productos/img-TW-avanzado.jpg';
import imgTwCleanser from './src/assets/img/Productos/J2008051-UNL-GB-024-TW-4-1-Cleanser-HiRes.jpg';
import imgTwMoisturizer from './src/assets/img/Productos/J2008051-UNL-GB-021-TW-Antioxidant-Moisturizer-HiRes.jpg';
import imgProtectorSolar from './src/assets/img/Productos/10237288_ProtectorSolardeAmplioEspectroFPS50.jpg';
import imgMascarillaCarbon from './src/assets/img/Productos/10094148.jpg';
import imgSatinLips from './src/assets/img/Productos/10094714 Satin Lips Lip Balm.jpg';
import imgPolvoTraslucido from './src/assets/img/Productos/168609-002-TranslucentLoosePowder-NOBRUSH-Hi-Res.jpg';
import imgCheekDuos from './src/assets/img/Productos/J2001928-UNL-LA-586-AT-PLAY-CHEEK-DUOS-2-SOLDIER-CLOSED-DESERT-SUN-BRONZER-HiRes.jpg';
// Nuevas imágenes agregadas
import imgTwRepairPeel from './src/assets/img/Productos/10088897.jpg';
import imgSombraDuoPlum from './src/assets/img/Productos/2d0de4b3be451cc9bb4bf36a4e6456f5.jpg';
import imgEsponjaBlending from './src/assets/img/Productos/799909-UNL-GB-310-QSM-04-19-Brush-BlendingSponge-Hi-Res.jpg';
import imgSatinLipsScrub from './src/assets/img/Productos/GM_300283_SatinLips_SugarScrub.jpg';
import imgTwNightRecovery from './src/assets/img/Productos/J2008051-UNL-GB-014-TW-Nighttime-Recovery-HiRes.jpg';
import imgClearBrowGel from './src/assets/img/Productos/J2009225-UNL-GB-102-MaryKay-Clear-Brow-Gel-HiRes.jpg';
import imgSombraDuoPinkChampagne from './src/assets/img/Productos/f3abfa5c58d3abd4f876731ed443a5c9.jpg';
import imgSombraMoonstone from './src/assets/img/Productos/ac59f7a943fc459f05563057e90ecedd.jpg';
import imgSombraSmokeyQuartz from './src/assets/img/Productos/ba7be96122c1306ce863b974828982dd.jpg';
import imgProtectorSolarMineral30 from './src/assets/img/Productos/bae5ab5cc46d47e4f913516f821e948b.jpg';
import imgPerfilMaryKay from './src/assets/img/perfil mary kay2.png';

/**
 * Componente ImageWithFallback
 */
function ImageWithFallback({ src, alt, className, containerClassName = "w-full h-full", placeholderIcon: PlaceholderIcon = Camera, placeholderLabel = "Imagen" }) {
  const [error, setError] = useState(false);

  if (error && placeholderLabel === "Logo") {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#5A0B22] to-[#7A1333] text-white shadow-md border border-[#D4AF37]/30 ${containerClassName}`}>
        <span className="font-serif font-bold text-sm tracking-widest text-[#F7E7B4]">MK</span>
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

// Catálogo oficial de productos con imágenes reales de stock
const products = [
  {
    id: 1,
    name: "Set Milagroso TimeWise 3D® Avanzado",
    category: "Cuidado de la Piel",
    description: "Rutina completa antiedad con complejo TimeWise 3D®. Defiende contra el daño ambiental, demora los signos visibles de la edad y revitaliza el rostro. Disponible para piel combinada a grasa o normal a seca ",
    image: imgTwAvanzado,
    icon: Droplets,
    badge: "Más Vendido",
    price: 226350,
  },
  {
    id: 2,
    name: "Limpiador Facial 4 en 1 TimeWise®",
    category: "Cuidado de la Piel",
    description: "Limpia en profundidad, exfolia suavemente, refresca e ilumina en un solo paso esencial. Prepara la piel para absorber mejor la hidratación. Disponible para piel combinada a grasa o normal a seca.",
    image: imgTwCleanser,
    icon: Droplets,
    badge: "",
    price: 43300,
  },
  {
    id: 3,
    name: "Humectante Antioxidante TimeWise®",
    category: "Cuidado de la Piel",
    description: "Fórmula ligera que ayuda a reducir la apariencia de finas líneas y mejora la firmeza de la piel, manteniéndola hidratada durante 12 horas. Disponible para piel combinada a grasa o normal a seca.",
    image: imgTwMoisturizer,
    icon: Droplets,
    badge: "Hidratación 12h",
    price: 55500,
  },
  {
    id: 4,
    name: "Protector Solar Facial FPS 50 Amplio Espectro",
    category: "Cuidado de la Piel",
    description: "Defensa solar avanzada contra rayos UVA y UVB. Textura liviana, rápida absorción, acabado no grasoso y resistente al agua.",
    image: imgProtectorSolar,
    icon: ShieldCheck,
    badge: "Protección Total",
    price: 63000,
  },
  {
    id: 5,
    name: "Mascarilla de Limpieza Profunda con Carbón Clear Proof™",
    category: "Cuidado de la Piel",
    description: "Ayuda a remover impurezas que obstruyen los poros y absorbe la grasa al instante, disminuye el brillo y reduce la apariencia de los poros.",
    image: imgMascarillaCarbon,
    icon: Sparkles,
    badge: "Detox Profundo",
    price: 35000,
  },
  {
    id: 6,
    name: "Crema humectante para labios con Karité Satin Lips®.",
    category: "Labios",
    description: "Tratamiento intensivo con manteca de karité pura que nutre, revive y calma los labios secos dejándolos sedosos.",
    image: imgSatinLips,
    icon: Smile,
    badge: "Humectación Intensa",
    price: 19800,
  },
  {
    id: 7,
    name: "Polvo Suelto Traslúcido Mary Kay®",
    category: "Maquillaje",
    description: "Fórmula translúcida ultraligera e invisible para todo tipo de piel. Fija el maquillaje y controla el brillo todo el día.",
    image: imgPolvoTraslucido,
    icon: Sparkles,
    badge: "",
    price: 37000,
  },
  {
    id: 8,
    name: "Dúo de Bronceador Mary Kay At Play® - Desert Sun",
    category: "Maquillaje",
    description: "Polvo ultrafino de alta pigmentación con dúo de bronceadores. Permite esculpir y dar un brillo saludable al rostro.",
    image: imgCheekDuos,
    icon: Palette,
    badge: "",
    price: 28200,
  },
  {
    id: 9,
    name: "TimeWise Repair\u00ae Peeling Facial Revealing Radiance",
    category: "Cuidado de la Piel",
    description: "Peeling suave de uso semanal que renueva la superficie de la piel, borra el da\u00f1o acumulado y revela un rostro notablemente m\u00e1s luminoso, uniforme y juvenil desde la primera aplicaci\u00f3n.",
    image: imgTwRepairPeel,
    icon: Sparkles,
    badge: "Renovaci\u00f3n Celular",
    price: 84200,
  },
  {
    id: 10,
    name: "Crema de Recuperaci\u00f3n Nocturna TimeWise\u00ae",
    category: "Cuidado de la Piel",
    description: "F\u00f3rmula de noche con microcápsulas activas que trabajan mientras dorm\u00eds: hidrata en profundidad, combate las finas l\u00edneas y restaura el aspecto descansado y radiante de tu piel al despertar.",
    image: imgTwNightRecovery,
    icon: Droplets,
    badge: "Acci\u00f3n Nocturna",
    price: 61900,
  },
  {
    id: 11,
    name: "Protector Solar Mineral FPS 30 Amplio Espectro",
    category: "Cuidado de la Piel",
    description: "F\u00f3rmula mineral liviana con FPS 30 de amplio espectro. Ideal para uso diario, no deja residuo blanco y es apta para pieles sensibles.",
    image: imgProtectorSolarMineral30,
    icon: ShieldCheck,
    badge: "Mineral & Suave",
    price: 51500,
  },
  {
    id: 12,
    name: "Exfoliante Labial Satin Lips\u00ae Shea Sugar Scrub",
    category: "Labios",
    description: "Exfoliante para labios con karit\u00e9 que elimina células muertas, suaviza y afina los labios en minutos. Aroma a t\u00e9 blanco y c\u00edtricos.",
    image: imgSatinLipsScrub,
    icon: Smile,
    badge: "",
    price: 19800,
  },
  {
    id: 13,
    name: "Gel Transparente para Cejas Clear Brow\u00ae Mary Kay",
    category: "Maquillaje",
    description: "Fija y define tus cejas durante todo el d\u00eda con un acabado natural y limpio. De larga duraci\u00f3n, no se siente n\u00ed r\u00edgido ni pegajoso. Transparente, apto para cualquier tono de cabello.",
    image: imgClearBrowGel,
    icon: Eye,
    badge: "",
    price: 21000,
  },
  {
    id: 14,
    name: "Sombra D\u00fao Mary Kay At Play\u00ae - Plum and Papaya",
    category: "Maquillaje",
    description: "D\u00fao de sombras de ojos con pigmentaci\u00f3n intensa y acabado satinado. El tono Papaya c\u00e1lido y el Plum profundo para crear looks del d\u00eda a la noche.",
    image: imgSombraDuoPlum,
    icon: Palette,
    badge: "Tendencia",
    price: 17200,
  },
  {
    id: 15,
    name: "Sombra D\u00fao Mary Kay At Play\u00ae - Pink Champagne",
    category: "Maquillaje",
    description: "D\u00fao de sombras luminosas con acabado brillante. Tonos champagne dorado y rosa polvo para un look radiante e iluminado. Larga duraci\u00f3n y alta pigmentaci\u00f3n.",
    image: imgSombraDuoPinkChampagne,
    icon: Palette,
    badge: "",
    price: 17200,
  },
  {
    id: 16,
    name: "Sombra Individual Mary Kay\u00ae - Moonstone",
    category: "Maquillaje",
    description: "Sombra de acabado luminoso en tono Moonstone dorado rosado. Polvo ultrafino de alta adherencia, perfecta para iluminar el arco de las cejas o el lagrimal.",
    image: imgSombraMoonstone,
    icon: Palette,
    badge: "",
    price: 13500,
  },
  {
    id: 17,
    name: "Sombra Individual Mary Kay\u00ae - Smokey Quartz",
    category: "Maquillaje",
    description: "Sombra en tono tostado neutro con acabado luminoso. Vers\u00e1til y apta para todo tipo de ojos, ideal para el crease o como transici\u00f3n. Se difumina con facilidad.",
    image: imgSombraSmokeyQuartz,
    icon: Palette,
    badge: "",
    price: 13500,
  },
  {
    id: 18,
    name: "Esponja Blending Mary Kay\u00ae",
    category: "Accesorios",
    description: "Esponja profesional para difuminar bases, correctores y polvos con acabado impecable. Su forma en punta alcanza el contorno de la nariz y el rabillo del ojo.",
    image: imgEsponjaBlending,
    icon: Camera,
    badge: "",
    price: 15200,
  },
];

// Helper de formato de moneda
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
};

/**
 * Componente ProductCard
 * Tarjeta de producto con toggle interactivo 'Ver más... / Ver menos' para la descripción
 */
function ProductCard({ product, addToCart, formatPrice }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = product.icon;
  const isLongDescription = product.description && product.description.length > 80;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#FFC9D6]/30 flex flex-col justify-between group hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-5 bg-[#FFF0F3]/50 p-6 flex items-center justify-center">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          placeholderIcon={Icon}
          placeholderLabel={product.name}
        />
        {product.badge && (
          <div className="absolute top-3 left-3 bg-[#D4AF37] text-[#5A0B22] text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
            {product.badge}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-[#7A1333] tracking-wider block">
              {product.category}
            </span>
            <span className="font-bold text-[#5A0B22] bg-[#FFF0F3] px-2 py-0.5 rounded text-sm">
              {formatPrice(product.price)}
            </span>
          </div>

          <h3 className="font-serif text-xl font-bold text-[#5A0B22] leading-tight mb-2">
            {product.name}
          </h3>

          <div className="mb-4">
            <p className={`text-sm text-[#5A0B22]/75 leading-relaxed transition-all duration-200 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {product.description}
            </p>
            {isLongDescription && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1333] hover:text-[#5A0B22] mt-1.5 transition-colors focus:outline-none group/toggle cursor-pointer select-none"
              >
                <span className="underline decoration-[#7A1333]/30 underline-offset-2 group-hover/toggle:decoration-[#5A0B22]">
                  {isExpanded ? 'Ver menos' : 'Ver más...'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#5A0B22]' : 'text-[#7A1333]'
                    }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#FFF0F3] mt-auto">
        <button
          onClick={() => addToCart(product)}
          className="w-full py-3 rounded-xl bg-white border-2 border-[#5A0B22] hover:bg-[#5A0B22] text-[#5A0B22] hover:text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Agregar al carrito</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function MaryKayStore() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const whatsappNumber = "5493813553492";

  // Lógica del Carrito
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const generateWhatsAppCheckoutLink = () => {
    if (cart.length === 0) return `https://wa.me/${whatsappNumber}`;

    let message = `¡Hola Melany! Te escribo desde tu tienda web. Quiero realizar el siguiente pedido:\n\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}\n`;
    });

    message += `\n*Total estimado:* ${formatPrice(cartTotal)}\n\n`;
    message += `Por favor, confirmame disponibilidad y métodos de pago. ¡Gracias!`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
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

  const categories = useMemo(() => {
    return ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans selection:bg-[#5A0B22] selection:text-white relative overflow-x-hidden">

      {/* Sidebar del Carrito */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col border-l border-[#5A0B22]/10"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#FFF0F3]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#5A0B22]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#5A0B22]">Tu Pedido</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-[#FFF0F3] rounded-full transition-colors text-[#5A0B22]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <ShoppingCart className="w-16 h-16 mb-4 text-[#7A1333]" />
                    <p className="font-medium text-lg">Tu carrito está vacío</p>
                    <p className="text-sm">Agrega productos para armar tu pedido.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-[#FFF0F3]/50 rounded-2xl border border-[#FFC9D6]/30">
                      <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 p-2 shadow-sm">
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-contain" placeholderLabel="Item" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-[#5A0B22] leading-tight text-sm mb-1 line-clamp-2">{item.name}</h4>
                          <p className="text-[#7A1333] font-bold text-sm">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-white rounded-lg border border-[#FFC9D6] overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 hover:bg-[#FFF0F3] text-[#5A0B22] transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="px-2 text-xs font-bold min-w-[24px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 hover:bg-[#FFF0F3] text-[#5A0B22] transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-[#FFF0F3] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[#5A0B22]/70 font-medium">Total Estimado</span>
                    <span className="font-serif text-3xl font-bold text-[#5A0B22]">{formatPrice(cartTotal)}</span>
                  </div>
                  <a
                    href={generateWhatsAppCheckoutLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-4 rounded-2xl bg-[#5A0B22] hover:bg-[#7A1333] text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#5A0B22]/20 group"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span>Enviar Pedido por WhatsApp</span>
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-13 h-13 sm:w-16 sm:h-16 bg-[#5A0B22] rounded-full shadow-[0_10px_30px_rgba(90,11,34,0.4)] flex items-center justify-center text-white border-2 border-white/20 transition-all cursor-pointer"
        aria-label="Abrir carrito de compras"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
          <AnimatePresence>
            {cartItemCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-3 min-w-[22px] h-[22px] bg-[#D4AF37] text-[#5A0B22] rounded-full text-xs font-bold flex items-center justify-center px-1.5 shadow-sm border-2 border-[#5A0B22]"
              >
                {cartItemCount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section id="inicio" className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-gradient-to-b from-[#FFF0F3] to-white">
          <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-[#FFC9D6]/30 rounded-full filter blur-[80px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full filter blur-[80px] -z-10 pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-start text-left"
              >
                <motion.div variants={itemFadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#FFC9D6] text-[#7A1333] text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                  <Star className="w-3.5 h-3.5" />
                  <span>Alta Cosmética & Skincare</span>
                </motion.div>

                <motion.h1
                  variants={itemFadeUp}
                  className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#5A0B22] mb-5 sm:mb-6 leading-[1.1] sm:leading-[1.05]"
                >
                  Tu Belleza, <br /><span className="text-[#7A1333]">Elevada.</span>
                </motion.h1>

                <motion.p variants={itemFadeUp} className="text-sm sm:text-base md:text-lg text-[#5A0B22]/80 font-medium mb-6 sm:mb-8 max-w-lg leading-relaxed">
                  Descubrí la línea completa de productos Mary Kay.
                  Armá tu pedido fácilmente desde aquí y finalizá la compra directo por WhatsApp.
                </motion.p>

                <motion.div variants={itemFadeUp} className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                  <a
                    href="#tienda"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-2xl bg-[#5A0B22] text-white font-bold hover:bg-[#7A1333] transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Ver Tienda</span>
                  </a>
                  <a
                    href="#asesoria"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-2xl bg-white text-[#5A0B22] font-bold border border-[#FFC9D6] hover:bg-[#FFF0F3] transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <HeartHandshake className="w-5 h-5 text-[#7A1333]" />
                    <span>Asesoría Gratis</span>
                  </a>
                </motion.div>

                <motion.div variants={itemFadeUp} className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#5A0B22] font-semibold">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span>100% Satisfacción</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                    <span>Envíos Seguros</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative flex justify-center md:justify-end w-full"
              >
                <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-2 sm:border-4 border-white bg-[#FFF0F3]">
                  <ImageWithFallback
                    src={imgPerfilMaryKay}
                    alt="Melany Toledo - Consultora de Belleza Mary Kay"
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                    placeholderLabel="Consultora de Belleza"
                  />
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-md shadow-lg">
                    <p className="font-serif font-bold text-[#5A0B22] text-base sm:text-lg leading-tight mb-0.5 sm:mb-1">
                      Consultora de Belleza
                    </p>
                    <p className="text-xs text-[#7A1333] font-semibold">Melany Toledo</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TIENDA DE PRODUCTOS */}
        <section id="tienda" className="py-20 bg-white relative scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            <div className="text-center max-w-2xl mx-auto mb-10">

              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#5A0B22] mb-4">
                Tienda Mary Kay
              </h2>
              <p className="text-[#5A0B22]/70 font-medium">
                Agregá tus favoritos al carrito y envíanos tu pedido por WhatsApp de forma rápida y sencilla.
              </p>
            </div>

            {/* Buscador de Productos */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A1333]" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar producto (ej: labial, TimeWise)..."
                  aria-label="Buscar productos"
                  className="w-full min-h-[44px] pl-12 pr-14 py-3.5 rounded-full bg-[#FFF0F3] border border-[#FFC9D6] text-sm text-[#5A0B22] placeholder:text-[#5A0B22]/50 focus:outline-none focus:ring-2 focus:ring-[#5A0B22]/20 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#5A0B22]/60 hover:text-[#5A0B22] hover:bg-[#FFC9D6]/50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === category
                    ? 'bg-[#5A0B22] text-white shadow-md'
                    : 'bg-[#FFF0F3] text-[#5A0B22] hover:bg-[#FFC9D6]'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Grid de Productos */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addToCart={addToCart}
                    formatPrice={formatPrice}
                  />
                ))}
              </AnimatePresence>
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <Search className="w-10 h-10 text-[#D87F95] mx-auto mb-3" aria-hidden="true" />
                  <p className="font-serif text-xl font-bold text-[#5A0B22] mb-1">No encontramos productos</p>
                  <p className="text-sm text-[#5A0B22]/70">Probá con otra palabra o cambiá de categoría.</p>
                </div>
              )}
            </motion.div>

            {/* CTA Final Tienda */}
            <div className="mt-16 text-center">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("¡Hola Melany! Quiero ver el catálogo digital completo de Mary Kay.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFF0F3] text-[#5A0B22] font-bold border border-[#FFC9D6] hover:bg-[#FFC9D6] transition-all shadow-sm"
              >
                <span>Solicitar Catálogo Completo (PDF)</span>
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

          </div>
        </section>

        {/* ASESORIA / CONSULTA */}
        <section id="asesoria" className="py-20 bg-[#5A0B22] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-5" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">

            <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
              <HeartHandshake className="w-8 h-8 text-[#FFC9D6]" />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-6">
              ¿No sabes qué necesita tu piel?
            </h2>
            <p className="text-lg text-[#FFC9D6] mb-10 max-w-2xl mx-auto leading-relaxed">
              Como Consultora de Belleza Mary Kay, mi misión no es solo venderte un producto, sino enseñarte a cuidarte. Escribime y hacemos un diagnóstico gratuito de tu piel.
            </p>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("¡Hola Melany! Quiero aprovechar la asesoría gratuita para conocer mi tipo de piel y los productos ideales.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#5A0B22] font-bold text-lg hover:scale-105 transition-transform shadow-xl"
            >
              <HeartHandshake className="w-6 h-6 text-[#7A1333]" />
              <span>Diagnóstico Gratis por WhatsApp</span>
            </a>

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
