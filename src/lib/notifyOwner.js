/**
 * Notificación "silenciosa" al dueño cuando se registra un turno.
 *
 * Estrategia:
 *  1. Si se configura `VITE_OWNER_WEBHOOK_URL` (Make/Zapier/n8n/Slack/Discord/Edge Function),
 *     se envía un POST con los datos del turno (fire-and-forget).
 *  2. Siempre queda registrado el turno en `user_appointments` → visible en el panel
 *     de admin, pestaña "Turnos" (con badge de pendientes). Esa es la alerta garantizada.
 *  3. Se deja un log en consola con el resumen por si no hay webhook configurado.
 *
 * @param {Object} appointment - Datos del turno recién creado.
 * @param {'solicitado'|'confirmado'} appointment.status
 */
export async function notifyOwner(appointment) {
  const payload = {
    type: 'turno',
    status: appointment.status,
    service_key: appointment.service_key,
    datetime: appointment.scheduled_at,
    client_name: appointment.client_name,
    client_phone: appointment.client_phone,
    notes: appointment.notes,
    created_at: new Date().toISOString(),
  };

  // Log local (fallback cuando no hay webhook)
  console.info('[notifyOwner] Nuevo turno registrado:', payload);

  const webhook = import.meta.env.VITE_OWNER_WEBHOOK_URL;
  if (!webhook) return { ok: true, channel: 'panel' };

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: true, channel: 'webhook' };
  } catch (e) {
    console.warn('[notifyOwner] No se pudo enviar el webhook:', e?.message);
    return { ok: false, channel: 'webhook', error: e };
  }
}

export default notifyOwner;
