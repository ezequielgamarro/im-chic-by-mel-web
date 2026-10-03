/**
 * Mapeo de `service_key` (base de datos) → nombre lindo para mostrar al usuario.
 * Se usa en la página "Mis Turnos", el panel admin y los mensajes de WhatsApp.
 */
const SERVICE_NAMES = {
  // Categorías genéricas
  unas: 'Uñas',
  cabello: 'Cabello',
  maquillaje: 'Maquillaje',
  packs: 'Packs',
  pestanas: 'Pestañas',
  // Servicios específicos
  unas_semipermanente: 'Uñas: Semipermanente & Capping',
  unas_esculpidas: 'Uñas: Esculpidas en Gel / Acrigel',
  unas_soft_gel: 'Uñas: Soft Gel Tips de Autor',
  unas_nail_art: 'Uñas: Nail Art & Pedrería',
  cabello_alisado: 'Cabello: Alisado Espejo / Plastificado',
  cabello_nutricion: 'Cabello: Nutrición & Shock de Keratina',
  cabello_peinado: 'Cabello: Peinado Social & Styling',
  maquillaje_social: 'Maquillaje: MakeUp Social Glam',
  maquillaje_noche: 'Maquillaje: MakeUp Noche Piel Blindada',
  maquillaje_novias: 'Maquillaje: Novias & Quinceañeras HD',
};

/**
 * Devuelve el nombre formateado de un servicio a partir de su clave.
 * @param {string} key
 * @returns {string}
 */
export function formatServiceName(key) {
  if (!key) return 'Turno';
  const clean = String(key).trim();
  if (SERVICE_NAMES[clean]) return SERVICE_NAMES[clean];
  // Fallback: reemplazar guiones bajos y capitalizar
  return clean
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default formatServiceName;
