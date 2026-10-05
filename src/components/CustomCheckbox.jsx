import React from 'react';
import styled from 'styled-components';

/**
 * CustomCheckbox — Spec 015
 * Réplica del checkbox animado de referencia (Uiverse "Checkbox by
 * SelfMadeSystem": un único path SVG dibuja caja + tick y la transición
 * stroke-dasharray/stroke-dashoffset los transforma al marcarlo).
 * Implementado con styled-components bajo autorización explícita del
 * usuario (override del principio 3 de la Constitución del repo).
 *
 * Accesibilidad AA: input oculto pero enfocable (visibility: hidden +
 * position: absolute, en vez de display: none), foco visible vía
 * focus-within, área táctil 44px, aria-hidden en el svg y
 * prefers-reduced-motion.
 */
export const CustomCheckbox = ({ label, checked, onChange }) => {
  return (
    <StyledWrapper>
      <label className="container">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <svg viewBox="0 0 64 64" height="2em" width="2em" aria-hidden="true">
          <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" className="path" />
        </svg>
        {label && <span className="label-text">{label}</span>}
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container { cursor: pointer; display: flex; align-items: center; gap: 10px; min-height: 44px; }
  .container input { visibility: hidden; position: absolute; }
  .container svg { overflow: visible; }
  .container:focus-within { outline: 2px solid #5A0B22; outline-offset: 2px; border-radius: 4px; }
  .container:focus-within .path { stroke: #5A0B22; }
  .path {
    fill: none; stroke: #6a1b29; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round;
    transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;
    stroke-dasharray: 241 9999999; stroke-dashoffset: 0;
  }
  .container input:checked ~ svg .path {
    stroke-dasharray: 70.5096664428711 9999999; stroke-dashoffset: -262.2723388671875;
  }
  .label-text { font-size: 15px; color: #4a0d1c; }
  @media (prefers-reduced-motion: reduce) {
    .path { transition: none; }
  }
`;
export default CustomCheckbox;
