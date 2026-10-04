import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ShoppingCart, X, Plus, Minus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/format';
import { buildWhatsAppCheckout, registerOrder } from '../lib/checkout';

/**
 * Imagen del ítem con fallback accesible (evita imágenes rotas en el carrito).
 */
function CartItemImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 p-2 shadow-sm flex items-center justify-center">
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <ShoppingCart className="w-7 h-7 text-[#7A1333]/50" aria-hidden="true" />
      )}
    </div>
  );
}

/**
 * Drawer global del carrito (Spec 010 T4/T9).
 * Consume `useCart` y se monta una sola vez en `main.jsx`, por lo que es
 * accesible desde cualquier ruta. Registra la orden en Supabase para usuarios
 * logueados ANTES de abrir WhatsApp (degradación grácil si las tablas faltan).
 */
export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    syncError,
    isSyncing,
  } = useCart();
  const { user } = useAuth();

  const [registering, setRegistering] = useState(false);
  const [notice, setNotice] = useState(null);

  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);

  // Cierre con Escape + bloqueo de scroll + gestión de foco (RF-07).
  useEffect(() => {
    if (!isOpen) return undefined;

    triggerRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKeyDown);

    // Llevamos el foco al panel al abrir.
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      // Devolvemos el foco al elemento que abrió el drawer.
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, closeCart]);

  const handleSendOrder = useCallback(async () => {
    if (items.length === 0 || registering) return;

    const { message, waLink } = buildWhatsAppCheckout(items, total);
    setNotice(null);

    // Invitado: no se registra nada, solo se abre WhatsApp (RF-22).
    if (!user) {
      window.open(waLink, '_blank', 'noopener');
      return;
    }

    // Abrimos la pestaña de forma síncrona (evita bloqueo de popups) y
    // navegamos recién después de intentar registrar la orden (RF-20).
    const waWindow = window.open('', '_blank');
    if (waWindow) waWindow.opener = null;

    setRegistering(true);
    const { error } = await registerOrder({ user, items, total, message });
    setRegistering(false);
    if (error) setNotice(error);

    if (waWindow && !waWindow.closed) {
      waWindow.location.href = waLink;
    } else {
      window.open(waLink, '_blank', 'noopener');
    }
  }, [items, registering, user, total]);

  const handleClearCart = useCallback(() => {
    setNotice(null);
    clearCart();
  }, [clearCart]);

  const hasItems = items.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden="true"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            key="cart-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col border-l border-[#5A0B22]/10"
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between p-6 border-b border-[#FFF0F3]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#5A0B22]">
                  <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#5A0B22]">Tu Pedido</h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-[#FFF0F3] text-[#5A0B22] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Avisos no bloqueantes de sesión/sincronización */}
            {(syncError || notice) && (
              <div
                role="status"
                className="mx-6 mt-4 px-4 py-3 rounded-2xl bg-[#FFF0F3] border border-[#FFC9D6]/60 text-[#7A1333] text-sm flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{notice || syncError}</span>
              </div>
            )}
            {isSyncing && (
              <p role="status" className="mx-6 mt-3 text-xs text-[#5A0B22]/60 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Sincronizando tu carrito…
              </p>
            )}

            {/* Lista de ítems */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!hasItems ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <ShoppingCart className="w-16 h-16 mb-4 text-[#7A1333]" aria-hidden="true" />
                  <p className="font-medium text-lg">Tu carrito está vacío</p>
                  <p className="text-sm">Agrega productos para armar tu pedido.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-[#FFF0F3]/50 rounded-2xl border border-[#FFC9D6]/30"
                  >
                    <CartItemImage src={item.image} alt={item.name} />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-[#5A0B22] leading-tight text-sm mb-1 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-[#7A1333] font-bold text-sm">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-white rounded-lg border border-[#FFC9D6] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            aria-label={`Quitar una unidad de ${item.name}`}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#FFF0F3] text-[#5A0B22] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <span
                            className="px-2 text-sm font-bold min-w-[28px] text-center"
                            aria-label={`Cantidad: ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label={`Agregar una unidad de ${item.name}`}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[#FFF0F3] text-[#5A0B22] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Eliminar ${item.name} del carrito`}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pie con total y acciones */}
            {hasItems && (
              <div className="p-6 bg-white border-t border-[#FFF0F3] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[#5A0B22]/70 font-medium">Total Estimado</span>
                  <span className="font-serif text-3xl font-bold text-[#5A0B22]">
                    {formatPrice(total)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSendOrder}
                  disabled={registering}
                  className="w-full min-h-[44px] py-4 rounded-2xl bg-[#5A0B22] hover:bg-[#7A1333] text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#5A0B22]/20 disabled:opacity-70 disabled:cursor-wait"
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Registrando…</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      <span>Enviar Pedido por WhatsApp</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="w-full min-h-[44px] mt-3 py-3 rounded-2xl bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFF0F3] transition-colors"
                >
                  Vaciar carrito
                </button>
                <p className="mt-3 text-center text-xs text-[#5A0B22]/55">
                  Tu carrito no se vacía automáticamente al enviar el pedido.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
