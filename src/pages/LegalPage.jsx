import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Scale, FileText, Shield, Cookie } from 'lucide-react';
import PrivacyContent from '../components/legal/PrivacyContent';
import TermsContent from '../components/legal/TermsContent';
import CookiesContent from '../components/legal/CookiesContent';

const PAGE_CONFIG = {
  privacidad: {
    component: PrivacyContent,
    title: 'Política de Privacidad',
    icon: Shield,
    description: 'Cómo recabamos, usamos y protegemos tus datos personales según Ley 25.326.',
  },
  terminos: {
    component: TermsContent,
    title: 'Términos y Condiciones',
    icon: FileText,
    description: 'Reglas de uso del sitio, turnos, cursos, tienda y responsabilidades.',
  },
  cookies: {
    component: CookiesContent,
    title: 'Política de Cookies',
    icon: Cookie,
    description: 'Qué cookies usamos, para qué y cómo gestionar tus preferencias.',
  },
};

function LegalPage({ page: propPage }) {
  const { page: paramPage } = useParams();
  const page = propPage ?? paramPage;
  const config = PAGE_CONFIG[page];

  if (!config) {
    return (
      <div className="min-h-screen bg-[#FFF0F3] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Scale size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="font-serif text-2xl font-bold text-[#5A0B22]">Página no encontrada</h2>
          <p className="text-sm text-[#5A0B22]/70 mt-2">
            La página legal solicitada no existe.
          </p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm shadow hover:shadow-lg transition">
            <ArrowLeft size={18} /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const Component = config.component;

  return (
    <div className="premium-page min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans">
      <header className="premium-header sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]">
            <ArrowLeft size={18} className="text-[#7A1333]" aria-hidden="true" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Header de la página legal */}
        <header className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FFC9D6]/60 text-[#7A1333] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <config.icon size={28} className="text-[#7A1333]" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A0B22] mb-2">
            {config.title}
          </h1>
          <p className="text-lg text-[#5A0B22]/70 max-w-2xl mx-auto leading-relaxed">
            {config.description}
          </p>
        </header>

        {/* Contenido legal */}
        <article className="premium-card p-6 sm:p-8 prose prose-[#5A0B22] max-w-none">
          <React.Fragment>
            <config.component />
          </React.Fragment>
        </article>

        {/* Footer legal */}
        <footer className="mt-8 text-center text-sm text-[#5A0B22]/60">
          <p>Última actualización: 3 de octubre de 2026</p>
          <p className="mt-1">
            <Link to="/privacidad" className="underline hover:text-[#7A1333] mx-1">Política de Privacidad</Link>
            <span className="text-[#5A0B22]/40">·</span>
            <Link to="/terminos" className="underline hover:text-[#7A1333] mx-1">Términos y Condiciones</Link>
            <span className="text-[#5A0B22]/40">·</span>
            <Link to="/cookies" className="underline hover:text-[#7A1333] mx-1">Política de Cookies</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default LegalPage;