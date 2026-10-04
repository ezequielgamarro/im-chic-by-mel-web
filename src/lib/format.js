/**
 * Utilidades de formato y validación compartidas (Spec 010).
 *
 * - `formatPrice`: moneda es-AR (movida desde `MaryKayStore.jsx`).
 * - `isUuid`: valida un id UUID (para decidir si un ítem puede persistirse
 *   en Supabase; los productos de respaldo tienen ids numéricos).
 * - `formatDateEs`: fecha en formato es-AR ("Mis Compras").
 */

/**
 * Formatea un precio como moneda argentina (ARS). Sin decimales para
 * mantener el estilo de la tienda.
 * @param {number|string} price
 * @returns {string}
 */
export const formatPrice = (price) => {
  const value = Number(price);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
};

// Formato general de UUID (8-4-4-4-12, hexadecimal). Acepta cualquier versión
// para no rechazar ids válidos generados por versiones futuras de Postgres.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Indica si `value` es un UUID válido en formato string.
 * Nota: los ids numéricos del catálogo de respaldo (1..31) devuelven `false`.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isUuid = (value) =>
  typeof value === 'string' && UUID_RE.test(value.trim());

/**
 * Formatea una fecha ISO/timestamp en formato es-AR. Devuelve cadena vacía
 * si el valor es nulo o inválido (degradación grácil en "Mis Compras").
 * @param {string|number|Date|null|undefined} value
 * @returns {string}
 */
export const formatDateEs = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(date);
};

export default { formatPrice, isUuid, formatDateEs };
