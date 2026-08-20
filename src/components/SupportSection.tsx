import React, { useState } from 'react';
import { Wallet, Heart, Sparkles, Send, Check, Copy, ExternalLink, X, ArrowRight } from 'lucide-react';
import { WalletConfig } from '../types';

interface SupportSectionProps {
  walletConfig: WalletConfig;
  onOpenProposalModal: () => void;
}

export const SupportSection: React.FC<SupportSectionProps> = ({
  walletConfig,
  onOpenProposalModal,
}) => {
  const [activeModal, setActiveModal] = useState<'socix' | 'aporte' | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(5000);
  const [copied, setCopied] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [supportConfirmed, setSupportConfirmed] = useState(false);

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(walletConfig.mpAlias);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportConfirmed(true);
    setTimeout(() => {
      setSupportConfirmed(false);
      setActiveModal(null);
      setDonorName('');
      setDonorEmail('');
    }, 3000);
  };

  return (
    <section id="sumate" className="border-b border-[#E52E33] scroll-mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E52E33]">
        
        {/* Left Col: Header & Statement */}
        <div className="p-8 sm:p-16 flex flex-col justify-between space-y-8">
          <div>
            <h2 className="brand-title text-4xl sm:text-5xl font-normal leading-[0.95] tracking-tight max-w-[12ch]">
              Sostené el proceso
            </h2>
            <p className="text-sm sm:text-base leading-relaxed max-w-[36ch] mt-8 opacity-90">
              Tu aporte sostiene materiales de taller, horas de horno comunitario, biblioteca independiente y la bitácora abierta. Elegí cómo sumarte.
            </p>
          </div>

          <div className="text-xs font-mono opacity-75">
            KAMIKAZE ⁄ Espacio autogestivo y horizontal 2026
          </div>
        </div>

        {/* Right Col: Action Rows */}
        <div className="divide-y divide-[#E52E33] flex flex-col justify-center">
          
          {/* Row 1: Socix Mensual */}
          <div 
            onClick={() => setActiveModal('socix')}
            className="brand-row flex justify-between items-baseline p-8 sm:p-10 cursor-pointer group"
          >
            <div>
              <span className="text-xl sm:text-2xl font-bold group-hover:underline brand-title block">
                Socix mensual
              </span>
              <span className="text-xs opacity-80 mt-1 block">
                Aranceles bonificados en todos los talleres + acceso a fanzines
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold shrink-0 ml-4">
              $6.000 / mes →
            </span>
          </div>

          {/* Row 2: Aporte Único */}
          <div 
            onClick={() => setActiveModal('aporte')}
            className="brand-row flex justify-between items-baseline p-8 sm:p-10 cursor-pointer group"
          >
            <div>
              <span className="text-xl sm:text-2xl font-bold group-hover:underline brand-title block">
                Aporte único
              </span>
              <span className="text-xs opacity-80 mt-1 block">
                Aporte libre directo a la billetera virtual del colectivo
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold shrink-0 ml-4">
              Monto libre →
            </span>
          </div>

          {/* Row 3: Proponer obra o taller */}
          <div 
            onClick={onOpenProposalModal}
            className="brand-row flex justify-between items-baseline p-8 sm:p-10 cursor-pointer group"
          >
            <div>
              <span className="text-xl sm:text-2xl font-bold group-hover:underline brand-title block">
                Proponer obra o taller
              </span>
              <span className="text-xs opacity-80 mt-1 block">
                Convocatoria abierta para artistas, docentes y creadorxs
              </span>
            </div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold shrink-0 ml-4">
              Escribinos →
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Support Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-3">
              <span className="font-mono text-xs uppercase tracking-widest font-bold">
                {activeModal === 'socix' ? 'Adhesión Socix Mensual' : 'Aporte Solidario Único'}
              </span>
              <button onClick={() => setActiveModal(null)} className="p-1 border border-[#E52E33]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {supportConfirmed ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E52E33] text-[#FFD41D] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="brand-title text-2xl font-bold">¡Gracias por sostener el proceso!</h3>
                <p className="text-xs opacity-90 font-mono">
                  Registramos tu adhesión. Te enviamos los detalles a tu email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmSupport} className="space-y-4 text-xs font-mono">
                <div>
                  <h3 className="brand-title text-2xl font-normal">
                    {activeModal === 'socix' ? 'Membresía Mensual: $6.000 / mes' : 'Aporte Libre a la Billetera'}
                  </h3>
                  <p className="opacity-90 mt-1 font-sans">
                    Transferí directamente a nuestra billetera virtual y dejanos tus datos para reconocerte como socix.
                  </p>
                </div>

                {activeModal === 'aporte' && (
                  <div>
                    <label className="block uppercase font-bold mb-1">Monto a aportar ($)</label>
                    <input
                      type="number"
                      min={500}
                      step={500}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33] font-bold text-sm"
                    />
                  </div>
                )}

                {/* Wallet Info Box */}
                <div className="p-3 border border-[#E52E33] bg-[#f0c510] space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="opacity-70 text-[10px] block">ALIAS BILLETERA / MERCADO PAGO</span>
                      <strong className="text-sm select-all">{walletConfig.mpAlias}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAlias}
                      className="px-2 py-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copied ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-[10px] opacity-80">
                    CVU: {walletConfig.mpCvu} · Titular: {walletConfig.mpTitular}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block uppercase font-bold mb-1">Tu Nombre y Apellido *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Sofía Benítez"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold mb-1">Email de contacto *</label>
                    <input
                      type="email"
                      required
                      placeholder="sofia@gmail.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E52E33] flex justify-between items-center gap-2">
                  <a
                    href={walletConfig.mpPaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] uppercase underline flex items-center gap-1 opacity-90 hover:opacity-100"
                  >
                    <span>Abrir Mercado Pago</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="submit"
                    className="btn-brand-inverse px-5 py-2 uppercase font-bold cursor-pointer"
                  >
                    Confirmar Aporte
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
