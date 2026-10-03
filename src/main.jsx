import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { TurnoProvider } from './context/TurnoContext';
import { AuthProvider } from './context/AuthContext';
import ImChicLanding from '../ImChicLanding.jsx';
import MaryKayStore from '../MaryKayStore.jsx';
import HomeServices from '../HomeServices.jsx';
import InversionPage from '../InversionPage.jsx';
import ContactoPage from '../ContactoPage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MyCoursesPage from './pages/MyCoursesPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LegalPage from './pages/LegalPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <TurnoProvider>
            <Routes>
              <Route path="/" element={<HomeServices />} />
              <Route path="/cursos" element={<ImChicLanding />} />
              <Route path="/tienda" element={<MaryKayStore />} />
              <Route path="/servicios" element={<InversionPage />} />
              <Route path="/inversion" element={<InversionPage />} />
              <Route path="/contacto" element={<ContactoPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/cuenta" element={<AccountPage />} />
              <Route path="/mis-turnos" element={<MyAppointmentsPage />} />
              <Route path="/mis-cursos" element={<MyCoursesPage />} />
              <Route path="/legal/:page" element={<LegalPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </TurnoProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
