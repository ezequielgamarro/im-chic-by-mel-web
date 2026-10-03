import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { buildTurnoMessage, buildFallbackTurnoMessage } from '../utils/whatsapp';

/**
 * Hook personalizado para manejar la lógica de citas/turnos.
 * Encapsula: crear cita, cancelar, obtener historial, fallback WhatsApp.
 */
export function useAppointment() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAppointment = useCallback(async (data) => {
    if (!user || !session) throw new Error('Usuario no autenticado');

    const {
      serviceKey,
      datetime,
      duration,
      name,
      phone,
      email,
      notes,
    } = data;

    setLoading(true);
    setError(null);

    try {
      // 1. Crear evento en Google Calendar via Edge Function
      const response = await fetch(
        'https://nxviapvgzfdzzyctzokh.supabase.co/functions/v1/calendar-create-event',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_key: serviceKey,
            datetime,
            duration,
            client_data: { name, phone, email, notes },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Fallback: guardar como solicitado y enviar WhatsApp
        if (result.fallback) {
          return { fallback: true, data: result };
        }
        throw new Error(result.error || 'Error al crear evento en Calendar');
      }

      // 2. Guardar en BD con status confirmado
      const { error: dbError } = await supabase
        .from('user_appointments')
        .insert({
          user_id: user.id,
          service_key: serviceKey,
          scheduled_at: datetime,
          status: 'confirmado',
          google_event_id: result.google_event_id,
          whatsapp_message: buildTurnoMessage({
            name,
            phone,
            service: serviceKey,
            date: datetime.split('T')[0],
            time: datetime.split('T')[1].slice(0, 5),
            notes,
            isConfirmed: true,
            gcalUrl: `https://calendar.google.com/calendar/event?eid=${result.google_event_id}`,
          }),
        });

      if (dbError) throw dbError;

      return { success: true, googleEventId: result.google_event_id };
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFallbackAppointment = useCallback(async (data) => {
    if (!user || !session) throw new Error('Usuario no autenticado');

    const {
      service,
      date,
      time,
      name,
      phone,
      notes,
    } = data;

    const serviceKey = service.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const datetime = date && time ? `${date}T${time}:00` : null;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_appointments')
        .insert({
          user_id: user.id,
          service_key,
          scheduled_at: datetime,
          status: 'solicitado',
          whatsapp_message: buildFallbackTurnoMessage({
            name,
            phone,
            service: data.service,
            date: data.date,
            time: data.time,
          }),
        });

      if (error) throw error;

      return { success: true, fallback: true };
    } catch (err) {
      console.error('Error creating fallback appointment:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (appointmentId) => {
    if (!user) throw new Error('Usuario no autenticado');

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_appointments')
        .update({ status: 'cancelado' })
        .eq('id', appointmentId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAppointments = useCallback(async (status) => {
    if (!user) return [];

    try {
      let query = supabase
        .from('user_appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching appointments:', err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    createAppointment,
    createFallbackAppointment,
    cancelAppointment,
    getAppointments,
  };
}

export default useAppointment;