import React from 'react';

const content = `
# Política de Cookies — Im Chic by Mel

**Última actualización:** 3 de octubre de 2026

## 1. ¿Qué son las cookies?

Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (computadora, tablet, móvil) cuando visitás un sitio web. Permiten que el sitio recuerde información sobre tu visita, como tus preferencias, sesión activa o comportamiento de navegación.

## 2. ¿Qué tipos de cookies usamos?

### a) Cookies Necesarias (Siempre activas)
Son esenciales para el funcionamiento del sitio. No se pueden desactivar.

| Cookie | Proveedor | Finalidad | Duración |
|--------|-----------|-----------|----------|
| \`sb-*-auth-token\` | Supabase Auth | Token de sesión JWT (autenticación) | Sesión / 1 hora |
| \`sb-*-refresh-token\` | Supabase Auth | Refresh token para renovar sesión | 30 días |
| \`imchic_cart\` | LocalStorage | Carrito de compras (usuarios anónimos) | 30 días |
| \`cookie_consent\` | LocalStorage | Preferencia de consentimiento de cookies | 1 año |
| \`cookie_preferences\` | LocalStorage | Preferencias por categoría | 1 año |

### b) Cookies Analíticas (Opcionales - requieren consentimiento)
Nos ayudan a entender cómo usás el sitio para mejorarlo.

| Cookie | Proveedor | Finalidad | Duración |
|--------|-----------|-----------|----------|
| \`_ga\` | Google Analytics | Distinguir usuarios únicos | 2 años |
| \`_ga_*\` | Google Analytics | Persistir estado de sesión | 2 años |
| \`_gid\` | Google Analytics | Distinguir usuarios por sesión | 24 horas |

### c) Cookies de Marketing (Opcionales - requieren consentimiento)
Se usan para mostrar anuncios relevantes y medir efectividad de campañas.

| Cookie | Proveedor | Finalidad | Duración |
|--------|-----------|-----------|----------|
| \`_fbp\` | Meta (Facebook) | Remarketing, conversiones | 3 meses |
| \`_gcl_au\` | Google Ads | Conversiones, atribución | 3 meses |

## 3. Cookies de terceros

Al integrar servicios de terceros, estos pueden colocar sus propias cookies:

| Servicio | Finalidad | Política de privacidad |
|----------|-----------|------------------------|
| **Google Analytics** | Analíticas de uso | https://policies.google.com/privacy |
| **Google Calendar API** | Sincronización de turnos | https://policies.google.com/privacy |
| **WhatsApp Business API** | Comunicación por WhatsApp | https://www.whatsapp.com/legal/privacy-policy |
| **Supabase** | Auth, BD, Storage | https://supabase.com/privacy |
| **Meta (Facebook/Instagram)** | Píxeles, remarketing | https://www.facebook.com/privacy/policy |

## 4. ¿Cómo gestionar tus preferencias?

### Banner de cookies (primera visita)
Al visitar el Sitio por primera vez, verás un banner con tres opciones:
- **Aceptar todas:** Permite cookies analíticas y de marketing.
- **Rechazar:** Solo cookies necesarias.
- **Configurar:** Elegí categoría por categoría.

### Cambiar preferencias después
Podés cambiar tus preferencias en cualquier momento:
1. Clic en el ícono de **cookies** (esquina inferior) o visita **/cookies**.
2. Ajustá los toggles por categoría.
3. Clic en **Guardar preferencias**.

### Revocar consentimiento
Si antes aceptaste y ahora querés rechazar:
1. Entrá a **/cookies** → **Configurar**.
2. Desactivá "Analíticas" y/o "Marketing".
3. Guardá. Las cookies de esas categorías se eliminarán en tu próxima visita.

## 5. Cómo bloquear/eliminar cookies en tu navegador

También podés gestionar cookies desde la configuración de tu navegador:

- **Chrome:** Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
- **Firefox:** Opciones → Privacidad y seguridad → Cookies y datos de sitios
- **Safari:** Preferencias → Privacidad → Gestionar datos de sitios web
- **Edge:** Configuración → Cookies y permisos de sitio

> **Nota:** Si bloqueás todas las cookies (incluidas las necesarias), el Sitio no funcionará correctamente (no podrás iniciar sesión, usar el carrito, agendar turnos, etc.).

## 6. Cookies y Google Calendar / WhatsApp

Al usar la funcionalidad de **turnos con Google Calendar** o **WhatsApp**:
- Se almacenan tokens OAuth encriptados en nuestra base de datos (Supabase) — **no en cookies del navegador**.
- Al autorizar a Google Calendar, Google coloca sus propias cookies (ver tabla arriba).
- Al abrir WhatsApp Web, WhatsApp coloca sus cookies (ver política de WhatsApp).

## 7. Cambios en esta política

Podemos actualizar esta política para reflejar cambios en nuestras prácticas o en la legislación. La versión actualizada se publicará en esta página con la fecha de "Última actualización".

## 8. Contacto

Para consultas sobre esta política o el ejercicio de tus derechos sobre cookies:

**Im Chic by Mel**  
📧 imchicbymel@gmail.com  
📱 +54 9 381 355-3492  
📍 Tucumán, Argentina  
🌐 https://im-chic-by-mel-web.pages.dev
`;

function CookiesContent() {
  return (
    <article className="prose prose-[#5A0B22] max-w-none">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="font-serif text-2xl font-bold text-[#5A0B22] mt-8 mb-4">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="font-semibold text-lg text-[#5A0B22] mt-6 mb-3">{line.slice(4)}</h3>;
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="text-[#5A0B22]/80 leading-relaxed mb-4">{line}</p>;
      })}
    </article>
  );
}

export default CookiesContent;