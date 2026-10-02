import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
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
export default function ProductCard({ product, onStockChange }) {
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

        <div className="mt-auto pt-2">
          <StockControls product={product} onStockChange={onStockChange} />
        </div>
      </div>
    </article>
  );
}
