import React from 'react';

export const LimeButton = ({
  children,
  onClick,
  href,
  className = "",
  isActive = false,
  isBadge = false,
  style = {}
}) => {
  const isLink = Boolean(href);

  return (
    <div className={`brand-btn-wrapper inline-block ${className}`}>
      <style>{`
        .brand-btn-wrapper.w-full {
          width: 100%;
          display: block;
        }

        .brand-btn-wrapper.w-full .brand-bottone {
          width: 100%;
        }

        .brand-btn-wrapper .brand-bottone {
          padding-left: 28px;
          padding-right: 28px;
          padding-bottom: 14px;
          padding-top: 14px;
          border-radius: 9999px;
          background: #5A0B22;
          color: #ffffff;
          border: none;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 700;
          text-align: center;
          cursor: pointer;
          transition: 0.4s;
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          user-select: none;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(90, 11, 34, 0.25);
        }

        .brand-btn-wrapper .brand-bottone svg {
          flex-shrink: 0;
          display: inline-block;
        }

        .brand-btn-wrapper .brand-bottone:hover {
          background: #3F0516;
          box-shadow: 7px 5px 56px -12px rgba(90, 11, 34, 0.7);
          transform: translateY(-1px);
        }

        .brand-btn-wrapper .brand-bottone:active {
          transform: scale(0.97);
          box-shadow: 7px 5px 40px -8px rgba(90, 11, 34, 0.85);
        }

        /* Pestañas inactivas */
        .brand-btn-wrapper .brand-bottone.tab-inactive {
          background: transparent;
          color: #5A0B22;
          box-shadow: none;
          border: none;
        }

        .brand-btn-wrapper .brand-bottone.tab-inactive:hover {
          background: rgba(255, 201, 214, 0.5);
          color: #5A0B22;
          box-shadow: 0 4px 20px -8px rgba(90, 11, 34, 0.25);
        }

        /* Badge superior 'Grupo reducido' */
        .brand-btn-wrapper .brand-bottone.badge-style {
          padding: 9px 22px;
          font-size: 0.82rem;
          border: 1px solid rgba(212, 175, 55, 0.4);
          cursor: default;
          box-shadow: 0 4px 12px rgba(90, 11, 34, 0.2);
        }

        .brand-btn-wrapper .brand-bottone.badge-style:hover {
          transform: none;
          box-shadow: 7px 5px 36px -10px rgba(90, 11, 34, 0.5);
        }
      `}</style>

      {isLink ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`brand-bottone ${className}`}
          style={style}
        >
          {children}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={`brand-bottone ${isBadge ? 'badge-style' : ''} ${isActive === false && !isBadge ? 'tab-inactive' : ''} ${className}`}
          style={style}
        >
          {children}
        </button>
      )}
    </div>
  );
};

export default LimeButton;
