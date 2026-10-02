import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * Provee autenticación global (sesión + rol admin) a toda la app.
 * Uso: const { session, user, isAdmin, loading, signIn, signOut } = useAuth();
 *
 * - `isAdmin` se deriva del claim `app_metadata.role === 'admin'` (definido en el
 *   JWT por Supabase Auth). La autorización real la impone RLS en el backend;
 *   este flag solo se usa para UX/redirecciones en el cliente.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) Restaurar sesión existente al montar (persistencia al recargar la página).
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data?.session ?? null);
        setLoading(false);
      }
    });

    // 2) Escuchar cambios de sesión (login, logout, refresh y expiración).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const user = session?.user ?? null;
  const isAdmin = user?.app_metadata?.role === 'admin';

  const value = useMemo(
    () => ({ session, user, isAdmin, loading, signIn, signOut }),
    [session, user, isAdmin, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
