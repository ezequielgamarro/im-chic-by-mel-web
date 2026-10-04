import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/format';
import { buildWhatsAppCheckout, registerOrder } from '../../lib/checkout';

/**
 * Imagen del ítem con fallback accesible.
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
 * Pestaña "Mi Carrito" de /cuenta (Spec 010 T11).
 * Usa la MISMA fuente de verdad que el drawer global (`useCart`), por lo que
 * ambos comparten ítems, cantidades y acciones. Reutiliza la lógica de
 * checkout compartida de `src/lib/checkout.js`.
 */
export default function CartPanel() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    syncError,
  } = useCart();
  const { user } = useAuth();

  const [registering, setRegistering] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSendOrder = useCallback(async () => {
    if (items.length === 0 || registering) return;

    const { message, waLink } = buildWhatsAppCheckout(items, total);
    setNotice(null);

    if (!user) {
      window.open(waLink, '_blank', 'noopener');
      return;
    }

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
    <section aria-labelledby="cart-panel-heading" className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShoppingCart size={20} className="text-[#D4AF37]" aria-hidden="true" />
        <h2 id="cart-panel-heading" className="font-serif text-lg sm:text-xl font-semibold text-[#5A0B22]">
          Mi Carrito
        </h2>
      </div>

      {(syncError || notice) && (
        <div
          role="status"
          className="px-4 py-3 rounded-2xl bg-[#FFF0F3] border border-[#FFC9D6]/60 text-[#7A1333] text-sm flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{notice || syncError}</span>
        </div>
      )}

      {!hasItems ? (
        <div className="premium-card p-10 flex flex-col items-center justify-center text-center text-[#5A0B22]/70">
          <ShoppingCart className="w-14 h-14 mb-4 text-[#7A1333]" aria-hidden="true" />
          <p className="font-medium text-lg text-[#5A0B22]">Tu carrito está vacío</p>
          <p className="text-sm mb-5">Agregá productos para armar tu pedido.</p>
          <Link
            to="/tienda"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="premium-card-soft p-4 flex gap-4"
              >
                <CartItemImage src={item.image} alt={item.name} />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#5A0B22] leading-tight text-sm mb-1 line-clamp-2">
                      {item.name}
                    </h3>
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
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="premium-card p-6">
            <div className="flex justify-between items-center mb-5">
              <span className="text-[#5A0B22]/70 font-medium">Total Estimado</span>
              <span className="font-serif text-3xl font-bold text-[#5A0B22]">
                {formatPrice(total)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSendOrder}
              disabled={registering}
              className="w-full min-h-[44px] py-3.5 rounded-2xl bg-[#5A0B22] hover:bg-[#7A1333] text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#5A0B22]/20 disabled:opacity-70 disabled:cursor-wait focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
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
              className="w-full min-h-[44px] mt-3 py-3 rounded-2xl bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFF0F3] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
            >
              Vaciar carrito
            </button>
            <p className="mt-3 text-center text-xs text-[#5A0B22]/55">
              Tu carrito no se vacía automáticamente al enviar el pedido.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
