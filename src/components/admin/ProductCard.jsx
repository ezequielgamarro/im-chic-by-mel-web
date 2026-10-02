import React from 'react';
import { Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import StockControls from './StockControls';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

/**
 * Tarjeta de producto del panel: miniatura, título, precio, descripción y
 * controles de stock (+/−).
 */
export default function ProductCard({ product, onStockChange, onEdit, onDelete, deleting }) {
  return (
    <article className="bg-white/90 border border-[#5A0B22]/10 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="aspect-square w-full bg-[#FFC9D6]/30 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon size={32} className="text-[#7A1333]/50" aria-hidden="true" />
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {product.category ? (
          <span className="self-start inline-flex items-center px-2.5 py-1 rounded-full bg-[#FFC9D6]/50 text-[#7A1333] text-xs font-semibold tracking-wide">
            {product.category}
          </span>
        ) : null}

        <h3 className="font-serif text-base sm:text-lg font-semibold leading-snug">
          {product.title}
        </h3>

        <p className="text-[#7A1333] font-bold text-sm">
          {formatPrice(product.price)}
        </p>

        {product.description ? (
          <p className="text-sm text-[#5A0B22]/75 leading-relaxed line-clamp-3">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto pt-2 flex flex-col gap-2">
          <StockControls product={product} onStockChange={onStockChange} />
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
              aria-label={`Editar ${product.title}`}
            >
              <Pencil size={16} className="text-[#7A1333]" aria-hidden="true" />
              <span>Editar</span>
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(product)}
              disabled={deleting}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-[#B91C1C]/30 text-[#B91C1C] font-semibold text-sm hover:bg-[#B91C1C]/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B91C1C]"
              aria-label={`Eliminar ${product.title}`}
            >
              <Trash2 size={16} className="text-[#B91C1C]" aria-hidden="true" />
              <span>{deleting ? 'Eliminando…' : 'Eliminar'}</span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
