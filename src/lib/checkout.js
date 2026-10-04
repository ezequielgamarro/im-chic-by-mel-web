import { supabase } from './supabase';
import { formatPrice, isUuid } from './format';

/**
 * Lógica compartida de checkout por WhatsApp (Spec 010).
 *
 * Se usa tanto en el `CartDrawer` global como en el `CartPanel` de `/cuenta`
 * para no duplicar:
 *  - la construcción del mensaje y del link `wa.me`;
 *  - el registro de `orders` + `order_items` cuando hay sesión (snapshot);
 *  - la degradación grácil si las tablas nuevas todavía no existen.
 */

export const WHATSAPP_NUMBER = '5493813553492';

const TABLE_MISSING_CODES = new Set(['42P01', 'PGRST205']);

const NOTICE_TABLE_MISSING =
  'El historial de compras todavía no está activo. Igual podés enviar tu pedido por WhatsApp.';
const NOTICE_GENERIC =
  'No pudimos registrar tu compra, pero podés enviar tu pedido por WhatsApp igual.';

/**
 * Construye el mensaje de WhatsApp con el detalle del carrito y el total.
 * @param {Array} items  Ítems del carrito (`{ name, price, quantity }`).
 * @param {number} total Total estimado.
 * @returns {string}
 */
export function buildOrderMessage(items, total) {
  let message =
    '¡Hola Melany! Te escribo desde tu tienda web. Quiero realizar el siguiente pedido:\n\n';

  items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}* (x${item.quantity}) - ${formatPrice(
      (Number(item.price) || 0) * item.quantity
    )}\n`;
  });

  message += `\n*Total estimado:* ${formatPrice(total)}\n\n`;
  message += 'Por favor, confirmame disponibilidad y métodos de pago. ¡Gracias!';
  return message;
}

/**
 * Construye el link `wa.me` a partir del mensaje.
 * @param {string} message
 * @returns {string}
 */
export function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Devuelve el mensaje y el link listos para el checkout.
 * @param {Array} items
 * @param {number} total
 * @returns {{ message: string, waLink: string }}
 */
export function buildWhatsAppCheckout(items, total) {
  const message = buildOrderMessage(items, total);
  return { message, waLink: buildWhatsAppLink(message) };
}

/**
 * Registra la orden y su detalle en Supabase si hay sesión (RF-20/RF-23).
 * Nunca lanza: devuelve `{ error: string|null }` con un aviso no bloqueante.
 * @param {{ user: object|null, items: Array, total: number, message: string }} params
 * @returns {Promise<{ error: string|null }>}
 */
export async function registerOrder({ user, items, total, message }) {
  if (!user) return { error: null };

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'enviado_whatsapp',
        total,
        whatsapp_message: message,
      })
      .select('id')
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: isUuid(item.id) ? item.id : null,
      product_name: item.name,
      unit_price: Number(item.price) || 0,
      quantity: item.quantity,
    }));

    if (orderItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;
    }

    return { error: null };
  } catch (err) {
    const code = err?.code || err?.status;
    return {
      error: TABLE_MISSING_CODES.has(code) ? NOTICE_TABLE_MISSING : NOTICE_GENERIC,
    };
  }
}

export default {
  WHATSAPP_NUMBER,
  buildOrderMessage,
  buildWhatsAppLink,
  buildWhatsAppCheckout,
  registerOrder,
};
