import React from 'react';

export const DownloadButton = ({
  fileUrl,
  fileName = "documento.pdf",
  tooltipText = "Descargar PDF",
  className = "",
  label = ""
}) => {
  return (
    <div className={`download-btn-container inline-flex items-center gap-3 ${className}`}>
      <style>{`
        .download-btn-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .download-btn-wrapper .Btn {
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 50%;
          background-color: #5A0B22;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition-duration: .3s;
          box-shadow: 2px 2px 10px rgba(90, 11, 34, 0.3);
          text-decoration: none;
          flex-shrink: 0;
        }

        .download-btn-wrapper .svgIcon {
          fill: #F8B4C4;
          width: 15px;
          height: 15px;
        }

        .download-btn-wrapper .icon2 {
          width: 18px;
          height: 5px;
          border-bottom: 2px solid #D4AF37;
          border-left: 2px solid #D4AF37;
          border-right: 2px solid #D4AF37;
          margin-top: 2px;
        }

        .download-btn-wrapper .tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          opacity: 0;
          background-color: #3F0516;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.25s ease, transform 0.25s ease;
          pointer-events: none;
          letter-spacing: 0.3px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          z-index: 60;
          box-shadow: 0 4px 14px rgba(90, 11, 34, 0.4);
        }

        .download-btn-wrapper .tooltip::before {
          position: absolute;
          content: "";
          width: 8px;
          height: 8px;
          background-color: #3F0516;
          transform: rotate(45deg);
          bottom: -4px;
          left: 50%;
          margin-left: -4px;
        }

        .download-btn-wrapper .Btn:hover .tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .download-btn-wrapper .Btn:hover {
          background-color: #3F0516;
          box-shadow: 0 6px 20px rgba(90, 11, 34, 0.55);
          transform: translateY(-2px);
        }

        .download-btn-wrapper .Btn:hover .icon2 {
          border-bottom: 2px solid #fff;
          border-left: 2px solid #fff;
          border-right: 2px solid #fff;
        }

        .download-btn-wrapper .Btn:hover .svgIcon {
          fill: #ffffff;
          animation: slide-in-top 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }

        .download-btn-wrapper .Btn:active {
          transform: scale(0.95);
        }

        @keyframes slide-in-top {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }

          100% {
            transform: translateY(0px);
            opacity: 1;
          }
        }
      `}</style>

      <div className="download-btn-wrapper">
        <a
          href={fileUrl}
          download={fileName}
          className="Btn"
          aria-label={tooltipText}
          title={tooltipText}
        >
          <svg className="svgIcon" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
          </svg>
          <span className="icon2" />
          <span className="tooltip">{tooltipText}</span>
        </a>
      </div>

      {label && (
        <span className="text-xs sm:text-sm font-bold text-[#5A0B22] leading-tight">
          {label}
        </span>
      )}
    </div>
  );
};

export default DownloadButton;
