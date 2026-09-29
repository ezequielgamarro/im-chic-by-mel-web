import React from 'react';

export const InstagramButton = ({
  href = "https://www.instagram.com/imchicbymel/",
  className = "",
  open = false,
  size = "md", // "sm", "md", "lg"
  text = "Instagram"
}) => {
  const svgIcon = (
    <svg className="svgIcon" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  );

  return (
    <div className={`ig-btn-wrapper inline-flex items-center ${className}`}>
      <style>{`
        .ig-gradient-bg {
          background: #f09433;
          background: -moz-linear-gradient(
            45deg,
            #f09433 0%,
            #e6683c 25%,
            #dc2743 50%,
            #cc2366 75%,
            #bc1888 100%
          );
          background: -webkit-linear-gradient(
            45deg,
            #f09433 0%,
            #e6683c 25%,
            #dc2743 50%,
            #cc2366 75%,
            #bc1888 100%
          );
          background: linear-gradient(
            45deg,
            #f09433 0%,
            #e6683c 25%,
            #dc2743 50%,
            #cc2366 75%,
            #bc1888 100%
          );
        }

        /* ESTILO ABIERTO (EXPANDIDO CON ICONO + TEXTO VISIBLES, EXACTAMENTE IGUAL AL DE WSP) */
        .ig-btn-wrapper .ig-btn-open {
          display: inline-flex;
          align-items: center;
          justify-content: center;
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
        }

        .ig-btn-wrapper .ig-btn-open .sign {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .ig-btn-wrapper .ig-btn-open .sign svg {
          fill: white;
        }

        .ig-btn-wrapper .ig-btn-open .text {
          color: white;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        /* Tamaños coincidentes exactamente con WhatsAppButton */
        .ig-btn-wrapper .ig-btn-open.ig-sm {
          height: 40px;
          padding: 0 18px 0 12px;
          gap: 8px;
          font-size: 0.88rem;
        }
        .ig-btn-wrapper .ig-btn-open.ig-sm .sign svg {
          width: 18px;
          height: 18px;
        }

        .ig-btn-wrapper .ig-btn-open.ig-md {
          height: 48px;
          padding: 0 24px 0 16px;
          gap: 10px;
          font-size: 0.98rem;
        }
        .ig-btn-wrapper .ig-btn-open.ig-md .sign svg {
          width: 22px;
          height: 22px;
        }

        .ig-btn-wrapper .ig-btn-open.ig-lg {
          height: 54px;
          padding: 0 30px 0 20px;
          gap: 12px;
          font-size: 1.08rem;
        }
        .ig-btn-wrapper .ig-btn-open.ig-lg .sign svg {
          width: 24px;
          height: 24px;
        }

        .ig-btn-wrapper .ig-btn-open:hover {
          box-shadow: 0 6px 20px rgba(220, 39, 67, 0.45);
          transform: translateY(-2px);
          filter: brightness(1.06);
        }

        .ig-btn-wrapper .ig-btn-open:hover .sign {
          transform: scale(1.12);
        }

        .ig-btn-wrapper .ig-btn-open:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
        }

        /* ESTILO COMPACTO ORIGINAL */
        .ig-btn-wrapper .Btn {
          border: none;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition-duration: 0.4s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.15);
          outline: none;
        }

        .ig-btn-wrapper .Btn:hover {
          width: 110px;
          transition-duration: 0.4s;
          border-radius: 30px;
          box-shadow: 0 6px 20px rgba(220, 39, 67, 0.4);
        }

        .ig-btn-wrapper .Btn:hover .text {
          opacity: 1;
          transition-duration: 0.4s;
        }

        .ig-btn-wrapper .Btn:hover .svgIcon {
          opacity: 0;
          transition-duration: 0.3s;
        }

        .ig-btn-wrapper .Btn .text {
          position: absolute;
          color: rgb(255, 255, 255);
          width: 100%;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.92rem;
          opacity: 0;
          transition-duration: 0.4s;
          text-align: center;
          white-space: nowrap;
          user-select: none;
        }

        .ig-btn-wrapper .Btn .svgIcon {
          width: 1.35em;
          height: 1.35em;
          transition-duration: 0.3s;
          flex-shrink: 0;
        }

        .ig-btn-wrapper .Btn .svgIcon path {
          fill: white;
        }

        .ig-btn-wrapper .Btn:active {
          transform: scale(0.95);
        }
      `}</style>

      {open ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`ig-btn-open ig-gradient-bg ig-${size}`}
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
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="Btn ig-gradient-bg"
          aria-label="Instagram @imchicbymel"
          title="Seguinos en Instagram @imchicbymel"
        >
          {svgIcon}
          <span className="text">{text}</span>
        </a>
      )}
    </div>
  );
};

export default InstagramButton;
