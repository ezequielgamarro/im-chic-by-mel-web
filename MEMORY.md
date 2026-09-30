# MEMORY.md
Memoria del proyecto entre sesiones. Límite estricto: ~50 líneas. Resumir o eliminar datos obsoletos.

## Estado actual
- Web React + Vite ("I'm Chic By Melany Toledo") operativa con rutas principales: Inicio (/), Cursos (/cursos), Tienda (/tienda), Servicios (/servicios, con alias retrocompatible /inversion) y Contacto (/contacto).
- Pestaña "Inversión" renombrada a "Servicios" en todas las barras de navegación desktop y móvil.
- Catálogo interactivo de servicios detallado por categorías (Uñas, Cabello, MakeUp, Packs VIP, Cursos) con búsqueda reactiva, descripción exhaustiva, duración, qué incluye y reserva directa.
- Sistema de reserva integrado con TurnoModal.jsx, Google Calendar (.ics) y WhatsApp (+54 9 381 355-3492).

## Decisiones (y por qué)
- Unificación de navegación hacia `/servicios`: preserva coherencia estética y comercial del estudio.
- Catálogo con filtros y búsqueda: permite a las usuarias explorar fácilmente Uñas, Cabello, MakeUp y Combos VIP.
- Acciones dobles por tarjeta ("Generar Turno" y "Consultar por WhatsApp"): maximiza la conversión de reservas.
- Ampliación de SERVICE_OPTIONS en TurnoModal.jsx para sincronizar con los servicios del catálogo nuevo.

## Aprendizajes y errores a evitar
- Mantener `/inversion` como ruta secundaria en src/main.jsx previene enlaces rotos de visitas previas.
- Preseleccionar el servicio en TurnoModal según el botón presionado acelera el flujo de agendamiento.

## Próximos pasos
- Posible pasarela de señas/pagos online (Mercado Pago) si se requiere confirmar turnos con anticipo.
