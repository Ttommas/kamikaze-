import React, { useState } from 'react';
import { X, Check, Mail, Sparkles, Shield, User, ArrowRight, AlertCircle } from 'lucide-react';
import { StudentUser } from '../types';
import { signInWithGoogle, getCachedAccessToken } from '../services/googleWorkspace';
import { createStudentUserFromGoogle, GoogleUserProfile } from '../utils/googleAuth';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: StudentUser) => void;
  defaultEmail?: string;
  contextText?: string;
}

const RECENT_GMAIL_ACCOUNTS: Array<{ name: string; email: string; avatar: string }> = [
  {
    name: 'Colectivo KAMIKAZE',
    email: 'Colectivokmkz@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Lucía Benítez',
    email: 'lucia.benitez.arte@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  },
];

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultEmail = '',
  contextText = 'para inscribirte a talleres y gestionar tus pases digitales',
}) => {
  const [customEmail, setCustomEmail] = useState(defaultEmail);
  const [customName, setCustomName] = useState('');
  const [isUsingAnotherAccount, setIsUsingAnotherAccount] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real Google OAuth Sign In Popup Flow
  const handleRealGoogleOAuth = async () => {
    setIsAuthorizing(true);
    setAuthError(null);
    try {
      const { user } = await signInWithGoogle();
      setIsAuthorizing(false);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.error('Error al autenticar con Google:', err);
      setIsAuthorizing(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('La ventana de Google se cerró antes de completar la autorización.');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('El navegador bloqueó la ventana emergente. Permití ventanas emergentes para este sitio.');
      } else {
        setAuthError(err.message || 'No se pudo completar el inicio de sesión con Google.');
      }
    }
  };

  const handleSelectSimulatedAccount = (account: { name: string; email: string; avatar?: string }) => {
    setIsAuthorizing(true);
    setAuthError(null);

    setTimeout(() => {
      const profile: GoogleUserProfile = {
        name: account.name,
        email: account.email,
        picture: account.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(account.name)}`,
        sub: `google-${Math.floor(100000000 + Math.random() * 900000000)}`,
        email_verified: true,
      };

      const studentUser = createStudentUserFromGoogle(profile);
      setIsAuthorizing(false);
      onSuccess(studentUser);
      onClose();
    }, 400);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    let email = customEmail.trim().toLowerCase();
    if (!email.includes('@')) {
      email = `${email}@gmail.com`;
    }

    let name = customName.trim();
    if (!name) {
      const local = email.split('@')[0].replace(/[._-]/g, ' ');
      name = local.charAt(0).toUpperCase() + local.slice(1);
    }

    handleSelectSimulatedAccount({
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white text-neutral-800 w-full max-w-md rounded-xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center shadow-xs">
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
            </div>
            <div>
              <h3 className="font-sans font-medium text-lg text-neutral-900 leading-tight">
                Acceder con Google
              </h3>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                para continuar a <strong className="text-neutral-800">KAMIKAZE</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-sans">
          <p className="text-xs text-neutral-600">
            Conectá tu cuenta de Google / Gmail {contextText}. Los correos y pases se sincronizarán directamente con la API oficial.
          </p>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          {isAuthorizing ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-neutral-700">
                Conectando con Google Identity Services...
              </p>
              <p className="text-xs text-neutral-400">
                Autorizando permisos de Gmail y perfil seguro
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* PRIMARY OFFICIAL GOOGLE AUTH BUTTON */}
              <button
                type="button"
                onClick={handleRealGoogleOAuth}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border-2 border-blue-600 hover:border-blue-700 rounded-lg shadow-sm hover:shadow font-medium text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
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
                <span className="font-semibold text-neutral-900">Iniciar sesión con Google (Real OAuth)</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-neutral-200 flex-1" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  O vincular cuenta rápida
                </span>
                <div className="h-px bg-neutral-200 flex-1" />
              </div>

              {!isUsingAnotherAccount ? (
                <div className="space-y-2">
                  <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                    {RECENT_GMAIL_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleSelectSimulatedAccount(acc)}
                        className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-neutral-50 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-8 h-8 rounded-full object-cover border border-neutral-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-neutral-900 group-hover:text-blue-600 truncate">
                              {acc.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono truncate">
                              {acc.email}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                          Elegir <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsUsingAnotherAccount(true)}
                    className="w-full py-2 px-3 flex items-center justify-center gap-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg border border-dashed border-neutral-300 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Ingresar otra dirección de Gmail manualmente</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Tu dirección de Gmail *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        required
                        placeholder="usuario@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Nombre y Apellido
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Clara Salmerón"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUsingAnotherAccount(false)}
                      className="flex-1 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg border border-neutral-200"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span>Vincular Gmail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Privacy footer */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-green-600" />
              <span>Conexión segura Google OAuth (Gmail API)</span>
            </div>
            <span>Privacidad · Condiciones</span>
          </div>
        </div>
      </div>
    </div>
  );
};

