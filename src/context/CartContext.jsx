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

const CartContext = createContext(null);

/** Clave de persistencia local del carrito (unificada con los legales). */
const STORAGE_KEY = 'imchic_cart';
/** Clave legada que se migra una única vez de forma transparente. */
const LEGACY_STORAGE_KEY = 'cart';

/** Códigos de error de PostgREST/Postgres para "la tabla no existe". */
const TABLE_MISSING_CODES = new Set(['42P01', 'PGRST205']);

/**
 * Normaliza un ítem leído de localStorage para asegurar campos mínimos.
 */
const normalizeItem = (item) => {
  if (!item || item.id === undefined || item.id === null) return null;
  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
  const price = Number(item.price);
  return { ...item, quantity, price: Number.isFinite(price) ? price : 0 };
};

/**
 * Lee y parsea un carrito desde localStorage sin lanzar.
 */
const readStoredCart = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeItem).filter(Boolean);
  } catch {
    return [];
  }
};

const writeStoredCart = (key, items) => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* almacenamiento no disponible: se ignora silenciosamente */
  }
};

/**
 * Clave del marcador de dueño del carrito espejo.
 * Guarda el `user.id` del último dueño logueado y NO se borra al cerrar sesión:
 * permite distinguir un carrito "espejo" (exportado desde cart_items) de un
 * carrito de invitado genuino y evitar el doble conteo al re-loguear.
 */
const CART_OWNER_KEY = 'imchic_cart_owner';

const readOwner = () => {
  try {
    return localStorage.getItem(CART_OWNER_KEY);
  } catch {
    return null;
  }
};

const setOwner = (uid) => {
  try {
    if (uid) localStorage.setItem(CART_OWNER_KEY, String(uid));
  } catch {
    /* ignore */
  }
};

const clearOwner = () => {
  try {
    localStorage.removeItem(CART_OWNER_KEY);
  } catch {
    /* ignore */
  }
};

/**
 * Reconstruye la forma de producto que usa la tienda a partir de una fila
 * `public.products` traída por la relación `cart_items.product_id`.
 */
const mapRemoteProduct = (row, fallbackId) => ({
  id: row?.id ?? fallbackId,
  name: row?.title ?? 'Producto',
  category: row?.category ?? 'Productos',
  description: row?.description ?? '',
  image: row?.image_url ?? '',
  badge: row?.badge ?? '',
  price: Number(row?.price) || 0,
  stock: Number(row?.stock) || 0,
});

/**
 * Provee el carrito global y persistente de la tienda.
 * Uso: const { items, addToCart, ... } = useCart();
 *
 * Persistencia:
 *  - Invitado  → localStorage `imchic_cart` (migra una vez desde `cart`).
 *  - Logueado  → `public.cart_items` es la fuente de verdad, pero el carrito
 *    COMPLETO se conserva además en `localStorage` (nunca se recorta, RF-10/11),
 *    de modo que un merge fallido no pierde datos.
 *  - Detección de espejo: mientras hay sesión se marca `imchic_cart_owner` con
 *    el `user.id`. Al loguear, si el marcador coincide, el remoto es la fuente
 *    de verdad y NO se suman cantidades de los UUID ya presentes en remoto
 *    (se seedean los ausentes). Si no coincide (invitado genuino), se suman.
 *  - Solo se envían a Supabase los ids UUID; los productos del catálogo de
 *    respaldo (ids numéricos 1..31) quedan local-only (RF-14).
 *
 * Degradación grácil: si `cart_items` no existe o falla, se expone `syncError`
 * y el carrito sigue operando en local (RF-13).
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth es opcional en el contrato de este módulo: si no hay AuthProvider,
  // el carrito sigue funcionando como invitado (main.jsx garantiza el orden).
  let auth = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    auth = useAuth();
  } catch {
    auth = null;
  }
  const user = auth?.user ?? null;
  const authLoading = auth?.loading ?? false;

  // Refs para leer el estado actual dentro de callbacks/efectos sin re-suscribir.
  const itemsRef = useRef(items);
  const uidRef = useRef(null);
  const syncUserIdRef = useRef(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    uidRef.current = user?.id ?? null;
  }, [user?.id]);

  /**
   * Traduce un error a un mensaje no bloqueante en `syncError`.
   */
  const handleSyncError = useCallback((err) => {
    const code = err?.code || err?.status;
    if (TABLE_MISSING_CODES.has(code)) {
      setSyncError(
        'Las funciones de carrito en la nube todavía no están disponibles. Guardamos tu carrito en este dispositivo.'
      );
    } else if (code === '23503') {
      setSyncError(
        'Algún producto de tu carrito ya no está disponible en la tienda y no pudo sincronizarse.'
      );
    } else {
      setSyncError(
        err?.message ||
          'No pudimos sincronizar tu carrito. Se seguirá guardando en este dispositivo.'
      );
    }
  }, []);

  /**
   * Ejecuta una operación Supabase capturando el error y aplicando rollback
   * opcional del estado optimista.
   */
  const runSafely = useCallback(
    async (operation, rollback) => {
      try {
        const result = await operation();
        if (result?.error) throw result.error;
        setSyncError(null);
      } catch (err) {
        handleSyncError(err);
        if (typeof rollback === 'function') rollback();
      }
    },
    [handleSyncError]
  );

  // ---------------------------------------------------------------------------
  // Hidratación inicial desde localStorage (migra la clave legada `cart`).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let stored = readStoredCart(STORAGE_KEY);
    if (stored === null) {
      const legacy = readStoredCart(LEGACY_STORAGE_KEY);
      if (legacy && legacy.length > 0) {
        stored = legacy;
        writeStoredCart(STORAGE_KEY, stored);
        try {
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {
          /* ignore */
        }
      } else {
        stored = [];
      }
    }
    setItems(stored);
    setHydrated(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Persistencia en localStorage: SIEMPRE se guarda el carrito COMPLETO,
  // incluidos los ids UUID. Así nunca se pierden datos si el merge con
  // `cart_items` falla. El doble conteo se evita con el marcador de dueño
  // (`imchic_cart_owner`) y la detección de espejo en el merge.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    writeStoredCart(STORAGE_KEY, items);
  }, [items, hydrated]);

  /**
   * Merge del carrito local con `public.cart_items` al iniciar sesión.
   *
   * Detección de espejo (`imchic_cart_owner === uid`):
   *  - ESPEJO (true): el carrito local fue exportado desde la cuenta del mismo
   *    usuario; el remoto es la fuente de verdad → los UUID ya presentes en
   *    remoto CONSERVAN su cantidad (no se suman), y solo se seedean los UUID
   *    ausentes y los ítems no-UUID.
   *  - GENUINO (false): carrito de invitado → se SUMAN las cantidades de los
   *    UUID por `product_id` (unique(user_id, product_id)).
   *
   * En ambos casos hace upsert idempotente y conserva los ítems no-UUID.
   */
  const mergeWithSupabase = useCallback(
    async (uid) => {
      setIsSyncing(true);
      try {
        const localItems = itemsRef.current;
        // Se lee ANTES de cualquier efecto que actualice el marcador de dueño.
        const isMirror = readOwner() === uid;

        const { data, error } = await supabase
          .from('cart_items')
          .select('product_id, quantity, products(*)')
          .eq('user_id', uid);
        if (error) throw error;

        const merged = new Map();
        const localOnly = [];

        // Fuente remota: cart_items (fuente de verdad para UUID).
        (Array.isArray(data) ? data : []).forEach((row) => {
          if (!row?.product_id) return;
          merged.set(row.product_id, {
            ...mapRemoteProduct(row.products, row.product_id),
            quantity: Math.max(1, Math.floor(Number(row.quantity) || 1)),
          });
        });

        // Fusiona el carrito local.
        localItems.forEach((item) => {
          if (!isUuid(item.id)) {
            // Rama no-UUID: nunca va a Supabase, se conserva local-only.
            localOnly.push(item);
            return;
          }
          const localQuantity = Math.max(1, item.quantity || 1);
          const existing = merged.get(item.id);

          if (existing && isMirror) {
            // Rama espejo: el remoto manda, no se suma.
            return;
          }
          if (existing) {
            // Rama no-espejo (invitado genuino): se suman las cantidades.
            merged.set(item.id, {
              ...existing,
              quantity: existing.quantity + localQuantity,
            });
          } else {
            // UUID ausente en remoto: se agrega (seed) en ambos casos.
            merged.set(item.id, {
              ...item,
              quantity: localQuantity,
            });
          }
        });

        const mergedUuidItems = Array.from(merged.values());

        if (mergedUuidItems.length > 0) {
          const rows = mergedUuidItems.map((item) => ({
            user_id: uid,
            product_id: item.id,
            quantity: item.quantity,
          }));
          const { error: upsertError } = await supabase
            .from('cart_items')
            .upsert(rows, { onConflict: 'user_id,product_id' });
          if (upsertError) throw upsertError;
        }

        setItems([...mergedUuidItems, ...localOnly]);
        setSyncError(null);
      } catch (err) {
        // Ante el fallo, se conserva el carrito local y se avisa sin romper.
        handleSyncError(err);
      } finally {
        setIsSyncing(false);
      }
    },
    [handleSyncError]
  );

  // ---------------------------------------------------------------------------
  // Reacción al cambio de sesión (login/logout), con guard por `user.id` para
  // evitar el doble merge de React StrictMode (R4).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hydrated || authLoading) return;
    const uid = user?.id ?? null;

    if (uid && syncUserIdRef.current !== uid) {
      syncUserIdRef.current = uid;
      mergeWithSupabase(uid);
    } else if (!uid && syncUserIdRef.current) {
      syncUserIdRef.current = null;
    }
  }, [user?.id, authLoading, hydrated, mergeWithSupabase]);

  // ---------------------------------------------------------------------------
  // Marcador de dueño del carrito espejo. Se declara DESPUÉS del efecto de sync
  // para que `mergeWithSupabase` lea el marcador previo antes de actualizarlo.
  // NO se borra al cerrar sesión (permite detectar el espejo al re-loguear).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (user?.id) setOwner(user.id);
  }, [user?.id, authLoading, hydrated]);

  // ---------------------------------------------------------------------------
  // Acciones (UI optimista + rollback en error).
  // ---------------------------------------------------------------------------
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback(
    (product) => {
      if (!product || product.id === undefined || product.id === null) return;
      const prev = itemsRef.current;
      const existing = prev.find((item) => item.id === product.id);
      const quantity = existing ? existing.quantity + 1 : 1;
      const next = existing
        ? prev.map((item) =>
            item.id === product.id ? { ...item, quantity } : item
          )
        : [...prev, { ...product, quantity: 1 }];

      setItems(next);
      setIsOpen(true);

      const uid = uidRef.current;
      if (uid && isUuid(product.id)) {
        runSafely(
          () =>
            supabase
              .from('cart_items')
              .upsert(
                { user_id: uid, product_id: product.id, quantity },
                { onConflict: 'user_id,product_id' }
              ),
          () => setItems(prev)
        );
      } else if (!uid) {
        // Mutación como invitado: el carrito deja de ser espejo.
        clearOwner();
      }
    },
    [runSafely]
  );

  const removeFromCart = useCallback(
    (productId) => {
      const prev = itemsRef.current;
      setItems(prev.filter((item) => item.id !== productId));

      const uid = uidRef.current;
      if (uid && isUuid(productId)) {
        runSafely(
          () =>
            supabase
              .from('cart_items')
              .delete()
              .eq('user_id', uid)
              .eq('product_id', productId),
          () => setItems(prev)
        );
      } else if (!uid) {
        clearOwner();
      }
    },
    [runSafely]
  );

  const updateQuantity = useCallback(
    (productId, delta) => {
      const prev = itemsRef.current;
      let quantity = 1;
      const next = prev.map((item) => {
        if (item.id !== productId) return item;
        quantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity };
      });
      setItems(next);

      const uid = uidRef.current;
      if (uid && isUuid(productId)) {
        runSafely(
          () =>
            supabase
              .from('cart_items')
              .upsert(
                { user_id: uid, product_id: productId, quantity },
                { onConflict: 'user_id,product_id' }
              ),
          () => setItems(prev)
        );
      } else if (!uid) {
        clearOwner();
      }
    },
    [runSafely]
  );

  const setQuantity = useCallback(
    (productId, qty) => {
      const parsed = Math.floor(Number(qty));
      const quantity = Math.max(1, Number.isFinite(parsed) ? parsed : 1);
      const prev = itemsRef.current;
      setItems(
        prev.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );

      const uid = uidRef.current;
      if (uid && isUuid(productId)) {
        runSafely(
          () =>
            supabase
              .from('cart_items')
              .upsert(
                { user_id: uid, product_id: productId, quantity },
                { onConflict: 'user_id,product_id' }
              ),
          () => setItems(prev)
        );
      } else if (!uid) {
        clearOwner();
      }
    },
    [runSafely]
  );

  const clearCart = useCallback(() => {
    const prev = itemsRef.current;
    setItems([]);

    const uid = uidRef.current;
    if (uid) {
      runSafely(
        () => supabase.from('cart_items').delete().eq('user_id', uid),
        () => setItems(prev)
      );
    } else {
      clearOwner();
    }
  }, [runSafely]);

  // ---------------------------------------------------------------------------
  // Derivados.
  // ---------------------------------------------------------------------------
  const itemCount = useMemo(
    () => items.reduce((count, item) => count + (item.quantity || 0), 0),
    [items]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0),
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      loading: !hydrated,
      isOpen,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      setQuantity,
      clearCart,
      itemCount,
      total,
      syncError,
      isSyncing,
    }),
    [
      items,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      setQuantity,
      clearCart,
      itemCount,
      total,
      syncError,
      isSyncing,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return ctx;
}

export default CartContext;
