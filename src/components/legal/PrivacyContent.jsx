import React from 'react';
import { Link } from 'react-router-dom';

const content = `
# Política de Privacidad — Im Chic by Mel

**Última actualización:** 3 de octubre de 2026

## 1. ¿Quiénes somos?

Im Chic by Mel (en adelante, "nosotros", "nuestro" o "la Empresa") es un estudio de belleza ubicado en Tucumán, Argentina, dedicado a servicios de uñas, cabello y maquillaje. Nuestra dirección de contacto es: imchicbymel@gmail.com / +54 9 381 355-3492.

## 2. ¿Qué datos recabamos?

Recabamos las siguientes categorías de datos personales:

### a) Datos de identificación y contacto
- Nombre y apellido
- Correo electrónico
- Número de teléfono / WhatsApp
- Foto de perfil (opcional)

### b) Datos de autenticación
- Email y contraseña hasheada (gestionada por Supabase Auth)
- Tokens de sesión y refresh tokens

### c) Datos de uso y navegación
- Dirección IP
- Tipo de navegador y dispositivo
- Páginas visitadas y tiempo de permanencia
- Cookies e identificadores similares

### d) Datos de transacciones y servicios
- Historial de turnos agendados (fecha, hora, servicio)
- Inscripciones a cursos
- Carrito de compras y preferencias de productos

### e) Datos de comunicación
- Mensajes enviados por WhatsApp, email o formularios web
- Preferencias de notificaciones

## 3. ¿Con qué finalidad tratamos tus datos?

| Finalidad | Base legal (Ley 25.326) |
|-----------|--------------------------|
| Gestión de turnos y citas | Ejecución de contrato / Consentimiento |
| Inscripción y gestión de cursos | Ejecución de contrato / Consentimiento |
| Gestión de carrito y compras | Ejecución de contrato |
| Comunicación por WhatsApp/email | Consentimiento / Interés legítimo |
| Mejora del sitio y analíticas | Consentimiento (cookies analíticas) |
| Marketing y promociones | Consentimiento (cookies marketing) |
| Cumplimiento legal | Obligación legal |

## 4. ¿Con quién compartimos tus datos?

- **Proveedores de servicios:** Supabase (hosting, base de datos, auth), Google Calendar API, WhatsApp Business API.
- **Autoridades competentes:** Cuando lo exija la ley o una orden judicial.
- **No vendemos** tus datos personales a terceros.

## 5. Transferencias internacionales

Tus datos pueden ser procesados en servidores de Supabase (EE. UU.) y Google (EE. UU.). Estas transferencias se basan en:
- Cláusulas contractuales tipo aprobadas por la Comisión Europea
- Certificaciones de privacidad (Privacy Shield / marcos sucesores)

## 6. ¿Cuánto tiempo conservamos tus datos?

| Tipo de dato | Período de conservación |
|--------------|------------------------|
| Datos de cuenta (perfil) | Mientras la cuenta esté activa + 2 años |
| Historial de turnos/cursos | 5 años desde la última actividad |
| Carrito de compras | 30 días (anon) / mientras la cuenta exista |
| Logs de acceso y analíticas | 12 meses |
| Comunicaciones WhatsApp/email | 2 años |

## 7. Tus derechos (Ley 25.326 - Habeas Data)

Tenés derecho a:
- **Acceso:** Solicitar copia de tus datos personales.
- **Rectificación:** Corregir datos inexactos o incompletos.
- **Supresión:** Solicitar la eliminación ("derecho al olvido").
- **Oposición:** Oponerte al tratamiento para marketing directo.
- **Portabilidad:** Recibir tus datos en formato estructurado.
- **Limitación:** Restringir el tratamiento en ciertos casos.

Para ejercer tus derechos, escribí a: **imchicbymel@gmail.com** con el asunto "Derechos ARCO - Ley 25.326". Responderemos en un plazo máximo de 10 días hábiles.

## 8. Seguridad de los datos

Implementamos medidas técnicas y organizativas apropiadas:
- Cifrado en tránsito (TLS 1.3) y en reposo (AES-256)
- Autenticación con Supabase Auth (JWT, refresh tokens rotativos)
- Acceso basado en roles (RLS en Supabase)
- Tokens encriptados con AES-GCM (Google Calendar tokens)
- Monitoreo de accesos anómalos

## 9. Cookies y tecnologías similares

Usamos cookies y tecnologías similares para:
- **Necesarias:** Sesión, autenticación, carrito, seguridad (siempre activas)
- **Analíticas:** Google Analytics (con consentimiento)
- **Marketing:** Píxeles de conversión, remarketing (con consentimiento)

Podés gestionar tus preferencias en cualquier momento desde el **banner de cookies** o en la página **/cookies**.

## 9. Menores de edad

Nuestros servicios no están dirigidos a menores de 18 años. No recabamos intencionalmente datos de menores. Si detectamos que un menor nos proporcionó datos, los eliminaremos.

## 10. Cambios en esta política

Podemos actualizar esta política para reflejar cambios en nuestras prácticas o en la legislación. La versión actualizada se publicará en esta página con la fecha de "Última actualización". Si los cambios son materiales, te notificaremos por email o mediante aviso en el sitio.

## 10. Contacto

Para consultas sobre esta política o el ejercicio de tus derechos:

**Im Chic by Mel**  
📧 imchicbymel@gmail.com  
📱 +54 9 381 355-3492  
📍 Tucumán, Argentina  
🌐 https://im-chic-by-mel-web.pages.dev
`;

function PrivacyContent() {
  return (
    <article className="prose prose-[#5A0B22] max-w-none">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="font-serif text-2xl font-bold text-[#5A0B22] mt-8 mb-4">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="font-semibold text-lg text-[#5A0B22] mt-6 mb-3">{line.slice(4)}</h3>;
        }
        if (line.startsWith('|') && line.endsWith('|')) {
          return null; // Tables handled separately
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="text-[#5A0B22]/80 leading-relaxed mb-4">{line}</p>;
      })}
    </article>
  );
}

export default PrivacyContent;