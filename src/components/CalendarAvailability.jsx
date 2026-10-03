import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function CalendarAvailability({ 
  onSlotSelected, 
  selectedService,
  serviceDurations,
  businessHours,
  slotGranularity = 15,
  disabled = false 
}) {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busySlots, setBusySlots] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [availableHours, setAvailableHours] = useState([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const today = useMemo(() => new Date(), []);
  const todayStr = today.toISOString().split('T')[0];

  // Get 60 days range
  const endDate = useMemo(() => {
    const d = new Date(currentMonth);
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  }, [currentMonth]);

  const startDateStr = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  }, [currentMonth]);

  // Fetch busy slots from Edge Function
  const fetchBusySlots = useCallback(async () => {
    if (!selectedService || !serviceDurations[selectedService]) {
      setBusySlots({});
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await fetch(
        `https://nxviapvgzfdzzyctzokh.supabase.co/functions/v1/calendar-availability?service=${encodeURIComponent(selectedService)}&start=${startDateStr}&end=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // No bloqueamos: seguimos con disponibilidad según horario de atención (sin eventos)
        console.warn('[calendar-availability] No disponible (status', response.status, '). Se usará solo el horario de atención.');
        setBusySlots({});
        setError(null);
        return;
      }

      const data = await response.json();
      setBusySlots(data.busy_slots || {});
    } catch (err) {
      // Tolerante a fallos: continuar con horario de atención
      console.warn('[calendar-availability] Error al consultar disponibilidad:', err.message);
      setBusySlots({});
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [selectedService, startDateStr, endDate]);

  // Fetch busy slots when service or month changes
  useEffect(() => {
    fetchBusySlots();
  }, [fetchBusySlots]);

  // Generate available hours for selected day
  const generateAvailableHours = useCallback((dayStr) => {
    if (!selectedService || !serviceDurations[selectedService]) return [];
    
    const duration = serviceDurations[selectedService] || 60;
    const dayObj = new Date(dayStr);
    const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayObj.getDay()];
    const daySchedule = businessHours?.[dayName];
    
    if (!daySchedule) return [];
    
    const { open, close } = daySchedule;
    if (!open || !close) return [];

    const slots = [];
    const [openH, openM] = open.split(':').map(Number);
    const [closeH, closeM] = close.split(':').map(Number);
    
    let current = new Date(dayStr);
    current.setHours(openH, openM, 0, 0);
    const endTime = new Date(dayStr);
    endTime.setHours(closeH, closeM, 0, 0);
    endTime.setMinutes(endTime.getMinutes() - (serviceDurations[selectedService] || 60));

    const granularity = slotGranularity || 15;
    
    while (current <= endTime) {
      const timeStr = current.toTimeString().slice(0, 5);
      const slotStart = new Date(dayStr);
      const [h, m] = timeStr.split(':').map(Number);
      slotStart.setHours(h, m, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + (serviceDurations[selectedService] || 60) * 60000);
      
      // Check if slot overlaps with busy slots
      let isBusy = false;
      const busyForDay = busySlots[dayStr] || [];
      for (const busy of busyForDay) {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        if (slotStart < busyEnd && slotEnd > busyStart) {
          isBusy = true;
          break;
        }
      }
      
      // Check if slot is in the past
      const now = new Date();
      const isPast = slotEnd <= now;
      
      slots.push({
        time: timeStr,
        isBusy,
        isPast,
      });
      
      current.setMinutes(current.getMinutes() + (slotGranularity || 15));
    }
    
    return slots;
  }, [busySlots, businessHours, selectedService, serviceDurations, slotGranularity]);

  // Handle day selection
  const handleDayClick = (dayStr) => {
    if (dayStr < todayStr) return; // No past dates
    setSelectedDay(dayStr);
    setAvailableHours(generateAvailableHours(dayStr));
    setSelectedSlot(null);
  };

  // Handle hour selection
  const handleHourClick = (timeStr, isBusy, isPast) => {
    if (isBusy || isPast || disabled) return;
    setSelectedSlot(timeStr);
  };

  // Generate calendar days for current month view
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday
    
    const days = [];
    // Previous month days
    const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, dayNum);
      days.push({ day: dayNum, date, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push({ day: i, date, isCurrentMonth: true });
    }
    // Next month days to fill grid
    const totalCells = days.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      days.push({ day: i, date, isCurrentMonth: false });
    }
    return days;
  }, [currentMonth]);

  const navigateMonth = (delta) => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
  };

  const isDayAvailable = (dayStr) => {
    if (dayStr < todayStr) return false;
    if (!selectedService || !serviceDurations[selectedService]) return false;
    const duration = serviceDurations[selectedService] || 60;
    const dayObj = new Date(dayStr);
    const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayObj.getDay()];
    const daySchedule = businessHours?.[dayName];
    if (!daySchedule || !daySchedule.open || !daySchedule.close) return false;
    
    // Check if any slot available
    const hours = generateAvailableHours(dayStr);
    return hours.some(h => !h.isBusy && !h.isPast);
  };

  const isDaySelected = (dayStr) => selectedDay === dayStr;
  const isDayToday = (dayStr) => dayStr === todayStr;

  // Render
  if (!selectedService || !serviceDurations[selectedService]) {
    return (
      <div className="p-6 text-center text-[#5A0B22]/70">
        <Calendar size={48} className="mx-auto mb-4 text-[#FFC9D6]" />
        <p className="text-lg font-medium">Seleccioná un servicio para ver disponibilidad</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 size={48} className="mx-auto mb-4 text-[#7A1333] animate-spin" />
        <p className="text-[#5A0B22]/70">Consultando disponibilidad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center" role="alert">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600 font-medium">Error al consultar disponibilidad</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <button 
          onClick={fetchBusySlots}
          className="mt-4 px-4 py-2 bg-[#5A0B22] text-white rounded-lg hover:bg-[#7A1333] transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#5A0B22] mb-2">Servicio</label>
        <select
          value={selectedService}
          onChange={(e) => {
            // This will be handled by parent via onSlotSelected
          }}
          disabled
          className="w-full px-4 py-2 border border-[#FFC9D6] rounded-lg text-[#5A0B22] bg-white"
        >
          <option value="">{selectedService}</option>
        </select>
        <p className="text-xs text-[#5A0B22]/50 mt-1">Cambia el servicio desde el selector principal</p>
      </div>

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          disabled={currentMonth <= today}
          className="p-2 rounded-lg text-[#5A0B22] hover:bg-[#FFC9D6]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-[#5A0B22] text-lg capitalize">
          {MONTHS_ES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg text-[#5A0B22] hover:bg-[#FFC9D6]/30 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 mb-4" role="grid" aria-label="Calendario de disponibilidad">
        {DAYS_ES.map(day => (
          <div key={day} className="text-center text-xs font-medium text-[#5A0B22]/60 py-2">
            {day}
          </div>
        ))}
        {calendarDays.map((item, index) => {
          const dayStr = item.date.toISOString().split('T')[0];
          const isAvail = item.isCurrentMonth && isDayAvailable(dayStr);
          const isSel = item.isCurrentMonth && isDaySelected(dayStr);
          const isPast = dayStr < todayStr;
          const isToday = isDayToday(dayStr);

          return (
            <button
              key={index}
              type="button"
              onClick={() => item.isCurrentMonth && !isPast && handleDayClick(dayStr)}
              disabled={!item.isCurrentMonth || isPast || !isDayAvailable(dayStr)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg transition-all min-h-[56px]
                ${!item.isCurrentMonth ? 'text-[#5A0B22]/20' : ''}
                ${isPast ? 'text-[#5A0B22]/20 cursor-not-allowed' : ''}
                ${!isPast && !isDayAvailable(dayStr) && item.isCurrentMonth ? 'text-[#B91C1C]/50 cursor-not-allowed' : ''}
                ${isAvail ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer' : ''}
                ${isSel ? 'bg-[#7A1333] text-white shadow-md ring-2 ring-[#7A1333]' : ''}
                ${isToday && !isSel ? 'ring-2 ring-[#D4AF37]' : ''}
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1333] focus-visible:ring-offset-2
              `}
              role="gridcell"
              aria-label={`${item.day} de ${MONTHS_ES[item.date.getMonth()]} - ${isAvail ? 'Disponible' : isPast ? 'Pasado' : 'Sin disponibilidad'}`}
              aria-selected={isSel}
              aria-disabled={!isDayAvailable(dayStr) || isPast}
            >
              <span className="font-medium">{item.day}</span>
              {isSel && <span className="text-xs mt-1">Seleccionado</span>}
              {!isPast && !isDayAvailable(dayStr) && item.isCurrentMonth && (
                <span className="text-xs text-red-500">Completo</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day info */}
      {selectedDay && (
        <div className="bg-white/80 border border-[#FFC9D6] rounded-2xl p-4" role="region" aria-label="Horarios disponibles">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#5A0B22] flex items-center gap-2">
              <Calendar size={20} className="text-[#7A1333]" />
              {new Date(selectedDay).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h4>
            <button
              onClick={() => { setSelectedDay(null); setAvailableHours([]); setSelectedSlot(null); }}
              className="text-sm text-[#5A0B22]/70 hover:text-[#5A0B22] underline"
            >
              Cambiar día
            </button>
          </div>

          {loadingHours ? (
            <div className="flex justify-center py-8">
              <Loader2 size={32} className="text-[#7A1333] animate-spin" />
              <p className="text-sm text-[#5A0B22]/70 ml-2">Cargando horarios…</p>
            </div>
          ) : availableHours.length === 0 ? (
            <div className="text-center py-8 text-[#5A0B22]/60">
              <Clock size={32} className="mx-auto mb-2 text-[#FFC9D6]" />
              <p className="text-sm">No hay horarios disponibles para este día</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="listbox" aria-label="Horarios disponibles">
              {availableHours.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  role="option"
                  onClick={() => !slot.isBusy && !slot.isPast && handleHourClick(slot.time, slot.isBusy, slot.isPast)}
                  disabled={slot.isBusy || slot.isPast}
                  className={`
                    min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium transition-all
                    ${slot.isPast ? 'text-[#5A0B22]/20 cursor-not-allowed' : ''}
                    ${slot.isBusy && !slot.isPast ? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed' : ''}
                    ${!slot.isBusy && !slot.isPast ? 'bg-white border border-[#FFC9D6] text-[#5A0B22] hover:bg-green-50 hover:border-green-300 cursor-pointer' : ''}
                    ${selectedSlot === slot.time ? 'bg-green-600 text-white border-green-600 shadow-md' : ''}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1333] focus-visible:ring-offset-2
                  `}
                  aria-selected={selectedSlot === slot.time}
                  aria-disabled={slot.isBusy || slot.isPast}
                >
                  {slot.time}
                  {slot.isBusy && !slot.isPast && <span className="ml-1 text-xs">Ocupado</span>}
                  {slot.isPast && <span className="ml-1 text-xs">Pasado</span>}
                </button>
              ))}
            </div>
          )}

          {/* Confirm button */}
          {selectedSlot && (
            <div className="mt-4 pt-4 border-t border-[#FFC9D6]">
              <button
                type="button"
                onClick={() => onSlotSelected?.({
                  service: selectedService,
                  datetime: new Date(`${selectedDay}T${selectedSlot}:00`).toISOString(),
                  duration: serviceDurations[selectedService] || 60,
                })}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all min-h-[48px] flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                <span>Confirmar turno para las {selectedSlot} hs</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarAvailability;