import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, ShieldCheck, QrCode, 
  Calendar, CheckCircle, Clock, AlertCircle, 
  ArrowRight, Sparkles, LogOut, Check, ExternalLink, 
  Download, BookOpen, CreditCard, Shield 
} from 'lucide-react';
import { StudentUser, Enrollment, Workshop, WalletConfig } from '../types';
import { GoogleSignInModal } from './GoogleSignInModal';

interface StudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentUser | null;
  onLogin: (user: StudentUser) => void;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: StudentUser) => void;
  enrollments: Enrollment[];
  workshops: Workshop[];
  walletConfig: WalletConfig;
  onStartEnrollmentForWorkshop: (workshop: Workshop) => void;
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  enrollments,
  workshops,
  walletConfig,
  onStartEnrollmentForWorkshop,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'mis_cursos' | 'perfil' | 'catalogo'>('mis_cursos');
  const [isGoogleSignInModalOpen, setIsGoogleSignInModalOpen] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDoc, setRegDoc] = useState('');
  const [regIsMember, setRegIsMember] = useState(false);

  // Edit Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileDoc, setProfileDoc] = useState(currentUser?.doc || '');
  const [profileIsMember, setProfileIsMember] = useState(currentUser?.isMember || false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Selected Pass for QR view
  const [selectedPass, setSelectedPass] = useState<Enrollment | null>(null);

  // Google / Gmail Sync Notification
  const [gmailSyncNotification, setGmailSyncNotification] = useState<string | null>(null);

  // Open Google Auth Modal
  const handleOpenGoogleAuth = (prefillEmail?: string) => {
    if (prefillEmail) {
      setLoginEmail(prefillEmail);
    }
    setIsGoogleSignInModalOpen(true);
  };

  // Add to Google Calendar direct link generator
  const handleAddToGoogleCalendar = (enrollment: Enrollment) => {
    const ws = workshops.find((w) => w.id === enrollment.workshopId);
    const title = encodeURIComponent(`${enrollment.workshopTitle} · Taller KAMIKAZE`);
    const details = encodeURIComponent(
      `Inscripción oficial en Colectivo Kamikaze (Pase #${enrollment.enrollmentCode})\n\n` +
      `Taller: ${enrollment.workshopTitle}\n` +
      `Docente: ${ws?.teacherName || 'Equipo Docente'}\n` +
      `Fechas: ${ws?.dates || 'Consultar'}\n` +
      `Horario: ${ws?.schedule || 'Consultar'}\n` +
      `Sede: ${ws?.location || 'Brandsen 2032, Barracas'}\n` +
      `Pase de acceso: ${enrollment.enrollmentCode}\n` +
      `Estado: ${enrollment.paymentStatus === 'confirmado' ? 'Confirmado' : 'Registrado'}`
    );
    const location = encodeURIComponent(ws?.location || 'Brandsen 2032, Barracas, CABA');
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      const email = loginEmail || 'participante@kamikaze.xyz';
      const user: StudentUser = {
        id: 'usr-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        phone: '+54 9 11 0000-0000',
        isMember: false,
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      onLogin(user);
    } else {
      const newUser: StudentUser = {
        id: 'usr-' + Date.now(),
        name: regName,
        email: regEmail,
        phone: regPhone,
        doc: regDoc,
        isMember: regIsMember,
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      onLogin(newUser);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updated: StudentUser = {
      ...currentUser,
      name: profileName,
      phone: profilePhone,
      doc: profileDoc,
      isMember: profileIsMember,
    };
    onUpdateProfile(updated);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Filter enrollments for this logged in user
  const userEnrollments = currentUser
    ? enrollments.filter(
        (e) => e.studentEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : [];

  const handleDownloadIcs = (enrollment: Enrollment) => {
    const ws = workshops.find((w) => w.id === enrollment.workshopId);
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//KAMIKAZE Talleres 2026//ES
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${enrollment.workshopTitle} - KAMIKAZE
DESCRIPTION:Inscripción confirmada (${enrollment.enrollmentCode}). Sede: ${ws?.location || 'Brandsen 2032, Barracas'}.
LOCATION:${ws?.location || 'Brandsen 2032, Barracas, CABA'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KAMIKAZE_${enrollment.enrollmentCode}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E52E33] bg-[#f0c510]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E52E33] text-[#FFD41D] flex items-center justify-center font-bold font-mono text-xs">
              {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'AL'}
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-widest font-bold block">
                Portal de Alumnxs & Participantes
              </span>
              <span className="text-[11px] opacity-80">
                {currentUser ? `Sesión activa: ${currentUser.email}` : 'Acceso a pases, inscripciones y datos guardados'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* NON LOGGED-IN VIEW */}
          {!currentUser ? (
            <div className="max-w-md mx-auto space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-white border-2 border-[#E52E33] shadow-md mb-2">
                  {/* Google Multi-color G */}
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h3 className="brand-title text-3xl font-bold">Portal Alumnxs & Participantes</h3>
                <p className="text-xs opacity-90 font-mono">
                  Ingreso oficial con tu cuenta de Google / Gmail para validar tus inscripciones y pases digitales.
                </p>
              </div>

              {/* Main Gmail Login Action Box */}
              <div className="bg-white text-neutral-900 border-2 border-[#E52E33] p-5 shadow-lg space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-mono font-bold text-neutral-500 tracking-wider block">
                    Acceso Instantáneo
                  </span>
                  <h4 className="text-base font-bold text-neutral-900 leading-snug">
                    Ingresá con la app de Gmail para sincronizar tus formularios
                  </h4>
                  <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                    Al identificarte con tu cuenta de Gmail, tu nombre y correo se utilizarán automáticamente en el formulario de inscripción a talleres y se emitirá tu credencial digital.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenGoogleAuth()}
                  className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-300 hover:border-neutral-400 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar con Google / Gmail</span>
                  <ArrowRight className="w-4 h-4 text-[#E52E33] ml-auto" />
                </button>

                <div className="pt-2 border-t border-neutral-200">
                  <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between mb-2">
                    <span>Cuentas sugeridas en este dispositivo:</span>
                  </div>
                  
                  {/* Quick Select Buttons */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenGoogleAuth('Colectivokmkz@gmail.com')}
                      className="w-full p-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#E52E33] text-[#FFD41D] flex items-center justify-center text-xs font-bold font-mono">
                        KM
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-neutral-900 truncate">Colectivo KAMIKAZE</div>
                        <div className="text-[11px] text-neutral-500 font-mono truncate">Colectivokmkz@gmail.com</div>
                      </div>
                      <span className="text-[10px] font-mono text-blue-600 uppercase font-bold">Ingresar →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenGoogleAuth('lucia.benitez.arte@gmail.com')}
                      className="w-full p-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                        LB
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-neutral-900 truncate">Lucía Benítez</div>
                        <div className="text-[11px] text-neutral-500 font-mono truncate">lucia.benitez.arte@gmail.com</div>
                      </div>
                      <span className="text-[10px] font-mono text-blue-600 uppercase font-bold">Ingresar →</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Benefits list */}
              <div className="p-3.5 bg-[#f0c510] border border-[#E52E33] space-y-2 text-xs font-mono">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Beneficios de tu cuenta Google / Gmail:</span>
                </div>
                <ul className="space-y-1 opacity-90 pl-5 list-disc text-[11px]">
                  <li>Carga de tus datos de contacto en 1 clic en inscripciones.</li>
                  <li>Agendado de fechas y direcciones en Google Calendar.</li>
                  <li>Emisión de pase digital con QR y arancel bonificado si sos socix.</li>
                </ul>
              </div>
            </div>
          ) : (
            /* LOGGED-IN VIEW */
            <div className="space-y-6">
              {/* User Overview Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-[#E52E33] bg-[#f0c510]">
                <div className="flex items-center gap-3">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full border border-[#E52E33] object-cover bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#E52E33] text-[#FFD41D] flex items-center justify-center font-bold font-mono text-sm">
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="brand-title text-xl font-bold leading-tight flex flex-wrap items-center gap-2">
                      <span>{currentUser.name}</span>
                      {currentUser.isMember && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#E52E33] text-[#FFD41D] font-bold">
                          ★ Socix Activo
                        </span>
                      )}
                      {(currentUser.provider === 'google' || currentUser.email.includes('@gmail.com')) ? (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-green-800 text-white font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Gmail Verificado</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenGoogleAuth()}
                          className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-neutral-800 text-white font-bold hover:bg-[#E52E33] transition-colors cursor-pointer"
                        >
                          + Conectar Gmail
                        </button>
                      )}
                    </h3>
                    <p className="text-xs font-mono opacity-80">{currentUser.email} · {currentUser.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenGoogleAuth()}
                    className="btn-brand px-3 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 font-bold cursor-pointer"
                    title="Cambiar o vincular cuenta Google / Gmail"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Cambiar Cuenta Gmail</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="btn-brand px-3 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>

              {gmailSyncNotification && (
                <div className="p-3 bg-green-800 text-white font-mono text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{gmailSyncNotification}</span>
                </div>
              )}

              {/* Navigation Sub-Tabs */}
              <div className="flex border-b border-[#E52E33] font-mono text-xs uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('mis_cursos')}
                  className={`px-4 py-2 border-b-2 font-bold transition-all ${
                    activeTab === 'mis_cursos'
                      ? 'border-[#E52E33] bg-[#E52E33] text-[#FFD41D]'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  Mis Inscripciones ({userEnrollments.length})
                </button>
                <button
                  onClick={() => setActiveTab('perfil')}
                  className={`px-4 py-2 border-b-2 font-bold transition-all ${
                    activeTab === 'perfil'
                      ? 'border-[#E52E33] bg-[#E52E33] text-[#FFD41D]'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  Mi Perfil & Datos
                </button>
                <button
                  onClick={() => setActiveTab('catalogo')}
                  className={`px-4 py-2 border-b-2 font-bold transition-all ${
                    activeTab === 'catalogo'
                      ? 'border-[#E52E33] bg-[#E52E33] text-[#FFD41D]'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  + Inscribirme a Nuevo Taller
                </button>
              </div>

              {/* TAB 1: MIS INSCRIPCIONES */}
              {activeTab === 'mis_cursos' && (
                <div className="space-y-4">
                  {userEnrollments.length === 0 ? (
                    <div className="p-8 border border-[#E52E33] bg-yellow-400/10 text-center space-y-3">
                      <BookOpen className="w-10 h-10 mx-auto opacity-70" />
                      <h4 className="brand-title text-xl font-bold">Todavía no tenés talleres registrados</h4>
                      <p className="text-xs font-mono opacity-85 max-w-md mx-auto">
                        Tus inscripciones confirmadas y reservas aparecerán acá con tu Pase Digital QR y detalles de cursada.
                      </p>
                      <button
                        onClick={() => setActiveTab('catalogo')}
                        className="btn-brand-inverse px-5 py-2 uppercase font-mono text-xs font-bold mt-2 cursor-pointer"
                      >
                        Ver Talleres Disponibles →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userEnrollments.map((enr) => {
                        const ws = workshops.find((w) => w.id === enr.workshopId);
                        const isConfirmed = enr.paymentStatus === 'confirmado';
                        const isPending = enr.paymentStatus === 'pendiente_verificacion';

                        return (
                          <div
                            key={enr.id}
                            className="p-4 sm:p-5 border-2 border-[#E52E33] bg-[#f0c510] space-y-4 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#E52E33]/30 pb-3">
                              <div>
                                <span className="text-[10px] font-mono tracking-widest uppercase opacity-75 block">
                                  PASE OFICIAL #{enr.enrollmentCode}
                                </span>
                                <h4 className="brand-title text-2xl font-bold mt-0.5">
                                  {enr.workshopTitle}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono font-bold px-2 py-1 uppercase border border-[#E52E33] ${
                                    isConfirmed
                                      ? 'bg-[#E52E33] text-[#FFD41D]'
                                      : isPending
                                      ? 'bg-orange-600 text-white'
                                      : 'bg-yellow-200 text-neutral-900'
                                  }`}
                                >
                                  {enr.paymentStatus === 'confirmado' && '✓ Pago Confirmado'}
                                  {enr.paymentStatus === 'pendiente_verificacion' && '⏳ Comprobante en Revisión'}
                                  {enr.paymentStatus === 'reserva_seña' && '½ Seña del 50%'}
                                  {enr.paymentStatus === 'beca' && '★ Beca Oficial'}
                                </span>
                              </div>
                            </div>

                            {/* Workshop Meta */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono opacity-90">
                              <div>
                                <span className="opacity-70 block text-[10px]">FECHAS & HORARIO:</span>
                                <strong>{ws?.schedule || 'Consultar horario'}</strong>
                                <p className="text-[11px]">{ws?.dates}</p>
                              </div>

                              <div>
                                <span className="opacity-70 block text-[10px]">DOCENTE A CARGO:</span>
                                <strong>{ws?.teacherName}</strong>
                                <p className="text-[11px]">{ws?.teacherRole}</p>
                              </div>

                              <div>
                                <span className="opacity-70 block text-[10px]">ABONADO:</span>
                                <strong className="text-sm">${enr.paymentAmount.toLocaleString('es-AR')}</strong>
                                <span className="block text-[10px]">
                                  {enr.paymentOption === 'total' ? 'Abonado 100%' : 'Seña 50% abonada'}
                                </span>
                              </div>
                            </div>

                            {/* Actions bar for this enrollment */}
                            <div className="pt-2 border-t border-[#E52E33]/30 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => setSelectedPass(enr)}
                                  className="btn-brand px-3 py-1.5 uppercase font-bold flex items-center gap-1.5 shadow-xs"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>Ver Pase QR</span>
                                </button>

                                <button
                                  onClick={() => handleAddToGoogleCalendar(enr)}
                                  className="btn-brand-inverse px-3 py-1.5 uppercase font-bold flex items-center gap-1.5 shadow-xs"
                                  title="Añadir evento directamente a Google Calendar"
                                >
                                  {/* Google G icon */}
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                    <path
                                      fill="#4285F4"
                                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                      fill="#34A853"
                                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                      fill="#FBBC05"
                                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                      fill="#EA4335"
                                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                  </svg>
                                  <span>+ Google Calendar</span>
                                </button>

                                <button
                                  onClick={() => handleDownloadIcs(enr)}
                                  className="px-3 py-1.5 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] uppercase font-bold flex items-center gap-1.5 transition-colors"
                                  title="Descargar archivo de calendario .ics para Apple / Outlook"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Descargar .ics</span>
                                </button>
                              </div>

                              <a
                                href={`https://wa.me/${walletConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hola!%20Tengo%20una%20consulta%20sobre%20mi%20taller%20${encodeURIComponent(enr.workshopTitle)}%20(Pase%20${enr.enrollmentCode})`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline uppercase tracking-wider flex items-center gap-1 hover:opacity-100 opacity-80 text-[11px]"
                              >
                                <span>Consultar a Coordinación</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MI PERFIL */}
              {activeTab === 'perfil' && (
                <div className="space-y-6 max-w-xl">
                  {/* Google / Gmail Sync status badge & card */}
                  <div className="p-4 border-2 border-[#E52E33] bg-[#f0c510] space-y-3 font-mono text-xs shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#E52E33]/30 pb-2.5">
                      <div className="flex items-center gap-2">
                        {/* Google G icon */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <div>
                          <span className="font-bold uppercase tracking-wider block">
                            Sincronización con Google / Gmail
                          </span>
                          <span className="text-[11px] opacity-80">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 bg-green-800 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" />
                        <span>Sincronizado</span>
                      </span>
                    </div>

                    <p className="text-[11px] opacity-85 leading-relaxed">
                      Tu cuenta está vinculada con Google. Tus pases digitales con QR, notificaciones de talleres y recordatorios de calendario se sincronizan automáticamente con este correo de Gmail.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenGoogleAuth()}
                        className="btn-brand px-3 py-1.5 uppercase font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Cambiar / Vincular otra cuenta Gmail</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs">
                    {profileSaved && (
                      <div className="p-3 bg-green-800 text-white font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>¡Tus datos fueron actualizados correctamente!</span>
                      </div>
                    )}

                    <div>
                      <label className="block font-bold uppercase mb-1">Nombre & Apellido *</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase mb-1">Email Registrado (Sincronizado con Google)</label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full px-3 py-2 bg-neutral-200/60 border border-[#E52E33] opacity-75 cursor-not-allowed font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase mb-1">Teléfono / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase mb-1">DNI / Documento</label>
                      <input
                        type="text"
                        value={profileDoc}
                        onChange={(e) => setProfileDoc(e.target.value)}
                        className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                      />
                    </div>

                    <div className="p-3 border border-[#E52E33] bg-[#f0c510] space-y-1">
                      <label className="flex items-center gap-2 font-bold uppercase cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileIsMember}
                          onChange={(e) => setProfileIsMember(e.target.checked)}
                          className="accent-[#E52E33]"
                        />
                        <span>Membresía Socix Activa ($6.000/mes)</span>
                      </label>
                      <p className="text-[11px] opacity-80 pl-5">
                        Al tener membresía de Socix, accedés automáticamente al arancel bonificado en todos los cursos y talleres.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="btn-brand-inverse px-6 py-2.5 uppercase tracking-wider font-bold cursor-pointer"
                    >
                      Guardar Cambios
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: CATÁLOGO DIRECTO */}
              {activeTab === 'catalogo' && (
                <div className="space-y-4">
                  <div className="text-xs font-mono opacity-90 pb-2 border-b border-[#E52E33]/30">
                    Seleccioná un taller para inscribirte con tus datos guardados automáticamente en 1-click:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {workshops.filter((w) => w.active).map((ws) => {
                      const alreadyEnrolled = userEnrollments.some((e) => e.workshopId === ws.id);
                      const priceToPay = currentUser.isMember ? ws.memberPrice : ws.regularPrice;

                      return (
                        <div
                          key={ws.id}
                          className="p-4 border border-[#E52E33] bg-[#f0c510] flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex justify-between items-start text-[10px] font-mono uppercase tracking-wider opacity-75">
                              <span>{ws.discipline}</span>
                              <span className="font-bold">{ws.availableSpots} vacantes</span>
                            </div>
                            <h4 className="brand-title text-xl font-bold leading-tight mt-1">
                              {ws.title}
                            </h4>
                            <p className="text-xs opacity-85 mt-1 font-sans">{ws.subtitle}</p>
                          </div>

                          <div className="pt-2 border-t border-[#E52E33]/30 flex items-center justify-between">
                            <div className="text-xs font-mono">
                              <span className="font-bold">${priceToPay.toLocaleString('es-AR')}</span>
                              {currentUser.isMember && (
                                <span className="text-[10px] opacity-75 block text-green-800 font-bold">
                                  Arancel Socix
                                </span>
                              )}
                            </div>

                            {alreadyEnrolled ? (
                              <span className="text-[11px] font-mono uppercase font-bold text-green-800 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Ya Inscripto</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  onClose();
                                  onStartEnrollmentForWorkshop(ws);
                                }}
                                className="btn-brand-inverse px-3 py-1.5 font-mono text-[11px] uppercase font-bold cursor-pointer"
                              >
                                Inscribirme →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-[#E52E33] bg-[#f0c510] flex justify-between items-center text-xs font-mono">
          <span className="opacity-80">Colectivo KAMIKAZE — Proceso & Materia 2026</span>
          <button onClick={onClose} className="underline uppercase font-bold cursor-pointer">
            Cerrar Ventana
          </button>
        </div>
      </div>

      {/* Pase Digital QR Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-md p-6 shadow-2xl space-y-4 text-center">
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-2">
              <span className="font-mono text-xs uppercase tracking-widest font-bold">
                Pase Oficial de Ingreso
              </span>
              <button onClick={() => setSelectedPass(null)} className="p-1 border border-[#E52E33]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest opacity-80">
                TEMPORADA 06 · KAMIKAZE
              </span>
              <h3 className="brand-title text-2xl font-bold leading-tight">
                {selectedPass.workshopTitle}
              </h3>
              <p className="font-mono text-sm font-bold">
                Titular: {selectedPass.studentName}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="w-48 h-48 mx-auto bg-white p-3 border-2 border-[#E52E33] shadow-md flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `KAMIKAZE|PASS|${selectedPass.enrollmentCode}|${selectedPass.studentEmail}|${selectedPass.workshopTitle}`
                )}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="font-mono text-xs space-y-1">
              <div className="font-bold text-sm tracking-widest">{selectedPass.enrollmentCode}</div>
              <div className="opacity-80">Presentar este código al ingresar al taller en la sede</div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleAddToGoogleCalendar(selectedPass)}
                className="btn-brand-inverse px-3.5 py-2 font-mono text-xs uppercase font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>+ Google Calendar</span>
              </button>

              <button
                onClick={() => handleDownloadIcs(selectedPass)}
                className="btn-brand px-3.5 py-2 font-mono text-xs uppercase font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Descargar .ics</span>
              </button>

              <button
                onClick={() => setSelectedPass(null)}
                className="btn-brand-inverse px-4 py-2 font-mono text-xs uppercase font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google / Gmail Sign In & Switch Account Modal */}
      <GoogleSignInModal
        isOpen={isGoogleSignInModalOpen}
        onClose={() => setIsGoogleSignInModalOpen(false)}
        onSuccess={(user) => {
          onLogin(user);
          setProfileName(user.name);
          setProfilePhone(user.phone);
          setProfileDoc(user.doc || '');
          setProfileIsMember(user.isMember);
          setGmailSyncNotification(`Cuenta de Google / Gmail vinculada: ${user.email}`);
          setTimeout(() => setGmailSyncNotification(null), 4500);
        }}
        defaultEmail={loginEmail || currentUser?.email || ''}
        contextText="para acceder a tus pases digitales y autocompletar inscripciones"
      />
    </div>
  );
};
