// src/utils/whatsapp.js
// Utilidades para generar mensajes de WhatsApp pre-llenados

export function buildTurnoMessage(data) {
  const {
    name = '',
    phone = '',
    service = '',
    date = '',
    time = '',
    notes = '',
    isConfirmed = false,
    gcalUrl = '',
    isAdmin = false,
  } = data;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr;
  };

  const dateFormatted = formatDate(date);
  const timeFormatted = formatTime(time);

  if (isAdmin) {
    // Mensaje para el admin
    let msg = `🌸 *NUEVO TURNO - I'M CHIC BY MELANY TOLEDO* 🌸\n\n`;
    msg += `👤 *Cliente:* ${name}\n`;
    msg += `📱 *Teléfono:* ${phone}\n`;
    msg += `💅 *Servicio:* ${service}\n`;
    msg += `📅 *Fecha:* ${dateFormatted}\n`;
    msg += `⏰ *Horario:* ${timeFormatted} hs\n`;
    if (notes) msg += `📝 *Detalles:* ${notes}\n\n`;
    if (isConfirmed && gcalUrl) {
      msg += `✅ *Estado:* Turno CONFIRMADO y agendado en Google Calendar.\n`;
      msg += `🔗 Ver en Calendar: ${gcalUrl}\n\n`;
    } else {
      msg += `❓ *Estado:* Pendiente de confirmación. ¿Tenés disponibilidad?\n\n`;
    }
    msg += `📲 Responder a este WhatsApp para confirmar o reprogramar.`;
    return encodeURIComponent(msg);
  } else {
    // Mensaje para el cliente
    let msg = `🌸 *TURNO GENERADO - I'M CHIC BY MELANY TOLEDO* 🌸\n\n`;
    msg += `¡Hola ${name}! Tu turno fue generado exitosamente:\n\n`;
    msg += `💅 *Servicio:* ${service}\n`;
    msg += `📅 *Fecha:* ${dateFormatted}\n`;
    msg += `⏰ *Horario:* ${timeFormatted} hs\n`;
    if (notes) msg += `📝 *Detalles:* ${notes}\n\n`;
    if (isConfirmed && gcalUrl) {
      msg += `✅ Tu turno está *CONFIRMADO* y agendado en Google Calendar.\n`;
      msg += `🔗 Ver en Calendar: ${gcalUrl}\n\n`;
    } else {
      msg += `⏳ Tu solicitud está *PENDIENTE DE CONFIRMACIÓN*. Te avisaremos por WhatsApp cuando Melany confirme la disponibilidad.\n\n`;
    }
    msg += `📍 Estudio I'm Chic - Tucumán, Argentina\n`;
    msg += `📞 Melany Toledo: +54 9 381 355-3492\n`;
    msg += `📸 Instagram: @imchicbymelany\n\n`;
    msg += `¡Te esperamos! 💕`;
    return encodeURIComponent(msg);
  }
}

export function buildCursoMessage(data) {
  const {
    name = '',
    phone = '',
    email = '',
    course = '',
    courseKey = '',
    isConfirmed = false,
  } = data;

  const COURSE_LABELS = {
    masterclass: 'Masterclass - Diseño de Uñas',
    formacion_integral: 'Formación Integral - Uñas',
  };

  const COURSE_PRICES = {
    masterclass: '$65.000 (pago único)',
    formacion_integral: '$130.000 por mes',
  };

  const courseLabel = COURSE_LABELS[courseKey] || course;
  const coursePrice = COURSE_PRICES[courseKey] || '';

  let msg = `🌸 *INSCRIPCIÓN A CURSO - I'M CHIC BY MELANY TOLEDO* 🌸\n\n`;
  msg += `👤 *Alumna:* ${name}\n`;
  msg += `📱 *Teléfono:* ${phone}\n`;
  msg += `📧 *Email:* ${email}\n`;
  msg += `📚 *Curso:* ${courseLabel}\n`;
  msg += `💰 *Precio:* ${coursePrice}\n\n`;
  
  if (isConfirmed) {
    msg += `✅ *Estado:* Inscripción CONFIRMADA.\n\n`;
  } else {
    msg += `⏳ *Estado:* Inscripción PENDIENTE de confirmación.\n\n`;
  }
  
  msg += `📩 Te contactaremos pronto para coordinar el pago y el acceso al material.\n\n`;
  msg += `📸 Instagram: @imchicbymelany\n`;
  msg += `📞 WhatsApp: +54 9 381 355-3492`;
  
  return encodeURIComponent(msg);
}

export function buildCartMessage(items, data) {
  const { name = '', phone = '', email = '' } = data;

  let msg = `🛍️ *NUEVO PEDIDO - I'M CHIC BY MELANY TOLEDO* 🛍️\n\n`;
  msg += `👤 *Cliente:* ${name}\n`;
  msg += `📱 *Teléfono:* ${phone}\n`;
  if (email) msg += `📧 *Email:* ${email}\n\n`;
  
  msg += `📦 *Productos:*\n`;
  let total = 0;
  items.forEach((item, index) => {
    const subtotal = item.price * (item.quantity || 1);
    total += subtotal;
    msg += `${index + 1}. ${item.name} x${item.quantity || 1} - $${subtotal.toLocaleString('es-AR')}\n`;
  });
  msg += `\n💰 *Total: $${total.toLocaleString('es-AR')}*\n\n`;
  msg += `📍 Envío a coordinar por WhatsApp.\n`;
  msg += `💳 Pago a coordinar (transferencia/efectivo).\n\n`;
  msg += `📸 Instagram: @imchicbymelany\n`;
  msg += `📞 WhatsApp: +54 9 381 355-3492`;
  
  return encodeURIComponent(msg);
}

export function buildFallbackTurnoMessage(data) {
  const { name = '', phone = '', service = '', date = '', time = '' } = data;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  };

  const dateFormatted = formatDate(date);

  let msg = `❓ *CONSULTA DE DISPONIBILIDAD - I'M CHIC BY MELANY TOLEDO*\n\n`;
  msg += `👤 *Cliente:* ${name}\n`;
  msg += `📱 *Teléfono:* ${phone}\n`;
  msg += `💅 *Servicio:* ${service}\n`;
  msg += `📅 *Fecha solicitada:* ${formatDate(date)}\n`;
  msg += `⏰ *Horario solicitado:* ${time} hs\n\n`;
  msg += `❓ *Estado:* El cliente solicitó este horario pero no se pudo confirmar automáticamente en Google Calendar.\n\n`;
  msg += `❓ *¿Tenés disponibilidad para este horario?*\n\n`;
  msg += `📲 Responder a este WhatsApp para confirmar o proponer otro horario.`;
  
  return encodeURIComponent(msg);
}