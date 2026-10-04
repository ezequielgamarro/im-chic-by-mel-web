import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/format';
import { mapProduct } from '../../../MaryKayStore.jsx';

const TABLE_MISSING_CODES = new Set(['42P01', 'PGRST205']);

/**
 * Imagen del favorito con fallback.
 */
function FavoriteImage({ src, alt }) {
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
        <Heart className="w-7 h-7 text-[#7A1333]/40" aria-hidden="true" />
      )}
    </div>
  );
}

/**
 * Pestaña "Favoritos" de /cuenta (Spec 010 T12).
 * Carga `favorites` con join a `products`, reusa el mapeo de la tienda
 * (`mapProduct`) y permite agregar al carrito o quitar el favorito.
 * Requiere sesión (invitado ve un aviso con link a /login).
 */
export default function FavoritesPanel() {
  const { user } = useAuth();
  const { favorites, toggleFavorite, loading: favoritesLoading, unavailable: favoritesUnavailable } = useFavorites();
  const { addToCart } = useCart();

  const [productsById, setProductsById] = useState({});
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const uid = user?.id;
    if (!uid) {
      setProductsById({});
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
          .from('favorites')
          .select('product_id, created_at, products(*)')
          .eq('user_id', uid)
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (loadError) {
          const code = loadError.code || loadError.status;
          if (TABLE_MISSING_CODES.has(code)) {
            setUnavailable(true);
            setError('La sección de favoritos todavía no está disponible.');
          } else {
            setError(loadError.message || 'No pudimos cargar tus favoritos.');
          }
          setProductsById({});
        } else {
          setUnavailable(false);
          setError(null);
          const map = {};
          (Array.isArray(data) ? data : []).forEach((row) => {
            if (!row?.product_id) return;
            map[row.product_id] = row.products
              ? mapProduct(row.products)
              : {
                  id: row.product_id,
                  name: 'Producto no disponible',
                  category: 'Productos',
                  description: '',
                  image: '',
                  badge: '',
                  price: 0,
                  stock: 0,
                };
          });
          setProductsById(map);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'No pudimos cargar tus favoritos.');
        setProductsById({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Los ids vienen de FavoritesContext (fuente de verdad del estado global).
  const items = useMemo(
    () =>
      favorites
        .map((id) => productsById[id])
        .filter(Boolean),
    [favorites, productsById]
  );

  const isUnavailable = unavailable || favoritesUnavailable;
  const isLoading = loading || favoritesLoading;

  if (!user) {
    return (
      <section aria-labelledby="favorites-panel-heading" className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-[#D4AF37]" aria-hidden="true" />
          <h2 id="favorites-panel-heading" className="font-serif text-lg sm:text-xl font-semibold text-[#5A0B22]">
            Favoritos
          </h2>
        </div>
        <div role="status" className="premium-card p-8 text-center text-[#5A0B22]/75">
          <Heart className="w-12 h-12 mx-auto mb-3 text-[#7A1333]/60" aria-hidden="true" />
          <p className="font-medium text-[#5A0B22] mb-1">Iniciá sesión para guardar favoritos</p>
          <p className="text-sm mb-5">Tus productos favoritos se guardan en tu cuenta.</p>
          <Link
            to="/login"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="favorites-panel-heading" className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Heart size={20} className="text-[#D4AF37]" aria-hidden="true" />
        <h2 id="favorites-panel-heading" className="font-serif text-lg sm:text-xl font-semibold text-[#5A0B22]">
          Favoritos
        </h2>
      </div>

      {error && (
        <div role="status" className="px-4 py-3 rounded-2xl bg-[#FFF0F3] border border-[#FFC9D6]/60 text-[#7A1333] text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <p role="status" className="text-sm text-[#5A0B22]/60 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          Cargando favoritos…
        </p>
      ) : isUnavailable ? (
        <div className="premium-card p-8 text-center text-[#5A0B22]/75">
          <p className="font-medium text-[#5A0B22]">Favoritos no disponible por ahora</p>
          <p className="text-sm">Se habilitará al aplicar la migración de la base de datos.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="premium-card p-10 flex flex-col items-center justify-center text-center text-[#5A0B22]/70">
          <Heart className="w-14 h-14 mb-4 text-[#7A1333]/60" aria-hidden="true" />
          <p className="font-medium text-lg text-[#5A0B22]">Todavía no tenés favoritos</p>
          <p className="text-sm mb-5">Tocá el corazón en los productos de la tienda para guardarlos acá.</p>
          <Link
            to="/tienda"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((product) => (
            <div key={product.id} className="premium-card-soft p-4 flex flex-col gap-3">
              <div className="flex gap-3">
                <FavoriteImage src={product.image} alt={product.name} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#5A0B22] leading-tight text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-[#7A1333] font-bold text-sm">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#5A0B22] hover:bg-[#7A1333] text-white font-bold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
                >
                  <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                  <span>Agregar al carrito</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  aria-label={`Quitar ${product.name} de favoritos`}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-2 rounded-xl bg-white border border-[#5A0B22]/15 text-[#7A1333] hover:bg-[#FFF0F3] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
                >
                  <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span className="sr-only">Quitar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
