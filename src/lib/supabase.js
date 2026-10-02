import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Copia .env.example a .env y ' +
      'completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  );
}

/**
 * Cliente Supabase centralizado de la app.
 * Se usa para Auth (panel de administración) y lectura de la tienda.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
