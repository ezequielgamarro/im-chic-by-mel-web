import React from 'react';

export const WhatsAppButton = ({ 
  phoneNumber = "5493813553492", 
  message = "¡Hola Melany! Me comunico desde la web de I'm Chic.", 
  className = "",
  fixed = false,
  open = false,
  text = "Whatsapp",
  size = "md", // "sm", "md", "lg"
  style = {}
}) => {
  const encoded = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encoded}`;

  const svgIcon = (
    <svg className="socialSvg whatsappSvg" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
    </svg>
  );

  return (
    <div className={`wsp-button-container ${fixed ? 'wsp-fixed' : ''} ${className}`} style={style}>
      <style>{`
        .wsp-button-container.wsp-fixed {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
        }

        /* ESTILO ORIGINAL ANIMADO (COMPACTO QUE EXPANDE AL HOVER) */
        .wsp-styled-button {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 45px;
          height: 45px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition-duration: 0.3s;
          box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
          background-color: #00d757;
          padding: 0;
          outline: none;
          text-decoration: none;
        }

        .wsp-styled-button .sign {
          width: 100%;
          transition-duration: 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wsp-styled-button .sign svg,
        .wsp-btn-open .sign svg {
          width: 25px;
          height: 25px;
        }

        .wsp-styled-button .sign svg path,
        .wsp-btn-open .sign svg path {
          fill: white;
        }

        .wsp-styled-button .text {
          position: absolute;
          right: 0%;
          width: 0%;
          opacity: 0;
          color: white;
          font-size: 1.05em;
          font-weight: 600;
          transition-duration: 0.3s;
          white-space: nowrap;
          overflow: hidden;
          font-family: inherit;
        }

        .wsp-styled-button:hover {
          width: 150px;
          border-radius: 40px;
          transition-duration: 0.3s;
          box-shadow: 0 6px 20px rgba(0, 215, 87, 0.4);
        }

        .wsp-styled-button:hover .sign {
          width: 30%;
          transition-duration: 0.3s;
          padding-left: 10px;
        }

        .wsp-styled-button:hover .text {
          opacity: 1;
          width: 70%;
          transition-duration: 0.3s;
          padding-right: 12px;
        }

        .wsp-styled-button:active {
          transform: translate(2px, 2px);
        }

        /* ESTILO ABIERTO / EXPANDIDO (MISMA ESTÉTICA PERO CON TEXTO SIEMPRE VISIBLE) */
        .wsp-button-container:not(.wsp-fixed) {
          display: inline-block;
        }

        .wsp-btn-open {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background-color: #00d757;
          color: #ffffff;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          position: relative;
          text-decoration: none;
          font-family: inherit;
          font-weight: 700;
          box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          user-select: none;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .wsp-btn-open .sign {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .wsp-btn-open .text {
          color: white;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        /* Tamaños para botón abierto */
        .wsp-btn-open.wsp-sm {
          height: 40px;
          padding: 0 18px 0 12px;
          gap: 8px;
          font-size: 0.88rem;
        }
        .wsp-btn-open.wsp-sm .sign svg {
          width: 20px;
          height: 20px;
        }

        .wsp-btn-open.wsp-md {
          height: 48px;
          padding: 0 24px 0 16px;
          gap: 10px;
          font-size: 0.98rem;
        }
        .wsp-btn-open.wsp-md .sign svg {
          width: 24px;
          height: 24px;
        }

        .wsp-btn-open.wsp-lg {
          height: 54px;
          padding: 0 30px 0 20px;
          gap: 12px;
          font-size: 1.08rem;
        }
        .wsp-btn-open.wsp-lg .sign svg {
          width: 26px;
          height: 26px;
        }

        .wsp-btn-open:hover {
          background-color: #00be4d;
          box-shadow: 0 6px 20px rgba(0, 215, 87, 0.45);
          transform: translateY(-2px);
        }

        .wsp-btn-open:hover .sign {
          transform: scale(1.12);
        }

        .wsp-btn-open:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      
      {open ? (
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`wsp-btn-open wsp-${size}`}
          aria-label={text}
          title={text}
        >
          <div className="sign">
            {svgIcon}
          </div>
          <span className="text">{text}</span>
        </a>
      ) : (
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="wsp-styled-button" 
          aria-label="Contactar por WhatsApp"
          title="Enviar mensaje por WhatsApp"
        >
          <div className="sign">
            {svgIcon}
          </div>
          <div className="text">{text}</div>
        </a>
      )}
    </div>
  );
};

export default WhatsAppButton;
