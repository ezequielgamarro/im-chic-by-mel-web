import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDateEs } from '../../lib/format';

const TABLE_MISSING_CODES = new Set(['42P01', 'PGRST205']);

const STATUS_LABELS = {
  enviado_whatsapp: 'Enviado por WhatsApp',
  confirmado: 'Confirmado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

/**
 * Pestaña "Mis Compras" de /cuenta (Spec 010 T13).
 * Lista las órdenes propias (más recientes primero) con su detalle.
 * Degrada con gracia si las tablas nuevas todavía no existen.
 */
export default function OrdersPanel() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const uid = user?.id;
    if (!uid) {
      setOrders([]);
      setError(null);
      setUnavailable(false);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data, error: loadError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', uid)
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (loadError) {
          const code = loadError.code || loadError.status;
          if (TABLE_MISSING_CODES.has(code)) {
            setUnavailable(true);
            setError('El historial de compras todavía no está disponible.');
          } else {
            setError(loadError.message || 'No pudimos cargar tus compras.');
          }
          setOrders([]);
        } else {
          setUnavailable(false);
          setError(null);
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'No pudimos cargar tus compras.');
        setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <section aria-labelledby="orders-panel-heading" className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Receipt size={20} className="text-[#D4AF37]" aria-hidden="true" />
        <h2 id="orders-panel-heading" className="font-serif text-lg sm:text-xl font-semibold text-[#5A0B22]">
          Mis Compras
        </h2>
      </div>

      {error && (
        <div role="status" className="px-4 py-3 rounded-2xl bg-[#FFF0F3] border border-[#FFC9D6]/60 text-[#7A1333] text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!user ? (
        <div role="status" className="premium-card p-8 text-center text-[#5A0B22]/75">
          <Receipt className="w-12 h-12 mx-auto mb-3 text-[#7A1333]/60" aria-hidden="true" />
          <p className="font-medium text-[#5A0B22] mb-1">Iniciá sesión para ver tus compras</p>
          <p className="text-sm mb-5">Tu historial de pedidos queda guardado en tu cuenta.</p>
          <Link
            to="/login"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            Iniciar sesión
          </Link>
        </div>
      ) : loading ? (
        <p role="status" className="text-sm text-[#5A0B22]/60 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          Cargando tus compras…
        </p>
      ) : unavailable ? (
        <div className="premium-card p-8 text-center text-[#5A0B22]/75">
          <p className="font-medium text-[#5A0B22]">Historial no disponible por ahora</p>
          <p className="text-sm">Se habilitará al aplicar la migración de la base de datos.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="premium-card p-10 flex flex-col items-center justify-center text-center text-[#5A0B22]/70">
          <ShoppingBag className="w-14 h-14 mb-4 text-[#7A1333]/60" aria-hidden="true" />
          <p className="font-medium text-lg text-[#5A0B22]">Todavía no tenés compras</p>
          <p className="text-sm mb-5">Cuando envíes un pedido por WhatsApp aparecerá acá.</p>
          <Link
            to="/tienda"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const orderItems = Array.isArray(order.order_items) ? order.order_items : [];
            const statusLabel = STATUS_LABELS[order.status] || order.status;
            return (
              <article key={order.id} className="premium-card p-5">
                <header className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#5A0B22]/50 font-semibold">
                      Pedido
                    </p>
                    <time dateTime={order.created_at} className="text-sm font-semibold text-[#5A0B22]">
                      {formatDateEs(order.created_at)}
                    </time>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#FFC9D6]/60 text-[#7A1333] text-xs font-bold">
                    {statusLabel}
                  </span>
                </header>

                <ul className="divide-y divide-[#FFF0F3] mb-3">
                  {orderItems.length === 0 ? (
                    <li className="py-2 text-sm text-[#5A0B22]/60">Sin detalle de ítems.</li>
                  ) : (
                    orderItems.map((item) => (
                      <li key={item.id} className="py-2 flex items-start justify-between gap-3 text-sm">
                        <span className="text-[#5A0B22]">
                          <span className="font-semibold">{item.product_name}</span>
                          <span className="text-[#5A0B22]/60"> × {item.quantity}</span>
                        </span>
                        <span className="text-[#7A1333] font-semibold whitespace-nowrap">
                          {formatPrice(item.unit_price)} c/u
                        </span>
                      </li>
                    ))
                  )}
                </ul>

                <footer className="flex items-center justify-between pt-3 border-t border-[#FFF0F3]">
                  <span className="text-sm text-[#5A0B22]/70">Total</span>
                  <span className="font-serif text-xl font-bold text-[#5A0B22]">
                    {formatPrice(order.total)}
                  </span>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
