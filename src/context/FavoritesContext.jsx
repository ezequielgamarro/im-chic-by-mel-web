import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { isUuid } from '../lib/format';

const FavoritesContext = createContext(null);

/** Códigos de PostgREST/Postgres para "la tabla no existe". */
const TABLE_MISSING_CODES = new Set(['42P01', 'PGRST205']);

/**
 * Provee los favoritos del usuario (requieren sesión).
 * Uso: const { favorites, isFavorite, toggleFavorite, loading, unavailable, error, requiresAuth } = useFavorites();
 *
 * Degradación grácil: si `public.favorites` no existe o falla, se expone
 * `unavailable`/`error` sin lanzar (la tienda sigue operativa).
 * Invitado: `toggleFavorite` no inserta, setea `requiresAuth`.
 */
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  // Auth opcional: sin AuthProvider no se consulta nada y los favoritos quedan
  // en modo invitado (main.jsx garantiza el orden en la app real).
  let auth = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    auth = useAuth();
  } catch {
    auth = null;
  }
  const user = auth?.user ?? null;
  const authLoading = auth?.loading ?? false;

  const favoritesRef = useRef(favorites);
  const uidRef = useRef(null);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  // ---------------------------------------------------------------------------
  // Carga al cambiar la sesión; limpia estado al cerrar sesión.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const uid = user?.id ?? null;
    uidRef.current = uid;

    if (authLoading) return;

    if (!uid) {
      setFavorites([]);
      setUnavailable(false);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error: loadError } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', uid);

      if (cancelled) return;

      if (loadError) {
        const code = loadError.code || loadError.status;
        if (TABLE_MISSING_CODES.has(code)) {
          setUnavailable(true);
          setError(
            'La sección de favoritos todavía no está disponible. Se habilitará al aplicar la migración.'
          );
        } else {
          setError(loadError.message || 'No pudimos cargar tus favoritos.');
        }
        setFavorites([]);
      } else {
        setUnavailable(false);
        setError(null);
        setFavorites(
          (Array.isArray(data) ? data : [])
            .map((row) => row.product_id)
            .filter(Boolean)
        );
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  /**
   * Alterna un favorito con UI optimista y rollback ante error.
   * Sin sesión: no alterna y marca `requiresAuth`.
   */
  const toggleFavorite = useCallback(async (product) => {
    const uid = uidRef.current;
    if (!uid) {
      setRequiresAuth(true);
      return;
    }

    const id = product?.id;
    if (!isUuid(id)) {
      setError(
        'Los productos del catálogo de respaldo no se pueden guardar en favoritos. Probá con los productos publicados en la tienda.'
      );
      return;
    }

    const prev = favoritesRef.current;
    const wasFavorite = prev.includes(id);
    setFavorites(
      wasFavorite ? prev.filter((value) => value !== id) : [...prev, id]
    );
    setError(null);

    try {
      if (wasFavorite) {
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', uid)
          .eq('product_id', id);
        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('favorites')
          .insert({ user_id: uid, product_id: id });
        if (insertError) throw insertError;
      }
    } catch (err) {
      // Rollback del estado optimista.
      setFavorites(prev);
      const code = err?.code || err?.status;
      if (TABLE_MISSING_CODES.has(code)) setUnavailable(true);
      setError(err?.message || 'No pudimos actualizar tus favoritos.');
    }
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites]
  );

  const dismissRequiresAuth = useCallback(() => setRequiresAuth(false), []);

  const value = useMemo(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      loading,
      unavailable,
      error,
      requiresAuth,
      dismissRequiresAuth,
    }),
    [
      favorites,
      isFavorite,
      toggleFavorite,
      loading,
      unavailable,
      error,
      requiresAuth,
      dismissRequiresAuth,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  }
  return ctx;
}

export default FavoritesContext;
