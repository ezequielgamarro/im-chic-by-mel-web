import React from 'react';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';

const WHATSAPP_URL =
  'https://wa.me/5493813553492?text=' +
  encodeURIComponent("¡Hola Melany! Estoy teniendo un problema al usar la web.");

/**
 * Error Boundary global.
 * Evita que un fallo de render deje la aplicación en blanco.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Registro para diagnóstico
    console.error('[ErrorBoundary] Error de render:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans flex items-center justify-center p-6">
        <main className="w-full max-w-md bg-white/90 border border-[#5A0B22]/10 rounded-3xl shadow-xl p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#FFC9D6]/60 text-[#7A1333] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            Algo salió mal
          </h1>
          <p className="text-sm text-[#5A0B22]/75 leading-relaxed mb-6">
            Estamos teniendo un problema para mostrar esta sección. Podés recargar
            la página o escribirnos por WhatsApp.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
            >
              <RefreshCw size={18} className="text-[#F7E7B4]" />
              <span>Recargar página</span>
            </button>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-medium text-sm hover:bg-[#FFF0F3] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]"
            >
              <MessageCircle size={18} className="text-[#7A1333]" />
              <span>Avisar por WhatsApp</span>
            </a>
          </div>
        </main>
      </div>
    );
  }
}
