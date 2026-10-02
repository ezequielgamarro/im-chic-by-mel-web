import React from 'react';
import ProductCard from './ProductCard';

/**
 * Lista de productos del panel.
 * Grid responsive: 1 columna en móvil, 2 en `sm`, 3 en `lg`.
 */
export default function ProductList({ products, onStockChange }) {
  if (!products || products.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} onStockChange={onStockChange} />
        </li>
      ))}
    </ul>
  );
}
