import React, { useState } from 'react';
import { X, Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { StudentUser } from '../types';
import { signInWithGoogle } from '../services/googleWorkspace';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: StudentUser) => void;
  defaultEmail?: string;
  contextText?: string;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contextText = 'para inscribirte a talleres y gestionar tus pases digitales',
}) => {
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
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError('Solicitud de ventana emergente cancelada.');
      } else {
        setAuthError(err.message || 'No se pudo completar el inicio de sesión con Google.');
      }
    }
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
              <h3 className="font-sans font-semibold text-lg text-neutral-900 leading-tight">
                Acceder con Google
              </h3>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                para continuar en <strong className="text-neutral-800">KAMIKAZE</strong>
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
          <p className="text-xs text-neutral-600 leading-relaxed">
            Iniciá sesión con tu cuenta de Gmail {contextText}. Tus inscripciones, pases de ingreso y notificaciones se sincronizarán directamente con tu cuenta de Google.
          </p>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          {isAuthorizing ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-neutral-700">
                Conectando con Google Identity Services...
              </p>
              <p className="text-xs text-neutral-400">
                Validando autenticación con Firebase
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {/* PRIMARY OFFICIAL GOOGLE AUTH BUTTON */}
              <button
                type="button"
                onClick={handleRealGoogleOAuth}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border-2 border-blue-600 hover:border-blue-700 rounded-lg shadow-sm hover:shadow font-medium text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span className="font-semibold text-neutral-900">Iniciar sesión con Google</span>
                <ArrowRight className="w-4 h-4 text-blue-600 ml-auto" />
              </button>
            </div>
          )}

          {/* Privacy footer */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-600" />
              <span>Conexión oficial Google OAuth</span>
            </div>
            <span>Firebase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
