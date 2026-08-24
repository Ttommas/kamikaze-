import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Check, Mail, MessageCircle, ExternalLink, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { WalletConfig, StudentUser } from '../types';
import { sendEmailViaGmail, getCachedAccessToken, signInWithGoogle } from '../services/googleWorkspace';

interface ProposeWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletConfig?: WalletConfig;
  currentUser?: StudentUser | null;
}

export const ProposeWorkshopModal: React.FC<ProposeWorkshopModalProps> = ({
  isOpen,
  onClose,
  walletConfig,
  currentUser,
}) => {
  const targetEmail = walletConfig?.contactEmail || 'Colectivokmkz@gmail.com';
  const targetPhone = walletConfig?.whatsappNumber || '+54 9 2213036525';
  const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    proposalType: 'taller',
    title: '',
    description: '',
    portfolio: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [sendMethod, setSendMethod] = useState<'gmail_api' | 'mailto' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
      }));
    }
  }, [currentUser]);

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

  const composeEmailText = (data: typeof formData) => {
    return (
      `Hola Colectivo KAMIKAZE,\n\n` +
      `Envío mi propuesta para la convocatoria abierta:\n\n` +
      `• Nombre y Apellido: ${data.name}\n` +
      `• Tipo de Propuesta: ${data.proposalType.toUpperCase()}\n` +
      `• Título del Proyecto: ${data.title}\n` +
      `• Email de contacto: ${data.email}\n` +
      `• Teléfono / WhatsApp: ${data.phone || 'No especificado'}\n` +
      `• Portfolio / Instagram: ${data.portfolio || 'No especificado'}\n\n` +
      `Descripción & Necesidades:\n${data.description}\n\n` +
      `Saludos cordiales,\n${data.name}`
    );
  };

  const handleSendViaGmailAPI = async (token: string, senderEmail: string) => {
    setIsSending(true);
    setErrorMsg(null);
    try {
      const subject = `[KAMIKAZE Propuesta] ${formData.proposalType.toUpperCase()}: ${formData.title} - ${formData.name}`;
      const body = composeEmailText(formData);

      await sendEmailViaGmail({
        accessToken: token,
        senderEmail,
        recipientEmail: targetEmail,
        subject,
        body,
      });

      setSendMethod('gmail_api');
      setSubmittedData({ ...formData });
      setIsSending(false);
    } catch (err: any) {
      console.error('Error enviando por Gmail API:', err);
      // Fallback to mailto
      setErrorMsg(err.message || 'No se pudo enviar con la API de Gmail. Abriendo gestor de correo predeterminado...');
      setIsSending(false);
      triggerMailtoFallback();
    }
  };

  const triggerMailtoFallback = () => {
    const subject = encodeURIComponent(`[KAMIKAZE Propuesta] ${formData.proposalType.toUpperCase()}: ${formData.title} - ${formData.name}`);
    const body = encodeURIComponent(composeEmailText(formData));
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    setSendMethod('mailto');
    setSubmittedData({ ...formData });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const token = getCachedAccessToken();
    if (token) {
      await handleSendViaGmailAPI(token, formData.email || 'usuario@gmail.com');
    } else {
      // If user provided a gmail or wants direct sync, prompt Google OAuth or trigger mailto
      try {
        setIsSending(true);
        const { accessToken, user } = await signInWithGoogle();
        await handleSendViaGmailAPI(accessToken, user.email);
      } catch (authErr: any) {
        setIsSending(false);
        // If popup closed or rejected, proceed with mailto
        triggerMailtoFallback();
      }
    }
  };

  const handleSendWhatsApp = () => {
    if (!submittedData) return;
    const msg = `¡Hola Colectivo KAMIKAZE! Les acerco mi propuesta de *${submittedData.proposalType}* titulada *${submittedData.title}*.\nMi nombre: ${submittedData.name}\nEmail: ${submittedData.email}\nTel: ${submittedData.phone}\nDetalle: ${submittedData.description}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[#E52E33] pb-3">
          <span className="font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Convocatoria Abierta — KAMIKAZE
          </span>
          <button onClick={onClose} className="p-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedData ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-[#E52E33] text-[#FFD41D] rounded-full flex items-center justify-center mx-auto shadow-md">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="brand-title text-2xl font-bold">¡Propuesta Enviada Exitosamente!</h3>
            
            <div className="p-4 border border-[#E52E33] bg-[#f0c510] text-left text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 text-green-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-green-700" />
                <span>
                  {sendMethod === 'gmail_api' 
                    ? 'Enviado directamente mediante Gmail API de Google' 
                    : 'Enrutado mediante cliente de correo'}
                </span>
              </div>
              <div><strong>Proyecto:</strong> {submittedData.title} ({submittedData.proposalType})</div>
              <div><strong>Proponente:</strong> {submittedData.name} ({submittedData.email})</div>
              <div><strong>Destinatario:</strong> {targetEmail}</div>
            </div>

            <p className="text-xs font-mono opacity-90 max-w-md mx-auto">
              El colectivo revisará tu material en la próxima asamblea de producción. También podés avisarnos por WhatsApp para agilizar el contacto.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-4 py-2.5 bg-[#25D366] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1fb855] transition-colors border border-black/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Avisar por WhatsApp ({targetPhone})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    proposalType: 'taller',
                    title: '',
                    description: '',
                    portfolio: '',
                  });
                  onClose();
                }}
                className="btn-brand-inverse px-5 py-2.5 text-xs font-mono uppercase font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <h3 className="brand-title text-2xl sm:text-3xl font-normal leading-tight">
                Proponer obra o taller
              </h3>
              <p className="text-xs opacity-90 mt-1 font-sans">
                Buscamos proyectos que dialoguen con la materia, el fanzine y la producción colectiva horizontal. Las propuestas se envían directamente a <strong>{targetEmail}</strong>.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-100 border border-red-500 text-red-800 text-xs rounded-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase mb-1">Nombre & Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Tipo de propuesta *</label>
                <select
                  value={formData.proposalType}
                  onChange={(e) => setFormData({ ...formData, proposalType: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                >
                  <option value="taller">Taller / Curso Formativo</option>
                  <option value="obra">Obra Colectiva / Instalación</option>
                  <option value="publicacion">Fanzine / Publicación</option>
                  <option value="residencia">Residencia de Producción</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase mb-1">Email de contacto (Gmail) *</label>
                <input
                  type="email"
                  required
                  placeholder="tu@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+54 9 2213036525"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Título del Taller o Proyecto *</label>
              <input
                type="text"
                required
                placeholder="Ej: Laboratorio de tintes naturales y bioplásticos"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Descripción de la propuesta & necesidades *</label>
              <textarea
                rows={3}
                required
                placeholder="Contanos sobre la metodología, materiales requeridos y qué te interesa cruzar con KAMIKAZE..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Link a portfolio o Instagram (opcional)</label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
              />
            </div>

            <div className="pt-3 border-t border-[#E52E33] flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[10px] opacity-75">
                Destino: <strong>{targetEmail}</strong>
              </span>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2 border border-[#E52E33] uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex-1 sm:flex-none btn-brand-inverse px-5 py-2 uppercase font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando con Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar a {targetEmail}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

