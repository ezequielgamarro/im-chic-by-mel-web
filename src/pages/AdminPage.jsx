import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Package,
  AlertTriangle,
  RefreshCw,
  Boxes,
  ImagePlus,
  Settings,
  Calendar,
  CalendarCheck,
  Scissors,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/admin/ProductList';
import ProductForm from '../components/admin/ProductForm';
import TurnSettingsTab from '../components/admin/TurnSettingsTab';
import TurnosTab from '../components/admin/TurnosTab';
import ServicesTab from '../components/admin/ServicesTab';

/**
 * Panel de administración (T7…T15).
 * Cabecera con cierre de sesión, formulario de alta/edición y listado de
 * productos leído desde Supabase. Rediseñado en T15 (skill frontend-design):
 * mobile-first, paleta de marca, WCAG 2.1 AA, secciones claras.
 */
export default function AdminPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'appointments' | 'settings' | 'services'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Contador de turnos pendientes (para el badge de la pestaña)
  const fetchPendingCount = useCallback(async () => {
    const { count } = await supabase
      .from('user_appointments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'solicitado');
    setPendingCount(count ?? 0);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setProducts([]);
    } else {
      setProducts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchPendingCount();
  }, [fetchProducts, fetchPendingCount]);

  // Refrescar el contador al cambiar de pestaña (por si se resolvieron turnos)
  useEffect(() => {
    if (activeTab === 'appointments') fetchPendingCount();
  }, [activeTab, fetchPendingCount]);

  // Extrae la ruta del objeto dentro del bucket `productos` desde su URL pública.
  const extractStoragePath = (publicUrl) => {
    if (!publicUrl || typeof publicUrl !== 'string') return null;
    const marker = '/object/public/productos/';
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    const path = publicUrl.slice(idx + marker.length).split('?')[0];
    try {
      return decodeURIComponent(path);
    } catch {
      return path;
    }
  };

  const handleDelete = useCallback(
    async (product) => {
      const confirmed = window.confirm(
        `¿Seguro que querés eliminar "${product.title}"? Esta acción no se puede deshacer.`
      );
      if (!confirmed) return;

      setDeletingId(product.id);
      setDeleteError('');

      const { error: rowError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (rowError) {
        setDeleteError(
          `No pudimos eliminar "${product.title}". Intentá de nuevo.`
        );
        setDeletingId(null);
        return;
      }

      const path = extractStoragePath(product.image_url);
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('productos')
          .remove([path]);
        if (storageError) {
          setDeleteError(
            `El producto se eliminó, pero no pudimos borrar su imagen del Storage.`
          );
        }
      }

      setDeletingId(null);
      await fetchProducts();
    },
    [fetchProducts]
  );

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch {
      setSigningOut(false);
    }
  };

  const handleStockChange = useCallback((id, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
  }, []);

  return (
    <div className="premium-page min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans">
      <header className="premium-header sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              aria-label="Volver al inicio"
              title="Volver al inicio"
              className="shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white border border-[#FFC9D6] shadow-sm overflow-hidden flex items-center justify-center hover:shadow-md hover:border-[#7A1333]/40 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
            >
              <img
                src="/assets/logo-im-chic.png"
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="font-serif font-bold text-sm text-[#5A0B22]">IC</span>';
                }}
              />
            </Link>
            <div className="min-w-0">
              <p className="font-script text-lg leading-none text-[#7A1333]">
                Im Chic by Mel
              </p>
              <h1 className="font-serif text-xl sm:text-2xl font-bold truncate">
                Panel de Administración
              </h1>
            </div>
          </div>
          
          {/* Tab Navigation */}
          {/* flex-wrap: con 4 pestañas los botones no caben en 320px en una sola fila */}
          <nav className="premium-card-soft flex flex-wrap gap-1 p-1" aria-label="Secciones del panel">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white shadow-sm'
                  : 'text-[#5A0B22]/70 hover:bg-[#FFC9D6]/30'
              }`}
            >
              <Boxes size={18} aria-hidden="true" />
              <span>Productos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2 ${
                activeTab === 'appointments'
                  ? 'bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white shadow-sm'
                  : 'text-[#5A0B22]/70 hover:bg-[#FFC9D6]/30'
              }`}
            >
              <CalendarCheck size={18} aria-hidden="true" />
              <span>Turnos</span>
              {pendingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#B91C1C] text-white text-[11px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white shadow-sm'
                  : 'text-[#5A0B22]/70 hover:bg-[#FFC9D6]/30'
              }`}
            >
              <Settings size={18} aria-hidden="true" />
              <span>Config. Turnos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'bg-gradient-to-r from-[#7A1333] to-[#5A0B22] text-white shadow-sm'
                  : 'text-[#5A0B22]/70 hover:bg-[#FFC9D6]/30'
              }`}
            >
              <Scissors size={18} aria-hidden="true" />
              <span>Servicios</span>
            </button>
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
          >
            <LogOut size={18} className="text-[#7A1333]" aria-hidden="true" />
            <span>{signingOut ? 'Cerrando…' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
        {activeTab === 'products' ? (
          <>
            {deleteError && (
              <div
                role="alert"
                className="flex items-start gap-2 bg-white/80 border border-[#B91C1C]/20 rounded-2xl p-4 text-sm text-[#B91C1C] font-medium"
              >
                <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Sección: crear o editar producto */}
            {editingProduct ? (
              <section aria-label="Formulario de edición">
                <ProductForm
                  key={editingProduct.id}
                  product={editingProduct}
                  onUpdated={() => {
                    setEditingProduct(null);
                    fetchProducts();
                  }}
                  onCancel={() => setEditingProduct(null)}
                />
              </section>
            ) : (
              <section aria-label="Crear producto">
                <div className="flex items-center gap-2 mb-3">
                  <ImagePlus size={20} className="text-[#D4AF37]" aria-hidden="true" />
                  <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#5A0B22]">
                    Crear producto
                  </h2>
                </div>
                <ProductForm onCreated={fetchProducts} />
              </section>
            )}

            {/* Sección: catálogo */}
            <section aria-labelledby="catalog-heading">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Boxes size={20} className="text-[#D4AF37]" aria-hidden="true" />
                  <h2
                    id="catalog-heading"
                    className="font-serif text-lg sm:text-xl font-semibold"
                  >
                    Mi catálogo
                  </h2>
                  <span className="text-sm text-[#5A0B22]/60 font-medium">
                    (Productos)
                  </span>
                </div>
                {!loading && !error && (
                  <span className="inline-flex items-center min-h-[28px] px-3 rounded-full bg-[#FFC9D6]/60 text-[#7A1333] text-xs font-bold">
                    {products.length} {products.length === 1 ? 'producto' : 'productos'}
                  </span>
                )}
              </div>

              {loading ? (
                <div
                  className="flex flex-col items-center gap-3 py-16"
                  role="status"
                  aria-live="polite"
                >
                  <div
                    className="w-10 h-10 rounded-full border-4 border-[#FFC9D6] border-t-[#7A1333] animate-spin"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-[#5A0B22]/75 font-medium">
                    Cargando productos…
                  </p>
                </div>
              ) : error ? (
                <div
                  role="alert"
                  className="flex flex-col items-center gap-3 py-10 text-center bg-white/80 border border-[#B91C1C]/20 rounded-3xl p-6"
                >
                  <AlertTriangle
                    size={28}
                    className="text-[#B91C1C]"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-[#B91C1C] font-medium">
                    No pudimos cargar los productos.
                  </p>
                  <p className="text-xs text-[#5A0B22]/70 break-words">{error}</p>
                  <button
                    type="button"
                    onClick={fetchProducts}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
                  >
                    <RefreshCw size={18} className="text-[#F7E7B4]" aria-hidden="true" />
                    <span>Reintentar</span>
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center bg-white/80 border border-[#5A0B22]/10 rounded-3xl p-6">
                  <div className="w-14 h-14 rounded-full bg-[#FFC9D6]/60 text-[#7A1333] flex items-center justify-center">
                    <Package size={26} aria-hidden="true" />
                  </div>
                  <p className="font-serif text-lg font-semibold">
                    Aún no hay productos
                  </p>
                  <p className="text-sm text-[#5A0B22]/75 leading-relaxed max-w-sm">
                    Cuando subas tu primer producto aparecerá acá y quedará visible en la
                    tienda.
                  </p>
                </div>
              ) : (
                <ProductList
                  products={products}
                  onStockChange={handleStockChange}
                  onEdit={setEditingProduct}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              )}
            </section>
          </>
        ) : activeTab === 'appointments' ? (
          <TurnosTab />
        ) : activeTab === 'services' ? (
          <ServicesTab />
        ) : (
          <TurnSettingsTab />
        )}
      </main>
    </div>
  );
}
