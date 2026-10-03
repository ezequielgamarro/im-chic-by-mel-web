import React from 'react';

const content = `
# Términos y Condiciones — Im Chic by Mel

**Última actualización:** 3 de octubre de 2026

## 1. Aceptación de los términos

Al acceder y utilizar el sitio web **im-chic-by-mel-web.pages.dev** (en adelante, "el Sitio") y los servicios ofrecidos por **Im Chic by Mel** (en adelante, "la Empresa"), aceptás quedar vinculado por estos Términos y Condiciones (en adelante, "los Términos"), nuestra **Política de Privacidad** y nuestra **Política de Cookies**. Si no estás de acuerdo, por favor no utilices el Sitio.

## 2. Servicios ofrecidos

A través del Sitio ofrecemos:
- **Agendamiento de turnos** para servicios de uñas, cabello y maquillaje.
- **Inscripción a cursos** de formación (Masterclass, Formación Integral).
- **Compra de productos** de belleza (carrito + WhatsApp).
- **Gestión de cuenta de usuario** (perfil, historial de turnos/cursos, carrito persistente).

## 3. Uso del Sitio

### 3.1 Elegibilidad
Debés ser **mayor de 18 años** y tener capacidad legal para contratar. Al registrarte, declarás que la información proporcionada es veraz, completa y actualizada.

### 3.2 Cuenta de usuario
- Sos responsable de mantener la confidencialidad de tu contraseña.
- Debés notificarnos inmediatamente si sospechás de uso no autorizado de tu cuenta.
- No podés compartir tu cuenta con terceros.

### 3.3 Uso prohibido
No podés utilizar el Sitio para:
- Actividades ilegales o fraudulentas.
- Intentar acceder sin autorización a sistemas o datos.
- Enviar spam, malware o contenido dañino.
- Violar derechos de propiedad intelectual.

## 4. Turnos y Citas

### 4.1 Agendamiento
- Los turnos se agendan a través del **TurnoModal** en el Sitio.
- Los usuarios registrados ven disponibilidad en tiempo real (Google Calendar).
- Los usuarios sin cuenta usan el formulario clásico (WhatsApp).

### 4.2 Confirmación y cancelación
- **Usuarios logueados:** Turno confirmado en Google Calendar + WhatsApp + email.
- **Anónimos:** Solicitud por WhatsApp, confirmación manual por la Empresa.
- **Cancelación:** Turnos confirmados pueden cancelarse hasta 2 horas antes. Cancelaciones tardías pueden incurrir en cargo.

### 4.3 No-show
La inasistencia sin aviso previo (no-show) puede resultar en la suspensión temporal de la posibilidad de agendar nuevos turnos online.

## 5. Cursos e Inscripciones

- **Masterclass:** Pago único, acceso vitalicio al contenido.
- **Formación Integral:** Suscripción mensual renovable automáticamente.
- **Cancelación:** Podés cancelar la suscripción mensual en cualquier momento desde tu cuenta. El acceso continúa hasta el final del período pagado.
- **Certificados:** Se entregan al completar los requisitos del curso.

## 6. Tienda y Productos

- Los precios están en **pesos argentinos (ARS)** e incluyen IVA.
- Los pedidos se confirman por **WhatsApp**; no hay pasarela de pago online.
- Los precios pueden cambiar sin previo aviso; se respeta el precio al momento del pedido.
- Stock sujeto a disponibilidad; en caso de falta de stock, se contacta al cliente.

## 7. Propiedad Intelectual

Todo el contenido del Sitio (textos, imágenes, logos, diseños, código) es propiedad de **Im Chic by Mel** o de sus licenciantes. Está protegido por leyes de propiedad intelectual. No podés copiar, reproducir, distribuir ni crear obras derivadas sin autorización escrita.

## 7. Limitación de responsabilidad

La Empresa no se responsabiliza por:
- Interrupciones temporales del Sitio por mantenimiento o fuerza mayor.
- Errores tipográficos en precios o descripciones (se corregirán a la brevedad).
- Daños indirectos, incidentales o consecuentes.
- Contenido de enlaces a terceros (Instagram, WhatsApp, Google Calendar).

La responsabilidad total de la Empresa se limita al monto pagado por el servicio/producto en cuestión.

## 8. Modificaciones

Podemos modificar estos Términos en cualquier momento. La versión actualizada se publicará en esta página con la fecha de "Última actualización". El uso continuado del Sitio implica aceptación de los nuevos Términos.

## 9. Ley aplicable y jurisdicción

Estos Términos se rigen por las leyes de la **República Argentina**. Cualquier disputa se someterá a los tribunales competentes de **San Miguel de Tucumán, Tucumán, Argentina**.

## 9. Contacto

Para consultas sobre estos Términos:

**Im Chic by Mel**  
📧 imchicbymel@gmail.com  
📱 +54 9 381 355-3492  
📍 Tucumán, Argentina  
🌐 https://im-chic-by-mel-web.pages.dev
`;

function TermsContent() {
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

export default TermsContent;