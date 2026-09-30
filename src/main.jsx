import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ImChicLanding from '../ImChicLanding.jsx';
import MaryKayStore from '../MaryKayStore.jsx';
import HomeServices from '../HomeServices.jsx';
import InversionPage from '../InversionPage.jsx';
import ContactoPage from '../ContactoPage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeServices />} />
        <Route path="/cursos" element={<ImChicLanding />} />
        <Route path="/tienda" element={<MaryKayStore />} />
        <Route path="/servicios" element={<InversionPage />} />
        <Route path="/inversion" element={<InversionPage />} />
        <Route path="/contacto" element={<ContactoPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
