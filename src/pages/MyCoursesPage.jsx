import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react';

const COURSE_LABELS = {
  masterclass: 'Masterclass - Diseño de Uñas',
  formacion_integral: 'Formación Integral - Uñas',
};

const STATUS_LABELS = {
  inscrito: { label: 'Inscrito', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: BookOpen },
  completado: { label: 'Completado', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertCircle },
};

const COURSE_PRICES = {
  masterclass: '$65.000 (pago único)',
  formacion_integral: '$130.000 por mes',
};

const COURSE_DETAILS = {
  masterclass: 'Acceso ilimitado a la Masterclass de Diseño de Uñas. Incluye material descargable, certificado y soporte por 6 meses.',
  formacion_integral: 'Formación completa mensual. Acceso a todas las clases, materiales, mentorías semanales y comunidad exclusiva.',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
};

function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      setError(err?.message || 'No pudimos cargar tus cursos.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FFF0F3] flex items-center justify-center p-6" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FFC9D6] border-t-[#7A1333] animate-spin" aria-hidden="true" />
          <p className="text-sm text-[#5A0B22]/75 font-medium">Cargando tus cursos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page min-h-screen bg-[#FFF0F3] text-[#5A0B22] font-sans">
      <header className="premium-header sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-script text-lg leading-none text-[#7A1333]">Im Chic by Mel</p>
            <h1 className="font-serif text-xl sm:text-2xl font-bold">Mis Cursos</h1>
          </div>
          <Link to="/cuenta" className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFC9D6]/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A0B22]">
            ← Volver a mi cuenta
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white/90 border border-[#5A0B22]/10 rounded-3xl p-6">
            <div className="w-14 h-14 rounded-full bg-[#FFC9D6]/60 text-[#7A1333] flex items-center justify-center">
              <BookOpen size={28} aria-hidden="true" />
            </div>
            <p className="font-serif text-lg font-semibold">Aún no te inscribiste a ningún curso</p>
            <p className="text-sm text-[#5A0B22]/75 leading-relaxed max-w-sm">
              Visitá la sección <Link to="/cursos" className="font-semibold underline hover:text-[#7A1333]">Cursos</Link> para inscribirte.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => {
              const status = STATUS_LABELS[course.status] || STATUS_LABELS.inscrito;
              const StatusIcon = status.icon;
              const courseLabel = COURSE_LABELS[course.course_key] || course.course_key;
              const coursePrice = COURSE_PRICES[course.course_key] || '';
              const courseDetail = COURSE_DETAILS[course.course_key] || '';

              return (
                <article
                  key={course.id}
                  className="premium-card-soft p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-semibold text-[#5A0B22]">{courseLabel}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      <status.icon size={12} aria-hidden="true" />
                      <span>{status.label}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#5A0B22]/80">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-[#7A1333]" aria-hidden="true" />
                      <span>
                        <strong>Inscrito el:</strong> {formatDate(course.enrolled_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#7A1333]" aria-hidden="true" />
                      <span>
                        <strong>Precio:</strong> {coursePrice}
                      </span>
                    </div>
                    <div className="sm:col-span-2 flex items-start gap-2">
                      <Info size={16} className="text-[#7A1333] shrink-0" aria-hidden="true" />
                      <span>{courseDetail}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#5A0B22]/10 flex flex-wrap gap-3">
                    <Link
                      to="/cursos"
                      className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-[#5A0B22] via-[#7A1333] to-[#5A0B22] text-white font-semibold text-sm text-center hover:shadow-lg transition-all"
                    >
                      Ver curso
                    </Link>
                    <button
                      type="button"
                      className="flex-1 py-2 px-4 rounded-xl bg-white border border-[#5A0B22]/15 text-[#5A0B22] font-semibold text-sm hover:bg-[#FFF0F3] transition-colors"
                    >
                      Detalles
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyCoursesPage;