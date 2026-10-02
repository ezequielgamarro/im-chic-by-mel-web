import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * Controles de stock (+/−) por producto (tarea T9, RF-3).
 *
 * Estrategia de actualización elegida: UPDATE optimista con rollback.
 *  - Al tocar "+" o "−" se refleja el nuevo stock en la UI de inmediato
 *    (vía `onStockChange` hacia el estado de AdminPage), sin esperar la red.
 *  - Luego se persiste con `supabase.from('products').update({ stock }).eq('id', id)`.
 *  - Si la actualización falla, se revierte al valor anterior y se muestra un
 *    mensaje accesible.
 *  - El botón "−" se deshabilita en `stock === 0` (nunca negativo) y mientras hay
 *    una operación en curso, para evitar dobles envíos y condiciones de carrera
 *    dentro del mismo cliente.
 *
 * Nota: un incremento 100% atómico a nivel de base requeriría una función RPC
 * (p. ej. `increment_stock`) con su migración SQL, fuera del alcance de T9
 * (frontend). Para un panel de un único admin, el UPDATE optimista es simple y
 * suficiente; la restricción `CHECK (stock >= 0)` de la tabla da una red de
 * seguridad extra en el backend.
 */
export default function StockControls({ product, onStockChange }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const stock = Number(product.stock) || 0;

  const adjust = async (delta) => {
    const next = stock + delta;
    if (next < 0 || saving) return;

    setSaving(true);
    setError('');

    // Optimista: actualiza la UI de inmediato.
    onStockChange?.(product.id, next);

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: next })
      .eq('id', product.id);

    if (updateError) {
      // Rollback visual al valor previo.
      onStockChange?.(product.id, stock);
      setError('No pudimos actualizar el stock. Reintentá.');
    }

    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#5A0B22]/70">Stock</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjust(-1)}
            disabled={stock === 0 || saving}
            aria-label={`Restar 1 al stock de ${product.title}`}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full border border-[#5A0B22]/25 text-[#7A1333] hover:bg-[#FFC9D6]/30 active:scale-95 transition disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1333]"
          >
            <Minus size={20} aria-hidden="true" />
          </button>

          <span
            className="min-w-[2.5rem] text-center text-lg font-bold text-[#5A0B22]"
            aria-live="polite"
          >
            {stock}
          </span>

          <button
            type="button"
            onClick={() => adjust(1)}
            disabled={saving}
            aria-label={`Sumar 1 al stock de ${product.title}`}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white hover:shadow-lg active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-xs font-medium text-[#B91C1C]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
